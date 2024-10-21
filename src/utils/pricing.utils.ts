import { Convert } from "@radixdlt/radix-engine-toolkit";
import { ProgrammaticScryptoSborValueMap } from "@radixdlt/babylon-gateway-api-sdk";
import { PriceTiers } from "../mappings/pricing";
import { stripExtension } from "./domain.utils";
import Decimal from "decimal.js";
import { convertToDecimal, divideDecimal, isDecimalLessThan, multiplyDecimal } from "./decimal.utils";
import pricingConfig from "../pricing.config";
import { BidI } from "../common/auction.types";

export function convertToNormalisedPrice(usd: number, years: number, usdXrdRate: Decimal) {

    return multiplyDecimal(convertToDecimal(usd * years), usdXrdRate);

}

export function normaliseXrd(xrd: number) {

    return Convert.String.toDecimal(xrd.toString());

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

export function priceFromXrd(usdXrdRate: Decimal, xrd: Decimal | number | string | null | undefined): BidI {

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
            usd: 4,
            xrd: usdToXrd(usdXrdRate, 4)
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

// export function getBaseSettlement(domain: string) {

//     const sdl = stripExtension(domain);

//     if (sdl.length >= 18) return 'Instant';
//     if (sdl.length >= 15) return '4 hours';
//     if (sdl.length >= 12) return '8 hours';
//     if (sdl.length >= 10) return '24 hours';
//     if (sdl.length >= 8) return '36 hours';
//     if (sdl.length >= 5) return '48 hours';
//     if (sdl.length === 4) return '64 hours';
//     if (sdl.length === 3) return '72 hours';
//     if (sdl.length === 2) return '96 hours';

//     return null;

// }

// export function normalisedPrice(usd: number, years: string) {

//     // assume domains attempted to register is instantly settled for MVP
//     const usdCost = Convert.String.toDecimal(years).mul(Convert.String.toDecimal(usd.toString()));
//     return usdCost.mul(Convert.String.toDecimal(config.xrdExchangeRate.toString())).toString();

// }

// export function normaliseXrd(xrd: number) {

//     return Convert.String.toDecimal(xrd.toString());

// }

// export function formatXrd(xrd: number | string): number {

//     let normalise: string = '0';

//     if (typeof xrd === 'number') {
//         normalise = parseFloat(xrd.toString()).toFixed(2);
//     } else if (typeof xrd === 'string') {
//         normalise = parseFloat(xrd).toFixed(2);
//     }

//     return +normalise;

// }

// export function priceFromXrd(xrd: any) {

//     const normalisedXrd = parseFloat(xrd);

//     if (isNaN(normalisedXrd)) {
//         return {
//             usd: 0,
//             xrd: 0
//         };
//     }

//     return {
//         usd: xrdToUsd(normalisedXrd),
//         xrd: formatXrd(normalisedXrd)
//     };

// }

// export function usdToXrd(usd: number) {

//     if (isNaN(usd)) {
//         return formatXrd(0);
//     }

//     return formatXrd((usd * config.xrdExchangeRate));

// }

// export function xrdToUsd(xrd: number) {

//     const normalisedXrd = parseFloat(xrd.toString());

//     if (isNaN(normalisedXrd)) {
//         return formatXrd(0);
//     }

//     return formatXrd((normalisedXrd / config.xrdExchangeRate));

// }

// export function getBasePrice(domain: string) {

//     const sdl = stripExtension(domain);

//     if (sdl.length >= 5) {
//         return {
//             usd: 4,
//             xrd: usdToXrd(4)
//         };
//     }

//     const usd = config.baseDollarPricing[sdl.length];

//     return {
//         usd: usd,
//         xrd: usdToXrd(usd)
//     };

// }