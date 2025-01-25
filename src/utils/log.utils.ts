export const logger = {

    error(context: string, error: unknown): void {

        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        const errorStack = error instanceof Error ? error.stack : "No stack available";

        console.error(`[Error - ${context}] Message: ${errorMessage}`, { stack: errorStack });

    }

};