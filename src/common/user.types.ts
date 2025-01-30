import { InstancePropsI } from "./entities.types";

export interface UserSpecificsI {
    badgeId: string;
    accountAddress: string;
}

export interface UserBadgeReqPropsI extends InstancePropsI {

    accountAddress: string;

}