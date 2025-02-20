import errors, { subdomain } from "./errors";
import { normaliseDomain, validateDomain, validateSubdomain } from "../utils/domain.utils";
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

};