import { RadixDappToolkit } from "@radixdlt/radix-dapp-toolkit";

import { EventCallbacksI } from "./transaction.types";
import { InstancePropsI, ProofsI } from "./entities.types";
import { RecordDocketI, DocketPropsI } from "./record.types";
import { DomainDataI, SubDomainDataI } from "./domain.types";


export interface DispatcherPropsI extends InstancePropsI {

    rdt: RadixDappToolkit;
    callbacks?: EventCallbacksI;

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
    domainDetails: DomainDataI | SubDomainDataI;
    docket: RecordDocketI;
    proofs: ProofsI;

}

export interface AmendRecordDispatcherPropsI extends DispatcherPropsI {

    accountAddress: string;
    domainDetails: DomainDataI | SubDomainDataI;
    docket: RecordDocketI;
    proofs: ProofsI;

}

export interface DeleteRecordDispatcherPropsI extends DispatcherPropsI {

    accountAddress: string;
    domainDetails: DomainDataI | SubDomainDataI;
    docket: DocketPropsI;

}

export interface TransferDispatcherPropsI extends DispatcherPropsI {

    domainDetails: DomainDataI;
    fromAddress: string;
    destinationAddress: string;
    preferences?: TransferPreferencesI;

}

export interface TransferPreferencesI {

    deleteRecords?: boolean;
    deleteSubdomains?: boolean;

}