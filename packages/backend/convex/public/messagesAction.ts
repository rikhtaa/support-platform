import { ConvexError, v } from "convex/values";
import { components, internal } from "../_generated/api";
import { action } from "../_generated/server";
import { supportAgent } from "../system/ai/agents/supportAgent";
import { resolveConversation } from "../system/ai/tools/resolveConversation";
import { escalateConversation } from "../system/ai/tools/escalateConversation";
import { saveMessage } from "@convex-dev/agent";
import { search } from "../system/ai/tools/search";
import { isRateLimitError } from "../lib/errors";

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

        //This refreshes the user's session if they are within the threshold
        await ctx.runMutation(internal.system.contactSessions.refresh, {
                contactSessionId: args.contactSessionId
        })

        const subscription = await ctx.runQuery(
            internal.system.subscriptions.getByOrganizationId,
            {
                organizationId: conversation.organizationId
            } 
        )

        const shouldTriggerAgent = 
          conversation.status === "unresolved" && subscription?.status === "active"

        if(shouldTriggerAgent){
         try {
           await supportAgent.generateText(
              ctx,
              { threadId: args.threadId },
              {
                  prompt: args.prompt,
                  tools: {
                      resolveConversation,
                      escalateConversation,
                      search
                  },
              }
          )
         } catch (error) {
            const rateLimited = isRateLimitError(error);

            await saveMessage(ctx, components.agent, {
                threadId: args.threadId,
                message: {
                    role: "assistant",
                    content: rateLimited
                        ? "Our assistant has reached its usage limit for right now. Please try again shortly, or use the Contact Us option if this is urgent."
                        : "Something went wrong while processing that message. Please try again in a moment, or use the Contact Us option if this keeps happening.",
                },
            });
         }
        }else{
            await saveMessage(ctx, components.agent, {
                threadId: args.threadId,
                prompt: args.prompt
            })
        }
    }
})