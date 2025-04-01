import { ErrorI } from "./response.types";

export type UtilValidationT = {
    isValid: boolean;
    errors?: ErrorI[];
};