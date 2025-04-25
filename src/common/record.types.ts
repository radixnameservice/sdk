import { ProofsI } from "../common/entities.types";

export type ContextT = "receivers" | "delegation" | "navigation" | "social" | "discovery" | "widgets";

export interface RecordItemI extends DocketPropsI {
    record_id: string;
    platform_identifier: string;
    domain_id: string;
    value: string | null;
}

export interface DocketPropsI {

    context: ContextT;
    directive?: string;
    proven?: boolean;

}

export interface RecordDocketI extends DocketPropsI {

    platformIdentifier?: string;
    value: string | ProofsI;

}