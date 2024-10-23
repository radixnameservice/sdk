import RnsSDK, { RegistrationResponse } from "../..";
import { InstancePropsI } from "../../common/entities.types";


export async function dispatchDomainRegistration({
    domain,
    entities,
    dependencies,
    sdkInstance
}: InstancePropsI & { domain: string, sdkInstance: RnsSDK }): Promise<RegistrationResponse> {

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