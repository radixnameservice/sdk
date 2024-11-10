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

export interface BadgeIssuanceResponse {
    status: 'issuance-successful' | 'issuance-failed';
    verbose: string;
}

export interface UserBadgeDispatcherPropsI extends DispatcherPropsI {

    userDetails: UserSpecificsI;

}

export interface RegistrationDispatcherPropsI extends DispatcherPropsI {

    domain: string;
    durationYears: number;
    userDetails: UserSpecificsI;

}