import { DocketI } from "./record.types";
import { ErrorGenerationI, ErrorI } from "./response.types";

export const commonErrors = {

    authenticityMismatch: ({ domain, verbose = null }: ErrorGenerationI & { domain: string }): ErrorI => {

        return {

            code: "AUTHENTICITY_MISMATCH",
            error: `${domain} has failed the authenticity check.`,
            verbose: verbose || `Inconsistencies have been detected for ${domain} (e.g. could be inactive with residual records from a previous owner). It is inadvisable to utilize this domain within trusted contexts under these circumstances.`

        };

    },

    missingParameters: ({ verbose = null }: ErrorGenerationI): ErrorI => {

        return {

            code: 'MISSING_PARAMETERS',
            error: `Not all required parameters were provided for this request.`,
            verbose

        };

    },

    invalidDomain: ({ domain, verbose = null }: ErrorGenerationI & { domain: string }): ErrorI => {

        return {

            code: 'INVALID_DOMAIN',
            error: `${domain} is an invalid domain name.`,
            verbose

        };

    },

    invalidSubdomain: ({ subdomain, verbose = null }: ErrorGenerationI & { subdomain: string }): ErrorI => {

        return {

            code: 'INVALID_SUBDOMAIN',
            error: `${subdomain} is an invalid domain name.`,
            verbose

        };

    },

    subdomainNotExist: ({ subdomain, verbose = null }: ErrorGenerationI & { subdomain: string }): ErrorI => {

        return {

            code: 'NONEXISTENT_SUBDOMAIN',
            error: `${subdomain} does not exist.`,
            verbose

        };

    },

    emptyDomainDetails: ({ domain, verbose = null }: ErrorGenerationI & { domain: string }): ErrorI => {

        return {

            code: 'EMPTY_DOMAIN_DETAILS',
            error: `Could not retrieve details for ${domain}.`,
            verbose

        };

    },

    domainTaken: ({ domain, verbose = null }: ErrorGenerationI & { domain: string }): ErrorI => {

        return {
            code: "DOMAIN_TAKEN",
            error: `${domain} could not be registered as is already taken / reserved.`,
            verbose
        };

    },

    accountRetrieval: ({ accountAddress, verbose = null }: ErrorGenerationI & { accountAddress: string }): ErrorI => {

        return {
            code: "ACCOUNT_RETRIEVAL_ERROR",
            error: `An error occurred when attempting to fetch items from the following account: ${accountAddress}.`,
            verbose
        };

    }

};

export const registrationErrors = {

    generic: ({ domain, verbose = null }: ErrorGenerationI & { domain: string }): ErrorI => {

        return {
            code: "REGISTRATION_ERROR",
            error: `An error occurred when attempting to register ${domain}.`,
            verbose
        };

    }

};

export const activationErrors = {

    generic: ({ domain, verbose = null }: ErrorGenerationI & { domain: string }): ErrorI => {

        return {
            code: "ACTIVATION_ERROR",
            error: `An error occurred when attempting to activate ${domain}.`,
            verbose
        };

    }

};

export const subdomainErrors = {

    generic: ({ subdomain, verbose = null }: ErrorGenerationI & { subdomain: string }): ErrorI => {

        return {
            code: "SUBDOMAIN_ERROR",
            error: `An error occurred when attempting to create ${subdomain}.`,
            verbose
        };

    },

    creation: ({ subdomain, verbose = null }: ErrorGenerationI & { subdomain: string }): ErrorI => {

        return {
            code: "SUBDOMAIN_CREATION_FAILED",
            error: `An error occurred when attempting to create ${subdomain}.`,
            verbose
        };

    },

    deletion: ({ subdomain, verbose = null }: ErrorGenerationI & { subdomain: string }): ErrorI => {

        return {
            code: "SUBDOMAIN_DELETION_FAILED",
            error: `An error occurred when attempting to delete ${subdomain}.`,
            verbose
        };

    }

};

export const badgeErrors = {

    userIssuance: ({ accountAddress, verbose = null }: ErrorGenerationI & { accountAddress: string }): ErrorI => {

        return {
            code: "USER_BADGE_ISSUANCE_FAILED",
            error: `An error occurred when attempting to issue an RNS user badge to account: ${accountAddress}.`,
            verbose
        };

    },

    userRequest: ({ accountAddress, verbose = null }: ErrorGenerationI & { accountAddress: string }): ErrorI => {

        return {
            code: "USER_BADGE_REQUEST_FAILED",
            error: `An error occurred when attempting to fetch an RNS user badge: ${accountAddress}.`,
            verbose
        };

    }

};

export const recordErrors = {

    creation: ({ docket, verbose = null }: ErrorGenerationI & { docket: DocketI }): ErrorI => {

        return {
            code: "RECORD_CREATION_FAILED",
            error: `An error occurred when attempting to create a domain record for: ${docket.context}:${docket.directive}.`,
            verbose
        };

    },

    deletion: ({ docket, verbose = null }: ErrorGenerationI & { docket: DocketI }): ErrorI => {

        return {
            code: "RECORD_DELETION_FAILED",
            error: `An error occurred when attempting to delete a domain record for: ${docket.context}:${docket.directive}.`,
            verbose
        };

    }

};