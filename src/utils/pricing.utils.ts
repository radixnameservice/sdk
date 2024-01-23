import { Convert } from "@radixdlt/radix-engine-toolkit";
import { ProgrammaticScryptoSborValueMap } from "@radixdlt/babylon-gateway-api-sdk";
import { PriceTiers } from "../mappings/pricing";
import { stripExtension } from "./domain.utils";
import config from "../pricing.config";

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

export function getBaseSettlement(domain: string) {

    const sdl = stripExtension(domain);

    if (sdl.length >= 18) return 'Instant';
    if (sdl.length >= 15) return '4 hours';
    if (sdl.length >= 12) return '8 hours';
    if (sdl.length >= 10) return '24 hours';
    if (sdl.length >= 8) return '36 hours';
    if (sdl.length >= 5) return '48 hours';
    if (sdl.length === 4) return '64 hours';
    if (sdl.length === 3) return '72 hours';
    if (sdl.length === 2) return '96 hours';

    return null;

}

export function normalisedPrice(usd: number, years: string) {

    // assume domains attempted to register is instantly settled for MVP
    const usdCost = Convert.String.toDecimal(years).mul(Convert.String.toDecimal(usd.toString()));
    return usdCost.mul(Convert.String.toDecimal(config.xrdExchangeRate.toString())).toString();

}

export function normaliseXrd(xrd: number) {

    return Convert.String.toDecimal(xrd.toString());

}

export function formatXrd(xrd: number | string): number {

    let normalise: string = '0';

    if (typeof xrd === 'number') {
        normalise = parseFloat(xrd.toString()).toFixed(2);
    } else if (typeof xrd === 'string') {
        normalise = parseFloat(xrd).toFixed(2);
    }

    return +normalise;

}

export function priceFromXrd(xrd: any) {

    const normalisedXrd = parseFloat(xrd);

    if (isNaN(normalisedXrd)) {
        return {
            usd: 0,
            xrd: 0
        };
    }

    return {
        usd: xrdToUsd(normalisedXrd),
        xrd: formatXrd(normalisedXrd)
    };

}

export function usdToXrd(usd: number) {

    if (isNaN(usd)) {
        return formatXrd(0);
    }

    return formatXrd((usd * config.xrdExchangeRate));

}

export function xrdToUsd(xrd: number) {

    const normalisedXrd = parseFloat(xrd.toString());

    if (isNaN(normalisedXrd)) {
        return formatXrd(0);
    }

    return formatXrd((normalisedXrd / config.xrdExchangeRate));

}

export function getBasePrice(domain: string) {

    const sdl = stripExtension(domain);

    if (sdl.length >= 5) {
        return {
            usd: 4,
            xrd: usdToXrd(4)
        };
    }

    const usd = config.baseDollarPricing[sdl.length];

    return {
        usd: usd,
        xrd: usdToXrd(usd)
    };

}