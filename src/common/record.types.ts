export type ContextT = "receivers" | "delegation" | "navigation" | "social" | "discovery" | "widgets";

export interface DocketI {

    context: ContextT;
    directive?: string;
    platformIdentifier: string;
    value: string;

}