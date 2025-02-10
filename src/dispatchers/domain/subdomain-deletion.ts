import subdomainDeletionManifest from "../../manifests/domains/subdomain-deletion-manifest";

import { sendTransaction } from "../../utils/transaction.utils";
import { errorResponse, successResponse } from "../../utils/response.utils";
import { deriveRootDomain, normaliseDomain, validateSubdomain } from "../../utils/domain.utils";

import { commonErrors, subdomainErrors } from "../../common/errors";

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

        if (!subdomainValidation.valid)
            return errorResponse(commonErrors.invalidSubdomain({ subdomain, verbose: subdomainValidation.message }));

        const rootDomain = deriveRootDomain(normalisedSubDomain);
        const rootDomainDetails = await sdkInstance.getDomainDetails(rootDomain);

        if ('errors' in rootDomainDetails) {
            return rootDomainDetails;
        }

        const subdomainDetails = rootDomainDetails.subdomains.find((subdomain) => subdomain.name === normalisedSubDomain);

        if (!subdomainDetails)
            return errorResponse(commonErrors.subdomainNotExist({ subdomain }));

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
            return errorResponse(subdomainErrors.generic({ subdomain }));

        return successResponse({
            code: 'SUBDOMAIN_DELETION_SUCCESSFUL',
            details: `${normalisedSubDomain} was succesfully deleted.`
        });

    } catch (error) {

        return errorResponse(subdomainErrors.deletion({ subdomain, verbose: error }));

    }

}