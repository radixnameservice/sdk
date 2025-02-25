
import errors from "../../mappings/errors";
import { recordDeletionManifest } from "../../manifests/records/record-deletion-manifest";

import { errorStack, successResponse } from "../../utils/response.utils";
import { sendTransaction } from "../../utils/transaction.utils";

import { ErrorStackResponseI, CommitmentStackResponseI } from "../../common/response.types";
import { DeleteRecordDispatcherPropsI } from "../../common/dispatcher.types";
import { docketToRecordId } from "../../utils/record.utils";


export async function dispatchRecordDeletion({
    sdkInstance,
    rdt,
    userDetails,
    domainDetails,
    docket,
    callbacks
}: DeleteRecordDispatcherPropsI): Promise<CommitmentStackResponseI | ErrorStackResponseI> {

    try {

        const recordId = await docketToRecordId(domainDetails.name, docket);

        const manifest = recordDeletionManifest({
            sdkInstance,
            userDetails,
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
            return errorStack(errors.record.deletion({ docket }));
        }

        return successResponse({
            code: 'RECORD_SUCCESSFULLY_DELETED',
            details: `The domain record was successfully deleted.`
        });

    } catch (error) {

        return errorStack(errors.record.deletion({ docket, verbose: error }));

    }

}
