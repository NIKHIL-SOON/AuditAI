import { describe, it, expect } from 'vitest';
import { evaluateSpend, AuditContext } from './audit-engine';

describe('Audit Engine Evaluator', () => {
  it('should recommend consolidating Cursor and Copilot', () => {
    const context: AuditContext = {
      teamSize: 10,
      tools: [
        { name: 'Cursor', tier: 'Pro', users: 5, monthlySpend: 100 },
        { name: 'GitHub Copilot', tier: 'Business', users: 5, monthlySpend: 95 }
      ]
    };

    const result = evaluateSpend(context);
    
    expect(result.currentMonthlySpend).toBe(195);
    expect(result.recommendations.length).toBeGreaterThan(0);
    expect(result.recommendations[0].toolName).toBe('GitHub Copilot');
    expect(result.recommendations[0].action).toBe('CONSOLIDATE');
    expect(result.monthlySavings).toBe(95); // 5 users * $19
    expect(result.annualSavings).toBe(95 * 12);
  });

  it('should recommend downgrading Cursor Business for small teams', () => {
    const context: AuditContext = {
      teamSize: 3,
      tools: [
        { name: 'Cursor', tier: 'Business', users: 3, monthlySpend: 120 }
      ]
    };

    const result = evaluateSpend(context);
    
    expect(result.recommendations[0].toolName).toBe('Cursor');
    expect(result.recommendations[0].action).toBe('DOWNGRADE');
    expect(result.monthlySavings).toBe(60); // 3 users * $20 difference
  });

  it('should recommend consolidating ChatGPT and Claude', () => {
    const context: AuditContext = {
      teamSize: 20,
      tools: [
        { name: 'ChatGPT', tier: 'Plus', users: 10, monthlySpend: 200 },
        { name: 'Claude', tier: 'Pro', users: 10, monthlySpend: 200 }
      ]
    };

    const result = evaluateSpend(context);
    
    expect(result.recommendations[0].toolName).toBe('Multiple Chatbots');
    expect(result.recommendations[0].action).toBe('CONSOLIDATE');
    expect(result.monthlySavings).toBe(200); // overlap of 10 users * $20
  });

  it('should calculate zero savings if stack is perfectly optimized', () => {
    const context: AuditContext = {
      teamSize: 5,
      tools: [
        { name: 'Cursor', tier: 'Pro', users: 5, monthlySpend: 100 },
        { name: 'Claude', tier: 'Pro', users: 2, monthlySpend: 40 }
      ]
    };

    const result = evaluateSpend(context);
    
    expect(result.recommendations.length).toBe(0);
    expect(result.monthlySavings).toBe(0);
    expect(result.currentMonthlySpend).toBe(140);
  });
});
