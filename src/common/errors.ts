export const commonErrors = {

    authenticityMismatch: (domain: string) => {

        return {

            code: "authenticity-mismatch",
            error: `${domain} has failed the authenticity check.`,
            verbose: `Inconsistencies have been detected for ${domain} (e.g. could be inactive with residual records from a previous owner). It is inadvisable to utilize this domain within trusted contexts under these circumstances.`

        };

    },

    invalidDomain: (domain: string, verbose: string) => {

        return {

            code: 'invalid-domain',
            error: `${domain} is an invalid domain name.`,
            verbose

        };

    },


    emptyDomainDetails: (domain: string) => {

        return {

            code: 'empty-domain-details',
            error: `Could not retrieve details for ${domain}.`,
            verbose: null

        };

    }
    

};