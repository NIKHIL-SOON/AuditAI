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
  const currentMonthlySpend = context.tools.reduce((sum, t) => sum + t.monthlySpend, 0);
  let totalSavings = 0;
  const recommendations: Recommendation[] = [];

  const toolMap = new Map(context.tools.map(t => [t.name.toLowerCase(), t]));

  const cursor = toolMap.get('cursor');
  const copilot = toolMap.get('github copilot') || toolMap.get('copilot');
  const chatgpt = toolMap.get('chatgpt');
  const claude = toolMap.get('claude');
  const gemini = toolMap.get('gemini');

  // 1. Evaluate Coding Assistants
  if (cursor && copilot) {
    const costPerUser = copilot.monthlySpend / copilot.users;
    const savings = costPerUser * context.teamSize;
    recommendations.push({
      toolName: 'GitHub Copilot',
      action: 'CONSOLIDATE',
      savings: savings,
      rationale: `Dropping GitHub Copilot ($${costPerUser.toFixed(0)}/user) for your team of ${context.teamSize} saves $${savings.toFixed(0)}/mo.`
    });
    totalSavings += savings;
  } else if (copilot) {
    if (copilot.tier.toLowerCase() === 'enterprise' && context.teamSize <= 10) {
      const costPerUser = copilot.monthlySpend / copilot.users;
      const recommendedCost = 19;
      const costDiff = costPerUser - recommendedCost;
      if (costDiff > 0) {
        const savings = costDiff * context.teamSize;
        recommendations.push({
          toolName: 'GitHub Copilot',
          action: 'DOWNGRADE',
          savings: savings,
          rationale: `Downgrading GitHub Copilot ($${costDiff.toFixed(0)}/user) for your team of ${context.teamSize} saves $${savings.toFixed(0)}/mo.`
        });
        totalSavings += savings;
      }
    }
  }

  if (cursor) {
    if ((cursor.tier.toLowerCase() === 'business' || cursor.tier.toLowerCase() === 'enterprise') && context.teamSize <= 10) {
      const costPerUser = cursor.monthlySpend / cursor.users;
      const recommendedCost = 20;
      const costDiff = costPerUser - recommendedCost;
      if (costDiff > 0) {
        const savings = costDiff * context.teamSize;
        recommendations.push({
          toolName: 'Cursor',
          action: 'DOWNGRADE',
          savings: savings,
          rationale: `Downgrading Cursor ($${costDiff.toFixed(0)}/user) for your team of ${context.teamSize} saves $${savings.toFixed(0)}/mo.`
        });
        totalSavings += savings;
      }
    }
  }

  // 2. Evaluate Chatbots
  if (chatgpt && claude) {
    const costPerUser = claude.monthlySpend / claude.users;
    const savings = costPerUser * context.teamSize;
    recommendations.push({
      toolName: 'Claude',
      action: 'CONSOLIDATE',
      savings: savings,
      rationale: `Dropping Claude ($${costPerUser.toFixed(0)}/user) for your team of ${context.teamSize} saves $${savings.toFixed(0)}/mo.`
    });
    totalSavings += savings;
  }

  if (chatgpt) {
    if (chatgpt.tier.toLowerCase() === 'enterprise' && context.teamSize <= 10) {
      const costPerUser = chatgpt.monthlySpend / chatgpt.users;
      const recommendedCost = 30;
      const costDiff = costPerUser - recommendedCost;
      if (costDiff > 0) {
        const savings = costDiff * context.teamSize;
        recommendations.push({
          toolName: 'ChatGPT',
          action: 'DOWNGRADE',
          savings: savings,
          rationale: `Downgrading ChatGPT ($${costDiff.toFixed(0)}/user) for your team of ${context.teamSize} saves $${savings.toFixed(0)}/mo.`
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
        const costPerUser = primaryChatbot.monthlySpend / primaryChatbot.users;
        const savings = costPerUser * context.teamSize;
        
        recommendations.push({
          toolName: primaryChatbot.name,
          action: 'CONSOLIDATE',
          savings: savings,
          rationale: `Dropping ${primaryChatbot.name} ($${costPerUser.toFixed(0)}/user) for your team of ${context.teamSize} saves $${savings.toFixed(0)}/mo.`
        });
        totalSavings += savings;
      }
    }
  }

  const optimizedMonthlySpend = Math.max(0, currentMonthlySpend - totalSavings);

  return {
    useCase: context.useCase,
    teamSize: context.teamSize,
    currentMonthlySpend,
    optimizedMonthlySpend,
    monthlySavings: totalSavings,
    annualSavings: totalSavings * 12,
    recommendations
  };
}
