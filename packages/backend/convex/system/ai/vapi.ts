import { internalAction } from "../../_generated/server";
import { v } from "convex/values";
import rag from "./rag";

export const searchKnowledgeBase = internalAction({
  args: {
    organizationId: v.string(),
    query: v.string(),
  },

  handler: async (ctx, args) => {
    const result = await rag.search(ctx, {
      namespace: args.organizationId,
      query: args.query,
      limit: 5,
    });

    return {
      text: result.text,
      entries: result.entries.map((entry) => ({
        title: entry.title ?? null,
      })),
    };
  },
});