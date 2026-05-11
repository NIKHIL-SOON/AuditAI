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
      rationale: `You are currently paying for 'Ghost Seats'. By dropping Copilot for ${overlapUsers} overlapping Cursor users, you stop a $${savings * 12}/year leak. Eliminate waste and reclaim this budget.`
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
        rationale: `You are currently paying for 'Ghost Seats' on an enterprise tier you don't need. Downgrading to Pro stops a $${savings * 12}/year leak. Reclaim budget without losing capabilities.`
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
      rationale: `You are currently paying for 'Ghost Seats'. By consolidating ChatGPT and Claude, you stop a $${savings * 12}/year leak that adds zero value to your team. Redirect this capital into growth, not redundant subscriptions.`
    });
    currentMonthlySpend += chatgpt.monthlySpend + claude.monthlySpend;
    optimizedMonthlySpend += (chatgpt.monthlySpend + claude.monthlySpend - savings);
  } else {
    if (chatgpt) {
      if (chatgpt.tier.toLowerCase() === 'enterprise' && chatgpt.users <= 5) {
        const recommendedCost = chatgpt.users * 30; // Team plan cost
        const savings = chatgpt.monthlySpend > recommendedCost ? chatgpt.monthlySpend - recommendedCost : 0;
        if (savings > 0) {
          recommendations.push({
            toolName: 'ChatGPT',
            action: 'DOWNGRADE',
            savings: savings,
            rationale: `You have ${chatgpt.users} users on an Enterprise plan. Switching to the Business Team plan ($30/user) provides a better usage-fit and stops a $${savings * 12}/year leak.`
          });
          currentMonthlySpend += chatgpt.monthlySpend;
          optimizedMonthlySpend += (chatgpt.monthlySpend - savings);
        } else {
          currentMonthlySpend += chatgpt.monthlySpend;
          optimizedMonthlySpend += chatgpt.monthlySpend;
        }
      } else {
        currentMonthlySpend += chatgpt.monthlySpend;
        optimizedMonthlySpend += chatgpt.monthlySpend;
      }
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
    useCase: context.useCase,
    teamSize: context.teamSize,
    currentMonthlySpend,
    optimizedMonthlySpend,
    monthlySavings,
    annualSavings: monthlySavings * 12,
    recommendations
  };
}
