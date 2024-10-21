export type StatusI = 'available' | 'auction' | 'settlement' | 'registered' | 'sunrise' | 'tld' | 'genus-substrate';

export interface StatusMapsI {

    [key: string]: {
        status: string;
        verbose: string;
    }

}