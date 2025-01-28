import Decimal from "decimal.js";
import { getWellKnownAddresses } from "../../utils/gateway.utils";
import { UserSpecificsI } from "../../common/user.types";
import RnsSDK from "../..";

export default async function registerDomainManifest({
    sdkInstance,
    domain,
    userDetails,
    price,
    durationYears
}: {
    sdkInstance: RnsSDK;
    domain: string;
    userDetails: UserSpecificsI;
    price: Decimal;
    durationYears: number;
}) {

    const xrdTokenResource = (await getWellKnownAddresses(sdkInstance.status)).xrd;

    return `
        CALL_METHOD
            Address("${userDetails.accountAddress}")
            "withdraw"
            Address("${xrdTokenResource}")
            Decimal("${price}");
        TAKE_FROM_WORKTOP
            Address("${xrdTokenResource}")
            Decimal("${price}")
            Bucket("radix_bucket");
        CALL_METHOD
            Address("${userDetails.accountAddress}")
            "create_proof_of_non_fungibles"
            Address("${sdkInstance.entities.resources.badges.rnsUser}")
            Array<NonFungibleLocalId>(
                NonFungibleLocalId("${userDetails.badgeId}")
            );
        POP_FROM_AUTH_ZONE
            Proof("user_proof");
        CALL_METHOD
            Address("${sdkInstance.entities.components.coreVersionManager.rnsCoreComponent}")
            "register_domain"
            "${domain}"
            Address("${userDetails.accountAddress}")
            ${durationYears}i64
            Bucket("radix_bucket")
            Proof("user_proof");
        CALL_METHOD
            Address("${userDetails.accountAddress}")
            "deposit_batch"
            Expression("ENTIRE_WORKTOP");
    `;

}
