# Prompts

## The Audit Summary Prompt

The following prompt is sent to the Anthropic API (Claude 3.5 Sonnet) after the hardcoded audit engine calculates the raw savings data.

\`\`\`text
You are an expert SaaS financial advisor specializing in AI tooling for startups. 
I have just audited a startup's AI tool spend. 

Here is their data:
- Current Monthly Spend: ${currentSpend}
- Projected Optimal Spend: ${optimalSpend}
- Total Monthly Savings: ${monthlySavings}
- Tools audited: ${toolsList}

Here are the specific recommendations made by our hardcoded engine:
${recommendationText}

Write a 100-word personalized summary paragraph addressed to the startup founder. 
Your tone should be professional, empathetic, and actionable. Do NOT invent new numbers or savings. 
Only use the numbers provided. Highlight the biggest quick win from the recommendations.
End with a gentle nudge that Credex can help them unlock even deeper savings on enterprise credits if their savings are over $500/mo.
\`\`\`

## Why I wrote it this way:
1. **Strict adherence to provided data**: LLMs are notorious for hallucinating financial data. By supplying the exact calculated numbers and explicitly forbidding it from inventing new ones, we ensure the summary matches the UI.
2. **Tone setting**: Emphasizes empathy. Founders often feel guilty about "wasted" money; the tone must be advisory, not scolding.
3. **Dynamic Call-to-Action**: It conditionally includes the Credex pitch only if it makes sense contextually.

## What I tried that didn't work:
I initially tried sending raw user inputs to the LLM and asked it to "audit their spend and find savings". This was a disaster. The LLM recommended downgrading to non-existent tiers (like "Cursor Team") or suggested completely incorrect pricing for Claude. It proved that LLMs should be the presentation layer, not the calculation layer for a financial audit.
