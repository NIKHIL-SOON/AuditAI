"use server";

import { generateSummary } from "@/backend/api/ai-summary";
import { AuditResult } from "@/backend/api/audit-engine";

export async function getAiSummaryAction(result: AuditResult) {
  return generateSummary(result);
}
