import * as React from "react";
import { BaseEmailTemplate } from "./base-template";

interface ResetPasswordTemplateProps {
  email: string;
  appName: string;
  resetLink: string;
}

export const ResetPasswordTemplate: React.FC<
  Readonly<ResetPasswordTemplateProps>
> = ({ email, appName, resetLink }) => (
  <BaseEmailTemplate appName={appName}>
    <p
      style={{
        color: "#334155",
        fontSize: "16px",
        lineHeight: "24px",
        margin: "0 0 16px 0",
      }}
    >
      We received a request to reset the password for your account (
      <span style={{ fontWeight: "600" }}>{email}</span>).
    </p>
    <p
      style={{
        color: "#334155",
        fontSize: "16px",
        lineHeight: "24px",
        margin: "0 0 24px 0",
      }}
    >
      Click the button below to reset your password. This link will expire in 1
      hour.
    </p>
    <div style={{ textAlign: "center", margin: "32px 0" }}>
      <a
        href={resetLink}
        style={{
          backgroundColor: "#0f172a",
          color: "#ffffff",
          padding: "12px 24px",
          borderRadius: "6px",
          textDecoration: "none",
          fontWeight: "500",
          display: "inline-block",
        }}
      >
        Reset Password
      </a>
    </div>
    <p
      style={{
        color: "#334155",
        fontSize: "16px",
        lineHeight: "24px",
        margin: "24px 0 0 0",
      }}
    >
      If you did not request a password reset, please ignore this email or
      contact your system administrator if you have concerns.
    </p>
    <p
      style={{
        color: "#64748b",
        fontSize: "14px",
        lineHeight: "20px",
        margin: "24px 0 0 0",
      }}
    >
      If the button above doesn't work, copy and paste this link into your
      browser:
      <br />
      <span style={{ wordBreak: "break-all" }}>{resetLink}</span>
    </p>
  </BaseEmailTemplate>
);
