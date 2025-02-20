import subdomainDeletionManifest from "../../manifests/domains/subdomain-deletion-manifest";

import errors from "../../mappings/errors";

import { sendTransaction } from "../../utils/transaction.utils";
import { errorStack, successResponse } from "../../utils/response.utils";
import { deriveRootDomain, normaliseDomain, validateSubdomain } from "../../utils/domain.utils";

import { SubdomainDispatcherPropsI } from "../../common/dispatcher.types";
import { ErrorStackResponseI, CommitmentStackResponseI } from "../../common/response.types";


export async function dispatchSubdomainDeletion({
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
        const requestRootDetails = await sdkInstance.getDomainDetails({ domain: rootDomain });

        if (requestRootDetails instanceof Error)
            throw requestRootDetails;

        if ('errors' in requestRootDetails) {
            return requestRootDetails;
        }

        const rootDomainDetails = requestRootDetails.data.details;
        const subdomainDetails = rootDomainDetails.subdomains.find((subdomain) => subdomain.name === normalisedSubDomain);

        if (!subdomainDetails)
            return errorStack(errors.subdomain.doesNotExist({ subdomain }));

        const manifest = await subdomainDeletionManifest({
            sdkInstance,
            userDetails,
            rootDomainId: rootDomainDetails.id,
            subdomainId: subdomainDetails.id
        });

        const dispatch = await sendTransaction({
            rdt,
            message: `Delete ${normalisedSubDomain}`,
            manifest,
            transaction: sdkInstance.transaction,
            callbacks
        });

        if (!dispatch)
            return errorStack(errors.subdomain.generic({ subdomain }));

        return successResponse({
            code: 'SUBDOMAIN_DELETION_SUCCESSFUL',
            details: `${normalisedSubDomain} was succesfully deleted.`
        });

    } catch (error) {

        return errorStack(errors.subdomain.deletion({ subdomain, verbose: error }));

    }

}