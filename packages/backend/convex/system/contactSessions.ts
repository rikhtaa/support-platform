import { ConvexError, v } from "convex/values";
import { internalMutation, internalQuery } from "../_generated/server";
import { SESSION_DURATION_MS } from "../constants";

const AUTO_REFRESH_THRESHOLD_MS = 4 * 60 * 60 * 1000; // 4 hours

export const getOne = internalQuery({
    args: {
        contactSessionId: v.id("contactSessions"),
    },
    handler: async(ctx, args) => {
      return await ctx.db.get(args.contactSessionId)
    }
})

export const refresh = internalMutation({
    args: {
        contactSessionId: v.id("contactSessions"),
    },
    handler: async(ctx, args) => {
        const contactSession = await ctx.db.get(args.contactSessionId)

        if(!contactSession) {
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Contact session not found"
            })
        }

        if(contactSession.expiresAt < Date.now()){
            throw new ConvexError({
                code: "BAD_REQUEST",
                message: "Contact session expired"
            })
        }

        const timeRemaineing = contactSession.expiresAt - Date.now()

        if(timeRemaineing > AUTO_REFRESH_THRESHOLD_MS){
            const newExpireAt = Date.now() + SESSION_DURATION_MS
            await ctx.db.patch(args.contactSessionId, {
                expiresAt: newExpireAt
            })
            return {...contactSession, expiresAt: newExpireAt}
        }
        return contactSession
    }
})