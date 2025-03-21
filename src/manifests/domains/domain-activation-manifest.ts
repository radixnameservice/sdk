import RnsSDK from "../..";

export default async function activateDomainManifest({
    sdkInstance,
    accountAddress,
    rootDomainId,
    subdomainIds,
}: {
    sdkInstance: RnsSDK;
    accountAddress: string;
    rootDomainId: string;
    subdomainIds: string[];
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
            Proof("domain_proof");
        CALL_METHOD
            Address("${sdkInstance.entities.components.coreVersionManager.rnsCoreComponent}")
            "update_address"
            Proof("domain_proof")
            Address("${accountAddress}");
        CALL_METHOD
            Address("${accountAddress}")
            "create_proof_of_non_fungibles"
            Address("${sdkInstance.entities.resources.collections.domains}")
            Array<NonFungibleLocalId>(
                NonFungibleLocalId("${rootDomainId}")
            );
        POP_FROM_AUTH_ZONE
            Proof("requested_proof");
        CALL_METHOD
            Address("${sdkInstance.entities.components.coreVersionManager.rnsCoreComponent}")
            "delete_all_records_and_subdomains"
            NonFungibleLocalId("${rootDomainId}")
            true
            true
            Array<NonFungibleLocalId>(
                ${subdomainIds.map(id => `NonFungibleLocalId("${id}")`).join(', ')}
            )
            Proof("requested_proof")
            Enum<0u8>();
        DROP_ALL_PROOFS;
    `;

}
