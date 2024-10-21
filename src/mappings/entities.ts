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

export enum PriceTier {
    Tier1 = 2,
    Tier2 = 3,
    Tier3 = 4,
    Tier4
}
