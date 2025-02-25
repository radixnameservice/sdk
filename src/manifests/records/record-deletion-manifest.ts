import RnsSDK from "../..";
import { UserDetailsI } from "../../common/user.types";

export function recordDeletionManifest({
    sdkInstance,
    userDetails,
    rootDomainId,
    recordId
}: {
    sdkInstance: RnsSDK;
    userDetails: UserDetailsI;
    rootDomainId: string;
    recordId: string;
}): string {

    return `
        CALL_METHOD
            Address("${userDetails.accountAddress}")
            "create_proof_of_non_fungibles"
            Address("${sdkInstance.entities.resources.collections.domains}")
            Array<NonFungibleLocalId>(
                NonFungibleLocalId("${rootDomainId}")
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
            Address("${userDetails.accountAddress}")
            "deposit_batch"
            Expression("ENTIRE_WORKTOP");
    `;

}
