import Decimal from "decimal.js";
import { ProgrammaticScryptoSborValueMap } from "@radixdlt/babylon-gateway-api-sdk";

import { stripExtension } from "./domain.utils";
import { convertToDecimal, divideDecimal, isDecimalLessThan, multiplyDecimal } from "./decimal.utils";
import { PriceTiers } from "../mappings/pricing";
import pricingConfig from "../pricing.config";

import { PricePairI } from "../common/pricing.types";


export function convertToNormalisedPrice(usd: number, years: number, usdXrdRate: Decimal) {

    return multiplyDecimal(convertToDecimal(usd * years), usdXrdRate);

}

export function normaliseXrd(xrd: number) {

    return convertToDecimal(xrd.toString());

}

export function formatXrd(xrd: number | string, decPoints: number = 2): number {

    let normalise: string = '0';

    if (typeof xrd === 'number') {
        normalise = parseFloat(xrd.toString()).toFixed(decPoints);
    } else if (typeof xrd === 'string') {
        normalise = parseFloat(xrd).toFixed(decPoints);
    }

    return +normalise;

}

export function priceFromXrd(usdXrdRate: Decimal, xrd: Decimal | number | string | null | undefined): PricePairI {

    if (!xrd) {
        return null;
    }

    return {
        usd: xrdToUsd(usdXrdRate, xrd).toFixed(2),
        xrd: convertToDecimal(xrd).toFixed(2)
    };


}

export function usdToXrd(usdXrdRate: Decimal, usd: Decimal | number | string | null | undefined) {

    if (!usd) {
        return 0;
    }

    if (isDecimalLessThan(convertToDecimal(usd), 1)) {
        return 0;
    }

    return multiplyDecimal(usdXrdRate, usd);

}

export function xrdToUsd(usdXrdRate: Decimal, xrd: Decimal | number | string | null | undefined) {

    if (!xrd) {
        return 0;
    }

    if (isDecimalLessThan(convertToDecimal(xrd), 1)) {
        return 0;
    }

    return divideDecimal(convertToDecimal(xrd), usdXrdRate);

}

export function getBasePrice(domain: string, usdXrdRate: Decimal) {

    const sdl = stripExtension(domain);

    if (sdl.length >= 5) {
        return {
            usd: pricingConfig.baseDollarPricing[5],
            xrd: usdToXrd(usdXrdRate, pricingConfig.baseDollarPricing[5])
        };
    }

    const usd = pricingConfig.baseDollarPricing[sdl.length];

    return {
        usd: usd,
        xrd: usdToXrd(usdXrdRate, usd)
    };

}

export function parsePricingTiers(priceMap: ProgrammaticScryptoSborValueMap) {

    if (!priceMap) {
        return undefined;
    }

    return priceMap.entries.reduce((acc, val) => {
        if (val.key.kind === 'Enum' && val.key.variant_name) {
            return { ...acc, [val.key.variant_name]: val.value.kind === 'Decimal' && val.value.value };
        }

        return acc;
    }, {} as Record<PriceTiers, string>);

}