import { RadixEngineToolkit } from "@radixdlt/radix-engine-toolkit";
import errors from "../mappings/errors";
import { ErrorI } from "../common/response.types";

export async function validateAddress(accountAddress: string): Promise<true | ErrorI> {

    if (!accountAddress.includes('account_'))
        return errors.account.invalidAddress({ accountAddress });

    try {
        await RadixEngineToolkit.Address.entityType(accountAddress);
    } catch (e) {
        return errors.account.invalidAddress({ accountAddress, verbose: e.message });
    }

    return true;
}