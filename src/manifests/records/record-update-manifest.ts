import RnsSDK from "../..";

import { buildFungibleProofs, buildNonFungibleProofs } from "../../utils/proof.utils";

import { ProofsI } from "../../common/entities.types";
import { RecordDocketI } from "../../common/record.types";

export function recordUpdateManifest({
    sdkInstance,
    accountAddress,
    rootDomainId,
    recordDocket,
    recordId,
    proofs = {}
}: {
    sdkInstance: RnsSDK;
    accountAddress: string;
    rootDomainId: string;
    recordDocket: RecordDocketI;
    recordId: string;
    proofs?: ProofsI;
}): string {

    const nonFungibleProofs = proofs.nonFungibles
        ? buildNonFungibleProofs(proofs.nonFungibles, accountAddress)
        : [];
    const fungibleProofs = proofs.fungibles
        ? buildFungibleProofs(proofs.fungibles, accountAddress)
        : [];
    const methodName =
        nonFungibleProofs.length > 0 || fungibleProofs.length > 0
            ? "update_proven_record"
            : "update_record";

    return `
    ${nonFungibleProofs.map(proof => proof.manifest).join('')}
    ${fungibleProofs.map(proof => proof.manifest).join('')}
    CALL_METHOD
        Address("${accountAddress}")
        "create_proof_of_non_fungibles"
        Address("${sdkInstance.entities.resources.collections.domains}")
        Array<NonFungibleLocalId>(
            NonFungibleLocalId("${rootDomainId}")
        );
    POP_FROM_AUTH_ZONE
        Proof("requester_proof");
    CALL_METHOD
        Address("${sdkInstance.entities.components.coreVersionManager.rnsCoreComponent}")
        "${methodName}"
        NonFungibleLocalId("${recordId}")
        ${methodName === "update_proven_record"
            ? `Array<Proof>(
        ${nonFungibleProofs.map(proof => proof.proofIds).join(',')}
        ${fungibleProofs.map(proof => proof.proofIds).join(',')}
        )`
            : ""}
        "${recordDocket.value}"
        Proof("requester_proof")
        Enum<0u8>();
    CALL_METHOD
        Address("${accountAddress}")
        "deposit_batch"
        Expression("ENTIRE_WORKTOP");
`;

}
