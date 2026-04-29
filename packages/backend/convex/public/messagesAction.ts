import { ConvexError, v } from "convex/values";
import { components, internal } from "../_generated/api";
import { action } from "../_generated/server";
import { supportAgent } from "../system/ai/agents/supportAgent";
import { resolveConversation } from "../system/ai/tools/resolveConversation";
import { escalateConversation } from "../system/ai/tools/escalateConversation";
import { saveMessage } from "@convex-dev/agent";

export const create = action({
    args: {
        prompt: v.string(),
        threadId: v.string(),
        contactSessionId: v.id("contactSessions"),
    },
    handler: async (ctx, args) =>{
        const contactSession = await ctx.runQuery(
            internal.system.contactSessions.getOne, 
            {
                contactSessionId: args.contactSessionId
            }
        )

        if(!contactSession || contactSession.expiresAt < Date.now()){
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Invalid session"
            })
        }

        const conversation = await ctx.runQuery(
            internal.system.conversations.getByThreadId,
            {
                threadId: args.threadId
            }
        )

        if(!conversation){
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Conversation not found"
            })
        }

        if(conversation.status === "resolved"){
            throw new ConvexError({
                code: "BAD_REQUEST",
                message: "Conversation resolved"
            })
        }

        //TODO: Implement subscription check
        const shouldTriggerAgent = 
          conversation.status === "unresolved"

        if(shouldTriggerAgent){
         await supportAgent.generateText(
            ctx,
            { threadId: args.threadId },
            {
                prompt: args.prompt,
                tools: {
                    resolveConversation,
                    escalateConversation
                }
            }
        )}else{
            await saveMessage(ctx, components.agent, {
                threadId: args.threadId,
                prompt: args.prompt
            })
        }
    }
})
