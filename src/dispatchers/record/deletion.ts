
import errors from "../../mappings/errors";
import { recordDeletionManifest } from "../../manifests/records/record-deletion-manifest";

import { transactionError, transactionResponse } from "../../utils/response.utils";
import { sendTransaction } from "../../utils/transaction.utils";

import { TransactionFeedbackStackI, SdkTransactionResponseT } from "../../common/response.types";
import { DeleteRecordDispatcherPropsI } from "../../common/dispatcher.types";
import { docketToRecordId } from "../../utils/record.utils";
import { SubDomainDataI } from "../../common/domain.types";


export async function dispatchRecordDeletion({
    sdkInstance,
    rdt,
    accountAddress,
    domainDetails,
    docket,
    callbacks
}: DeleteRecordDispatcherPropsI): Promise<SdkTransactionResponseT<TransactionFeedbackStackI>> {

    try {

        let rootDomainId: string = domainDetails.id;

        if (sdkInstance.utils.isSubdomain(domainDetails.name)) {
            const subdomainDetails = domainDetails as SubDomainDataI;
            rootDomainId = subdomainDetails.root_domain.id;
        }

        const recordId = await docketToRecordId(domainDetails.name, docket, !docket.proven);

        const manifest = recordDeletionManifest({
            sdkInstance,
            accountAddress,
            rootDomainId,
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
