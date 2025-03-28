import subdomainDeletionManifest from "../../manifests/domains/subdomain-deletion-manifest";

import errors from "../../mappings/errors";

import { sendTransaction } from "../../utils/transaction.utils";
import { transactionError, transactionResponse } from "../../utils/response.utils";

import { SubdomainDispatcherPropsI } from "../../common/dispatcher.types";
import { SdkTransactionResponseT, TransactionFeedbackStackI } from "../../common/response.types";


export async function dispatchSubdomainDeletion({
    sdkInstance,
    subdomain,
    rootDomainDetails,
    rdt,
    accountAddress,
    callbacks
}: SubdomainDispatcherPropsI): Promise<SdkTransactionResponseT<TransactionFeedbackStackI>> {

    try {

        const subdomainDetails = rootDomainDetails.subdomains.find((subdomainItem) => subdomainItem.name === subdomain);

        if (!subdomainDetails)
            return transactionError(errors.subdomain.doesNotExist({ subdomain }));

        const manifest = await subdomainDeletionManifest({
            sdkInstance,
            accountAddress,
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
            return transactionError(errors.subdomain.generic({ subdomain }));

        return transactionResponse({
            code: 'SUBDOMAIN_DELETION_SUCCESSFUL',
            details: `${subdomain} was succesfully deleted.`
        });

    } catch (error) {

        return transactionError(errors.subdomain.deletion({ subdomain, verbose: error }));

    }

}