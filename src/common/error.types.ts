export interface ErrorStackResponse {

    errors: ErrorI[];

}

export interface ErrorI {

    code: string;
    error: string;
    verbose: string | null;

}