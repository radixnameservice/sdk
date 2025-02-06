import subdomainCreationManifest from "../../manifests/domains/subdomain-creation-manifest";

import { sendTransaction } from "../../utils/transaction.utils";
import { errorResponse, successResponse } from "../../utils/response.utils";
import { deriveRootDomain, normaliseDomain } from "../../utils/domain.utils";

import { activationErrors } from "../../common/errors";

import { SubdomainDispatcherPropsI } from "../../common/dispatcher.types";
import { ErrorStackResponse, CommitmentStackResponse } from "../../common/response.types";




export async function dispatchSubdomainCreation({
    sdkInstance,
    subdomain,
    rdt,
    userDetails,
    callbacks
}: SubdomainDispatcherPropsI): Promise<CommitmentStackResponse | ErrorStackResponse> {

    try {

        const normalisedSubDomain = normaliseDomain(subdomain);
        const rootDomain = deriveRootDomain(normalisedSubDomain);

        const details = await sdkInstance.getDomainDetails(rootDomain);

        if ('errors' in details) {
            return details;
        }

        const manifest = await subdomainCreationManifest({
            sdkInstance,
            subdomain: normalisedSubDomain,
            rootDomainId: details.id,
            userDetails
        });

        return successResponse({
            code: 'SUBDOMAIN_CREATION_SUCCESSFUL',
            details: `${normalisedSubDomain} was succesfully created.`
        });

    } catch (error) {

       // return errorResponse(activationErrors.generic({ domain, verbose: error }));

    }

}