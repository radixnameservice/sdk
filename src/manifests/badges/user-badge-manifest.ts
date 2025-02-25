import RnsSDK from "../..";


export default function issueBadgeManifest({
    sdkInstance,
    accountAddress,
}: {
    sdkInstance: RnsSDK;
    accountAddress: string;
}) {

    return `
        CALL_METHOD
            Address("${sdkInstance.entities.components.coreVersionManager.rnsCoreComponent}")
            "register_user";
        CALL_METHOD
            Address("${accountAddress}")
            "deposit_batch"
            Expression("ENTIRE_WORKTOP");
    `;

}