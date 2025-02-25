import { Transaction } from "@radixdlt/babylon-gateway-api-sdk";
import { RadixDappToolkit } from "@radixdlt/radix-dapp-toolkit";

export interface SendTransactionI {

    manifest: string;
    rdt: RadixDappToolkit;
    transaction: Transaction;
    callbacks?: EventCallbacksI;
    message?: string;

}

export interface EventCallbacksI {

    onInit?: Function;
    onSuccess?: Function;
    onFail?: Function;
    onAppApproved?: Function;
    onIntentReceipt?: Function;

}