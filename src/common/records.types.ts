export interface RecordResultI {

    record_id: string;
    id_additions: number[];
    domain_id: string;
    context: string;
    directive: string;
    platform_identifier: string;
    value: string;

}

export type RecordResultsT = RecordResultI[] | [];
