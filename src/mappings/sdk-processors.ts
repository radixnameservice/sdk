import RnsSDK from "..";
import errors from "./errors";
import { normaliseDomain, validateDomain, validateDomainEntity, validateSubdomain } from "../utils/domain.utils";
import { validateAccountAddress } from "../utils/address.utils";
import { ParamProcessMapT } from "../common/validation.types";

export const parameterProcessMap: ParamProcessMapT = {
    _default: {
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
            validate: (accountAddress: string, instance: RnsSDK) => validateAccountAddress(accountAddress, { network: instance.network }),
            missingError: errors.account.invalidAddress
        }
    },
    getRecords: {
        domain: {
            normalize: normaliseDomain,
            validate: validateDomainEntity,
            missingError: errors.domain.generic
        },
    },
    getDomainDetails: {
        domain: {
            normalize: normaliseDomain,
            validate: validateDomainEntity,
            missingError: errors.domain.generic
        },
    }
};