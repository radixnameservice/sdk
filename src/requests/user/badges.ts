import { badgeErrors, commonErrors } from "../../common/errors";
import { ErrorStackResponse } from "../../common/response.types";
import { UserBadgeReqPropsI, UserBadgeResponse } from "../../common/user.types";
import { errorResponse } from "../../utils/response.utils";

export async function getUserBadgeId({ sdkInstance, accountAddress }: UserBadgeReqPropsI): Promise<UserBadgeResponse | ErrorStackResponse> {

    try {

        if (!accountAddress)
            return errorResponse(commonErrors.missingParameters({ verbose: 'No account address was provided to the getUserBadge method.' }));

        const accountNfts = await sdkInstance.state.getEntityDetailsVaultAggregated(accountAddress);

        const ids = accountNfts.non_fungible_resources.items.find(nft => nft.resource_address === sdkInstance.entities.resources.badges.rnsUser)?.vaults.items[0].items ?? [];

        if (!ids.length) {
            return null;
        }

        return ids[0];

    } catch (error) {

        return errorResponse(badgeErrors.userRequest({ accountAddress, verbose: error }));

    }

}