import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { AuditResult } from "./audit-engine";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseKey);

const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy");

export async function captureLead(email: string, honeypot: string, auditData: AuditResult) {
  // 1. Honeypot check
  if (honeypot && honeypot.length > 0) {
    console.warn("Bot detected via honeypot field");
    return { success: false, error: "Bot detected" };
  }

  // 2. Insert into Supabase
  const { data, error } = await supabase
    .from("audit_leads")
    .insert([
      {
        email: email,
        audit_data: auditData as any,
        monthly_savings: auditData.monthlySavings
      }
    ])
    .select("id")
    .single();

  if (error) {
    console.error("Supabase insert error:", error);
    return { success: false, error: "Failed to save lead" };
  }

  const leadId = data.id;

  // 3. Transactional Email
  try {
    let emailHtml = `<p>Hi there,</p><p>Thank you for using the AI Spend Audit tool. You can save <strong>$${auditData.monthlySavings}/mo</strong> by optimizing your stack.</p>`;
    
    if (auditData.monthlySavings > 500) {
      emailHtml += `<p>Because your potential savings are significant (>$500/mo), we highly recommend booking a <strong>Credex Consultation</strong>. Our experts can help you restructure your enterprise stack and negotiate better terms.</p>`;
    }
    
    emailHtml += `<p>View your full results and share them with your team here: <a href="https://audit.credex.com/share/${leadId}">View Audit</a></p>`;

    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: "AuditAI <audit@credex.com>",
        to: [email],
        subject: "Your AI Spend Audit Results",
        html: emailHtml,
      });
    } else {
      console.log("Mocking email send for:", email);
      console.log("Content:", emailHtml);
    }
  } catch (emailError) {
    console.error("Failed to send email:", emailError);
  }

  return { success: true, id: leadId };
}
