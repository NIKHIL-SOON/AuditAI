# Unit Economics

To justify dedicating engineering resources to this AI Spend Audit tool, it must function as a highly profitable lead-generation asset. Here is the detailed breakdown of unit economics, acquisition costs, and the mathematical path to $1M ARR.

## Value of a Converted Lead (LTV)
We estimate the downstream value of the core Credex product (discounted AI infrastructure credits).
- **Assumptions**: 
  - A startup discovering >$500/month in actionable savings is our Ideal Customer Profile (ICP).
  - When this ICP converts, they purchase an average of $2,000/month in assorted AI credits through Credex.
  - Credex operates on an average margin of 15% on these brokered credits.
  - The average lifespan of a startup customer is 18 months.
- **Lifetime Value (LTV) Calculation**: 
  - $2,000 monthly spend * 15% margin = $300/month gross profit per customer.
  - $300/mo * 18 months = **$5,400 LTV per closed-won customer**.

## Customer Acquisition Cost (CAC)
With a Go-To-Market plan relying entirely on organic channels ($0 paid ad spend), our CAC derives from infrastructure and human capital.
- **Infrastructure Cost per Audit**: The Next.js hosting is negligible. The Anthropic API call for the summary (~$0.01) and Supabase read/writes (~$0.01) equal $0.02 per audit.
- **Sales Cost**: An SDR spends approximately 1 hour qualifying and conducting a consultation call. Fully loaded SDR cost is ~$40/hour.
- **Blended CAC**: Assuming 1 out of 20 completed audits yields a qualified lead, it costs 20 * $0.02 = $0.40 in infra. Adding the $40 SDR time, our **CAC is $40.40 per qualified lead worked**.

## Conversion Rates for Profitability
To ensure profitability, the conversion funnel must hit these baseline metrics:
- **Visitor to Audit Completed**: 15% (Requires a frictionless UI).
- **Audit to Email Capture**: 25% (Users trade email to save the report).
- **Email Capture to Sales Qualified Lead (SQL)**: 10% (Only 10% have >$500/mo savings).
- **SQL to Consultation Booked**: 20% (SDR successfully schedules a call).
- **Consultation to Closed Won**: 50% (Savings were mathematically proven).

**Funnel Simulation for 10,000 Visitors:**
- 10,000 Visitors -> 1,500 Audits Completed.
- 1,500 Audits -> 375 Emails Captured.
- 375 Emails -> 37 SQLs.
- 37 SQLs -> 7.5 Consultations Booked.
- 7.5 Consultations -> **3.75 Closed Won Customers.**

**ROI Calculation:**
- Revenue Generated: 3.75 deals * $5,400 LTV = **$20,250**.
- Total Cost: 1,500 audits * $0.02 ($30) + SDR time on 37 SQLs ($1,480) = **$1,510**.
- Return on Investment: ~13x ROI.

## Path to $1M ARR in 18 Months
To generate $1,000,000 in Annual Recurring Revenue ($83,333 Monthly Recurring Revenue), Credex needs approximately **277 active customers** paying that $300/mo margin.

Working backward through the funnel over 18 months:
- At a 50% close rate, we need 554 consultations.
- At a 20% booking rate, we need 2,770 SQLs.
- At a 10% qualification rate, we need 27,700 captured emails.
- At a 25% capture rate, we need **110,800 completed audits**.

This requires sustaining **~6,155 audits per month**. The shareable result URL must achieve a K-factor of at least 0.2 to sustain traffic. If organic growth stalls, the 13x ROI buffer allows Credex to easily afford paid ads while remaining profitable.
