export interface UserTool {
  name: string;
  tier: string;
  users: number;
  monthlySpend: number;
}

export interface AuditContext {
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
  currentMonthlySpend: number;
  optimizedMonthlySpend: number;
  monthlySavings: number;
  annualSavings: number;
  recommendations: Recommendation[];
}

export function evaluateSpend(context: AuditContext): AuditResult {
  let currentMonthlySpend = 0;
  let optimizedMonthlySpend = 0;
  const recommendations: Recommendation[] = [];

  const toolMap = new Map(context.tools.map(t => [t.name.toLowerCase(), t]));

  // 1. Evaluate Coding Assistants (Cursor vs Copilot)
  const cursor = toolMap.get('cursor');
  const copilot = toolMap.get('github copilot') || toolMap.get('copilot');

  if (cursor && copilot) {
    const overlapUsers = Math.min(cursor.users, copilot.users);
    // Determine overlapping spend logic
    const savings = overlapUsers * 19; // baseline copilot cost
    recommendations.push({
      toolName: 'GitHub Copilot',
      action: 'CONSOLIDATE',
      savings: savings,
      rationale: `You are paying for both Cursor and Copilot. Cursor includes a powerful AI autocomplete model. Dropping Copilot for ${overlapUsers} overlapping users saves $${savings}/mo without losing capabilities.`
    });
    currentMonthlySpend += copilot.monthlySpend;
    optimizedMonthlySpend += (copilot.monthlySpend - savings);
  } else if (copilot) {
    currentMonthlySpend += copilot.monthlySpend;
    optimizedMonthlySpend += copilot.monthlySpend;
  }
  
  if (cursor) {
    // Determine tier optimization for Cursor
    if (cursor.tier.toLowerCase() === 'business' && cursor.users < 5) {
      const savings = cursor.users * (40 - 20); // Business is $40, Pro is $20
      recommendations.push({
        toolName: 'Cursor',
        action: 'DOWNGRADE',
        savings: savings,
        rationale: `Cursor Business is best for larger teams requiring centralized billing & privacy controls. Since you only have ${cursor.users} users, downgrading to Pro saves $20/user/mo.`
      });
      currentMonthlySpend += cursor.monthlySpend;
      optimizedMonthlySpend += (cursor.monthlySpend - savings);
    } else {
      currentMonthlySpend += cursor.monthlySpend;
      optimizedMonthlySpend += cursor.monthlySpend;
    }
  }

  // 2. Evaluate Chat Assistants (ChatGPT vs Claude)
  const chatgpt = toolMap.get('chatgpt');
  const claude = toolMap.get('claude');

  if (chatgpt && claude) {
    const overlapUsers = Math.min(chatgpt.users, claude.users);
    const savings = overlapUsers * 20; // Average baseline chat cost
    recommendations.push({
      toolName: 'Multiple Chatbots',
      action: 'CONSOLIDATE',
      savings: savings,
      rationale: `Paying for both ChatGPT and Claude for the exact same users is redundant. Standardizing on one platform saves $20/user/mo.`
    });
    currentMonthlySpend += chatgpt.monthlySpend + claude.monthlySpend;
    optimizedMonthlySpend += (chatgpt.monthlySpend + claude.monthlySpend - savings);
  } else {
    if (chatgpt) {
      currentMonthlySpend += chatgpt.monthlySpend;
      optimizedMonthlySpend += chatgpt.monthlySpend;
    }
    if (claude) {
      currentMonthlySpend += claude.monthlySpend;
      optimizedMonthlySpend += claude.monthlySpend;
    }
  }

  // 3. Catch-all for un-evaluated tools
  for (const tool of context.tools) {
    const name = tool.name.toLowerCase();
    if (!['cursor', 'copilot', 'github copilot', 'chatgpt', 'claude'].includes(name)) {
      currentMonthlySpend += tool.monthlySpend;
      optimizedMonthlySpend += tool.monthlySpend;
    }
  }

  const monthlySavings = currentMonthlySpend - optimizedMonthlySpend;

  return {
    currentMonthlySpend,
    optimizedMonthlySpend,
    monthlySavings,
    annualSavings: monthlySavings * 12,
    recommendations
  };
}
