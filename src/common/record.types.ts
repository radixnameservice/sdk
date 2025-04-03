import { ProofsI } from "../common/entities.types";

export type ContextT = "receivers" | "delegation" | "navigation" | "social" | "discovery" | "widgets";

export interface RecordItemI {
    record_id: string;
    platform_identifier: string;
    domain_id: string;
    context: ContextT;
    value: string | null;
    directive?: string;
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