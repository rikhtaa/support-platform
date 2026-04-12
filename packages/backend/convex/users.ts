import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getMany = query({
  handler: async (ctx) => {
    const users = await ctx.db
      .query("users")
      .collect();
    return users;
  },
})

export const createUser = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const user = await ctx.db.insert("users", {
      name: "Rekhta"
    });
    return user;
  }
})