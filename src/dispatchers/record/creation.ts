import recordCreationManifest from "../../manifests/record-creation-manifest";

import { sendTransaction } from "../../utils/transaction.utils";
import { CreateRecordDispatcherPropsI } from "../../common/dispatcher.types";
import { ErrorStackResponse, SuccessStackResponse } from "../../common/response.types";
import { errorResponse, successResponse } from "../../utils/response.utils";
import { recordErrors } from "../../common/errors";


export async function dispatchRecordCreation({
    sdkInstance,
    rdt,
    userDetails,
    domainId,
    rootDomainId,
    docket,
    callbacks
}: CreateRecordDispatcherPropsI): Promise<SuccessStackResponse | ErrorStackResponse> {

    try {

        const manifest = recordCreationManifest({
            sdkInstance,
            userDetails,
            domainId,
            rootDomainId,
            recordDocket: docket,
        });

        const dispatch = await sendTransaction({
            rdt,
            message: `Create Domain Record`,
            manifest,
            transaction: sdkInstance.transaction,
            callbacks
        });

        if (!dispatch)
            return errorResponse(recordErrors.creation({ docket }));

        return successResponse({
            code: 'RECORD_SUCCESFULLY_CREATED',
            details: `The domain record was successfully created.`
        });

    } catch (error) {

        return errorResponse(recordErrors.creation({ docket, verbose: error }));

    }

}