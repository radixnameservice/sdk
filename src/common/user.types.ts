import { InstancePropsI } from "./entities.types";
import { ErrorWithStatusResponse } from "./feedback.types";

export interface UserSpecificsI {
    badgeId: string;
    accountAddress: string;
}

export interface UserBadgeReqPropsI extends InstancePropsI {

    accountAddress: string;

}

export type UserBadgeResponse =  string | null | ErrorWithStatusResponse;