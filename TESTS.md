# Test Suite Coverage (Day 2)

## Unit Testing Approach
We have implemented a **Test-Driven Development (TDD)** approach for the core financial business logic, the Audit Engine (`lib/audit-engine.ts`). Because this engine dictates the financial savings metrics displayed to users, it must be 100% deterministic and heavily tested against edge cases to prevent any loss of trust.

We are using **Vitest** for its extreme execution speed and native TypeScript support without complex configuration overhead.

## Test Cases Implemented

The following critical paths are actively covered in `__tests__/audit-engine.test.ts`:

1. **Coding Assistant Consolidation**
   - **Condition**: User inputs both `Cursor` and `GitHub Copilot`.
   - **Expectation**: The engine accurately identifies the overlapping seat count, recommends dropping `Copilot` in favor of `Cursor`'s built-in autocomplete, and calculates the exact monthly and annual savings.

2. **Seat-Based Tier Optimization**
   - **Condition**: User inputs `Cursor` on the `Business` tier ($40/mo), but has fewer than 5 users.
   - **Expectation**: The engine accurately triggers a downgrade recommendation to the `Pro` tier ($20/mo), calculating the precise difference multiplied by the seat count.

3. **Chatbot Overlap**
   - **Condition**: User inputs both `ChatGPT` and `Claude` for the same team.
   - **Expectation**: The engine identifies the overlap, recommends standardizing on a single platform, and aggregates the savings.

4. **Zero-Savings State (Optimized Stack)**
   - **Condition**: User inputs an already perfectly optimized stack (e.g., Cursor Pro + Claude Pro for different users without overlap).
   - **Expectation**: The engine returns `$0` in savings and `0` recommendations, proving it does not hallucinate false savings just to generate a report.

## Future Testing Scope
In subsequent phases (Days 3-7), we will add:
1. **React Component Testing**: Using React Testing Library to ensure the dynamically generated form inputs match the required UI schema.
2. **E2E Testing**: A Playwright suite to trace a user's flow from the landing page, through the audit, to the final email capture modal.
