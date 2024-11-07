import registerDomainManifest from "../../manifests/domain-registration-manifest";

import { sendTransaction } from "../../utils/transaction.utils";
import { convertToDecimal, multiplyDecimal } from "../../utils/decimal.utils";
import { getBasePrice } from "../../utils/pricing.utils";

import { RegistrationDispatcherPropsI, RegistrationResponse } from "../../common/dispatcher.types";

export async function dispatchDomainRegistration({
    sdkInstance,
    domain,
    rdt,
    durationYears,
    userDetails,
    callbacks
}: RegistrationDispatcherPropsI): Promise<RegistrationResponse> {

    try {

        const details = await sdkInstance.getDomainAttributes(domain);

        if (!details) {

            return {
                status: 'registration-failed',
                verbose: `An error occurred during the pre-registration checks, please try again.`
            };

        }

        if (details.status !== 'available') {

            return {
                status: 'registration-failed',
                verbose: `${domain} could not be registered as is already taken / reserved.`
            };

        }

        const manifest = await registerDomainManifest({
            sdkInstance,
            domain,
            userDetails,
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

        if (!dispatch) {

            return {
                status: 'registration-failed',
                verbose: `An error occurred when attempting to register ${domain}.`
            };

        }

        return {
            status: 'registration-successful',
            verbose: `${domain} was succesfully registered.`
        };

    } catch (error) {

        return {
            status: 'registration-failed',
            verbose: `An error occurred when attempting to register ${domain}: ${error}.`
        };

    }

}