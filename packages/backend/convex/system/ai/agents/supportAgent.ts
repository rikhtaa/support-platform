import { Agent } from "@convex-dev/agent";
import { components } from "../../../_generated/api"
import { search } from "../tools/search";
import { escalateConversation } from "../tools/escalateConversation";
import { resolveConversation } from "../tools/resolveConversation";
import { SUPPORT_AGENT_PROMPT } from "../constants";
import { google } from "@ai-sdk/google";

export const supportAgent = new Agent(components.agent, {
    name: "Support Agent",
    languageModel: google("gemini-2.0-flash"),
    tools: { search, escalateConversation, resolveConversation },
    instructions: SUPPORT_AGENT_PROMPT,
})
