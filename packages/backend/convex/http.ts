import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { Webhook } from "svix";
import { createClerkClient } from "@clerk/backend";
import { WebhookEvent } from "@clerk/backend";
import { internal } from "./_generated/api";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

const http = httpRouter();

http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const event = await validateRequest(request);

    if (!event) {
      return new Response("Error occured", { status: 400 });
    }

    switch (event.type) {
      case "subscription.updated": {
        const subscription = event.data as {
          status: string;
          payer?: {
            organization_id?: string;
          };
        };

        const organizationId = subscription.payer?.organization_id;

        if (!organizationId) {
          return new Response("Missing Organization ID", { status: 400 });
        }

        const newMaxAllowedMemberships =
          subscription.status === "active" ? 5 : 1;

        await clerkClient.organizations.updateOrganization(organizationId, {
          maxAllowedMemberships: newMaxAllowedMemberships,
        });

        await ctx.runMutation(internal.system.subscriptions.upsert, {
          organizationId,
          status: subscription.status,
        });

        break;
      }

      default:
        console.log(`Ignored Clerk webhook event ${event.type}`);
    }

    return new Response(null, { status: 200 });
  }),
});

/**
 * Vapi custom tool endpoint.
 */
http.route({
  path: "/vapi/search",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();

      if (body?.message?.type !== "tool-calls") {
        return new Response(
          JSON.stringify({ error: "Invalid Vapi request" }),
          {
            status: 400,
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
      }

      const toolCalls = body.message.toolCallList ?? [];

      const results = [];

      for (const toolCall of toolCalls) {
        if (toolCall.function?.name !== "search_knowledge_base") {
          continue;
        }

        const query = toolCall.function?.arguments?.query;

        if (!query || typeof query !== "string") {
          results.push({
            toolCallId: toolCall.id,
            result: "No search query was provided.",
          });

          continue;
        }

        const organizationId =
          body.message.call?.assistantOverrides?.variableValues
            ?.organizationId;

        if (
          !organizationId ||
          typeof organizationId !== "string"
        ) {
          results.push({
            toolCallId: toolCall.id,
            result: "Knowledge base is unavailable for this assistant.",
          });

          continue;
        }

        const searchResult = await ctx.runAction(
          internal.system.ai.vapi.searchKnowledgeBase,
          {
            organizationId,
            query,
          },
        );

        results.push({
          toolCallId: toolCall.id,
          result: searchResult.text || "No relevant information was found.",
        });
      }

      return new Response(
        JSON.stringify({ results }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    } catch (error) {
      console.error("Vapi knowledge search failed:", error);

      return new Response(
        JSON.stringify({
          results: [
            {
              toolCallId: "unknown",
              result:
                "The knowledge base could not be searched right now.",
            },
          ],
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }
  }),
});

async function validateRequest(
  req: Request,
): Promise<WebhookEvent | null> {
  const payloadString = await req.text();

  const svixHeaders = {
    "svix-id": req.headers.get("svix-id") || "",
    "svix-timestamp": req.headers.get("svix-timestamp") || "",
    "svix-signature": req.headers.get("svix-signature") || "",
  };

  const wh = new Webhook(
    process.env.CLERK_WEBHOOK_SECRET || "",
  );

  try {
    return wh.verify(
      payloadString,
      svixHeaders,
    ) as unknown as WebhookEvent;
  } catch (error) {
    console.log("Error verifying event", error);
    return null;
  }
}

export default http;