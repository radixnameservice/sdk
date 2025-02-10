import { ErrorI, ErrorStackResponseI, SuccessI, CommitmentStackResponseI } from "../common/response.types";

export function successResponse(success: SuccessI | SuccessI): CommitmentStackResponseI {

    if (Array.isArray(success)) {
        return {
            success
        };
    }

    return {
        success: [success]
    };

}

export function errorResponse(errors: ErrorI | ErrorI[]): ErrorStackResponseI {

    if (Array.isArray(errors)) {
        return {
            errors
        };
    }

    return {
        errors: [errors]
    };

}