import Decimal from "decimal.js";

export default function registerDomain({
    domain,
    userAccountAddress,
    userBadgeId,
    xrdTokenResource,
    rnsUserBadgeResource,
    rnsServiceComponent,
    price,
    durationYears
}: {
    domain: string;
    userAccountAddress: string;
    userBadgeId: string;
    xrdTokenResource: string;
    rnsUserBadgeResource: string;
    rnsServiceComponent: string;
    price: Decimal;
    durationYears: number
}) {

    return `
        CALL_METHOD
            Address("${userAccountAddress}")
            "withdraw"
            Address("${xrdTokenResource}")
            Decimal("${price}");
        TAKE_FROM_WORKTOP
            Address("${xrdTokenResource}")
            Decimal("${price}")
            Bucket("radix_bucket");
        CALL_METHOD
            Address("${userAccountAddress}")
            "create_proof_of_non_fungibles"
            Address("${rnsUserBadgeResource}")
            Array<NonFungibleLocalId>(
                NonFungibleLocalId("${userBadgeId}")
            );
        POP_FROM_AUTH_ZONE
            Proof("user_proof");
        CALL_METHOD
            Address("${rnsServiceComponent}")
            "register_domain"
            "${domain}"
            Address("${userAccountAddress}")
            ${durationYears}i64
            Bucket("radix_bucket")
            Proof("user_proof");
        CALL_METHOD
            Address("${userAccountAddress}")
            "deposit_batch"
            Expression("ENTIRE_WORKTOP");
    `;

}
