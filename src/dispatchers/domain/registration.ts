import registerDomainManifest from "../../manifests/domain-registration-manifest";

import { sendTransaction } from "../../utils/transaction.utils";
import { convertToDecimal, multiplyDecimal } from "../../utils/decimal.utils";
import { getBasePrice } from "../../utils/pricing.utils";

import { RegistrationDispatcherPropsI } from "../../common/dispatcher.types";
import { ErrorStackResponse, SuccessStackResponse } from "../../common/response.types";
import { commonErrors, registrationErrors } from "../../common/errors";
import { errorResponse, successResponse } from "../../utils/response.utils";

export async function dispatchDomainRegistration({
    sdkInstance,
    domain,
    rdt,
    durationYears,
    userDetails,
    callbacks
}: RegistrationDispatcherPropsI): Promise<SuccessStackResponse | ErrorStackResponse> {

    try {

        const details = await sdkInstance.getDomainAttributes(domain);

        if ('errors' in details) {
            return details;
        }

        if (details.status !== 'available')
            return errorResponse(commonErrors.domainTaken({ domain }));

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
            return errorResponse(registrationErrors.generic({ domain }));

        return successResponse({
            code: 'REGISTRATION_SUCCESSFUL',
            details: `${domain} was succesfully registered.`
        });

    } catch (error) {

        return errorResponse(registrationErrors.generic({ domain, verbose: error }));

    }

}