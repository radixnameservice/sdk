import { UserBadgeReqPropsI, UserBadgeResponse } from "../../common/user.types";

export async function getUserBadgeId({ sdkInstance, accountAddress }: UserBadgeReqPropsI): Promise<UserBadgeResponse> {

    try {

        if (!accountAddress) {

            return {
                status: 'invalid-input',
                verbose: `No account address was provided to this method.`
            };

        }

        const accountNfts = await sdkInstance.state.getEntityDetailsVaultAggregated(accountAddress);

        const ids = accountNfts.non_fungible_resources.items.find(nft => nft.resource_address === sdkInstance.entities.resources.badges.rnsUser)?.vaults.items[0].items ?? [];

        if (!ids.length) {

            return null;

        }

        return ids[0];

    } catch (error) {

        return {
            status: 'failed',
            verbose: `An error occurred when attempting to fetch an RNS user badge: ${error}.`
        };

    }

}