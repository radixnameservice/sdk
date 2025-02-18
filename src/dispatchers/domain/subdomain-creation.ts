import subdomainCreationManifest from "../../manifests/domains/subdomain-creation-manifest";

import { subdomainErrors } from "../../common/errors";

import { sendTransaction } from "../../utils/transaction.utils";
import { errorResponse, successResponse } from "../../utils/response.utils";
import { deriveRootDomain, normaliseDomain, validateSubdomain } from "../../utils/domain.utils";

import { SubdomainDispatcherPropsI } from "../../common/dispatcher.types";
import { ErrorStackResponseI, CommitmentStackResponseI } from "../../common/response.types";


export async function dispatchSubdomainCreation({
    sdkInstance,
    subdomain,
    rdt,
    userDetails,
    callbacks
}: SubdomainDispatcherPropsI): Promise<CommitmentStackResponseI | ErrorStackResponseI> {

    try {

        const normalisedSubDomain = normaliseDomain(subdomain);
        const subdomainValidation = validateSubdomain(normalisedSubDomain);

        if (!subdomainValidation.valid)
            return errorResponse(subdomainErrors.invalid({ subdomain, verbose: subdomainValidation.message }));

        const rootDomain = deriveRootDomain(normalisedSubDomain);
        const detailsRequest = await sdkInstance.getDomainDetails({ domain: rootDomain });

        if (detailsRequest instanceof Error)
            throw detailsRequest;

        if ('errors' in detailsRequest) {
            return detailsRequest;
        }

        const details = detailsRequest.data.details;

        const manifest = await subdomainCreationManifest({
            sdkInstance,
            subdomain: normalisedSubDomain,
            rootDomainId: details.id,
            userDetails
        });

        const dispatch = await sendTransaction({
            rdt,
            message: `Create ${normalisedSubDomain}`,
            manifest,
            transaction: sdkInstance.transaction,
            callbacks
        });

        if (!dispatch)
            return errorResponse(subdomainErrors.generic({ subdomain }));

        return successResponse({
            code: 'SUBDOMAIN_CREATION_SUCCESSFUL',
            details: `${normalisedSubDomain} was succesfully created.`
        });

    } catch (error) {

        return errorResponse(subdomainErrors.creation({ subdomain, verbose: error }));

    }

}