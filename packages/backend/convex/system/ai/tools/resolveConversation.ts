import { createTool } from "@convex-dev/agent"
import z from "zod"
import { internal } from "../../../_generated/api"
import { supportAgent } from "../agents/supportAgent"


export const resolveConversation = createTool({
    description: "Mark the conversation as resolved once the customer confirms they need nothing further",
    inputSchema: z.object({
        reason: z.string().describe("Brief reason the conversation is being resolved"),
    }),
    execute: async (ctx, args) => {
        if(!ctx.threadId){
            return "Missing thread ID"
        }

        await ctx.runMutation(internal.system.conversations.resolve, {
            threadId: ctx.threadId
        })

        await supportAgent.saveMessage(ctx, {
            threadId: ctx.threadId,
            message: {
                role: "assistant",
                content: "Conversation resolved",
            }
        })

        return "Conversation resolved"
    }
})