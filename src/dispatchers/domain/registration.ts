import registerDomainManifest from "../../manifests/domains/domain-registration-manifest";

import errors from "../../mappings/errors";
import { sendTransaction } from "../../utils/transaction.utils";
import { convertToDecimal, multiplyDecimal } from "../../utils/decimal.utils";
import { getBasePrice } from "../../utils/pricing.utils";
import { errorStack, successResponse } from "../../utils/response.utils";

import { RegistrationDispatcherPropsI } from "../../common/dispatcher.types";
import { ErrorStackResponseI, CommitmentStackResponseI } from "../../common/response.types";


export async function dispatchDomainRegistration({
    sdkInstance,
    domain,
    rdt,
    durationYears,
    userDetails,
    callbacks
}: RegistrationDispatcherPropsI): Promise<CommitmentStackResponseI | ErrorStackResponseI> {

    try {

        const attributes = await sdkInstance.getDomainAttributes({ domain });

        if (attributes instanceof Error)
            throw attributes;

        if ('errors' in attributes)
            return attributes;

        if (attributes.status !== 'available')
            return errorStack(errors.domain.unavailable({ domain }));

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

        if (!dispatch)
            return errorStack(errors.registration.generic({ domain }));

        return successResponse({
            code: 'REGISTRATION_SUCCESSFUL',
            details: `${domain} was succesfully registered.`
        });

    } catch (error) {

        return errorStack(errors.registration.generic({ domain, verbose: error }));

    }

}