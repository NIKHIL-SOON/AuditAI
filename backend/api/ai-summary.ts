import { AuditResult } from "./audit-engine";

export async function generateSummary(result: AuditResult): Promise<string> {
  const prompt = `You are an expert AI software auditor. The user has an AI tool stack that costs $${result.currentMonthlySpend}/mo. We found they can optimize it to $${result.optimizedMonthlySpend}/mo, saving $${result.monthlySavings}/mo ($${result.annualSavings}/year).

Here are the recommendations:
${result.recommendations.map(r => `- ${r.toolName}: ${r.action} (Saves $${r.savings}/mo) - ${r.rationale}`).join('\n')}

Write a concise, professional ~100-word executive summary of these findings, highlighting the biggest wins. Be direct, encouraging, and do not use generic AI buzzwords.`;

  try {
    const apiKey = process.env.ANTHROPIC_API_KEY || process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.log("[Info] Using local summary engine");
      return getFallbackSummary(result);
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 300,
        messages: [
          { role: "user", content: prompt }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.content[0].text;
  } catch (error) {
    console.error("AI Summary generation failed, falling back to templated response:", error);
    return getFallbackSummary(result);
  }
}

function getFallbackSummary(result: AuditResult): string {
  if (result.monthlySavings > 0) {
    return `Based on our audit, your team is currently spending $${result.currentMonthlySpend}/mo on AI tools. By optimizing overlapping subscriptions and right-sizing team seats, you can reduce this to $${result.optimizedMonthlySpend}/mo. This generates a total savings of $${result.monthlySavings}/mo ($${result.annualSavings}/year). Review the specific downgrade and cancellation recommendations below to achieve this leaner, more efficient AI tool stack immediately.`;
  } else {
    return `Great news! Based on our audit, your team's AI tool spend of $${result.currentMonthlySpend}/mo is fully optimized. We did not find any redundant subscriptions or wasted seats. Keep up the excellent work managing your software stack efficiently.`;
  }
}
