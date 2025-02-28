import RnsSDK from "../..";

export default async function subdomainDeletionManifest({
    sdkInstance,
    accountAddress,
    rootDomainId,
    subdomainId,
}: {
    sdkInstance: RnsSDK;
    accountAddress: string;
    rootDomainId: string;
    subdomainId: string;
}) {

    return `
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
            "delete_subdomain"
            NonFungibleLocalId("${subdomainId}")
            Proof("requester_proof")
            Enum<0u8>();
        DROP_ALL_PROOFS;
    `;
    
}
