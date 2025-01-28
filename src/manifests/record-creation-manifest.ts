import RnsSDK from "..";
import { FungibleProofItemI, NonFungibleProofItemI, ProofsI } from "../common/entities.types";

import { DocketI } from "../common/record.types";
import { UserSpecificsI } from "../common/user.types";


function buildNonFungibleProofs(
    nonFungibles: NonFungibleProofItemI[],
    account: string
): {
    manifest: string;
    proofIds: string
}[] {

    return nonFungibles.map((nonFungible, index) => {
        const manifest = `
            CALL_METHOD
                Address("${account}")
                "create_proof_of_non_fungibles"
                Address("${nonFungible.resourceAddress}")
                Array<NonFungibleLocalId>(
                    ${nonFungible.ids.map(id => `NonFungibleLocalId("${id}")`).join(',')}
                );
            POP_FROM_AUTH_ZONE
                Proof("non_fungible_proof_${index}");
        `;
        return { manifest, proofIds: `Proof("non_fungible_proof_${index}")` };
    });

}

function buildFungibleProofs(
    fungibles: FungibleProofItemI[],
    account: string
): {
    manifest: string;
    proofIds: string
}[] {

    return fungibles.map((fungible, index) => {
        const manifest = `
            CALL_METHOD
                Address("${account}")
                "create_proof_of_amount"
                Address("${fungible.resourceAddress}")
                Decimal("${fungible.amount}");
            POP_FROM_AUTH_ZONE
                Proof("fungible_proof_${index}");
        `;
        return { manifest, proofIds: `Proof("fungible_proof_${index}")` };
    });

}

export function recordCreationManifest({
    sdkInstance,
    userDetails,
    rootDomainId,
    subDomainId = null,
    recordDocket,
    proofs = {}
}: {
    sdkInstance: RnsSDK;
    userDetails: UserSpecificsI;
    rootDomainId: string;
    subDomainId?: string | null;
    recordDocket: DocketI;
    proofs?: ProofsI;
}): string {

    const nonFungibleProofs = proofs.nonFungibles
        ? buildNonFungibleProofs(proofs.nonFungibles, userDetails.accountAddress)
        : [];
    const fungibleProofs = proofs.fungibles
        ? buildFungibleProofs(proofs.fungibles, userDetails.accountAddress)
        : [];
    const idAdditions = proofs.idAdditions || [];


    const methodName =
        nonFungibleProofs.length > 0 || fungibleProofs.length > 0
            ? "create_proven_record"
            : "create_record";


    return `
        ${nonFungibleProofs.map(proof => proof.manifest).join('')}
        ${fungibleProofs.map(proof => proof.manifest).join('')}
        CALL_METHOD
            Address("${userDetails.accountAddress}")
            "create_proof_of_non_fungibles"
            Address("${sdkInstance.entities.resources.collections.domains}")
            Array<NonFungibleLocalId>(
                NonFungibleLocalId("${rootDomainId}")
            );
        POP_FROM_AUTH_ZONE
            Proof("request_proof");
        CALL_METHOD
            Address("${sdkInstance.entities.components.coreVersionManager.rnsCoreComponent}")
            "${methodName}"
            NonFungibleLocalId("${subDomainId || rootDomainId}")
            "${recordDocket.context}"
            ${recordDocket.directive}
            ${recordDocket.platformIdentifier}
            Array<String>(${idAdditions.map(id => `"${id}"`).join(',')})
            ${methodName === "create_proven_record"
            ? `Array<Proof>(
                ${nonFungibleProofs.map(proof => proof.proofIds).join(',')}
                ${fungibleProofs.map(proof => proof.proofIds).join(',')}
            )`
            : ""
        }
            Proof("request_proof")
            Enum<0u8>();
        CALL_METHOD
            Address("${userDetails.accountAddress}")
            "deposit_batch"
            Expression("ENTIRE_WORKTOP");
    `;

}
