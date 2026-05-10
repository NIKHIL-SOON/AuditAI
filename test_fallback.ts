import { evaluateSpend } from './backend/api/audit-engine';
import { generateSummary } from './backend/api/ai-summary';

async function test() {
  const result = evaluateSpend({
    teamSize: 20,
    tools: [
      { name: 'ChatGPT', tier: 'Plus', users: 20, monthlySpend: 400 },
      { name: 'Claude', tier: 'Pro', users: 20, monthlySpend: 400 }
    ]
  });
  console.log("=== Savings ===");
  console.log("Monthly Savings:", result.monthlySavings);
  
  console.log("=== Fallback Summary ===");
  // force missing api key
  process.env.ANTHROPIC_API_KEY = "";
  const summary = await generateSummary(result);
  console.log(summary);
}
test();
