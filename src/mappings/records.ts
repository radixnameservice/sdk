export interface RecordItem {
    record_id: string;
    platform_identifier: string;
    domain_id: string;
    context: string;
    value: string | null;
    directive?: string;
    id_additions: string[];
}