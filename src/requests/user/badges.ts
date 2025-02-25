import errors, { } from "../../mappings/errors";

import { dataResponse, errorStack } from "../../utils/response.utils";

import { ErrorStackResponseI, UserBadgeResponseT } from "../../common/response.types";
import { UserBadgeReqPropsI } from "../../common/user.types";


export async function getUserBadgeId({ sdkInstance, accountAddress }: UserBadgeReqPropsI): Promise<UserBadgeResponseT | ErrorStackResponseI> {

    try {

        if (!accountAddress)
            return errorStack(errors.request.missingParameters({ verbose: 'No account address was provided to the getUserBadge method.' }));

        const accountNfts = await sdkInstance.state.getEntityDetailsVaultAggregated(accountAddress);

        const ids = accountNfts.non_fungible_resources.items.find(nft => nft.resource_address === sdkInstance.entities.resources.badges.rnsUser)?.vaults.items[0].items ?? [];

        const id = ids.length ? ids[0] : null;
        return dataResponse({ id });

    } catch (error) {

        return errorStack(errors.badge.generic({ accountAddress, verbose: error }));

    }

}