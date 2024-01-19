import { ProgrammaticScryptoSborValueI64 } from "@radixdlt/babylon-gateway-api-sdk";
import { InstancePropsI } from "../../common/entities.types";
import { Convert } from "@radixdlt/radix-engine-toolkit";
import { stringToUint } from "../../utils/string.utils";

export interface Auction {
    id: string;
    bid_amount: string;
    initial_bid_amount: string;
    highest_bidder: string;
    original_buyer: string;
    end_timestamp: number;
}

export async function requestAuctionsForDomain(domainId: string, { state, entities }: InstancePropsI) {
    const latestAuctionId = +((await state.innerClient.keyValueStoreData({
        stateKeyValueStoreDataRequest: {
            key_value_store_address: entities.latestAuctionId,
            keys: [{ key_json: { kind: 'NonFungibleLocalId', value: `[${domainId}]` } }]
        }
    })).entries[0].value.programmatic_json as ProgrammaticScryptoSborValueI64).value;

    const auctionIds = Array(latestAuctionId + 1).fill(0).map((_, i) => {
        return `[${Convert.Uint8Array.toHexString(
            new Uint8Array([
                ...Convert.HexString.toUint8Array(domainId),
                ...stringToUint(`${i}`),
            ]),
        )}]`;
    });

    const auctionNfts = await state.getNonFungibleData(entities.rnsAuctionNftResource, auctionIds);

    return auctionNfts.map((auction) => {
        if (auction.data?.programmatic_json.kind === 'Tuple') {
            return auction.data.programmatic_json.fields.reduce((acc, field) => {
                if (field.field_name === 'end_timestamp' && field.kind === 'I64') {
                    return { ...acc, [field.field_name]: +field.value * 1000 };
                }

                if (field.kind === 'I64' || field.kind === 'Decimal' || field.kind === 'NonFungibleLocalId') {
                    if (field.field_name) {
                        return { ...acc, [field.field_name]: field.value };
                    }
                }

                return acc;
            }, { id: auction.non_fungible_id } as Auction);
        }
    });
}
