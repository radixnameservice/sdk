import RnsSDK from "..";
import { DocketI } from "../common/record.types";

import { UserSpecificsI } from "../common/user.types";

export function recordCreationManifest({
    sdkInstance,
    userDetails,
    domainId,
    rootDomainId,
    recordDocket
}: {
    sdkInstance: RnsSDK;
    userDetails: UserSpecificsI;
    domainId: string;
    rootDomainId: string;
    recordDocket: DocketI;
}) {

    return `
        CALL_METHOD
            Address("${userDetails.accountAddress}")
            "create_proof_of_non_fungibles"
            Address("${sdkInstance.entities.resources.collections.domains}")
        Array<NonFungibleLocalId>(
            NonFungibleLocalId("${rootDomainId}");
        POP_FROM_AUTH_ZONE
            Proof("request_proof");
        CALL_METHOD
            Address("${sdkInstance.entities.components.coreVersionManager.rnsCoreComponent}")
            "create_record"
            NonFungibleLocalId("${domainId}")
            "${recordDocket.context}"
            ${recordDocket.directive}
            ${recordDocket.platformIdentifier}
            Array<String>()
            ${recordDocket.value}
            Proof("request_proof")
            Enum<0u8>();
        CALL_METHOD
            Address("${userDetails.accountAddress}")
            "deposit_batch"
            Expression("ENTIRE_WORKTOP");
    `;

}

type FungibleProofItemT = {

    resourceAddress: string;
    ids: string[];
    amount: string;

};

type NonFungibleProofItemT = {

    resourceAddress: string;
    ids: string[];

};

// TODO - Ensure that subdomains are also covered under proven records.

export function provenRecordCreationManifest({
    sdkInstance,
    userDetails,
    domainId,
    rootDomainId,
    recordDocket,
    proofs
}: {
    sdkInstance: RnsSDK;
    userDetails: UserSpecificsI;
    domainId: string;
    rootDomainId: string;
    recordDocket: DocketI;
    proofs: {
        fungibles: FungibleProofItemT[];
        nonFungibles: NonFungibleProofItemT[];
        idAdditions: string[];
    }
}) {

    const nonFungibleProofs = buildNonFungibleProofs(proofs.nonFungibles, userDetails.accountAddress);
    const fungibleProofs = buildFungibleProofs(proofs.fungibles, userDetails.accountAddress);

    return `
        ${nonFungibleProofs.map(proof => proof.manifest).join('')}
            CALL_METHOD
                Address("${userDetails.accountAddress}")
                "create_proof_of_non_fungibles"
                Address("${sdkInstance.entities.resources.collections.domains}")
                Array<NonFungibleLocalId>(
                    NonFungibleLocalId("${domainId}")
                );
            POP_FROM_AUTH_ZONE
                Proof("request_proof");
            CALL_METHOD
                Address("${sdkInstance.entities.components.coreVersionManager.rnsCoreComponent}")
                "create_proven_record"
                NonFungibleLocalId("${domainId}")
                "${recordDocket.context}"
                ${recordDocket.directive}
                ${recordDocket.platformIdentifier}
                Array<String>(${proofs.idAdditions.map(id => `"${id}"`).join(',')})
                Array<Proof>(
                    ${nonFungibleProofs.map(proof => proof.proofIds).join(',')},
                    ${fungibleProofs.map(proof => proof.proofIds).join(',')}
                )
                Proof("request_proof")
                Enum<0u8>();
            CALL_METHOD
                Address("${userDetails.accountAddress}")
                "deposit_batch"
                Expression("ENTIRE_WORKTOP");
    `;

}

function buildNonFungibleProofs(nonFungibles: NonFungibleProofItemT[], account: string) {

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

function buildFungibleProofs(fungibles: FungibleProofItemT[], account: string) {

    return fungibles.map((fungible, index) => {

        const manifest = `
            CALL_METHOD
                Address("${account}")
                "create_proof_of_non_fungibles"
                Address("${fungible.resourceAddress}")
                Decimal("${fungible.amount}");
            POP_FROM_AUTH_ZONE
                Proof("fungible_proof_${index}");
        `;

        return { manifest, proofIds: `Proof("fungible_proof_${index}")` };

    });

}