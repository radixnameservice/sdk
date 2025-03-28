import registerDomainManifest from "../../manifests/domains/domain-registration-manifest";

import errors from "../../mappings/errors";
import { sendTransaction } from "../../utils/transaction.utils";
import { convertToDecimal, multiplyDecimal } from "../../utils/decimal.utils";
import { getBasePrice } from "../../utils/pricing.utils";
import { transactionError, transactionResponse } from "../../utils/response.utils";

import { RegistrationDispatcherPropsI } from "../../common/dispatcher.types";
import { SdkTransactionResponseT, TransactionFeedbackStackI } from "../../common/response.types";


export async function dispatchDomainRegistration({
    sdkInstance,
    domain,
    rdt,
    durationYears,
    accountAddress,
    callbacks
}: RegistrationDispatcherPropsI): Promise<SdkTransactionResponseT<TransactionFeedbackStackI>> {

    try {

        const manifest = await registerDomainManifest({
            sdkInstance,
            domain,
            accountAddress,
            durationYears,
            price: multiplyDecimal(convertToDecimal(getBasePrice(domain, sdkInstance.dependencies.rates.usdXrd).xrd), durationYears)
        });

        const dispatch = await sendTransaction({
            rdt,
            message: `Register ${domain}`,
            manifest,
            transaction: sdkInstance.transaction,
            callbacks
        });

        if (!dispatch)
            return transactionError(errors.registration.generic({ domain }));

        return transactionResponse({
            code: 'REGISTRATION_SUCCESSFUL',
            details: `${domain} was succesfully registered.`
        });

    } catch (error) {

        return transactionError(errors.registration.generic({ domain, verbose: error }));

    }

}