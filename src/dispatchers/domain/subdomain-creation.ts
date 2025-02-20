import subdomainCreationManifest from "../../manifests/domains/subdomain-creation-manifest";

import errors from "../../mappings/errors";

import { sendTransaction } from "../../utils/transaction.utils";
import { errorStack, successResponse } from "../../utils/response.utils";
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

        if (subdomainValidation !== true)
            return errorStack(subdomainValidation);

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
            return errorStack(errors.subdomain.generic({ subdomain }));

        return successResponse({
            code: 'SUBDOMAIN_CREATION_SUCCESSFUL',
            details: `${normalisedSubDomain} was succesfully created.`
        });

    } catch (error) {

        return errorStack(errors.subdomain.creation({ subdomain, verbose: error }));

    }

}