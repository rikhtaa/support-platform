# Support Platform

**Live Dashboard:** https://support-platform-web-xi.vercel.app

A B2B AI-powered customer support SaaS built as a Turborepo monorepo. Organizations embed a chat widget on their websites; end users interact with an AI support agent that can answer questions, search an organization knowledge base, escalate or resolve conversations, and optionally initiate voice calls. Authenticated organization members manage conversations, files, widget customization, integrations, plugins, billing, and AI testing from the dashboard.

## Table of Contents

- [Product Overview](#product-overview)
- [Architecture](#architecture)
- [Repository Structure](#repository-structure)
- [Tech Stack](#tech-stack)
- [Applications](#applications)
- [Backend Structure](#backend-structure)
- [Authentication and Organizations](#authentication-and-organizations)
- [Customer Sessions and Conversations](#customer-sessions-and-conversations)
- [AI Agent](#ai-agent)
- [AI Tools](#ai-tools)
- [Knowledge Base and RAG](#knowledge-base-and-rag)
- [Support Dashboard](#support-dashboard)
- [Widget](#widget)
- [Embed Script](#embed-script)
- [Widget Customization](#widget-customization)
- [Files and Document Sync](#files-and-document-sync)
- [Integrations and Plugins](#integrations-and-plugins)
- [Voice with Vapi](#voice-with-vapi)
- [Billing and Subscriptions](#billing-and-subscriptions)
- [AI Playground](#ai-playground)
- [Database Schema](#database-schema)
- [End-to-End Flow](#end-to-end-flow)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Development Commands](#development-commands)
- [Embedding the Widget](#embedding-the-widget)
- [Build and Quality Checks](#build-and-quality-checks)
- [Deployment](#deployment)
- [Author](#author)

---

## Product Overview

The platform has three user-facing/runtime applications and a shared Convex backend:

```text
Customer Website
      |
      | embed script
      v
Embed App (Vite bundle)
      |
      | iframe
      v
Widget App (Next.js)
      |
      | Convex public APIs
      v
Convex Backend
      |
      +--> Conversations / Contact Sessions
      +--> AI Agent / Tools
      +--> RAG / Knowledge Base
      +--> Files / Document Sync
      +--> Vapi / Voice
      +--> Widget Settings / Plugins / Secrets
      |
      v
Web Dashboard (Next.js)
      |
      +--> Support inbox
      +--> Files / Knowledge
      +--> Customization
      +--> Integrations / Plugins
      +--> Billing
      +--> AI Playground
```

The embed script is only the delivery layer. The actual customer chat experience is the Widget application, and both the Widget and Dashboard use the same Convex backend.

---

## Architecture

### Monorepo

```text
apps/
├── web/       # Next.js dashboard for organization members
├── widget/    # Next.js customer-facing widget
└── embed/     # Vite-built embeddable JavaScript

packages/
├── backend/           # Convex database, functions, agents, tools and RAG
├── ui/                # Shared UI components
├── math/              # Shared utilities
├── eslint-config/     # Shared ESLint configuration
└── typescript-config/ # Shared TypeScript configuration
```

### Runtime relationship

```text
Web Dashboard  ───────┐
                      │
Widget ───────────────┼──> Convex Backend
                      │
Embed ──> iframe ──> Widget
```

---

## Repository Structure

```text
.
├── apps/
│   ├── embed/
│   │   ├── embed.ts
│   │   ├── config.ts
│   │   ├── icons.ts
│   │   ├── demo.html
│   │   └── landing.html
│   │
│   ├── web/
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   └── (dashboard)/
│   │   │       ├── billing/
│   │   │       ├── conversations/
│   │   │       │   └── [conversationId]/
│   │   │       ├── customization/
│   │   │       ├── files/
│   │   │       ├── integrations/
│   │   │       ├── plugins/
│   │   │       └── test/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── modules/
│   │       ├── auth/
│   │       ├── billing/
│   │       ├── customization/
│   │       └── dashboard/
│   │           ├── ui/
│   │           │   ├── components/
│   │           │   ├── layouts/
│   │           │   └── views/
│   │           ├── atoms.ts
│   │           └── constants.ts
│   │
│   └── widget/
│       ├── app/
│       │   └── widget/
│       ├── components/
│       ├── hooks/
│       ├── lib/
│       └── modules/widget/
│           ├── atoms/
│           ├── hooks/
│           ├── ui/
│           │   ├── components/
│           │   └── screens/
│           ├── views/
│           ├── constants.ts
│           └── types.ts
│
├── packages/
│   ├── backend/
│   │   └── convex/
│   │       ├── _generated/
│   │       ├── lib/
│   │       ├── private/
│   │       ├── public/
│   │       ├── system/
│   │       ├── schema.ts
│   │       └── users.ts
│   ├── ui/
│   ├── math/
│   ├── eslint-config/
│   └── typescript-config/
│
├── package.json
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
├── turbo.json
└── README.md
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Monorepo | Turborepo + pnpm workspaces |
| Runtime | Node.js >= 20 |
| Dashboard | Next.js 16 |
| Widget | Next.js 16 |
| Embed | Vite 7 |
| Backend / Database | Convex |
| AI agents | `@convex-dev/agent` |
| RAG | `@convex-dev/rag` |
| AI providers | Google Gemini, Groq, xAI via Vercel AI SDK |
| Authentication | Clerk |
| UI | shadcn/ui + Radix UI |
| Styling | Tailwind CSS v4 |
| State | Jotai + jotai-family |
| Forms | React Hook Form + Zod |
| Voice | Vapi AI |
| Monitoring | Sentry |
| Webhook verification | Svix |

---

## Applications

### `apps/web`

Authenticated organization dashboard for support teams.

Main areas:

- Authentication and organization selection
- Conversation inbox and conversation details
- Billing
- Widget customization
- Files / knowledge management
- Integrations
- Plugins
- AI test/playground

### `apps/widget`

Customer-facing chat application loaded inside an iframe.

Widget modules include screens for:

- Loading
- Authentication/contact collection
- Contact information
- Inbox
- Chat
- Selection
- Voice
- Error states

The widget uses Jotai atoms for client-side widget state.

### `apps/embed`

A small browser JavaScript bundle that customers install on their websites.

It:

1. Reads the organization ID from the script tag.
2. Creates the floating button.
3. Creates the iframe/container.
4. Loads the Widget application.
5. Passes the organization ID to the Widget.
6. Handles open/close/resize messaging.
7. Exposes `window.EchoWidget`.

---

## Backend Structure

The Convex backend is organized into three main functional surfaces.

### `convex/public/`

Widget-facing operations, including:

```text
contactSessions.ts
conversations.ts
messages.ts
messagesAction.ts
organizations.ts
secrets.ts
widgetSettings.ts
```

### `convex/private/`

Authenticated/internal operations, including:

```text
contactSessions.ts
conversations.ts
docsSync.ts
files.ts
messages.ts
plugins.ts
secrets.ts
vapi.ts
widgetSettings.ts
```

### `convex/system/`

Platform infrastructure and AI functionality.

```text
system/
├── ai/
│   ├── agents/
│   ├── tools/
│   │   ├── escalateConversation.ts
│   │   ├── resolveConversation.ts
│   │   └── search.ts
│   ├── constants.ts
│   ├── docsSyncProcessor.ts
│   ├── githubDocsConfig.ts
│   ├── rag.ts
│   └── vapi.ts
├── auth.config.ts
├── constants.ts
├── convex.config.ts
├── http.ts
├── playground.ts
├── contactSessions.ts
├── conversations.ts
├── docsSyncRuns.ts
├── plugins.ts
├── secrets.ts
└── subscriptions.ts
```

`lib/` contains reusable backend helpers such as errors, text extraction and secrets utilities.

---

## Authentication and Organizations

Clerk provides authenticated organization membership and organization-scoped access in the dashboard.

Conceptually:

```text
Clerk User
    |
    v
Organization membership
    |
    v
Organization-scoped resources
```

Organization-owned resources include conversations, contact sessions, widget settings, files, RAG knowledge, plugins, secrets, subscriptions and Vapi configuration.

Widget-facing operations are separate from authenticated dashboard operations because website visitors are not dashboard users.

---

## Customer Sessions and Conversations

### Contact sessions

A `contactSession` represents an end user's interaction with the widget. It can contain:

- Name
- Email
- Organization ID
- Expiration time
- User agent
- Language/languages
- Platform
- Screen resolution
- Viewport size
- Timezone and timezone offset
- Cookie information
- Referrer/current URL

### Conversations

A conversation connects the customer session and organization to the AI Agent thread.

Conversation statuses are:

```text
unresolved
escalated
resolved
```

The important identity distinction is:

```text
contactSessionId  = end-user/session identity
conversationId    = application conversation record
threadId          = AI Agent conversation/thread
```

---

## AI Agent

The support agent is built with `@convex-dev/agent`.

The Agent provides:

- Model configuration
- Thread context/history
- System instructions
- Tool calling
- Agent generation
- Agent-specific message handling

A typical flow is:

```text
Customer prompt
      |
      v
Agent.generateText()
      |
      +--> system instructions
      +--> thread context
      +--> tools when required
      |
      v
AI response
```

Configured AI providers include Google Gemini, Groq and xAI through the Vercel AI SDK.

---

## AI Tools

The backend contains tools for core support behavior:

### Search

`search.ts` retrieves relevant knowledge-base context through RAG and makes that context available to the AI response process.

### Escalation

`escalateConversation.ts` supports moving a conversation into the escalated state when human support is required.

### Resolution

`resolveConversation.ts` supports marking a conversation resolved when the issue has been completed.

The agent decides when configured tools are appropriate according to its instructions and tool descriptions.

---

## Knowledge Base and RAG

The platform uses `@convex-dev/rag` for organization-specific retrieval.

The high-level pipeline is:

```text
File / document
      |
      v
Text extraction
      |
      v
RAG ingestion
      |
      v
Embeddings / knowledge entries
      |
      v
Organization namespace
      |
      v
Semantic search
      |
      v
Relevant context
      |
      v
AI Agent
```

RAG is organization-scoped so knowledge belonging to one organization is isolated from another organization's knowledge.

The backend also contains document synchronization functionality, including:

- `docsSync.ts`
- `docsSyncRuns.ts`
- `docsSyncProcessor.ts`
- `githubDocsConfig.ts`

These support synchronized documentation/knowledge workflows.

---

## Support Dashboard

The dashboard gives support teams a centralized view of customer conversations and platform configuration.

### Conversation inbox

Supports:

- Conversation list
- Conversation details
- Customer/contact information
- Conversation history
- Message pagination
- Status management
- Human operator replies
- AI responses
- Response enhancement

### Other dashboard areas

```text
Dashboard
├── Conversations
├── Billing
├── Customization
├── Files
├── Integrations
├── Plugins
└── Test
```

---

## Widget

The Widget is the customer-facing application.

Its UI is organized around screens and views, including:

```text
modules/widget/
├── atoms/
├── hooks/
├── ui/
│   ├── components/
│   └── screens/
│       ├── widget-auth-screen.tsx
│       ├── widget-chat-screen.tsx
│       ├── widget-contact-screen.tsx
│       ├── widget-error-screen.tsx
│       ├── widget-inbox-screen.tsx
│       ├── widget-loading-screen.tsx
│       ├── widget-selection-screen.tsx
│       └── widget-voice-screen.tsx
├── views/
│   └── widget-view.tsx
├── constants.ts
└── types.ts
```

The Widget communicates with Convex and renders customer conversation state in real time.

---

## Embed Script

The embed bundle is generated from the TypeScript source in `apps/embed`.

```text
apps/embed/embed.ts
        |
        | Vite build
        v
apps/embed/dist/<bundle>.js
```

The generated bundle can be installed on third-party websites with a script tag.

Example:

```html
<script
  src="https://<your-embed-url>/embed.js"
  data-organization-id="<your-organization-id>"
  data-position="bottom-right"
></script>
```

The embed script creates the UI shell while the actual chat interface is served by the Widget application inside an iframe.

### JavaScript API

```js
EchoWidget.show()
EchoWidget.hide()
EchoWidget.destroy()

EchoWidget.init({
  organizationId: "...",
  position: "bottom-left"
})
```

Supported position values:

```text
bottom-right
bottom-left
```

---

## Widget Customization

Organizations can configure the customer widget from the dashboard.

Settings include:

- Greeting message
- Default chat suggestions
- Vapi assistant configuration
- Vapi phone settings
- Other organization-specific widget settings

Widget configuration is stored and retrieved through Convex.

---

## Files and Document Sync

The platform provides file/knowledge management for organization support content.

The backend supports the file and document lifecycle, including storage, text extraction and knowledge-base ingestion.

Relevant backend modules include:

```text
private/files.ts
private/docsSync.ts
system/docsSyncProcessor.ts
system/docsSyncRuns.ts
system/githubDocsConfig.ts
```

The resulting content can be made available to the AI search/RAG layer.

---

## Integrations and Plugins

The dashboard contains separate areas for integrations and plugins.

```text
apps/web/app/(dashboard)/integrations/
apps/web/app/(dashboard)/plugins/
```

Backend support includes plugin, secret and Vapi modules.

```text
convex/private/plugins.ts
convex/private/secrets.ts
convex/private/vapi.ts
convex/system/plugins.ts
convex/system/secrets.ts
```

The platform currently documents Vapi as the primary voice integration.

---

## Voice with Vapi

Vapi provides optional voice-assistant functionality.

Widget voice UI:

```text
apps/widget/modules/widget/ui/screens/widget-voice-screen.tsx
```

Backend Vapi functionality includes:

```text
convex/private/vapi.ts
convex/system/ai/vapi.ts
```

Vapi configuration can also be associated with organization/widget settings and plugin/integration configuration.

---

## Billing and Subscriptions

Billing is organization-scoped.

Dashboard area:

```text
apps/web/app/(dashboard)/billing/
```

Backend subscription functionality:

```text
convex/system/subscriptions.ts
```

The `subscriptions` table tracks organization subscription status. Subscription checks can be applied to protected platform operations and features.

---

## AI Playground

The dashboard includes an AI testing area:

```text
apps/web/app/(dashboard)/test/
```

This provides a place to test agent behavior and platform AI functionality independently of the customer-facing widget.

---

## Database Schema

The major Convex tables are:

| Table | Purpose |
|---|---|
| `subscriptions` | Organization subscription status |
| `widgetSettings` | Per-organization widget configuration |
| `plugins` | Organization plugin/integration data |
| `conversations` | Customer conversations and conversation state |
| `contactSessions` | End-user sessions and browser metadata |
| `users` | Internal system users |

The conversation model links organization, contact session, status and AI thread information.

---

## End-to-End Flow

### Customer message

```text
Customer website
      |
      v
Embed script
      |
      v
Widget iframe
      |
      v
Contact session
      |
      v
Conversation
      |
      v
Convex message endpoint
      |
      v
Support Agent
      |
      +------> Search/RAG when needed
      +------> Escalate when needed
      +------> Resolve when needed
      |
      v
AI response
      |
      v
Conversation history
      |
      v
Widget
```

### Human support

```text
Customer
   |
   v
Conversation
   |
   v
Dashboard inbox
   |
   v
Support operator
   |
   +--> Reply
   +--> Change status
   +--> Review customer/session information
```

The customer conversation and AI Agent thread remain connected so the support workflow can move between automated and human assistance.

---

## Environment Variables

### Root / Convex

```env
CONVEX_DEPLOYMENT=<your-convex-deployment>
CONVEX_URL=<your-convex-url>
CONVEX_SITE_URL=<your-convex-site-url>
```

### `apps/web/.env.local`

```env
NEXT_PUBLIC_CONVEX_URL=<your-convex-url>
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<your-clerk-publishable-key>
CLERK_SECRET_KEY=<your-clerk-secret-key>
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
SENTRY_AUTH_TOKEN=<your-sentry-auth-token>
```

### `apps/widget/.env.local`

```env
NEXT_PUBLIC_CONVEX_URL=<your-convex-url>
VITE_WIDGET_URL=<your-deployed-widget-url>
```

### `apps/embed/.env`

```env
VITE_WIDGET_URL=<your-deployed-widget-url>
```

Optional feature-specific credentials are required for services such as AI providers, Vapi, Sentry and other integrations.

---

## Getting Started

### Prerequisites

- Node.js >= 20
- pnpm >= 9
- Convex account/project
- Clerk application
- Optional Vapi account for voice features
- Optional Sentry configuration

### Install

```bash
git clone <repository-url>
cd next-monorepo
pnpm install
```

### Backend first-time setup

```bash
cd packages/backend
pnpm setup
```

### Start backend development

```bash
cd packages/backend
pnpm dev
```

### Start the full monorepo

From the repository root:

```bash
pnpm dev
```

### Start individual applications

Dashboard:

```bash
cd apps/web
pnpm dev
```

Widget:

```bash
cd apps/widget
pnpm dev
```

Embed:

```bash
cd apps/embed
pnpm dev
```

---

## Build and Quality Checks

Build everything:

```bash
pnpm build
```

Build individual applications:

```bash
cd apps/web && pnpm build
cd apps/widget && pnpm build
cd apps/embed && pnpm build
```

Lint:

```bash
pnpm lint
```

Format:

```bash
pnpm format
```

Type check:

```bash
pnpm typecheck
```

The embed build produces a static bundle under:

```text
apps/embed/dist/
```

---

## Deployment

| Component | Deployment |
|---|---|
| `apps/web` | Vercel / Next.js |
| `apps/widget` | Vercel / Next.js |
| `apps/embed` | Static hosting/CDN for generated bundle |
| `packages/backend` | Convex Cloud |

Current dashboard URL:

https://support-platform-web-xi.vercel.app

Deploy Convex from the backend package with:

```bash
npx convex deploy
```

The embed build must know the deployed Widget URL because the embed script loads the Widget directly in an iframe.

---

## Author

Rekhta
