interface PricingConfigI {
    xrdExchangeRate: number;
    baseDollarPricing: PriceMapI;
}

interface PriceMapI {
    [key: number]: number;
}

const config: PricingConfigI = {

    xrdExchangeRate: 16.666666666666666666,
    baseDollarPricing: {

        1: 1000000,
        2: 240,
        3: 160,
        4: 40,
        5: 4
    
    }

};

export default config;