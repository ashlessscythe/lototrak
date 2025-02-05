import { Resend } from "resend";
import { EmailTemplate } from "../components/email-template";

const resend = new Resend(process.env.EMAIL_SERVER_PASSWORD);
const app_name = process.env.NEXT_PUBLIC_APP_NAME;
const fromEmail = process.env.EMAIL_FROM || "onboarding@resend.dev";

export async function sendEmail(to: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: `${app_name} <${fromEmail}>`,
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
