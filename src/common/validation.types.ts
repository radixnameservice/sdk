import RnsSDK from "..";
import { ErrorI } from "./response.types";

export type ParamProcessConfigT = {
    normalize?: (value: any, instance: RnsSDK) => any | Promise<any>;
    validate?: (value: any, instance: RnsSDK) => true | ErrorI | Promise<true | ErrorI>;
    missingError?: (value: any, instance: RnsSDK) => ErrorI;
};

export type ParamProcessMapT = {
    _default?: { [key: string]: ParamProcessConfigT };
    [methodName: string]: { [key: string]: ParamProcessConfigT } | undefined;
};