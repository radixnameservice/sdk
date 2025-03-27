import { ErrorI, ErrorStackI, CommitmentSuccessI, CommitmentStackResponseI } from "../common/response.types";

export function successResponse(success: CommitmentSuccessI | CommitmentSuccessI[]): CommitmentStackResponseI {

    if (Array.isArray(success)) {
        return {
            success
        };
    }

    return {
        success: [success]
    };

}

export function dataResponse<T>(responseData: T): T {
    return responseData;
}

export function errorStack(errors: ErrorI | ErrorI[]): ErrorStackI {

    if (Array.isArray(errors)) {
        return {
            errors
        };
    }

    return {
        errors: [errors]
    };

}