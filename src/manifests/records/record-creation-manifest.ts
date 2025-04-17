import RnsSDK from "../..";

import { buildFungibleProofs, buildNonFungibleProofs } from "../../utils/proof.utils";
import { RecordDocketI } from "../../common/record.types";
import { ProofsI } from "../../common/entities.types";

export function recordCreationManifest({
    sdkInstance,
    accountAddress,
    rootDomainId,
    targetDomainId,
    recordDocket,
    proofs = {}
}: {
    sdkInstance: RnsSDK;
    accountAddress: string;
    rootDomainId: string;
    targetDomainId: string;
    recordDocket: RecordDocketI;
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
            ? "create_proven_record"
            : "create_record";

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
            Proof("request_proof");
        CALL_METHOD
            Address("${sdkInstance.entities.components.coreVersionManager.rnsCoreComponent}")
            "${methodName}"
            NonFungibleLocalId("${targetDomainId}")
            "${recordDocket.context}"
            ${recordDocket.directive.trim().length > 0 ? `Enum<1u8>("${recordDocket.directive}")` : "Enum<0u8>()"}
            ${recordDocket.platformIdentifier.trim().length > 0 ? `Enum<1u8>("${recordDocket.platformIdentifier}")` : "Enum<0u8>()"}
            Array<String>()
            ${methodName === "create_proven_record"
            ? `Array<Proof>(
                ${nonFungibleProofs.map(proof => proof.proofIds).join(',')}
                ${fungibleProofs.map(proof => proof.proofIds).join(',')}
            )` : ""}
            ${methodName === "create_record" ? `"${recordDocket.value}"` : ``}
            Proof("request_proof")
            Enum<0u8>();
        CALL_METHOD
            Address("${accountAddress}")
            "deposit_batch"
            Expression("ENTIRE_WORKTOP");
    `;

}
