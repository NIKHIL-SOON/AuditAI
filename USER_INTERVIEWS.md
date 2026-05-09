# User Interviews

*Notes from three 15-minute conversations conducted this week with potential users.*

## Interview 1: "S.M.", Co-founder & CTO at a Seed-stage B2B SaaS
**3+ Direct Quotes:**
- *"Honestly, I just put my credit card into OpenAI and Cursor and forgot about it. Finance yelled at me last month because we had 12 stale seats."*
- *"I wouldn't use a tool that requires me to log in with GitHub just to see a dashboard. I don't have time."*
- *"If you can tell me exactly what to downgrade without breaking my team's workflow, I'd click the button today."*
**Most surprising thing:** He assumed Claude and ChatGPT had the exact same pricing model for teams, leading him to overpay for idle Claude seats.
**What it changed about my design:** I removed the initial idea of making users connect their AWS/billing APIs. A simple manual input form is much lower friction and addresses the "I don't have time" concern.

## Interview 2: "J.T.", Engineering Manager at a Series A DevTools company
**3+ Direct Quotes:**
- *"My biggest annoyance isn't the cost of Cursor, it's that we have half the team on GitHub Copilot and the other half on Cursor, so we're paying twice for the same autocomplete."*
- *"A $500 saving isn't going to get me promoted, but consolidating our toolstack might."*
- *"I'd share this with my VP of Eng if it outputs a clean chart I can just screenshot into Slack."*
**Most surprising thing:** The savings dollar amount wasn't the primary motivator—it was the administrative clarity of knowing *who* is using *what* and finding redundancies.
**What it changed about my design:** I made sure the shareable results page has a massive, clean hero section specifically designed to look good when screenshotted and pasted into Slack.

## Interview 3: "D.K.", Solo Founder / Indie Hacker
**3+ Direct Quotes:**
- *"I pay for Claude Pro out of pocket. I don't think I spend enough for an 'enterprise audit'."*
- *"Wait, I can use the API directly through something like typingmind and pay 10x less? I didn't know that."*
- *"If you try to sell me a consultation at the end of this, I'm bouncing. Just give me the data."*
**Most surprising thing:** The lack of awareness around API-direct pricing vs. retail web UI pricing among technical solo founders.
**What it changed about my design:** I added explicit logic to recommend API direct usage for low-headcount teams using high volumes of Pro subscriptions. I also gated the "Credex Consultation" CTA to only appear if the savings >$500, respecting the solo founder's desire not to be sold to.
