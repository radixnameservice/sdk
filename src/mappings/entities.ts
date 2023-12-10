import { PriceTiers } from "./pricing";

export const nameMappings = {
    'RNSAuction': 'rnsAuctionComponent',
    'RadixNameService': 'radixNameServiceComponent',
    'FeeService': 'feeServiceComponent',
    'MinimumPremium': 'minimumPremium',
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
export type AddressMapT = Record<NameMapValuesT | 'settlementVaultId' | 'biddersVaultId' | 'recordServiceVaultId', string> & { latestAuctionId: number, priceMap: Record<PriceTiers, string> } | null;