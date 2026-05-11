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
    const overlapUsers = Math.min(cursor.users, copilot.users);
    const costPerUser = copilot.monthlySpend / copilot.users;
    const savings = overlapUsers * costPerUser;
    recommendations.push({
      toolName: 'GitHub Copilot',
      action: 'CONSOLIDATE',
      savings: savings,
      rationale: `You are paying for redundant coding assistants. Dropping Copilot for ${overlapUsers} overlapping Cursor users saves $${costPerUser.toFixed(0)}/user/mo. For your team, that is a $${savings.toFixed(0)}/mo reduction.`
    });
    totalSavings += savings;
  } else if (copilot) {
    if (copilot.tier.toLowerCase() === 'enterprise' && context.teamSize <= 10) {
      const recommendedCost = copilot.users * 19;
      if (copilot.monthlySpend > recommendedCost) {
        const savings = copilot.monthlySpend - recommendedCost;
        const costDiff = (copilot.monthlySpend - recommendedCost) / copilot.users;
        recommendations.push({
          toolName: 'GitHub Copilot',
          action: 'DOWNGRADE',
          savings: savings,
          rationale: `Switching from Enterprise to Business saves $${costDiff.toFixed(0)}/user/mo. For your team of ${copilot.users}, that is a $${savings.toFixed(0)}/mo reduction without loss of core features.`
        });
        totalSavings += savings;
      }
    }
  }

  if (cursor) {
    if ((cursor.tier.toLowerCase() === 'business' || cursor.tier.toLowerCase() === 'enterprise') && context.teamSize <= 10) {
      const recommendedCost = cursor.users * 20;
      if (cursor.monthlySpend > recommendedCost) {
        const savings = cursor.monthlySpend - recommendedCost;
        const costDiff = (cursor.monthlySpend - recommendedCost) / cursor.users;
        recommendations.push({
          toolName: 'Cursor',
          action: 'DOWNGRADE',
          savings: savings,
          rationale: `Switching from ${cursor.tier} to Pro saves $${costDiff.toFixed(0)}/user/mo. For your team of ${cursor.users}, that is a $${savings.toFixed(0)}/mo reduction without loss of core features.`
        });
        totalSavings += savings;
      }
    }
  }

  // 2. Evaluate Chatbots
  if (chatgpt && claude) {
    const overlapUsers = Math.min(chatgpt.users, claude.users);
    const costPerUser = claude.monthlySpend / claude.users;
    const savings = overlapUsers * costPerUser;
    recommendations.push({
      toolName: 'Multiple Chatbots',
      action: 'CONSOLIDATE',
      savings: savings,
      rationale: `You are paying for redundant chatbots. Consolidating ChatGPT and Claude saves $${costPerUser.toFixed(0)}/user/mo. For ${overlapUsers} overlapping users, that is a $${savings.toFixed(0)}/mo reduction.`
    });
    totalSavings += savings;
  }

  if (chatgpt) {
    if (chatgpt.tier.toLowerCase() === 'enterprise' && context.teamSize <= 10) {
      const recommendedCost = chatgpt.users * 30;
      if (chatgpt.monthlySpend > recommendedCost) {
        const savings = chatgpt.monthlySpend - recommendedCost;
        const costDiff = (chatgpt.monthlySpend - recommendedCost) / chatgpt.users;
        recommendations.push({
          toolName: 'ChatGPT',
          action: 'DOWNGRADE',
          savings: savings,
          rationale: `Switching from Enterprise to Team saves $${costDiff.toFixed(0)}/user/mo. For your team of ${chatgpt.users}, that is a $${savings.toFixed(0)}/mo reduction without loss of core features.`
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
        const overlapUsers = Math.min(primaryChatbot.users, activeCodingAssist.users);
        const costPerUser = primaryChatbot.monthlySpend / primaryChatbot.users;
        const savings = overlapUsers * costPerUser;
        
        recommendations.push({
          toolName: primaryChatbot.name,
          action: 'CONSOLIDATE',
          savings: savings,
          rationale: `Since your primary use case is Coding, paying for a general chatbot PLUS a coding assistant is redundant. Dropping ${primaryChatbot.name} saves $${costPerUser.toFixed(0)}/user/mo. For your team of ${overlapUsers}, that is a $${savings.toFixed(0)}/mo reduction. Stick to your integrated coding assistant.`
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
    monthlySavings: currentMonthlySpend - optimizedMonthlySpend,
    annualSavings: (currentMonthlySpend - optimizedMonthlySpend) * 12,
    recommendations
  };
}
