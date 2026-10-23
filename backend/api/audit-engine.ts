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

// Existing project assumptions, NOT verified current vendor prices.
// Callers can override them with verified, like-for-like per-seat quotes.
export const DEFAULT_BASELINES = Object.freeze({ cursor: 20, copilot: 19, chatgpt: 30 });
export type Baselines = Partial<Record<'cursor' | 'copilot' | 'chatgpt', number>>;

export function evaluateSpend(context: AuditContext, baselines: Baselines = DEFAULT_BASELINES): AuditResult {
  if (!context || !Number.isInteger(context.teamSize) || context.teamSize < 1 ||
      typeof context.useCase !== 'string' || !context.useCase.trim() || !Array.isArray(context.tools)) {
    throw new Error('A use case, positive integer team size and tool list are required.');
  }
  const money = (n: number) => {
    const cents = Math.round((n + Number.EPSILON) * 100);
    if (!Number.isFinite(n) || n < 0 || !Number.isSafeInteger(cents)) {
      throw new Error('Spend must be a finite, non-negative amount within the supported range.');
    }
    return cents;
  };
  const normalize = (name: string) => {
    const key = name.trim().toLowerCase();
    return key === 'copilot' ? 'github copilot' : key;
  };
  const tools = new Map<string, UserTool & { cents: number }>();
  let currentCents = 0;
  for (const tool of context.tools) {
    if (!tool || typeof tool.name !== 'string' || !tool.name.trim() || typeof tool.tier !== 'string' ||
        !tool.tier.trim() || !Number.isInteger(tool.users) || tool.users < 1) {
      throw new Error('Each tool needs a name, tier and positive integer seat count.');
    }
    const key = normalize(tool.name);
    if (tools.has(key)) throw new Error('Combine duplicate tool entries before running the audit.');
    const cents = money(tool.monthlySpend);
    currentCents += cents;
    if (!Number.isSafeInteger(currentCents) || !Number.isSafeInteger(currentCents * 12)) {
      throw new Error('Total spend exceeds the supported range.');
    }
    tools.set(key, { ...tool, name: tool.name.trim(), cents });
  }
  for (const value of Object.values(baselines)) {
    if (value !== undefined) money(value);
  }

  const recommendations: Recommendation[] = [];
  const removed = new Set<string>();
  let savingsCents = 0;
  const cursor = tools.get('cursor');
  const copilot = tools.get('github copilot');
  const chatgpt = tools.get('chatgpt');
  const claude = tools.get('claude');

  const consolidate = (key: string, retained: string) => {
    const tool = tools.get(key);
    if (!tool || removed.has(key) || tool.cents === 0) return;
    removed.add(key);
    savingsCents += tool.cents;
    recommendations.push({
      toolName: tool.name,
      action: 'CONSOLIDATE',
      savings: tool.cents / 100,
      rationale: `Potential saving of $${(tool.cents / 100).toFixed(2)}/mo only if all ${tool.users} seats can be cancelled and ${retained} covers their needs at no extra cost. Confirm user overlap, features and contract terms first.`
    });
  };
  const downgrade = (key: string, baseline: number | undefined, tiers: string[]) => {
    const tool = tools.get(key);
    if (!tool || removed.has(key) || baseline === undefined || context.teamSize > 10 ||
        !tiers.includes(tool.tier.trim().toLowerCase())) return;
    // Multiply by purchased seats, not the overall team size. Work in cents.
    const targetCents = money(baseline) * tool.users;
    const delta = Math.max(0, tool.cents - targetCents);
    if (delta === 0) return;
    savingsCents += delta;
    recommendations.push({
      toolName: tool.name,
      action: 'DOWNGRADE',
      savings: delta / 100,
      rationale: `Potential saving of $${(delta / 100).toFixed(2)}/mo across ${tool.users} seats using an assumed $${baseline}/seat baseline. This is not a verified current quote; confirm current pricing, feature requirements and eligibility before changing plans.`
    });
  };

  if (cursor && copilot) consolidate('github copilot', cursor.name);
  // Cancellation and downgrade are mutually exclusive for any one subscription.
  downgrade('github copilot', baselines.copilot, ['enterprise']);
  downgrade('cursor', baselines.cursor, ['business', 'enterprise']);
  if (chatgpt && claude) consolidate('claude', chatgpt.name);
  downgrade('chatgpt', baselines.chatgpt, ['enterprise']);
  // A coding use case alone does not establish that a general chatbot is redundant.
  // Do not cancel a chatbot merely because a coding assistant is present.

  return {
    useCase: context.useCase.trim(),
    teamSize: context.teamSize,
    currentMonthlySpend: currentCents / 100,
    optimizedMonthlySpend: (currentCents - savingsCents) / 100,
    monthlySavings: savingsCents / 100,
    annualSavings: (savingsCents * 12) / 100,
    recommendations,
  };
}
