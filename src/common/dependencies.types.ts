import Decimal from "decimal.js";

export interface DependenciesI {

    rates: {
        usdXrd: Decimal | null;
    }
    
}