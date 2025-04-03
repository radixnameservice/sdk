import RnsSDK from "..";
import errors from "./errors";
import { normaliseDomain, validateDomain, validateDomainEntity, validateSubdomain } from "../utils/domain.utils";
import { validateAccountAddress } from "../utils/address.utils";
import { ParamProcessMapT } from "../common/validation.types";

const genericDomainEntityProcessor = {
    domain: {
        normalize: normaliseDomain,
        validate: validateDomainEntity,
        missingError: errors.domain.generic
    }
};

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
    getRecords: genericDomainEntityProcessor,
    resolveRecord: genericDomainEntityProcessor,
    createRecord: genericDomainEntityProcessor,
    amendRecord: genericDomainEntityProcessor,
    deleteRecord: genericDomainEntityProcessor,
    getDomainDetails: genericDomainEntityProcessor,
    transferDomain: {
        domain: {
            normalize: normaliseDomain,
            validate: validateDomain,
            missingError: errors.domain.generic
        },
        fromAddress: {
            normalize: (accountAddress: string) => accountAddress.toLowerCase(),
            validate: (accountAddress: string, instance: RnsSDK) => validateAccountAddress(accountAddress, { network: instance.network }),
            missingError: errors.account.invalidAddress
        },
        destinationAddress: {
            normalize: (accountAddress: string) => accountAddress.toLowerCase(),
            validate: (accountAddress: string, instance: RnsSDK) => validateAccountAddress(accountAddress, { network: instance.network }),
            missingError: errors.account.invalidAddress
        }
    }
};