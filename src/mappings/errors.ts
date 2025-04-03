import { RecordDocketI, DocketPropsI } from "../common/record.types";
import { ErrorGenerationI, ErrorI } from "../common/response.types";

const request = {

    missingParameters: ({ verbose = null }: ErrorGenerationI): ErrorI => {

        return {

            code: 'MISSING_PARAMETERS',
            error: `Not all required parameters were provided for this request.`,
            verbose

        };

    }

};

const account = {

    retrieval: ({ accountAddress, verbose = null }: ErrorGenerationI & { accountAddress: string }): ErrorI => {

        return {
            code: "ACCOUNT_RETRIEVAL_ERROR",
            error: `An error occurred when attempting to fetch items from the following account: ${accountAddress}.`,
            verbose
        };

    },

    invalidAddress: ({ accountAddress, verbose = null }: ErrorGenerationI & { accountAddress: string }): ErrorI => {

        return {
            code: "INVALID_ACCOUNT_ADDRESS",
            error: `The Radix account address entered is invalid: ${accountAddress}`,
            verbose
        };

    },

    authenticityMismatch: ({ domain, verbose = null }: ErrorGenerationI & { domain: string }): ErrorI => {

        return {

            code: "AUTHENTICITY_MISMATCH",
            error: `${domain} has failed the authenticity check.`,
            verbose: verbose || `Inconsistencies have been detected for ${domain} (e.g. could be inactive with residual records from a previous owner). It is inadvisable to utilize this domain within trusted contexts under these circumstances.`

        };

    }

};

const registration = {

    generic: ({ domain, verbose = null }: ErrorGenerationI & { domain: string }): ErrorI => {

        return {
            code: "REGISTRATION_ERROR",
            error: `An error occurred when attempting to register ${domain}.`,
            verbose
        };

    }

};

const activation = {

    generic: ({ domain, verbose = null }: ErrorGenerationI & { domain: string }): ErrorI => {

        return {
            code: "ACTIVATION_ERROR",
            error: `An error occurred when attempting to activate ${domain}.`,
            verbose
        };

    }

};

const domain = {

    generic: ({ domain, verbose = null }: ErrorGenerationI & { domain: string }): ErrorI => {

        return {
            code: "DOMAIN_ERROR",
            error: `An error occurred when attempting to interface with ${domain}.`,
            verbose
        };

    },

    unavailable: ({ domain, verbose = null }: ErrorGenerationI & { domain: string }): ErrorI => {

        return {
            code: "DOMAIN_TAKEN",
            error: `${domain} could not be registered as is already taken / reserved.`,
            verbose
        };

    },

    invalid: ({ domain, verbose = null }: ErrorGenerationI & { domain: string }): ErrorI => {

        return {

            code: 'INVALID_DOMAIN',
            error: `${domain} is an invalid domain name.`,
            verbose

        };

    },

    empty: ({ domain, verbose = null }: ErrorGenerationI & { domain: string }): ErrorI => {

        return {

            code: 'EMPTY_DOMAIN_DETAILS',
            error: `Could not retrieve details for ${domain}.`,
            verbose

        };

    }

};

const subdomain = {

    generic: ({ subdomain, verbose = null }: ErrorGenerationI & { subdomain: string }): ErrorI => {

        return {
            code: "SUBDOMAIN_ERROR",
            error: `An error occurred when attempting to interface with ${subdomain}.`,
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

    },


    invalid: ({ subdomain, verbose = null }: ErrorGenerationI & { subdomain: string }): ErrorI => {

        return {

            code: 'INVALID_SUBDOMAIN',
            error: `${subdomain} is an invalid subdomain name.`,
            verbose

        };

    },

    doesNotExist: ({ subdomain, verbose = null }: ErrorGenerationI & { subdomain: string }): ErrorI => {

        return {

            code: 'NONEXISTENT_SUBDOMAIN',
            error: `${subdomain} does not exist.`,
            verbose

        };

    },

    empty: ({ subdomain, verbose = null }: ErrorGenerationI & { subdomain: string }): ErrorI => {

        return {

            code: 'EMPTY_SUBDOMAIN_DETAILS',
            error: `Could not retrieve details for ${subdomain}.`,
            verbose

        };

    }

};

const transfer = {

    generic: ({ domain, verbose = null }: ErrorGenerationI & { domain: string }): ErrorI => {

        return {

            code: 'DOMAIN_TRANSFER_FAILED',
            error: `Failed to transfer ${domain}.`,
            verbose

        };

    }

};

const record = {

    creation: ({ docket, verbose = null }: ErrorGenerationI & { docket: RecordDocketI }): ErrorI => {

        return {
            code: "RECORD_CREATION_FAILED",
            error: `An error occurred when attempting to create a domain record for: ${docket.context}:${docket.directive}.`,
            verbose
        };

    },

    deletion: ({ docket, verbose = null }: ErrorGenerationI & { docket: DocketPropsI }): ErrorI => {

        return {
            code: "RECORD_DELETION_FAILED",
            error: `An error occurred when attempting to delete a domain record for: ${docket.context}:${docket.directive}.`,
            verbose
        };

    },

    amendment: ({ docket, verbose = null }: ErrorGenerationI & { docket: DocketPropsI }): ErrorI => {

        return {
            code: "RECORD_AMENDMENT_FAILED",
            error: `An error occurred when attempting to edit a domain record for: ${docket.context}:${docket.directive}.`,
            verbose
        };

    },

    retrieval: ({ domain, verbose = null }: ErrorGenerationI & { domain: string }): ErrorI => {

        return {
            code: "RECORD_RETRIEVAL_ERROR",
            error: `An error occurred when attempting to retrieve domain records for: ${domain}.`,
            verbose
        };

    }

};

export default { request, account, registration, activation, domain, subdomain, transfer, record }