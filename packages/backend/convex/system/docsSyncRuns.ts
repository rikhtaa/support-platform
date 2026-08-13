import { v } from "convex/values";
import { internalMutation, internalQuery } from "../_generated/server";

// Creates a new sync run row with the queued file list and zeroed counters.
export const create = internalMutation({
    args: {
        organizationId: v.string(),
        files: v.array(v.string()),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("docsSyncRuns", {
            organizationId: args.organizationId,
            status: "running",
            files: args.files,
            cursor: 0,
            added: 0,
            updatedOrUnchanged: 0,
            failed: 0,
            consecutiveFailures: 0,
            errorLog: [],
            startedAt: Date.now(),
        });
    },
});

// Fetches a single run by ID, used by the processor to check its status and cursor.
export const getById = internalQuery({
    args: {
        runId: v.id("docsSyncRuns"),
    },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.runId);
    },
});

// Finds an organization's in-progress run, so a second sync isn't started alongside it.
export const getRunningForOrganization = internalQuery({
    args: {
        organizationId: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("docsSyncRuns")
            .withIndex("by_organization_id_and_status", (q) =>
                q.eq("organizationId", args.organizationId).eq("status", "running")
            )
            .first();
    },
});

// Advances the cursor past a successfully embedded file and updates the added/unchanged tallies.
export const recordSuccess = internalMutation({
    args: {
        runId: v.id("docsSyncRuns"),
        outcome: v.union(v.literal("added"), v.literal("unchanged")),
    },
    handler: async (ctx, args) => {
        const run = await ctx.db.get(args.runId);
        if (!run) return;

        await ctx.db.patch(args.runId, {
            cursor: run.cursor + 1,
            added: args.outcome === "added" ? run.added + 1 : run.added,
            updatedOrUnchanged:
                args.outcome === "unchanged"
                    ? run.updatedOrUnchanged + 1
                    : run.updatedOrUnchanged,
            consecutiveFailures: 0,
        });
    },
});

// Advances the cursor past a failed file, logging the error and incrementing the failure streak.
export const recordFailure = internalMutation({
    args: {
        runId: v.id("docsSyncRuns"),
        path: v.string(),
        message: v.string(),
    },
    handler: async (ctx, args) => {
        const run = await ctx.db.get(args.runId);
        if (!run) return;

        const errorLog = [
            ...run.errorLog,
            { path: args.path, message: args.message },
        ].slice(-50);

        await ctx.db.patch(args.runId, {
            cursor: run.cursor + 1,
            failed: run.failed + 1,
            consecutiveFailures: run.consecutiveFailures + 1,
            errorLog,
        });
    },
});

// Marks a run as finished once every queued file has been processed.
export const complete = internalMutation({
    args: {
        runId: v.id("docsSyncRuns"),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.runId, {
            status: "completed",
            completedAt: Date.now(),
        });
    },
});

// Marks a run as failed and records the error that caused it to abort early.
export const fail = internalMutation({
    args: {
        runId: v.id("docsSyncRuns"),
        message: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.runId, {
            status: "failed",
            completedAt: Date.now(),
            lastError: args.message,
        });
    },
});