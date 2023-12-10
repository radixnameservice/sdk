import { State } from "@radixdlt/babylon-gateway-api-sdk";
import { AddressMapT } from "../mappings/entities";

export interface InstancePropsI {

    state: State;
    entities: AddressMapT;

}
