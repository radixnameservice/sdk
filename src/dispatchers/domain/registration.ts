import { RegistrationResponse } from "../..";

import registerDomainManifest from "../../manifests/register-domain";
import { sendTransaction } from "../../utils/transaction.utils";
import { multiplyDecimal } from "../../utils/decimal.utils";

import { RegistrationDispatcherPropsI } from "../../common/dispatcher.types";

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
            price: multiplyDecimal(sdkInstance.dependencies.rates.usdXrd, durationYears)
        });

        const dispatch = await sendTransaction({
            rdt,
            message: `Register ${domain}`,
            manifest,
            transaction: sdkInstance.transaction,
            callbacks
        });

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