# Support Platform

**Live:** [https://support-platform-web-xi.vercel.app](https://support-platform-web-xi.vercel.app)

A B2B AI-powered customer support SaaS built as a Turborepo monorepo. Organizations embed a chat widget on their website, and their end users interact with an AI agent that can answer questions, escalate conversations, and optionally initiate voice calls. The dashboard gives support teams a unified view of conversations, file uploads, integrations, and billing.

---

## Architecture Overview

```
apps/
  web/        - Next.js 16 dashboard (admin/support team UI)
  widget/     - Next.js 16 embeddable chat widget (end-user facing)
  embed/      - Vite-built JS snippet that injects the widget iframe
packages/
  backend/    - Convex backend (database, functions, AI agents, RAG)
  ui/         - Shared React component library (shadcn/Radix UI)
  math/       - Shared utility functions
  eslint-config/      - Shared ESLint configuration
  typescript-config/  - Shared TypeScript configuration
```

The `embed` script is injected as a `<script>` tag on any third-party website. It renders a floating button and iframes the `widget` app. The `widget` app communicates with the Convex backend in real time. The `web` app is the organization dashboard accessed by authenticated team members.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Monorepo tooling | Turborepo, pnpm workspaces |
| Frontend framework | Next.js 16 (web, widget), Vite 7 (embed) |
| Backend / Database | Convex (real-time, serverless) |
| AI agents | @convex-dev/agent, @convex-dev/rag |
| AI model providers | Google Gemini, Groq, xAI (via Vercel AI SDK) |
| Voice calls | Vapi AI (web SDK + server SDK) |
| Authentication | Clerk (organization-scoped, RBAC) |
| UI components | shadcn/ui, Radix UI, Tailwind CSS v4 |
| State management | Jotai, jotai-family |
| Forms | React Hook Form, Zod |
| Error monitoring | Sentry |
| Webhook verification | Svix |
| Package manager | pnpm 9 |
| Node requirement | >= 20 |

---

## Repository Structure

```
.
├── apps/
│   ├── embed/                  # Vite bundle - the embeddable JS snippet
│   │   ├── embed.ts            # Main embed script
│   │   ├── config.ts           # Widget URL and default config
│   │   ├── icons.ts            # SVG icons
│   │   ├── demo.html           # Local demo page
│   │   └── landing.html        # Landing preview page
│   ├── web/                    # Next.js dashboard (port 3000)
│   │   ├── app/
│   │   │   ├── (auth)/         # Sign in, sign up, org selection
│   │   │   └── (dashboard)/    # Billing, conversations, customization,
│   │   │                       # files, integrations, plugins, test
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── modules/
│   └── widget/                 # Next.js chat widget (port 3001)
│       ├── app/
│       │   └── widget/         # Widget page and layout
│       ├── components/
│       ├── hooks/
│       ├── lib/
│       └── modules/
│           └── widget/
│               ├── atoms/      # Jotai state atoms
│               ├── hooks/      # Widget-specific hooks
│               ├── ui/         # Widget UI components
│               ├── constants.ts
│               └── types.ts
└── packages/
    ├── backend/                # Convex backend
    │   └── convex/
    │       ├── _generated/
    │       ├── lib/
    │       ├── private/        # Internal mutations/queries
    │       │   ├── contactSessions.ts
    │       │   ├── conversations.ts
    │       │   ├── files.ts
    │       │   ├── messages.ts
    │       │   ├── plugins.ts
    │       │   ├── secrets.ts
    │       │   ├── vapi.ts
    │       │   └── widgetSettings.ts
    │       ├── public/         # Widget-facing endpoints (unauthenticated)
    │       │   ├── contactSessions.ts
    │       │   ├── conversations.ts
    │       │   ├── messages.ts
    │       │   ├── messagesAction.ts
    │       │   ├── organizations.ts
    │       │   ├── secrets.ts
    │       │   └── widgetSettings.ts
    │       ├── system/         # Auth, HTTP routes, config
    │       │   ├── auth.config.ts
    │       │   ├── constants.ts
    │       │   ├── convex.config.ts
    │       │   ├── http.ts
    │       │   └── playground.ts
    │       ├── schema.ts
    │       └── users.ts
    ├── ui/                     # Shared component library
    ├── math/                   # Shared utilities
    ├── eslint-config/
    └── typescript-config/
```

---

## Database Schema (Convex)

**subscriptions** — Tracks organization subscription status.

**widgetSettings** — Per-organization widget configuration including greet message, default chat suggestions, and Vapi assistant/phone settings.

**plugins** — Integration credentials per organization (currently: Vapi).

**conversations** — Chat threads linked to a contact session and organization. Status can be `unresolved`, `escalated`, or `resolved`.

**contactSessions** — Authenticated anonymous sessions for end users. Stores name, email, expiry, and browser metadata (user agent, timezone, screen resolution, etc.).

**users** — Internal system users.

---

## Getting Started

### Prerequisites

- Node.js >= 20
- pnpm >= 9
- A Convex account and project
- A Clerk application
- (Optional) Vapi account for voice features
- (Optional) Sentry DSN for error monitoring

### Installation

```bash
git clone <repository-url>
cd next-monorepo
pnpm install
```

### Environment Setup

Create the following `.env.local` files:

**Root `.env.local`**
```env
CONVEX_DEPLOYMENT=<your-convex-deployment>
CONVEX_URL=<your-convex-url>
CONVEX_SITE_URL=<your-convex-site-url>
```

**`apps/web/.env.local`**
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

**`apps/widget/.env.local`**
```env
NEXT_PUBLIC_CONVEX_URL=<your-convex-url>
VITE_WIDGET_URL=<your-deployed-widget-url>
```

**`apps/embed/.env`**
```env
VITE_WIDGET_URL=<your-deployed-widget-url>
```

### Running the Convex Backend

```bash
cd packages/backend
pnpm setup    # First time: deploy schema and wait for success
pnpm dev      # Subsequent runs
```

### Running the Full Development Environment

From the root, start all apps in parallel:

```bash
pnpm dev
```

Or run individual apps:

```bash
# Dashboard (port 3000)
cd apps/web && pnpm dev

# Widget (port 3001)
cd apps/widget && pnpm dev

# Embed script (port 3002)
cd apps/embed && pnpm dev
```

---

## Embedding the Widget

Once the `embed` app is built and deployed, add the following script tag to any website:

```html
<script
  src="https://<your-embed-url>/embed.js"
  data-organization-id="<your-organization-id>"
  data-position="bottom-right"
></script>
```

**Attributes:**

| Attribute | Required | Default | Description |
|---|---|---|---|
| `data-organization-id` | Yes | — | Your Convex organization ID |
| `data-position` | No | `bottom-right` | `bottom-right` or `bottom-left` |

**JavaScript API** (available as `window.EchoWidget`):

```js
EchoWidget.show()
EchoWidget.hide()
EchoWidget.destroy()
EchoWidget.init({ organizationId: '...', position: 'bottom-left' })
```

---

## Key Features

**Dashboard (web app)**

- Organization management via Clerk multi-tenancy
- Conversation inbox with status tracking (unresolved, escalated, resolved)
- File upload and knowledge base management
- Widget customization (greet message, default suggestions, Vapi settings)
- Plugin and integration management
- Billing management
- AI agent playground for testing

**Widget (end-user chat)**

- Anonymous contact sessions with browser metadata collection
- Real-time AI chat powered by Convex agents and RAG
- Voice call integration via Vapi
- Persistent conversation threads

**Embed script**

- Zero-dependency vanilla JS bundle
- Iframe-based isolation
- Configurable position and organization binding
- Exposes a simple JS API for programmatic control

---

## Build

```bash
# Build all packages and apps
pnpm build

# Build individual app
cd apps/web && pnpm build
cd apps/widget && pnpm build
cd apps/embed && pnpm build
```

---

## Linting and Formatting

```bash
# Lint all
pnpm lint

# Format all
pnpm format

# Type check all
pnpm typecheck
```

---

## Deployment

| App | URL |
|---|---|
| web (dashboard) | https://support-platform-web-xi.vercel.app |

- **web** and **widget** are Next.js apps deployed to Vercel.
- **embed** produces a static JS bundle (`dist/`) deployed alongside the widget app.
- **backend** runs on Convex cloud. Deploy with `npx convex deploy` from `packages/backend`.

The widget app URL must be set in the embed script's `VITE_WIDGET_URL` environment variable before building, as the embed script iframes that URL directly.

---

## Author

Rekhta
