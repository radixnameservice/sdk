import { badgeErrors, commonErrors } from "../../mappings/errors";

import { ErrorStackResponseI, UserBadgeResponseT } from "../../common/response.types";
import { UserBadgeReqPropsI } from "../../common/user.types";

import { dataResponse, errorStack } from "../../utils/response.utils";


export async function getUserBadgeId({ sdkInstance, accountAddress }: UserBadgeReqPropsI): Promise<UserBadgeResponseT | ErrorStackResponseI> {

    try {

        if (!accountAddress)
            return errorStack(commonErrors.missingParameters({ verbose: 'No account address was provided to the getUserBadge method.' }));

        const accountNfts = await sdkInstance.state.getEntityDetailsVaultAggregated(accountAddress);

        const ids = accountNfts.non_fungible_resources.items.find(nft => nft.resource_address === sdkInstance.entities.resources.badges.rnsUser)?.vaults.items[0].items ?? [];

        if (!ids.length) {
            return null;
        }

        return dataResponse({ badgeId: ids[0] });

    } catch (error) {

        return errorStack(badgeErrors.userRequest({ accountAddress, verbose: error }));

    }

}