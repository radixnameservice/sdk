export function ucWords(str: string) {

    const loweredStr = str.toLowerCase();
    return loweredStr.charAt(0).toUpperCase() + loweredStr.slice(1);

}

export function stringToUint(num: `${number}`) {
    const encoder = new TextEncoder();
    const number = encoder.encode(num);
    return number;
}