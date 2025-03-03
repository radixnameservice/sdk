export interface RegistrarDetailsI {

    identifier: string;
    fee?: {
        percentage: number;
        depositAddress: string;
    }
    meta?: string;

}