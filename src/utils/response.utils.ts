import { ErrorI, ErrorStackResponse, SuccessI, SuccessStackResponse } from "../common/response.types";

export function successResponse(success: SuccessI | SuccessI): SuccessStackResponse {

    if (Array.isArray(success)) {
        return {
            success
        };
    }

    return {
        success: [success]
    };

}

export function errorResponse(errors: ErrorI | ErrorI[]): ErrorStackResponse {

    if (Array.isArray(errors)) {
        return {
            errors
        };
    }

    return {
        errors: [errors]
    };

}