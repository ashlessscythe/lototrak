import { Resend } from "resend";
import * as React from "react";
import { SignupTemplate } from "../components/email/signup-template";
import { ResetPasswordTemplate } from "../components/email/reset-password-template";
import { RoleChangeTemplate } from "../components/email/role-change-template";
import { emailConfig, siteConfig } from "./config";

// Mock email sender for development/testing
class MockEmailSender {
  async send({
    from,
    to,
    subject,
    react,
  }: {
    from: string;
    to: string[];
    subject: string;
    react: React.ReactElement;
  }) {
    console.log("MOCK EMAIL SENT:", {
      from,
      to,
      subject,
      content: "React template rendered (mock)",
    });
    return { data: { id: `mock-${Date.now()}` }, error: null };
  }
}

// Use mock sender if no API key, otherwise use Resend
const emailSender = emailConfig.apiKey
  ? new Resend(emailConfig.apiKey)
  : { emails: new MockEmailSender() };

const app_name = siteConfig.name || "LOTO-Tracker";

export enum EmailType {
  SIGNUP = "signup",
  PASSWORD_RESET = "password_reset",
  ROLE_CHANGE = "role_change",
}

interface EmailOptions {
  to: string;
  type: EmailType;
  data?: {
    resetLink?: string;
    newRole?: string;
  };
}

export async function sendEmail({ to, type, data }: EmailOptions) {
  try {
    let subject: string;
    let reactTemplate: React.ReactElement;

    switch (type) {
      case EmailType.ROLE_CHANGE:
        if (!data?.newRole) {
          throw new Error("New role is required for role change emails");
        }
        subject = `Your ${app_name} Account Has Been Approved`;
        reactTemplate = React.createElement(RoleChangeTemplate, {
          email: to,
          appName: app_name,
          newRole: data.newRole,
        });
        break;

      case EmailType.SIGNUP:
        subject = `Welcome to ${app_name} - Account Pending Approval`;
        reactTemplate = React.createElement(SignupTemplate, {
          email: to,
          appName: app_name,
        });
        break;

      case EmailType.PASSWORD_RESET:
        if (!data?.resetLink) {
          throw new Error("Reset link is required for password reset emails");
        }
        subject = `Reset Your ${app_name} Password`;
        reactTemplate = React.createElement(ResetPasswordTemplate, {
          email: to,
          appName: app_name,
          resetLink: data.resetLink,
        });
        break;

      default:
        throw new Error(`Unsupported email type: ${type}`);
    }

    const { data: responseData, error } = await emailSender.emails.send({
      from: `${app_name} <noreply@${emailConfig.address}>`,
      to: [to],
      subject,
      react: reactTemplate,
      headers: {
        "X-Entity-Ref-ID": `${type}-${Date.now()}`,
      },
    });

    if (error) {
      console.error("Failed to send email:", error);
      return { success: false, error };
    }

    console.log("Email sent successfully:", responseData?.id);
    return { success: true, messageId: responseData?.id };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error };
  }
}
