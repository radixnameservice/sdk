import { ErrorI, ErrorStackResponseI, CommitmentSuccessI, CommitmentStackResponseI, ResultI } from "../common/response.types";

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

export function dataResponse<T>(responseData: T): ResultI<T> {
    return { data: responseData };
}

export function errorStack(errors: ErrorI | ErrorI[]): ErrorStackResponseI {

    if (Array.isArray(errors)) {
        return {
            errors
        };
    }

    return {
        errors: [errors]
    };

}