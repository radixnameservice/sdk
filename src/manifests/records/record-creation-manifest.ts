import RnsSDK from "../..";

import { buildFungibleProofs, buildNonFungibleProofs } from "../../utils/proof.utils";

import { ProofsI } from "../../common/entities.types";
import { RecordDocketI } from "../../common/record.types";
import { UserDetailsI } from "../../common/user.types";

export function recordCreationManifest({
    sdkInstance,
    userDetails,
    rootDomainId,
    recordDocket,
    proofs = {}
}: {
    sdkInstance: RnsSDK;
    userDetails: UserDetailsI;
    rootDomainId: string;
    recordDocket: RecordDocketI;
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
            NonFungibleLocalId("${rootDomainId}")
            "${recordDocket.context}"
            ${recordDocket.directive.trim().length > 0 ? `Enum<1u8>("${recordDocket.directive}")` : "Enum<0u8>()"}
            ${recordDocket.platformIdentifier.trim().length > 0 ? `Enum<1u8>("${recordDocket.platformIdentifier}")` : "Enum<0u8>()"}
            Array<String>(${idAdditions.map(id => `"${id}"`).join(',')})
            ${methodName === "create_proven_record"
            ? `Array<Proof>(
                ${nonFungibleProofs.map(proof => proof.proofIds).join(',')}
                ${fungibleProofs.map(proof => proof.proofIds).join(',')}
            )` : ""}
            "${recordDocket.value}"
            Proof("request_proof")
            Enum<0u8>();
        CALL_METHOD
            Address("${userDetails.accountAddress}")
            "deposit_batch"
            Expression("ENTIRE_WORKTOP");
    `;

}
