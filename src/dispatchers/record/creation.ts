
import { sendTransaction } from "../../utils/transaction.utils";

import { recordErrors } from "../../common/errors";
import { recordCreationManifest } from "../../manifests/records/record-creation-manifest";

import { errorResponse, successResponse } from "../../utils/response.utils";
import { ErrorStackResponse, CommitmentStackResponse } from "../../common/response.types";
import { CreateRecordDispatcherPropsI } from "../../common/dispatcher.types";

export async function dispatchRecordCreation({
    sdkInstance,
    rdt,
    userDetails,
    domainDetails,
    docket,
    callbacks,
    proofs // Optional parameter for additional proofs
}: CreateRecordDispatcherPropsI): Promise<CommitmentStackResponse | ErrorStackResponse> {

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
            return errorResponse(recordErrors.creation({ docket }));
        }

        return successResponse({
            code: 'RECORD_SUCCESSFULLY_CREATED',
            details: `The domain record was successfully created.`
        });

    } catch (error) {

        return errorResponse(recordErrors.creation({ docket, verbose: error }));

    }

}
