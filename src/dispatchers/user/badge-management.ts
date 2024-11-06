import issueBadgeManifest from "../../manifests/issue-badge";

import { sendTransaction } from "../../utils/transaction.utils";
import { UserBadgeDispatcherPropsI, UserBadgeResponse } from "../../common/dispatcher.types";


export async function dispatchUserBadgeIssuance({
    sdkInstance,
    rdt,
    userDetails,
    callbacks
}: UserBadgeDispatcherPropsI): Promise<UserBadgeResponse> {

    try {


        const manifest = await issueBadgeManifest({
            sdkInstance,
            userDetails
        });

        const dispatch = await sendTransaction({
            rdt,
            message: `Issue RNS User Badge`,
            manifest,
            transaction: sdkInstance.transaction,
            callbacks
        });

        if (!dispatch) {

            return {
                status: 'issuance-failed',
                verbose: `An error occurred when attempting to issue an RNS user badge to account: ${userDetails.accountAddress}.`
            };

        }

        return {
            status: 'issuance-successful',
            verbose: `An RNS badge was was succesfully issued to account: ${userDetails.accountAddress}.`
        };

    } catch (error) {

        return {
            status: 'issuance-failed',
            verbose: `An error occurred when attempting to issue an RNS user badge: ${error}.`
        };

    }

}