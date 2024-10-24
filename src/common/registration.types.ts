import { RadixDappToolkit } from "@radixdlt/radix-dapp-toolkit";
import RnsSDK from "..";
import { InstancePropsI } from "./entities.types";
import { UserSpecificsI } from "./user.types";

export interface RegistrationResponse {
    status: 'registration-successful' | 'registration-failed';
    verbose: string;
}

export interface RegistrationDispatcherPropsI extends InstancePropsI {

    domain: string;
    rdt: RadixDappToolkit;
    durationYears: number;
    userDetails: UserSpecificsI;
    sdkInstance: RnsSDK;


}