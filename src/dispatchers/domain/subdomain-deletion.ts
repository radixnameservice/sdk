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
    rootDomainDetails,
    rdt,
    userDetails,
    callbacks
}: SubdomainDispatcherPropsI): Promise<CommitmentStackResponseI | ErrorStackResponseI> {

    try {

        const subdomainDetails = rootDomainDetails.subdomains.find((subdomainItem) => subdomainItem.name === subdomain);

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
            message: `Delete ${subdomain}`,
            manifest,
            transaction: sdkInstance.transaction,
            callbacks
        });

        if (!dispatch)
            return errorStack(errors.subdomain.generic({ subdomain }));

        return successResponse({
            code: 'SUBDOMAIN_DELETION_SUCCESSFUL',
            details: `${subdomain} was succesfully deleted.`
        });

    } catch (error) {

        return errorStack(errors.subdomain.deletion({ subdomain, verbose: error }));

    }

}