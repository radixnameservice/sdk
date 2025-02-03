import activateDomainManifest from "../../manifests/domains/domain-activation-manifest";

import { sendTransaction } from "../../utils/transaction.utils";
import { errorResponse, successResponse } from "../../utils/response.utils";
import { activationErrors } from "../../common/errors";

import { ActivationDispatcherPropsI } from "../../common/dispatcher.types";
import { ErrorStackResponse, CommitmentStackResponse } from "../../common/response.types";


export async function dispatchDomainActivation({
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

        const manifest = await activateDomainManifest({
            sdkInstance,
            rootDomainId: details.id,
            subdomainIds: details.subdomains.map(subDomain => subDomain.id),
            userDetails
        });

        const dispatch = await sendTransaction({
            rdt,
            message: `Activate ${domain}`,
            manifest,
            transaction: sdkInstance.transaction,
            callbacks
        });

        if (!dispatch)
            return errorResponse(activationErrors.generic({ domain }));

        return successResponse({
            code: 'ACTIVATION_SUCCESSFUL',
            details: `${domain} was succesfully activated.`
        });

    } catch (error) {

        return errorResponse(activationErrors.generic({ domain, verbose: error }));

    }

}