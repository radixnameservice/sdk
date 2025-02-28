import { RadixDappToolkit } from "@radixdlt/radix-dapp-toolkit";

import { EventCallbacksI } from "./transaction.types";
import { InstancePropsI, ProofsI } from "./entities.types";
import { RecordDocketI, DocketPropsI } from "./record.types";
import { DomainDataI } from "./domain.types";


export interface DispatcherPropsI extends InstancePropsI {

    rdt: RadixDappToolkit;
    callbacks?: EventCallbacksI;

}

export interface UserBadgeDispatcherPropsI extends DispatcherPropsI {

    accountAddress: string;

}

export interface RegistrationDispatcherPropsI extends DispatcherPropsI {

    domain: string;
    durationYears: number;
    accountAddress: string;

}

export interface ActivationDispatcherPropsI extends DispatcherPropsI {

    domainDetails: DomainDataI;
    accountAddress: string;

}

export interface SubdomainDispatcherPropsI extends DispatcherPropsI {

    subdomain: string;
    rootDomainDetails: DomainDataI;
    accountAddress: string;

}

export interface CreateRecordDispatcherPropsI extends DispatcherPropsI {

    accountAddress: string;
    domainDetails: DomainDataI;
    docket: RecordDocketI;
    proofs?: ProofsI;

}

export interface DeleteRecordDispatcherPropsI extends DispatcherPropsI {

    accountAddress: string;
    domainDetails: DomainDataI;
    docket: DocketPropsI;

}

export interface AmendRecordDispatcherPropsI extends DispatcherPropsI {

    accountAddress: string;
    domainDetails: DomainDataI;
    docket: RecordDocketI;
    proofs?: ProofsI;

}