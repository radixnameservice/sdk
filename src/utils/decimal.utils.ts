import Decimal from "decimal.js";

export function convertToDecimal(num: Decimal | number | string, decimalPlaces: number = 5): Decimal {

    Decimal.set({ precision: decimalPlaces, rounding: Decimal.ROUND_UP });
    return new Decimal(num);

}

export function multiplyDecimal(decimal: Decimal, multiplier: number | string | Decimal): Decimal {

    return decimal.times(multiplier);

}

export function divideDecimal(decimal: Decimal, divisor: number | string | Decimal): Decimal {

    return decimal.dividedBy(divisor);

}

export function addDecimal(decimal1: Decimal, addition: number | string | Decimal): Decimal {

    return decimal1.plus(addition);

}

export function subtractDecimal(decimal1: Decimal, subtraction: number | string | Decimal): Decimal {
    return decimal1.minus(subtraction);
}

export function isDecimalLessThan(decimal1: Decimal, compareTo: number | string | Decimal): boolean {
    return decimal1.lessThan(compareTo);
}

export function isDecimalGreaterThan(decimal1: Decimal, compareTo: number | string | Decimal): boolean {
    return decimal1.greaterThan(compareTo);
}

export function isDecimalEqualTo(decimal1: Decimal, compareTo: number | string | Decimal): boolean {
    return decimal1.equals(compareTo);
}