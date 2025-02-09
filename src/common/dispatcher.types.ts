import { RadixDappToolkit } from "@radixdlt/radix-dapp-toolkit";

import { UserSpecificsI } from "./user.types";
import { EventCallbacksI } from "./transaction.types";
import { InstancePropsI, ProofsI } from "./entities.types";
import { DocketI } from "./record.types";
import { DomainData } from "./domain.types";

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

export interface ActivationDispatcherPropsI extends DispatcherPropsI {

    domain: string;
    userDetails: UserSpecificsI;

}

export interface SubdomainDispatcherPropsI extends DispatcherPropsI {

    subdomain: string;
    userDetails: UserSpecificsI;

}

export interface CreateRecordDispatcherPropsI extends DispatcherPropsI {
   
    userDetails: UserSpecificsI;
    rootDomainId: string;
    subDomainId?: string;
    docket: DocketI;
    proofs?: ProofsI;

}

export interface DeleteRecordDispatcherPropsI extends DispatcherPropsI {
   
    userDetails: UserSpecificsI;
    rootDomainId: string;
    recordId?: string;

}