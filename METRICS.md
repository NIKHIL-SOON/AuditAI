# Metrics

## North Star Metric
**Qualified Leads Captured per Week**
*Why*: This is a lead-gen asset for Credex. Raw traffic or "audits completed" are vanity metrics if they don't convert into a workable pipeline. A qualified lead (email captured + identified savings >$500/mo) is the exact atomic unit of value this tool was built to produce.

## 3 Input Metrics
1. **Landing Page Conversion Rate (Visitor → Audit Completed)**
   - Tells us if the messaging (Hero/Subhero) resonates and if the form UX is frictionless enough.
2. **Email Capture Rate (Audit Completed → Email Given)**
   - Tells us if the audit engine is providing enough "Aha!" value that the user is willing to trade their email to save the results.
3. **K-Factor (Shares per Audit)**
   - Measured by tracking how many unique sessions originate from a shared `/audit/[id]` link. Tells us if the viral loop is functioning.

## What to Instrument First
1. PostHog for funnel tracking:
   - Event 1: `page_viewed`
   - Event 2: `form_started`
   - Event 3: `audit_completed` (with properties: `total_savings`, `tools_count`)
   - Event 4: `email_captured`
2. Supabase DB triggers to alert a Slack channel immediately when a Qualified Lead is inserted.

## Pivot Decision Trigger
If the **Landing Page Conversion Rate drops below 5%** after the first 1,000 visitors.
If we can't convince 1 in 20 people to run a free, frictionless math calculator, it means either our distribution channel is sending the wrong traffic, or the "AI tool overspend" pain point is not acute enough for this audience. At that point, we must pivot the messaging or abandon the tool.
