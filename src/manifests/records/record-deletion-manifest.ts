import RnsSDK from "../..";

export function recordDeletionManifest({
    sdkInstance,
    accountAddress,
    targetDomainId,
    recordId
}: {
    sdkInstance: RnsSDK;
    accountAddress: string;
    targetDomainId: string;
    recordId: string;
}): string {

    return `
        CALL_METHOD
            Address("${accountAddress}")
            "create_proof_of_non_fungibles"
            Address("${sdkInstance.entities.resources.collections.domains}")
            Array<NonFungibleLocalId>(
                NonFungibleLocalId("${targetDomainId}")
            );
        POP_FROM_AUTH_ZONE
            Proof("requester_proof");
        CALL_METHOD
            Address("${sdkInstance.entities.components.coreVersionManager.rnsCoreComponent}")
            "delete_record"
            NonFungibleLocalId("${recordId}")
            Proof("requester_proof")
            Enum<0u8>();
        CALL_METHOD
            Address("${accountAddress}")
            "deposit_batch"
            Expression("ENTIRE_WORKTOP");
    `;

}
