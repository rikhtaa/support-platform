import { v } from "convex/values";
import { internalAction, type ActionCtx } from "../../_generated/server";
import { internal } from "../../_generated/api";
import { contentHashFromArrayBuffer } from "@convex-dev/rag";
import rag from "./rag";
import { isRateLimitError, sleep } from "../../lib/errors";
import {
    fetchGithubFileContent,
    stripFrontmatter,
    RATE_LIMIT_DELAY_MS,
    MAX_CONSECUTIVE_FAILURES,
    type GithubDocMetadata,
} from "./githubDocsConfig";

const RATE_LIMIT_RETRY_BACKOFF_MS = 65_000;

// Embeds one document's text into the organization's RAG namespace, keyed by its repo path.
async function embedIntoRag(
    ctx: ActionCtx,
    organizationId: string,
    path: string,
    text: string,
    contentHash: string
) {
    return await rag.add(ctx, {
        namespace: organizationId,
        text,
        key: path,
        title: path,
        metadata: {
            source: "github-sync",
            path,
            uploadBy: organizationId,
        } satisfies GithubDocMetadata,
        contentHash,
    });
}

// Processes one file from the run's queue, then reschedules itself for the next one.
export const processNextFile = internalAction({
    args: {
        runId: v.id("docsSyncRuns"),
    },
    returns: v.null(),
    handler: async (ctx, args) => {
        const run = await ctx.runQuery(internal.system.docsSyncRuns.getById, {
            runId: args.runId,
        });

        if (!run || run.status !== "running") {
            return null;
        }

        if (run.cursor >= run.files.length) {
            await ctx.runMutation(internal.system.docsSyncRuns.complete, {
                runId: args.runId,
            });
            return null;
        }

        const path = run.files[run.cursor]!;

        try {
            const rawText = await fetchGithubFileContent(path);
            const text = stripFrontmatter(rawText);
            const bytes = new TextEncoder().encode(rawText).buffer;
            const contentHash = await contentHashFromArrayBuffer(bytes);

            let result;
            try {
                result = await embedIntoRag(
                    ctx,
                    run.organizationId,
                    path,
                    text,
                    contentHash
                );
            } catch (embedError) {
                if (!isRateLimitError(embedError)) {
                    throw embedError;
                }

                await sleep(RATE_LIMIT_RETRY_BACKOFF_MS);
                result = await embedIntoRag(
                    ctx,
                    run.organizationId,
                    path,
                    text,
                    contentHash
                );
            }

            await ctx.runMutation(internal.system.docsSyncRuns.recordSuccess, {
                runId: args.runId,
                outcome: result.created ? "added" : "unchanged",
            });
        } catch (error) {
            const message =
                error instanceof Error ? error.message : "Unknown error";

            console.error(`Docs sync failed for ${path}:`, error);

            await ctx.runMutation(internal.system.docsSyncRuns.recordFailure, {
                runId: args.runId,
                path,
                message,
            });

            const updatedRun = await ctx.runQuery(
                internal.system.docsSyncRuns.getById,
                { runId: args.runId }
            );

            if (
                updatedRun &&
                updatedRun.consecutiveFailures >= MAX_CONSECUTIVE_FAILURES
            ) {
                await ctx.runMutation(internal.system.docsSyncRuns.fail, {
                    runId: args.runId,
                    message: `Aborted after ${MAX_CONSECUTIVE_FAILURES} consecutive failures. Last error: ${message}`,
                });
                return null;
            }
        }

        await ctx.scheduler.runAfter(
            RATE_LIMIT_DELAY_MS,
            internal.system.ai.docsSyncProcessor.processNextFile,
            { runId: args.runId }
        );

        return null;
    },
});