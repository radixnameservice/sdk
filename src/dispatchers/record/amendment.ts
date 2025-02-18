
import { sendTransaction } from "../../utils/transaction.utils";

import { recordErrors } from "../../common/errors";
import { recordUpdateManifest } from "../../manifests/records/record-update-manifest";

import { errorStack, successResponse } from "../../utils/response.utils";
import { docketToRecordId } from "../../utils/record.utils";

import { ErrorStackResponseI, CommitmentStackResponseI } from "../../common/response.types";
import { AmendRecordDispatcherPropsI } from "../../common/dispatcher.types";


export async function dispatchRecordAmendment({
    sdkInstance,
    rdt,
    userDetails,
    docket,
    domainDetails,
    callbacks,
    proofs // Optional parameter for additional proofs
}: AmendRecordDispatcherPropsI): Promise<CommitmentStackResponseI | ErrorStackResponseI> {

    try {

        const recordId = await docketToRecordId(domainDetails.name, docket);

        const manifest = recordUpdateManifest({
            sdkInstance,
            userDetails,
            recordDocket: docket,
            rootDomainId: domainDetails.id,
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
            return errorStack(recordErrors.amendment({ docket }));
        }

        return successResponse({
            code: 'RECORD_SUCCESSFULLY_AMENDED',
            details: `The domain record was successfully amended.`
        });

    } catch (error) {

        return errorStack(recordErrors.amendment({ docket, verbose: error }));

    }

}
