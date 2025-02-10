import Decimal from "decimal.js";

export interface RawPricePairI {

    usd: number;
    xrd: number | Decimal;

}

export interface PricePairI {

    usd: string;
    xrd: string;

}