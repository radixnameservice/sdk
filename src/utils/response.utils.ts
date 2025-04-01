import { DomainDataI, SubDomainDataI } from "../common/domain.types";
import { ErrorI, ErrorStackI, SdkResponseT, SdkTransactionResponseT, TransactionFeedbackI, TransactionFeedbackStackI } from "../common/response.types";
import { deriveDomainType } from "./domain.utils";

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
    return { data: undefined, ...errorStack(error) };
}

export function transactionResponse<T>(feedback: TransactionFeedbackI | TransactionFeedbackI[]): SdkTransactionResponseT<TransactionFeedbackStackI> {
    return { feedback: feedbackStack(feedback), errors: undefined };
}

export function transactionError<T>(error: ErrorI | ErrorI[]): SdkTransactionResponseT<T> {
    return { feedback: undefined, ...errorStack(error) };
}

export function generateAuthCheckProps({ domain, details }: { domain: string; details: DomainDataI | SubDomainDataI }) {

    const isSubdomain = deriveDomainType(domain) === 'sub';

    if (isSubdomain) {

        const { root_domain } = details as SubDomainDataI;

        return {
            domain: root_domain.name,
            accountAddress: root_domain.address
        };

    }

    const { name, address } = details as DomainDataI;

    return {
        domain: name,
        accountAddress: address
    };

}