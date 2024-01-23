export function mapStatusInt(domain: string, status: number) {

    const statusMaps: any = {
        '0': {
            status: 'available',
            verbose: `${domain} is available.`
        },
        '1': {
            status: 'settlement',
            verbose: `${domain} is currently within its settlement period.`
        },
        '2': {
            status: 'auction',
            verbose: `${domain} is currently within an auction.`
        },
        '3': {
            status: 'taken',
            verbose: `${domain} is taken.`
        },
        '4': {
            status: 'sunrise',
            verbose: `${domain} is protected by the RNS Foundation as part of the Sunrise Initiative.`
        },
        '5': {
            status: 'tld',
            verbose: `${domain} is protected by the RNS Foundation as part of Project TLD.`
        },
        '6': {
            status: 'genus-substrate',
            verbose: `${domain} is protected by the RNS Foundation as part of the genus substrate program.`
        }
    }

    return statusMaps[status] ?? {
        status: 'unknown',
        verbose: `The status of ${domain} is unknown. It's possible that the queried domain is invalid.`
    };

}

export enum DomainStatus {
    Unclaimed,
    InSettlement,
    InAuction,
    Claimed
}