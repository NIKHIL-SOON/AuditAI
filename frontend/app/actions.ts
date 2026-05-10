"use server";

import { generateSummary } from "@/backend/api/ai-summary";
import { AuditResult } from "@/backend/api/audit-engine";

import { captureLead } from "@/backend/api/lead-capture";

export async function getAiSummaryAction(result: AuditResult) {
  return generateSummary(result);
}

export async function captureLeadAction(email: string, honeypot: string, auditData: AuditResult) {
  return captureLead(email, honeypot, auditData);
}

