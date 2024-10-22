import { Transaction } from "@radixdlt/babylon-gateway-api-sdk";
import { RadixDappToolkit } from "@radixdlt/radix-dapp-toolkit";

interface SendTransactionI {

    id: string;
    manifest: string;
    rdt: RadixDappToolkit;
    transaction: Transaction;
    callbacks: EventCallbacksI;
    message?: string;

}

export interface EventCallbacksI {

    onInit: Function;
    onSuccess: Function;
    onFail: Function;
    onAppApproved: Function;
    onIntentReceipt: Function;

}

export async function sendTransaction({ manifest, rdt, transaction, callbacks, message }: SendTransactionI): Promise<boolean> {

    try {

        if (!rdt) {
            if (callbacks.onInit) callbacks.onFail({ manifest });
            throw new Error('RNS SDK: The Radix Dapp Toolkit must be initialized and passed into the sendTransaction method.');
        }

        if (callbacks.onInit) callbacks.onInit({ manifest });

        const result = await rdt?.walletApi.sendTransaction({
            transactionManifest: manifest,
            message
        });

        if (!result || result.isErr()) {

            if (callbacks.onFail) callbacks.onFail(result);
            if (result.isErr()) throw new Error(`RNS SDK: ${result.error}`);

            throw new Error(`RNS SDK: ${result}`);

        }

        if (callbacks.onAppApproved) callbacks.onAppApproved({ manifest });
        const intentHash = result.value.transactionIntentHash;
        if (callbacks.onIntentReceipt) callbacks.onIntentReceipt({ manifest, intentHash });

        const transactionStatus = await transaction.getStatus(intentHash);
        const getCommitReceipt = await transaction.getCommittedDetails(intentHash);
        if (callbacks.onSuccess) callbacks.onSuccess(getCommitReceipt);

        return true;

    } catch (error) {

        console.log(error);
        return false;

    }

}