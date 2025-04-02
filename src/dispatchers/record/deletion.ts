
import errors from "../../mappings/errors";
import { recordDeletionManifest } from "../../manifests/records/record-deletion-manifest";

import { transactionError, transactionResponse } from "../../utils/response.utils";
import { sendTransaction } from "../../utils/transaction.utils";

import { TransactionFeedbackStackI, SdkTransactionResponseT } from "../../common/response.types";
import { DeleteRecordDispatcherPropsI } from "../../common/dispatcher.types";
import { docketToRecordId } from "../../utils/record.utils";


export async function dispatchRecordDeletion({
    sdkInstance,
    rdt,
    accountAddress,
    domainDetails,
    docket,
    callbacks
}: DeleteRecordDispatcherPropsI): Promise<SdkTransactionResponseT<TransactionFeedbackStackI>> {

    try {

        const recordId = await docketToRecordId(domainDetails.name, docket, true);

        const manifest = recordDeletionManifest({
            sdkInstance,
            accountAddress,
            rootDomainId: domainDetails.id,
            recordId
        });

        const dispatch = await sendTransaction({
            rdt,
            message: `Delete Domain Record`,
            manifest,
            transaction: sdkInstance.transaction,
            callbacks
        });

        if (!dispatch) {
            return transactionError(errors.record.deletion({ docket }));
        }

        return transactionResponse({
            code: 'RECORD_SUCCESSFULLY_DELETED',
            details: `The domain record was successfully deleted.`
        });

    } catch (error) {

        return transactionError(errors.record.deletion({ docket, verbose: error }));

    }

}
