import { RadixDappToolkit } from "@radixdlt/radix-dapp-toolkit";
import RnsSDK from "..";

import { UserSpecificsI } from "./user.types";
import { EventCallbacksI } from "./transaction.types";

export interface DispatcherPropsI {

    sdkInstance: RnsSDK;
    rdt: RadixDappToolkit;
    callbacks?: EventCallbacksI;

}

export interface RegistrationResponse {
    status: 'registration-successful' | 'registration-failed';
    verbose: string;
}

export interface RegistrationDispatcherPropsI extends DispatcherPropsI {

    domain: string;
    durationYears: number;
    userDetails: UserSpecificsI;

}