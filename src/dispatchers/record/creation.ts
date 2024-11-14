import recordCreationManifest from "../../manifests/record-creation-manifest";

import { sendTransaction } from "../../utils/transaction.utils";
import { CreateRecordDispatcherPropsI, RecordCreationResponse } from "../../common/dispatcher.types";


export async function dispatchRecordCreation({
    sdkInstance,
    rdt,
    userDetails,
    domainId,
    rootDomainId,
    docket,
    callbacks
}: CreateRecordDispatcherPropsI): Promise<RecordCreationResponse> { 

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

        if (!dispatch) {

            return {
                status: 'creation-failed',
                verbose: `An error occurred when attempting to create a domain record for: ${docket.context}:${docket.directive}.`
            };

        }

        return {
            status: 'creation-successful',
            verbose: `An domain record was succesfully created.`
        };

    } catch (error) {

        return {
            status: 'creation-failed',
            verbose: `An error occurred when attempting to create an domain record: ${error}.`
        };

    }

}