
import { sendTransaction } from "../../utils/transaction.utils";

import errors from "../../mappings/errors";
import { recordCreationManifest } from "../../manifests/records/record-creation-manifest";

import { transactionError, transactionResponse } from "../../utils/response.utils";
import { TransactionFeedbackStackI, SdkTransactionResponseT } from "../../common/response.types";
import { CreateRecordDispatcherPropsI } from "../../common/dispatcher.types";

export async function dispatchRecordCreation({
    sdkInstance,
    rdt,
    accountAddress,
    domainDetails,
    docket,
    proofs,
    callbacks
}: CreateRecordDispatcherPropsI): Promise<SdkTransactionResponseT<TransactionFeedbackStackI>> {

    try {

        const manifest = recordCreationManifest({
            sdkInstance,
            accountAddress,
            rootDomainId: domainDetails.id,
            recordDocket: docket,
            proofs
        });

        const dispatch = await sendTransaction({
            rdt,
            message: `Create Domain Record`,
            manifest,
            transaction: sdkInstance.transaction,
            callbacks
        });

        if (!dispatch) {
            return transactionError(errors.record.creation({ docket }));
        }

        return transactionResponse({
            code: 'RECORD_SUCCESSFULLY_CREATED',
            details: `The domain record was successfully created.`
        });

    } catch (error) {

        return transactionError(errors.record.creation({ docket, verbose: error }));

    }

}
