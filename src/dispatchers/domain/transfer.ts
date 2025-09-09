import transferDomainManifest from "../../manifests/domains/transfer-domain-manifest";

import { sendTransaction } from "../../utils/transaction.utils";
import { transactionError, transactionResponse } from "../../utils/response.utils";
import errors from "../../mappings/errors";

import { TransferDispatcherPropsI } from "../../common/dispatcher.types";
import { SdkTransactionResponseT, TransactionFeedbackStackI } from "../../common/response.types";


export async function dispatchDomainTransfer({
    sdkInstance,
    domainDetails,
    rdt,
    fromAddress,
    destinationAddress,
    preferences,
    callbacks
}: TransferDispatcherPropsI): Promise<SdkTransactionResponseT<TransactionFeedbackStackI>> {

    try {

        const subdomainsResponse = await sdkInstance.getSubdomains({ domain: domainDetails.name });
        const subdomainIds = subdomainsResponse.errors ? [] : subdomainsResponse.data.subdomains.map(subdomain => subdomain.id);

        const manifest = await transferDomainManifest({
            sdkInstance,
            rootDomainId: domainDetails.id,
            fromAddress,
            destinationAddress,
            preferences: {
                deleteRecords: preferences?.deleteRecords ?? false,
                deleteSubdomains: preferences?.deleteSubdomains ?? false,
            },
            subdomainIds,
        });

        const dispatch = await sendTransaction({
            rdt,
            message: `Transfer ${domainDetails.name}`,
            manifest,
            transaction: sdkInstance.transaction,
            callbacks
        });

        if (!dispatch)
            return transactionError(errors.transfer.generic({ domain: domainDetails.name }));

        return transactionResponse({
            code: 'TRANSFER_SUCCESSFUL',
            details: `${domainDetails.name} was succesfully transferred.`
        });

    } catch (error) {

        return transactionError(errors.transfer.generic({ domain: domainDetails.name, verbose: error }));

    }

}