import { ErrorI } from "./response.types";

export type ParamProcessConfigT = {
    normalize?: (value: any) => any;
    validate?: (value: any) => true | ErrorI;
    missingError?: (value: any) => ErrorI;
};

export type ParamProcessMapT = {
    [key: string]: ParamProcessConfigT;
};