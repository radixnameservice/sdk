import activateDomainManifest from "../../manifests/domains/domain-activation-manifest";

import { sendTransaction } from "../../utils/transaction.utils";
import { errorStack, successResponse } from "../../utils/response.utils";
import errors from "../../mappings/errors";

import { ActivationDispatcherPropsI } from "../../common/dispatcher.types";
import { ErrorStackResponseI, CommitmentStackResponseI } from "../../common/response.types";


export async function dispatchDomainActivation({
    sdkInstance,
    domainDetails,
    rdt,
    userDetails,
    callbacks
}: ActivationDispatcherPropsI): Promise<CommitmentStackResponseI | ErrorStackResponseI> {

    try {

        const manifest = await activateDomainManifest({
            sdkInstance,
            rootDomainId: domainDetails.id,
            subdomainIds: domainDetails.subdomains ? domainDetails.subdomains.map(subdomain => subdomain.id) : [],
            userDetails
        });

        const dispatch = await sendTransaction({
            rdt,
            message: `Activate ${domainDetails.name}`,
            manifest,
            transaction: sdkInstance.transaction,
            callbacks
        });

        if (!dispatch)
            return errorStack(errors.activation.generic({ domain: domainDetails.name }));

        return successResponse({
            code: 'ACTIVATION_SUCCESSFUL',
            details: `${domainDetails.name} was succesfully activated.`
        });

    } catch (error) {

        return errorStack(errors.activation.generic({ domain: domainDetails.name, verbose: error }));

    }

}