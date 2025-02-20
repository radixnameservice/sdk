import errors from "./errors";
import { normaliseDomain, validateDomainEntity } from "../utils/domain.utils";
import { ParamProcessMapT } from "../common/validation.types";

export const parameterProcessMap: ParamProcessMapT = {

    domain: {
        normalize: normaliseDomain,
        validate: validateDomainEntity,
        missingError: errors.domain.generic
    },

};