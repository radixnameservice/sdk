import { InstancePropsI } from "./entities.types";

export interface UserDetailsI {
    badgeId: string;
    accountAddress: string;
}

export interface UserBadgeReqPropsI extends InstancePropsI {

    accountAddress: string;

}