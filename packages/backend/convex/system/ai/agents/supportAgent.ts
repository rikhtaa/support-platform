import { groq } from "@ai-sdk/groq";
import { Agent } from "@convex-dev/agent";
import { components } from "../../../_generated/api"
import { search } from "../tools/search";
import { escalateConversation } from "../tools/escalateConversation";
import { resolveConversation } from "../tools/resolveConversation";
import { SUPPORT_AGENT_PROMPT } from "../constants";

export const supportAgent = new Agent(components.agent, {
    name: "Support Agent",
    languageModel: groq("llama-3.3-70b-versatile"),
    tools: { search, escalateConversation, resolveConversation },
    instructions: SUPPORT_AGENT_PROMPT,
})
