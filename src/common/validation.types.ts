import RnsSDK from "..";
import { ErrorI } from "./response.types";

export type ParamProcessConfigT = {
    normalize?: (value: any, instance: RnsSDK) => any | Promise<any>;
    validate?: (value: any, instance: RnsSDK) => true | ErrorI | Promise<true | ErrorI>;
    missingError?: (value: any, instance: RnsSDK) => ErrorI;
};

export type ParamProcessMapT = {
    [key: string]: ParamProcessConfigT;
};