export default function registerDomain({
    auctionId,
    account,
    radixAddress,
    amount,
    rnsAuctionComponent,
    rnsUserBadgeResource,
    userBadgeId
}: {
    auctionId: string
    account: string,
    radixAddress: string,
    amount: string,
    rnsAuctionComponent: string,
    rnsUserBadgeResource: string,
    userBadgeId: string
}) {
    return `
CALL_METHOD
    Address("${account}")
    "withdraw"
    Address("${radixAddress}")
    Decimal("${amount}")
;
TAKE_FROM_WORKTOP
    Address("${radixAddress}")
    Decimal("${amount}")
    Bucket("radix_bucket")
;
CALL_METHOD
    Address("${account}")
    "create_proof_of_non_fungibles"
    Address("${rnsUserBadgeResource}")
    Array<NonFungibleLocalId>(
        NonFungibleLocalId("${userBadgeId}")
    )
;
POP_FROM_AUTH_ZONE
    Proof("user_proof")
;
CALL_METHOD
    Address("${rnsAuctionComponent}")
    "bid"
    NonFungibleLocalId("${auctionId}")
    Bucket("radix_bucket")
    Proof("user_proof")
;
CALL_METHOD
    Address("${account}")
    "deposit_batch"
    Expression("ENTIRE_WORKTOP")
;
    `
}