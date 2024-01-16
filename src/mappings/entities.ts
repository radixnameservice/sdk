export const nameMappings = {
    'RNS Auction Logic': 'rnsAuctionComponent',
    'RNS Logic': 'radixNameServiceComponent',
    'RNS Storage': 'rnsStorage',
    'RNS Auction Storage': 'rnsAuctionStorage',
    'Fee Service': 'feeServiceComponent',
    'Minimum Premium': 'minimumPremium',
    'RNS User Badge': 'rnsUserBadgeResource',
    'Domain User Badge': 'domainUserBadgeResource',
    'Domain Name': 'domainNameResource',
    'Resolver Record': 'resolverRecordResource',
    'RNS Auction NFT': 'rnsAuctionNftResource',
    'Settlement Badge': 'rnsSettlementBadgeResource',
    'Bid Badge': 'auctionBidBadgeResource'
} as const;

export type NameMapKeysT = keyof typeof nameMappings;
export type NameMapValuesT = (typeof nameMappings)[NameMapKeysT];

export type AddressMapT = Record<NameMapValuesT | 'settlementVaultId' | 'biddersVaultId' | 'recordServiceVaultId' | 'subdomainVaults' | 'rnsStorage', string> & { latestAuctionId: number, priceMap: Record<PriceTier, string> } | null;

export enum PriceTier {
    Tier1 = 2,
    Tier2 = 3,
    Tier3 = 4,
    Tier4
}