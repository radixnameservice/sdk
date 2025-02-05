import activateDomainManifest from "../../manifests/domains/domain-activation-manifest";

import { sendTransaction } from "../../utils/transaction.utils";
import { errorResponse, successResponse } from "../../utils/response.utils";
import { activationErrors } from "../../common/errors";

import { ActivationDispatcherPropsI } from "../../common/dispatcher.types";
import { ErrorStackResponse, CommitmentStackResponse } from "../../common/response.types";


export async function dispatchSubdomainCreation({
    sdkInstance,
    domain,
    rdt,
    userDetails,
    callbacks
}: ActivationDispatcherPropsI): Promise<CommitmentStackResponse | ErrorStackResponse> {

    try {
        

        const details = await sdkInstance.getDomainDetails(domain);

        if ('errors' in details) {
            return details;
        }
        return successResponse({
            code: 'SUBDOMAIN_CREATION_SUCCESSFUL',
            details: `${domain} was succesfully activated.`
        });

    } catch (error) {

        return errorResponse(activationErrors.generic({ domain, verbose: error }));

    }

}