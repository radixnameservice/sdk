import { RadixDappToolkit } from "@radixdlt/radix-dapp-toolkit";

import { UserSpecificsI } from "./user.types";
import { EventCallbacksI } from "./transaction.types";
import { InstancePropsI } from "./entities.types";
import { DocketI } from "./record.types";

export interface DispatcherPropsI extends InstancePropsI {

    rdt: RadixDappToolkit;
    callbacks?: EventCallbacksI;

}

export interface UserBadgeDispatcherPropsI extends DispatcherPropsI {

    userDetails: UserSpecificsI;

}

export interface RegistrationDispatcherPropsI extends DispatcherPropsI {

    domain: string;
    durationYears: number;
    userDetails: UserSpecificsI;

}

export interface CreateRecordDispatcherPropsI extends DispatcherPropsI {
   
    userDetails: UserSpecificsI;
    domainId: string;
    rootDomainId: string;
    docket: DocketI;

}