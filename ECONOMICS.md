# Unit Economics

If Credex deploys this tool, here is the economic model for its viability as a lead-gen asset.

## Value of a Converted Lead
- **Assumptions**: 
  - A startup saving >$500/month through Credex buys an average of $2,000/month in credits.
  - Credex takes a 15% margin on those credits.
  - Average lifespan of the startup customer is 18 months.
- **LTV Calculation**: $2,000 * 15% = $300/mo gross profit. $300 * 18 = **$5,400 LTV per closed won customer**.

## Customer Acquisition Cost (CAC)
With an organic GTM strategy ($0 paid ad spend), the CAC is primarily the amortized cost of engineering time and minor infrastructure costs.
- **Infra Cost per Audit**: ~$0.02 (Anthropic API summary + DB read/write).
- **Time Cost**: 1 hour of SDR time to follow up on a qualified lead (~$40).
- **Blended CAC**: Assuming 1 in 20 audits yields a qualified lead, infra cost per lead = $0.40. Plus $40 SDR time = **$40.40 CAC per qualified lead**.

## Conversion Rates for Profitability
To be wildly profitable, the conversion funnel needs to hit these baselines:
- **Visitor to Audit**: 15%
- **Audit to Email Capture**: 25%
- **Email Capture to Qualified Lead (>$500 savings)**: 10%
- **Qualified Lead to Consultation Booked**: 20%
- **Consultation to Credit Purchase (Close Rate)**: 50%

*From 10,000 visitors:*
-> 1,500 audits -> 375 emails -> 37 qualified leads -> 7.5 consultations -> **3.75 closed deals.**
*Revenue generated*: 3.75 deals * $5,400 LTV = **$20,250**.
*Cost*: 1,500 audits * $0.02 = $30. Plus SDR time (37 leads * $40) = $1,480. Total Cost: $1,510.
*ROI*: 13x.

## Path to $1M ARR in 18 Months
To generate $1M ARR ($83k MRR), Credex needs ~277 active customers paying $300/mo in margin.
Using the 50% close rate on consultations, we need 554 consultations.
Using the 20% consultation booking rate, we need 2,770 qualified leads.
Using the 10% qualification rate, we need 27,700 captured emails.
Using the 25% capture rate, we need 110,800 audits completed.
Over 18 months, that is ~**6,155 audits per month** (~200 per day).
*What must be true*: The viral loop (sharing results on Twitter/HN) must contribute at least a 0.2 K-factor (every 5 audits brings 1 new audit) to sustain traffic without scaling paid ads.
