interface PricingConfigI {
    baseDollarPricing: PriceMapI;
}

interface PriceMapI {
    [key: number]: number;
}

const config: PricingConfigI = {

    baseDollarPricing: {

        1: 1000000,
        2: 240,
        3: 120,
        4: 40,
        5: 4

    }

};

export default config;