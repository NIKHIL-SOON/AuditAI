export interface UserTool {
  name: string;
  category?: string;
  tier: string;
  users: number;
  monthlySpend: number;
}

export interface AuditContext {
  useCase: string;
  teamSize: number;
  tools: UserTool[];
}

export interface Recommendation {
  toolName: string;
  action: 'DOWNGRADE' | 'CONSOLIDATE' | 'UPGRADE' | 'KEEP';
  savings: number;
  rationale: string;
}

export interface AuditResult {
  useCase: string;
  teamSize: number;
  currentMonthlySpend: number;
  optimizedMonthlySpend: number;
  monthlySavings: number;
  annualSavings: number;
  recommendations: Recommendation[];
}

export function evaluateSpend(context: AuditContext): AuditResult {
  const currentMonthlySpend = Math.round(context.tools.reduce((sum, t) => sum + t.monthlySpend, 0) * 100) / 100;
  let totalSavings = 0;
  const recommendations: Recommendation[] = [];

  const toolMap = new Map(context.tools.map(t => [t.name.toLowerCase(), t]));

  const cursor = toolMap.get('cursor');
  const copilot = toolMap.get('github copilot') || toolMap.get('copilot');
  const chatgpt = toolMap.get('chatgpt');
  const claude = toolMap.get('claude');
  const gemini = toolMap.get('gemini');

  function roundCurrency(val: number | string): number {
    const numericValue = typeof val === 'string' ? parseFloat(val) : val;
    return Math.round(numericValue * 100) / 100;
  }

  // 1. Evaluate Coding Assistants
  if (cursor && copilot) {
    const costPerUser = roundCurrency(copilot.monthlySpend / copilot.users);
    const savings = roundCurrency(costPerUser * context.teamSize);
    recommendations.push({
      toolName: 'GitHub Copilot',
      action: 'CONSOLIDATE',
      savings: savings,
      rationale: `Dropping GitHub Copilot ($${costPerUser}/user) for your team of ${context.teamSize} saves $${savings}/mo.`
    });
    totalSavings += savings;
  } else if (copilot) {
    if (copilot.tier.toLowerCase() === 'enterprise' && context.teamSize <= 10) {
      const costPerUser = roundCurrency(copilot.monthlySpend / copilot.users);
      const recommendedCost = 19;
      const costDiff = roundCurrency(costPerUser - recommendedCost);
      if (costDiff > 0) {
        const savings = roundCurrency(costDiff * context.teamSize);
        recommendations.push({
          toolName: 'GitHub Copilot',
          action: 'DOWNGRADE',
          savings: savings,
          rationale: `Downgrading GitHub Copilot ($${costDiff}/user) for your team of ${context.teamSize} saves $${savings}/mo.`
        });
        totalSavings += savings;
      }
    }
  }

  if (cursor) {
    if ((cursor.tier.toLowerCase() === 'business' || cursor.tier.toLowerCase() === 'enterprise') && context.teamSize <= 10) {
      const costPerUser = roundCurrency(cursor.monthlySpend / cursor.users);
      const recommendedCost = 20;
      const costDiff = roundCurrency(costPerUser - recommendedCost);
      if (costDiff > 0) {
        const savings = roundCurrency(costDiff * context.teamSize);
        recommendations.push({
          toolName: 'Cursor',
          action: 'DOWNGRADE',
          savings: savings,
          rationale: `Downgrading Cursor ($${costDiff}/user) for your team of ${context.teamSize} saves $${savings}/mo.`
        });
        totalSavings += savings;
      }
    }
  }

  // 2. Evaluate Chatbots
  if (chatgpt && claude) {
    const costPerUser = roundCurrency(claude.monthlySpend / claude.users);
    const savings = roundCurrency(costPerUser * context.teamSize);
    recommendations.push({
      toolName: 'Claude',
      action: 'CONSOLIDATE',
      savings: savings,
      rationale: `Dropping Claude ($${costPerUser}/user) for your team of ${context.teamSize} saves $${savings}/mo.`
    });
    totalSavings += savings;
  }

  if (chatgpt) {
    if (chatgpt.tier.toLowerCase() === 'enterprise' && context.teamSize <= 10) {
      const costPerUser = roundCurrency(chatgpt.monthlySpend / chatgpt.users);
      const recommendedCost = 30;
      const costDiff = roundCurrency(costPerUser - recommendedCost);
      if (costDiff > 0) {
        const savings = roundCurrency(costDiff * context.teamSize);
        recommendations.push({
          toolName: 'ChatGPT',
          action: 'DOWNGRADE',
          savings: savings,
          rationale: `Downgrading ChatGPT ($${costDiff}/user) for your team of ${context.teamSize} saves $${savings}/mo.`
        });
        totalSavings += savings;
      }
    }
  }

  // 3. Alternative Tool Logic
  if (context.useCase.toLowerCase() === 'coding') {
    const activeChatbot = chatgpt || claude || gemini;
    const activeCodingAssist = cursor || copilot;
    
    if (activeChatbot && activeCodingAssist) {
      const primaryChatbot = chatgpt || claude || gemini;
      if (primaryChatbot) {
        const costPerUser = roundCurrency(primaryChatbot.monthlySpend / primaryChatbot.users);
        const savings = roundCurrency(costPerUser * context.teamSize);
        
        recommendations.push({
          toolName: primaryChatbot.name,
          action: 'CONSOLIDATE',
          savings: savings,
          rationale: `Dropping ${primaryChatbot.name} ($${costPerUser}/user) for your team of ${context.teamSize} saves $${savings}/mo.`
        });
        totalSavings += savings;
      }
    }
  }

  totalSavings = roundCurrency(totalSavings);
  const optimizedMonthlySpend = roundCurrency(Math.max(0, currentMonthlySpend - totalSavings));

  return {
    useCase: context.useCase,
    teamSize: context.teamSize,
    currentMonthlySpend,
    optimizedMonthlySpend,
    monthlySavings: totalSavings,
    annualSavings: roundCurrency(totalSavings * 12),
    recommendations
  };
}
