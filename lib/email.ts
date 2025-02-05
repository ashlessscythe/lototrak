import { Resend } from "resend";
import { EmailTemplate } from "../components/email-template";
import { emailConfig, siteConfig } from "./config";

const resend = new Resend(emailConfig.apiKey);
const app_name = siteConfig.name || "LOTO-Tracker";

export async function sendEmail(to: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: `${app_name} <onboarding@${emailConfig.address}>`,
      to: [to],
      subject: `Welcome to ${app_name} - Account Pending Approval`,
      react: EmailTemplate({ email: to, appName: app_name || "" }),
      headers: {
        "X-Entity-Ref-ID": `signup-${Date.now()}`, // Prevent threading on Gmail
      },
    });

    if (error) {
      console.error("Failed to send email:", error);
      return { success: false, error };
    }

    console.log("Email sent successfully:", data?.id);
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error };
  }
}
