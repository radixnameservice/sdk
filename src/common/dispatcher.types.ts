import { RadixDappToolkit } from "@radixdlt/radix-dapp-toolkit";

import { UserSpecificsI } from "./user.types";
import { EventCallbacksI } from "./transaction.types";
import { InstancePropsI, ProofsI } from "./entities.types";
import { DocketI, DocketPropsI } from "./record.types";
import { DomainDataI } from "./domain.types";


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

    domainDetails: DomainDataI;
    userDetails: UserSpecificsI;

}

export interface SubdomainDispatcherPropsI extends DispatcherPropsI {

    subdomain: string;
    rootDomainDetails: DomainDataI;
    userDetails: UserSpecificsI;

}

export interface CreateRecordDispatcherPropsI extends DispatcherPropsI {

    userDetails: UserSpecificsI;
    domainDetails: DomainDataI;
    docket: DocketI;
    proofs?: ProofsI;

}

export interface DeleteRecordDispatcherPropsI extends DispatcherPropsI {

    userDetails: UserSpecificsI;
    domainDetails: DomainDataI;
    docket: DocketPropsI;

}

export interface AmendRecordDispatcherPropsI extends DispatcherPropsI {

    userDetails: UserSpecificsI;
    domainDetails: DomainDataI;
    docket: DocketI;
    proofs?: ProofsI;

}