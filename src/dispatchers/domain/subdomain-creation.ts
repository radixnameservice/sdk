import subdomainCreationManifest from "../../manifests/domains/subdomain-creation-manifest";

import errors from "../../mappings/errors";

import { sendTransaction } from "../../utils/transaction.utils";
import { transactionError, transactionResponse } from "../../utils/response.utils";

import { SubdomainDispatcherPropsI } from "../../common/dispatcher.types";
import { TransactionFeedbackStackI, SdkTransactionResponseT } from "../../common/response.types";


export async function dispatchSubdomainCreation({
    sdkInstance,
    subdomain,
    rootDomainDetails,
    rdt,
    accountAddress,
    callbacks
}: SubdomainDispatcherPropsI): Promise<SdkTransactionResponseT<TransactionFeedbackStackI>> {

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
            return transactionError(errors.subdomain.generic({ subdomain }));

        return transactionResponse({
            code: 'SUBDOMAIN_CREATION_SUCCESSFUL',
            details: `${subdomain} was succesfully created.`
        });

    } catch (error) {

        return transactionError(errors.subdomain.creation({ subdomain, verbose: error }));

    }

}