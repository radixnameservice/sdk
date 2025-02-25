import { ErrorI } from "./response.types";

export type ParamProcessConfigT = {
    normalize?: (value: any) => any | Promise<any>;
    validate?: (value: any) => true | ErrorI | Promise<true | ErrorI>;
    missingError?: (value: any) => ErrorI;
};

export type ParamProcessMapT = {
    [key: string]: ParamProcessConfigT;
};