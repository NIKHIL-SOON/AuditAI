import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
const source = readFileSync(new URL('../backend/api/audit-engine.ts', import.meta.url), 'utf8');
const js = stripTypeScriptTypes(source, { mode: 'strip', disableWarning: true });
const { evaluateSpend } = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
const tool = (name, users, monthlySpend, tier = 'Pro') => ({ name, users, monthlySpend, tier });
const run = (tools, teamSize = 10, useCase = 'Mixed', baseline) => evaluateSpend({ tools, teamSize, useCase }, baseline);

test('original Copilot regression: actual $95 subscription, not $190', () => {
  const r = run([tool('Cursor', 5, 100), tool('GitHub Copilot', 5, 95, 'Business')]);
  assert.equal(r.currentMonthlySpend, 195); assert.equal(r.monthlySavings, 95);
  assert.equal(r.optimizedMonthlySpend, 100); assert.equal(r.annualSavings, 1140);
});
test('chatbot consolidation names actual cancelled tool and saves actual spend', () => {
  const r = run([tool('ChatGPT', 10, 200, 'Plus'), tool('Claude', 10, 200)], 20);
  assert.equal(r.monthlySavings, 200); assert.equal(r.recommendations[0].toolName, 'Claude');
});
test('downgrade uses actual three seats, not overall team size', () => {
  assert.equal(run([tool('Cursor', 3, 120, 'Business')], 8).monthlySavings, 60);
});
test('cancelled Copilot enterprise subscription is not downgraded again', () => {
  const r = run([tool('Cursor', 3, 60), tool('Copilot', 3, 117, 'Enterprise')], 3);
  assert.equal(r.monthlySavings, 117); assert.equal(r.recommendations.length, 1);
});
test('coding use case does not prove chatbot redundancy', () => {
  assert.equal(run([tool('Cursor', 5, 100), tool('Claude', 2, 40)], 5, 'Coding').monthlySavings, 0);
});
test('cent arithmetic and annual totals stay consistent', () => {
  const r = run([tool('ChatGPT', 3, 30.03), tool('Claude', 3, 30.03)], 3);
  assert.equal(r.currentMonthlySpend, 60.06); assert.equal(r.monthlySavings, 30.03);
  assert.equal(r.optimizedMonthlySpend, 30.03); assert.equal(r.annualSavings, 360.36);
});
test('empty tool list returns zero totals', () => { assert.equal(run([]).monthlySavings, 0); });
test('invalid seat counts are rejected without division by zero', () => {
  for (const n of [0, -1, 1.5, NaN, Infinity]) assert.throws(() => run([tool('Cursor', n, 20)]));
});
test('invalid spend values are rejected', () => {
  for (const n of [-1, NaN, Infinity, Number.MAX_VALUE]) assert.throws(() => run([tool('Cursor', 1, n)]));
});
test('use case and team size validation prevents malformed-context crash', () => {
  assert.throws(() => run([], 0)); assert.throws(() => run([], 1, ''));
  assert.throws(() => evaluateSpend({teamSize:1, tools:[]}));
});
test('duplicate aliases and whitespace variants are rejected', () => {
  assert.throws(() => run([tool('Copilot', 1, 19), tool(' GitHub Copilot ', 1, 19)]));
});
test('normalization and zero spend', () => {
  const r = run([tool(' CURSOR ', 1, 20), tool(' copilot ', 1, 0)]);
  assert.equal(r.monthlySavings, 0); assert.equal(r.recommendations.length, 0);
});
test('explicit verified baseline overrides illustrative default; empty disables downgrades', () => {
  assert.equal(run([tool('Cursor',3,120,'Business')],3,'Mixed',{cursor:25}).monthlySavings,45);
  assert.equal(run([tool('Cursor',3,120,'Business')],3,'Mixed',{}).monthlySavings,0);
});
test('recommendations never exceed spend and totals reconcile across combinations', () => {
  for (let size=1;size<=20;size++) {
    const r=run([tool('Cursor',3,120,'Business'),tool('Copilot',2,78,'Enterprise'),tool('ChatGPT',2,100,'Enterprise'),tool('Claude',1,20)],size,'Coding');
    assert.ok(r.monthlySavings<=r.currentMonthlySpend); assert.ok(r.optimizedMonthlySpend>=0);
    assert.equal(Math.round(r.recommendations.reduce((s,x)=>s+x.savings,0)*100),Math.round(r.monthlySavings*100));
    assert.equal(Math.round((r.optimizedMonthlySpend+r.monthlySavings)*100),Math.round(r.currentMonthlySpend*100));
  }
});
