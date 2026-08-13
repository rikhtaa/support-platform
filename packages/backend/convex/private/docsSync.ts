import { ConvexError, v } from "convex/values";
import { action, mutation, query } from "../_generated/server";
import { internal } from "../_generated/api";
import { fetchGithubTree, shouldIncludeFile } from "../system/ai/githubDocsConfig";
import type { UserIdentity } from "convex/server";
import { Doc, Id } from "../_generated/dataModel";
import { ENABLE_SUBSCRIPTION_CHECKS } from "../constants";

// Extracts the caller's organization ID, throwing if they aren't signed in or have no org.
function requireOrgIdentity(identity: UserIdentity | null): string {
    if (identity === null) {
        throw new ConvexError({
            code: "UNAUTHORIZED",
            message: "Identity not found",
        });
    }

    const orgId = identity.orgId as string;

    if (!orgId) {
        throw new ConvexError({
            code: "UNAUTHORIZED",
            message: "Organization not found",
        });
    }

    return orgId;
}

// Starts a GitHub docs sync: lists the repo's doc files, creates a run row, and kicks off processing.
export const startSync = action({
    args: {},
    handler: async (ctx): Promise<{
    runId: Id<"docsSyncRuns">;
    alreadyRunning: boolean;
    }> => {
        const identity = await ctx.auth.getUserIdentity();
        const orgId = requireOrgIdentity(identity);

        if (ENABLE_SUBSCRIPTION_CHECKS) {
        const subscription = await ctx.runQuery(
            internal.system.subscriptions.getByOrganizationId,
            { organizationId: orgId }
        );
        
        if (subscription?.status !== "active") {
            throw new ConvexError({
                code: "BAD_REQUEST",
                message: "Missing subscription",
            });
        }
        }

        // Prevent two overlapping syncs for the same organization —
        // running two at once would double up on the already-scarce
        // rate-limit budget and could interleave writes confusingly.
        const existingRun: Doc<"docsSyncRuns"> | null = await ctx.runQuery(
            internal.system.docsSyncRuns.getRunningForOrganization,
            { organizationId: orgId }
        );

        if (existingRun) {
            return { runId: existingRun._id, alreadyRunning: true as const };
        }

        const tree = await fetchGithubTree();

        const files = tree
            .filter((entry) => entry.type === "blob" && shouldIncludeFile(entry.path))
            .map((entry) => entry.path);

        if (files.length === 0) {
            throw new ConvexError({
                code: "BAD_REQUEST",
                message: "No matching documentation files found in the repo.",
            });
        }

        const runId: Id<"docsSyncRuns"> = await ctx.runMutation(internal.system.docsSyncRuns.create, {
            organizationId: orgId,
            files,
        });

        await ctx.scheduler.runAfter(
            0,
            internal.system.ai.docsSyncProcessor.processNextFile,
            { runId }
        );

        return { runId, alreadyRunning: false as const };
    },
});

// Returns the organization's most recent sync run, so the UI can show its progress and result.
export const getLatestRun = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        const orgId = requireOrgIdentity(identity);

        return await ctx.db
            .query("docsSyncRuns")
            .withIndex("by_organization_id", (q) => q.eq("organizationId", orgId))
            .order("desc")
            .first();
    },
});

// Marks a still-running sync as cancelled so the processor stops rescheduling itself.
export const cancelSync = mutation({
    args: {
        runId: v.id("docsSyncRuns"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        const orgId = requireOrgIdentity(identity);

        const run = await ctx.db.get(args.runId);

        if (!run) {
            throw new ConvexError({ code: "NOT_FOUND", message: "Run not found" });
        }

        if (run.organizationId !== orgId) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "This run does not belong to your organization",
            });
        }

        if (run.status !== "running") {
            return;
        }

        await ctx.db.patch(args.runId, {
            status: "cancelled",
            completedAt: Date.now(),
        });
    },
});