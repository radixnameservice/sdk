import Decimal from "decimal.js";
import RnsSDK from "../..";

import { getWellKnownAddresses } from "../../utils/gateway.utils";

import { UserDetailsI } from "../../common/user.types";


export default async function registerDomainManifest({
    sdkInstance,
    domain,
    accountAddress,
    price,
    durationYears
}: {
    sdkInstance: RnsSDK;
    domain: string;
    accountAddress: string;
    price: Decimal;
    durationYears: number;
}) {

    const xrdTokenResource = (await getWellKnownAddresses(sdkInstance.status)).xrd;

    return `
        CALL_METHOD
            Address("${accountAddress}")
            "withdraw"
            Address("${xrdTokenResource}")
            Decimal("${price}");
        TAKE_FROM_WORKTOP
            Address("${xrdTokenResource}")
            Decimal("${price}")
            Bucket("radix_bucket");
        CALL_METHOD
            Address("${sdkInstance.entities.components.coreVersionManager.rnsCoreComponent}")
            "register_domain"
            "${domain}"
            Address("${accountAddress}")
            ${durationYears}i64
            Bucket("radix_bucket");
        CALL_METHOD
            Address("${accountAddress}")
            "deposit_batch"
            Expression("ENTIRE_WORKTOP");
    `;

}
