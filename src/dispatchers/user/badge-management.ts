import issueBadgeManifest from "../../manifests/badges/user-badge-manifest";

import { sendTransaction } from "../../utils/transaction.utils";
import { UserBadgeDispatcherPropsI } from "../../common/dispatcher.types";
import { errorResponse, successResponse } from "../../utils/response.utils";
import { badgeErrors } from "../../common/errors";
import { ErrorStackResponseI, CommitmentStackResponseI } from "../../common/response.types";


export async function dispatchUserBadgeIssuance({
    sdkInstance,
    rdt,
    userDetails,
    callbacks
}: UserBadgeDispatcherPropsI): Promise<CommitmentStackResponseI | ErrorStackResponseI> {

    try {

        const manifest = issueBadgeManifest({
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

        if (!dispatch)
            return errorResponse(badgeErrors.userIssuance({ accountAddress: userDetails.accountAddress }));


        return successResponse({
            code: 'USER_BADGE_ISSUED',
            details: `An RNS badge was was succesfully issued to account: ${userDetails.accountAddress}.`
        });

    } catch (error) {

        return errorResponse(badgeErrors.userIssuance({ accountAddress: userDetails.accountAddress, verbose: error }));

    }

}