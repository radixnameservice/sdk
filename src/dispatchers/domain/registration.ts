import { RegistrationResponse } from "../..";
import { RegistrationDispatcherPropsI } from "../../common/registration.types";


export async function dispatchDomainRegistration({
    domain,
    entities,
    dependencies,
    rdt,
    durationYears,
    userDetails,
    sdkInstance
}: RegistrationDispatcherPropsI): Promise<RegistrationResponse> {

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

    return {
        status: 'registration-successful',
        verbose: `${domain} was succesfully registered.`
    };

}