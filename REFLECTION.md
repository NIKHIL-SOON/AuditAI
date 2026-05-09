## REFLECTION

1. **The hardest bug you hit this week, and how you debugged it**
The hardest bug was an insidious issue where the form state for dynamic tool selections would occasionally lose data when switching between plans rapidly. It turned out to be a stale closure problem within my React hooks. I debugged it by placing console logs inside the \`useEffect\` dependencies and noticed the previous state was being referenced. I fixed it by ensuring I used the functional update form of \`setState\` (\`setTools(prev => ...)\`) instead of relying on the closed-over variable.

2. **A decision you reversed mid-week, and what made you reverse it**
I originally planned to use AI to generate the exact dollar amounts for savings. However, mid-week, after realizing that LLMs hallucinate numbers and plans constantly, I reversed course. I decided to hardcode the pricing and the audit logic entirely in TypeScript. The AI is now only used for the final personalized prose summary, making the financial data 100% reliable.

3. **What you would build in week 2 if you had it**
I would build a "Benchmarking" feature. Once we have enough audits, we could aggregate the data (anonymously) to show a user: "You are spending $200/seat/month on AI, but companies your size average $140/seat/month." I would also implement the PDF export feature properly, using a headless browser to generate beautiful, shareable PDFs of the audit report.

4. **How you used AI tools**
I used Claude 3.5 Sonnet to help me bootstrap the shadcn/ui components and generate the base HTML/CSS layouts for the landing page. I didn't trust the AI with the math or the exact pricing data (it was completely hallucinating Windsurf pricing). One specific time the AI was wrong: it suggested using a deprecated React hook pattern for the intersection observer, and I caught it because the type definitions in TS 5.x flagged it as invalid.

5. **Self-rating on a 1–10 scale**
- **Discipline**: 9/10. I committed daily, logged my hours, and didn't cram on the weekend.
- **Code quality**: 8/10. Idiomatic React, fully typed, clear separation of concerns, though some components could be further decomposed.
- **Design sense**: 8/10. Clean, accessible, "Product Hunt ready", leveraging shadcn/ui.
- **Problem solving**: 9/10. Addressed the math hallucinations and form bugs efficiently.
- **Entrepreneurial thinking**: 9/10. The tool genuinely solves a problem and the lead capture loop is optimized for real business value.
