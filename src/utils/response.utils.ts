import { ErrorI, ErrorStackI, SdkResponseT, SdkTransactionResponseT, TransactionFeedbackI, TransactionFeedbackStackI } from "../common/response.types";

export function feedbackStack(feedback: TransactionFeedbackI | TransactionFeedbackI[]): TransactionFeedbackStackI {

    if (Array.isArray(feedback)) {
        return {
            feedback
        };
    }

    return {
        feedback: [feedback]
    };

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

export function retrievalResponse<T>(response: T): SdkResponseT<T> {
    return { data: response, errors: undefined };
}

export function retrievalError<T>(error: ErrorI | ErrorI[]): SdkResponseT<T> {
    return { data: undefined, errors: errorStack(error) };
}

export function transactionResponse<T>(feedback: TransactionFeedbackI | TransactionFeedbackI[]): SdkTransactionResponseT<TransactionFeedbackStackI> {
    return { feedback: feedbackStack(feedback), errors: undefined };
}

export function transactionError<T>(error: ErrorI | ErrorI[]): SdkTransactionResponseT<T> {
    return { feedback: undefined, errors: errorStack(error) };
}