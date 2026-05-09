# AI Spend Audit

A free web app for startups to audit their AI tool spending and discover cost-saving opportunities. By inputting current subscriptions, teams get an instant breakdown of where they are overspending and actionable recommendations for switching plans or tools.

## Quick Start
1. Clone the repository
2. Run \`npm install\`
3. Create a \`.env.local\` file with \`ANTHROPIC_API_KEY\`, \`RESEND_API_KEY\`, and Supabase credentials.
4. Run \`npm run dev\`

## Screenshots / Demo
*(Placeholder: 3+ screenshots of the dashboard and a 30-second Loom screen recording link will be added here upon final deployment.)*

## Decisions
1. **Framework**: Chosen Next.js App Router for seamless server-side rendering, API routes, and fast performance which is crucial for a landing page/tool hybrid.
2. **Styling**: Tailwind CSS and shadcn/ui for high-polish, robust accessible components without the bloat of heavy component libraries.
3. **Database**: Supabase PostgreSQL for straightforward relational data storage (leads, audit results) and built-in type safety.
4. **Audit Logic**: Hardcoded evaluation engine instead of AI. Predictability and mathematical accuracy are more important for financial audits than LLM-generated numbers.
5. **LLM Summary**: Using Anthropic's Claude 3 API for its superior nuance in generating human-like, empathetic summaries of financial data.

## Deployed URL
*(To be added upon deployment)*
