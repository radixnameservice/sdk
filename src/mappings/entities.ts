export const nameMappings = {
    RNSAuctionLogic: 'rnsAuctionComponent',
    RNSLogic: 'radixNameServiceComponent',
    RNSStorage: 'rnsStorage',
    RNSAuctionStorage: 'rnsAuctionStorage',
    FeeService: 'feeServiceComponent',
    MinimumPremium: 'minimumPremium',
    'RNS User Badge': 'rnsUserBadgeResource',
    'Domain User Badge': 'domainUserBadgeResource',
    'Domain': 'domainNameResource',
    'Resolver Record': 'resolverRecordResource',
    'RNS Auction NFT': 'rnsAuctionNftResource',
    'Settlement Badge': 'rnsSettlementBadgeResource',
    'Bid Badge': 'auctionBidBadgeResource'
} as const;

export type NameMapKeysT = keyof typeof nameMappings;
export type NameMapValuesT = (typeof nameMappings)[NameMapKeysT];

export type AddressMapT = Record<
    NameMapValuesT | 'settlementVaultId' | 'biddersVaultId' | 'recordServiceVaultId' | 'subdomainVaults' | 'rnsStorage' | 'domainEventClaimsKvId' | 'domainTldKvId' | 'tokenUsdPriceKvStore',
    string
> & { latestAuctionId: string, latestBidId: string, priceMap: Record<PriceTier, string> } | null;

export enum PriceTier {
    Tier1 = 2,
    Tier2 = 3,
    Tier3 = 4,
    Tier4
}
