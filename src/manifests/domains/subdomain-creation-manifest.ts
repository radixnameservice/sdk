import RnsSDK from "../..";
import { UserSpecificsI } from "../../common/user.types";

export default async function subdomainCreationManifest({
    sdkInstance,
    userDetails,
    domainResourceId,
    subdomain,
}: {
    sdkInstance: RnsSDK;
    userDetails: UserSpecificsI;
    domainResourceId: string;
    subdomain: string;
}) {

    return `
        CALL_METHOD
            Address("${userDetails.accountAddress}")
            "create_proof_of_non_fungibles"
            Address("${sdkInstance.entities.resources.collections.domains}")
            Array<NonFungibleLocalId>(
                NonFungibleLocalId("${domainResourceId}")
            );
        POP_FROM_AUTH_ZONE
            Proof("requester_proof");
        CALL_METHOD
            Address("${sdkInstance.entities.components.coreVersionManager.rnsCoreComponent}")
            "register_subdomain"
            NonFungibleLocalId("${domainResourceId}")
            "${subdomain}"
            Address("${userDetails.accountAddress}")
            Proof("requester_proof")
            Enum<0u8>();
        CALL_METHOD
            Address("${userDetails.accountAddress}")
            "deposit_batch"
            Expression("ENTIRE_WORKTOP");
        `;

}
