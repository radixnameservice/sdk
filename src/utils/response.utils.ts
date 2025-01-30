import { ErrorI, ErrorStackResponse, SuccessI, CommitmentStackResponse } from "../common/response.types";

export function successResponse(success: SuccessI | SuccessI): CommitmentStackResponse {

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