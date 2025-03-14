import subdomainCreationManifest from "../../manifests/domains/subdomain-creation-manifest";

import errors from "../../mappings/errors";

import { sendTransaction } from "../../utils/transaction.utils";
import { errorStack, successResponse } from "../../utils/response.utils";

import { SubdomainDispatcherPropsI } from "../../common/dispatcher.types";
import { ErrorStackResponseI, CommitmentStackResponseI } from "../../common/response.types";


export async function dispatchSubdomainCreation({
    sdkInstance,
    subdomain,
    rootDomainDetails,
    rdt,
    accountAddress,
    callbacks
}: SubdomainDispatcherPropsI): Promise<CommitmentStackResponseI | ErrorStackResponseI> {

    try {

        const manifest = await subdomainCreationManifest({
            sdkInstance,
            subdomain,
            rootDomainId: rootDomainDetails.id,
            accountAddress
        });

        const dispatch = await sendTransaction({
            rdt,
            message: `Create ${subdomain}`,
            manifest,
            transaction: sdkInstance.transaction,
            callbacks
        });

        if (!dispatch)
            return errorStack(errors.subdomain.generic({ subdomain }));

        return successResponse({
            code: 'SUBDOMAIN_CREATION_SUCCESSFUL',
            details: `${subdomain} was succesfully created.`
        });

    } catch (error) {

        return errorStack(errors.subdomain.creation({ subdomain, verbose: error }));

    }

}