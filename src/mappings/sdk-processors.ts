import errors from "./errors";
import { normaliseDomain, validateDomain, validateSubdomain } from "../utils/domain.utils";
import { validateAddress } from "../utils/address.utils";
import { ParamProcessMapT } from "../common/validation.types";

export const parameterProcessMap: ParamProcessMapT = {

    domain: {
        normalize: normaliseDomain,
        validate: validateDomain,
        missingError: errors.domain.generic
    },

    subdomain: {
        normalize: normaliseDomain,
        validate: validateSubdomain,
        missingError: errors.subdomain.generic
    },

    accountAddress: {
        normalize: (accountAddress: string) => accountAddress.toLowerCase(),
        validate: validateAddress,
        missingError: errors.account.invalidAddress
    },

};