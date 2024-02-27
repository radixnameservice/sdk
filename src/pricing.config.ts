interface PricingConfigI {
    xrdExchangeRate: number;
    baseDollarPricing: PriceMapI;
}

interface PriceMapI {
    [key: number]: number;
}

const config: PricingConfigI = {

    xrdExchangeRate: 22.222222222222222222,
    baseDollarPricing: {

        1: 1000000,
        2: 240,
        3: 120,
        4: 40,
        5: 4

    }

};

export default config;