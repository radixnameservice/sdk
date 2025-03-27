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

export function wrapResponse<T>(response: T | ErrorStackI): T & { errors?: ErrorI[] } {

    const isError = response && typeof response === "object" && "errors" in response && Array.isArray((response as any).errors);

    if (Array.isArray(response)) {

        const newArray = response.slice();

        Object.defineProperty(newArray, "errors", {
            value: isError ? (response as any).errors : undefined,
            enumerable: false, // so it won't show up in array iterations
            configurable: true,
            writable: false,
        });

        return newArray as T & { errors?: ErrorI[] };
    } else {

        const newObj = { ...(response as object) } as T & { errors?: ErrorI[] };

        if (!isError) {
            newObj.errors = undefined;
        }

        return newObj;
    }
}
