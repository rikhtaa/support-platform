export function isRateLimitError(error: unknown): boolean {
    const err = error as
        | { statusCode?: number; status?: number; message?: string }
        | undefined;
 
    if (err?.statusCode === 429 || err?.status === 429) {
        return true;
    }
 
    const message = err?.message?.toLowerCase() ?? "";
    return message.includes("429") || message.includes("rate limit");
}

export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}