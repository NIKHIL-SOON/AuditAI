# Architecture

## System Diagram
```mermaid
graph TD
    Client[Client Browser (Frontend)]
    NextJS[Next.js API Route (Frontend)]
    AuditEngine[Backend Audit Engine<br>backend/api/audit-engine.ts]
    LLM[Anthropic API]
    DB[(Supabase PostgreSQL)]
    Email[Resend API]

    Client -- "1. Submits AI Tool Spend via @/frontend" --> NextJS
    NextJS -- "2. Invokes @/backend engine" --> AuditEngine
    AuditEngine -. "Returns Hardcoded Results" .-> NextJS

    NextJS -- "3. Requests Personalized Summary" --> LLM
    LLM -. "Returns ~100-word Summary" .-> NextJS

    Client -- "4. Submits Email" --> NextJS
    NextJS -- "5. Stores Audit Data + Lead" --> DB
    NextJS -- "6. Triggers Confirmation Email" --> Email
```

## Stack Choice
- **Frontend/Backend**: Next.js (App Router) provides a unified stack. Server Actions allow easy integration with the database without building a separate REST API.
- **Styling**: Tailwind CSS + shadcn/ui ensures a professional, consistent design system.
- **Database**: Supabase is quick to spin up, offers great TypeScript support, and is highly scalable.
- **Email**: Resend for easy integration with React email templates.

## Scaling to 10k Audits/Day
If this had to handle 10k audits/day:
- I would implement Edge caching (Vercel Edge Network or Cloudflare) for the static parts and pricing data.
- The Rate Limiting would use Redis (Upstash) strictly.
- The Audit Engine could run on the Edge instead of Serverless functions to reduce latency.
- Lead captures and email triggers could be offloaded to an asynchronous queue (e.g., Inngest or Upstash QStash) rather than blocking the user's request.
