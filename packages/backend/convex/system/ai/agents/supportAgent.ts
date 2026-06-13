import { groq } from "@ai-sdk/groq";
import { Agent } from "@convex-dev/agent";
import { components } from "../../../_generated/api"
import { search } from "../tools/search";
import { escalateConversation } from "../tools/escalateConversation";
import { resolveConversation } from "../tools/resolveConversation";
import { SUPPORT_AGENT_PROMPT } from "../constants";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";


const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
});

export const supportAgent = new Agent(components.agent, {
    name: "Support Agent",
    languageModel: openrouter("openrouter/free"),
    tools: { search, escalateConversation, resolveConversation },
    instructions: SUPPORT_AGENT_PROMPT,
    maxSteps: 5,
})
