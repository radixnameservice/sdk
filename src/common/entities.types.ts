import { State, Status } from "@radixdlt/babylon-gateway-api-sdk";
import { AddressMapT } from "../mappings/entities";
import { DependenciesI } from "./dependencies.types";

export interface InstancePropsI {

    state: State;
    status: Status;
    entities: AddressMapT;
    dependencies: DependenciesI;

}
