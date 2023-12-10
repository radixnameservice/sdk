import { ProgrammaticScryptoSborValueMap } from "@radixdlt/babylon-gateway-api-sdk";
import { PriceTiers } from "../mappings/pricing";

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