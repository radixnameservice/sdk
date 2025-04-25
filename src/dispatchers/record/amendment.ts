
import { sendTransaction } from "../../utils/transaction.utils";

import errors from "../../mappings/errors";
import { recordUpdateManifest } from "../../manifests/records/record-update-manifest";

import { transactionError, transactionResponse } from "../../utils/response.utils";
import { docketToRecordId } from "../../utils/record.utils";

import { AmendRecordDispatcherPropsI } from "../../common/dispatcher.types";
import { SdkTransactionResponseT, TransactionFeedbackStackI } from "../../common/response.types";
import { SubDomainDataI } from "../../common/domain.types";


export async function dispatchRecordAmendment({
    sdkInstance,
    rdt,
    accountAddress,
    docket,
    proofs,
    domainDetails,
    callbacks
}: AmendRecordDispatcherPropsI): Promise<SdkTransactionResponseT<TransactionFeedbackStackI>> {

    try {

        let rootDomainId: string = domainDetails.id;

        if (sdkInstance.utils.isSubdomain(domainDetails.name)) {
            const subdomainDetails = domainDetails as SubDomainDataI;
            rootDomainId = subdomainDetails.root_domain.id;
        }

        const recordId = await docketToRecordId(domainDetails.name, docket, docket.proven);

        const manifest = recordUpdateManifest({
            sdkInstance,
            accountAddress,
            recordDocket: docket,
            rootDomainId,
            recordId,
            proofs
        });

        const dispatch = await sendTransaction({
            rdt,
            message: `Edit Domain Record`,
            manifest,
            transaction: sdkInstance.transaction,
            callbacks
        });

        if (!dispatch) {
            return transactionError(errors.record.amendment({ docket }));
        }

        return transactionResponse({
            code: 'RECORD_SUCCESSFULLY_AMENDED',
            details: `The domain record was successfully amended.`
        });

    } catch (error) {

        return transactionError(errors.record.amendment({ docket, verbose: error }));

    }

}
