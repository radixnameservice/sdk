interface StatusMapsI {

    [key: string]: {
        status: string;
        verbose: string;
    }

}

export function mapStatusInt(domain: string, status: number) {

    const statusMaps: StatusMapsI = {
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
            status: 'registered',
            verbose: `${domain} is registered.`
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