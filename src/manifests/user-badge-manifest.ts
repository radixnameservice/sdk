import RnsSDK from "..";

import { UserSpecificsI } from "../common/user.types";


export default function issueBadgeManifest({
    sdkInstance,
    userDetails,
}: {
    sdkInstance: RnsSDK;
    userDetails: UserSpecificsI;
}) {

    return `
        CALL_METHOD
            Address("${sdkInstance.entities.components.coreVersionManager.rnsCoreComponent}")
            "register_user";
        CALL_METHOD
            Address("${userDetails.accountAddress}")
            "deposit_batch"
            Expression("ENTIRE_WORKTOP");
    `;

}