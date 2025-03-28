import activateDomainManifest from "../../manifests/domains/domain-activation-manifest";

import { sendTransaction } from "../../utils/transaction.utils";
import { transactionError, transactionResponse } from "../../utils/response.utils";
import errors from "../../mappings/errors";

import { ActivationDispatcherPropsI } from "../../common/dispatcher.types";
import { SdkTransactionResponseT, TransactionFeedbackStackI } from "../../common/response.types";


export async function dispatchDomainActivation({
    sdkInstance,
    domainDetails,
    rdt,
    accountAddress,
    callbacks
}: ActivationDispatcherPropsI): Promise<SdkTransactionResponseT<TransactionFeedbackStackI>> {

    try {

        const manifest = await activateDomainManifest({
            sdkInstance,
            rootDomainId: domainDetails.id,
            subdomainIds: domainDetails.subdomains ? domainDetails.subdomains.map(subdomain => subdomain.id) : [],
            accountAddress
        });

        const dispatch = await sendTransaction({
            rdt,
            message: `Activate ${domainDetails.name}`,
            manifest,
            transaction: sdkInstance.transaction,
            callbacks
        });

        if (!dispatch)
            return transactionError(errors.activation.generic({ domain: domainDetails.name }));

        return transactionResponse({
            code: 'ACTIVATION_SUCCESSFUL',
            details: `${domainDetails.name} was succesfully activated.`
        });

    } catch (error) {

        return transactionError(errors.activation.generic({ domain: domainDetails.name, verbose: error }));

    }

}