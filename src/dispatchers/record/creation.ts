
import { sendTransaction } from "../../utils/transaction.utils";

import { recordErrors } from "../../common/errors";
import { recordCreationManifest } from "../../manifests/records/record-creation-manifest";

import { errorStack, successResponse } from "../../utils/response.utils";
import { ErrorStackResponseI, CommitmentStackResponseI } from "../../common/response.types";
import { CreateRecordDispatcherPropsI } from "../../common/dispatcher.types";

export async function dispatchRecordCreation({
    sdkInstance,
    rdt,
    userDetails,
    domainDetails,
    docket,
    callbacks,
    proofs // Optional parameter for additional proofs
}: CreateRecordDispatcherPropsI): Promise<CommitmentStackResponseI | ErrorStackResponseI> {

    try {

        const manifest = recordCreationManifest({
            sdkInstance,
            userDetails,
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
            return errorStack(recordErrors.creation({ docket }));
        }

        return successResponse({
            code: 'RECORD_SUCCESSFULLY_CREATED',
            details: `The domain record was successfully created.`
        });

    } catch (error) {

        return errorStack(recordErrors.creation({ docket, verbose: error }));

    }

}
