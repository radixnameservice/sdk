import RnsSDK from "../..";
import { RemovalPreferencesI } from "../../common/record.types";

export default async function subdomainCreationManifest({
    sdkInstance,
    fromAccount,
    toAccount,
    preferences,
    rootDomainId,
    subdomainIds,
}: {
    sdkInstance: RnsSDK;
    fromAccount: string;
    toAccount: string;
    preferences: RemovalPreferencesI;
    rootDomainId: string;
    subdomainIds: string[];
}) {

    return `
        CALL_METHOD
            Address("${fromAccount}")
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
            ${preferences.deleteSubdomains}
            ${preferences.deleteRecords}
            Array<NonFungibleLocalId>(
                ${subdomainIds.map(id => `NonFungibleLocalId("${id}")`).join(', ')}
            )
            Proof("requested_proof")
            Enum<0u8>();
        CALL_METHOD
            Address("${fromAccount}")
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
            Address("${toAccount}");
        CALL_METHOD
            Address("${fromAccount}")
            "withdraw_non_fungibles"
            Address("${sdkInstance.entities.resources.collections.domains}")
            Array<NonFungibleLocalId>(
                NonFungibleLocalId("${rootDomainId}")
            );
        CALL_METHOD
            Address("${toAccount}")
            "try_deposit_batch_or_refund"
            Expression("ENTIRE_WORKTOP")
            Enum<0u8>();
    `;



}
