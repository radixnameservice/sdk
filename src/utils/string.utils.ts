export function ucWords(str: string) {

    const loweredStr = str.toLowerCase();
    return loweredStr.charAt(0).toUpperCase() + loweredStr.slice(1);

}