import { RadixDappToolkit } from "@radixdlt/radix-dapp-toolkit";

import { UserSpecificsI } from "./user.types";
import { EventCallbacksI } from "./transaction.types";
import { InstancePropsI } from "./entities.types";

export interface DispatcherPropsI extends InstancePropsI {

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