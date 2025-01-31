import * as nodemailer from "nodemailer";

const app_name = process.env.NEXT_PUBLIC_APP_NAME;

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: "smtp.resend.com",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: "resend",
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

const fromEmail = process.env.EMAIL_FROM || "onboarding@resend.dev";

function getEmailHtml(email: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to ${app_name}</title>
      </head>
      <body>
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333;">Welcome to ${app_name}!</h1>
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            Thank you for signing up. Your account (${email}) is currently pending approval.
          </p>
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            You will receive another email once an administrator has approved your account.
          </p>
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            If you have any questions, please contact your system administrator.
          </p>
        </div>
      </body>
    </html>
  `;
}

export async function sendEmail(to: string) {
  try {
    // Send mail with defined transport object
    const info = await transporter.sendMail({
      from: `${app_name} <${fromEmail}>`,
      to,
      subject: `Welcome to ${app_name} - Account Pending Approval`,
      html: getEmailHtml(to),
      headers: {
        "X-Entity-Ref-ID": `signup-${Date.now()}`, // Prevent threading on Gmail
      },
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error };
  }
}
