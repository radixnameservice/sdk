export function mapStatusInt(status: number) {

    const statusMaps: any = {
        '0': 'available',
        '1': 'settlement',
        '2': 'auction',
        '3': 'taken',
        '4': 'sunrise',
        '5': 'tld',
        '6': 'genus-substrate'
    }

    return statusMaps[status] ?? 'unknown';

}

export enum DomainStatus {
    Unclaimed,
    InSettlement,
    InAuction,
    Claimed
}