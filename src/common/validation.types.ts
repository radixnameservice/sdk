import { ErrorI } from "./response.types";

export type ParamProcessConfigT = {
    normalize?: (value: any) => any;
    validate?: (value: any) => { valid: boolean; message?: string };
    missingError?: (value: any) => ErrorI;
    invalidError?: (value: any, message?: string) => ErrorI;
};

export type ParamProcessMapT = {
    [key: string]: ParamProcessConfigT;
};