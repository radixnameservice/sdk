
import { sendTransaction } from "../../utils/transaction.utils";

import errors from "../../mappings/errors";
import { recordCreationManifest } from "../../manifests/records/record-creation-manifest";

import { errorStack, successResponse } from "../../utils/response.utils";
import { ErrorStackResponseI, CommitmentStackResponseI } from "../../common/response.types";
import { CreateRecordDispatcherPropsI } from "../../common/dispatcher.types";

export async function dispatchRecordCreation({
    sdkInstance,
    rdt,
    accountAddress,
    domainDetails,
    docket,
    callbacks
}: CreateRecordDispatcherPropsI): Promise<CommitmentStackResponseI | ErrorStackResponseI> {

    try {

        const manifest = recordCreationManifest({
            sdkInstance,
            accountAddress,
            rootDomainId: domainDetails.id,
            recordDocket: docket
        });

        const dispatch = await sendTransaction({
            rdt,
            message: `Create Domain Record`,
            manifest,
            transaction: sdkInstance.transaction,
            callbacks
        });

        if (!dispatch) {
            return errorStack(errors.record.creation({ docket }));
        }

        return successResponse({
            code: 'RECORD_SUCCESSFULLY_CREATED',
            details: `The domain record was successfully created.`
        });

    } catch (error) {

        return errorStack(errors.record.creation({ docket, verbose: error }));

    }

}
