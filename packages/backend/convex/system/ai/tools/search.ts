import { createTool } from "@convex-dev/agent";
import { generateText } from "ai";
import z from "zod"
import { internal } from "../../../_generated/api";
import rag from "../rag";
import { SEARCH_INTERPRETER_PROMPT } from "../constants";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
});

export const search = createTool({
    description: "Search the knowledge base for relevant information to help answer user questions",
    inputSchema: z.object({
        query: z.string().describe("The search query to find relevant information.")
    }),
    execute: async (ctx, args) => {
        try {
            if (!ctx.threadId) {
                return "Missing thread ID"
            }

            const conversation = await ctx.runQuery(
                internal.system.conversations.getByThreadId,
                { threadId: ctx.threadId }
            )

            if (!conversation) {
                return "Conversation not found."
            }

            const searchResult = await rag.search(ctx, {
                namespace: conversation.organizationId,
                query: args.query,
                limit: 5
            })

            const contextText = `Found results in ${searchResult.entries
                .map((e) => e.title || null)
                .filter((t) => t !== null)
                .join(", ")}. Here is the context:\n\n${searchResult.text}`

            const response = await generateText({
                messages: [
                    { role: "system", content: SEARCH_INTERPRETER_PROMPT },
                    { role: "user", content: `User asked: "${args.query}\n\nSearch results: ${contextText}` },
                ],
                model: openrouter("openrouter/free")
            })

            return response.text
        } catch (error: any) {
            console.log("=== SEARCH TOOL ERROR ===")
            console.log("error message:", error?.message)
            console.log("error stack:", error?.stack)
            return `Search failed: ${error?.message}`
        }
    }
})