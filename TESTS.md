# Tests

The test suite ensures the integrity of the core audit engine. Since it involves financial data and recommendations, accuracy is paramount.

To run the tests:
\`\`\`bash
npm run test
\`\`\`

## Included Tests (in \`__tests__/audit-engine.test.ts\`)

1. \`calculates correct spend for Cursor Enterprise with 10 users\`: Ensures that a straight multiplication of seats * tier price matches the expected monthly and annual spend.
2. \`recommends downgrading from Claude Team to Pro for 2 users\`: Validates the rightsizing logic. Claude Team requires a 5 seat minimum (which costs $150/mo), so a 2-person team should just use 2 Pro seats ($40/mo).
3. \`identifies cheaper alternative: suggests Windsurf over Copilot Enterprise for specific coding setups\`: Checks the alternative recommendation logic when current spend is higher than the capable alternative.
4. \`handles retail vs credit evaluation correctly\`: Flags scenarios where the startup is paying full retail for high-volume API access, recommending Credex credits.
5. \`returns optimal state when startup is efficiently spending\`: Ensures that if a user is on the correct plan and not overspending, the engine honestly returns "You're spending well" with $0 savings.
