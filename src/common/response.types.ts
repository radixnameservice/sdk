export interface ErrorStackResponse {

    errors: ErrorI[];

}

export interface ErrorI {

    code: string;
    error: string;
    verbose: string | null;

}

export interface ErrorGenerationI {

    verbose?: string | null;

}

export interface SuccessI {

    code: string;
    details: string | null;

}

export interface SuccessStackResponse {

    success: SuccessI[];

}