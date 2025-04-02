import { SendTransactionI } from "../common/transaction.types";

export async function sendTransaction({ manifest, rdt, transaction, callbacks, message }: SendTransactionI): Promise<boolean> {

    try {

        if (!rdt) {
            if (callbacks?.onFail) callbacks.onFail({ manifest });
            throw new Error('RNS SDK: The Radix Dapp Toolkit must be initialized and passed into the sendTransaction method.');
        }

        if (callbacks?.onInit) callbacks.onInit({ manifest });

        const result = await rdt?.walletApi.sendTransaction({
            transactionManifest: manifest,
            message
        });

        if (!result || result.isErr()) {

            if (callbacks?.onFail) callbacks.onFail(result);
            if (result.isErr()) throw new Error(`RNS SDK: ${result.error.message}`);

            throw new Error(`RNS SDK: ${result}`);

        }

        if (callbacks?.onAppApproved) callbacks.onAppApproved({ manifest });
        const intentHash = result.value.transactionIntentHash;

        const transactionStatus = await transaction.getStatus(intentHash);
        if (callbacks?.onIntentReceipt) callbacks.onIntentReceipt({ manifest, intentHash });

        const getCommitReceipt = await transaction.getCommittedDetails(intentHash);
        if (callbacks?.onSuccess) callbacks.onSuccess(getCommitReceipt);

        return true;

    } catch (error) {

        console.log(error);
        return false;

    }

}