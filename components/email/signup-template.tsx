import * as React from "react";
import { BaseEmailTemplate } from "./base-template";

interface SignupTemplateProps {
  email: string;
  appName: string;
}

export const SignupTemplate: React.FC<Readonly<SignupTemplateProps>> = ({
  email,
  appName,
}) => (
  <BaseEmailTemplate appName={appName}>
    <p
      style={{
        color: "#334155",
        fontSize: "16px",
        lineHeight: "24px",
        margin: "0 0 16px 0",
      }}
    >
      Thank you for signing up. Your account (
      <span style={{ fontWeight: "600" }}>{email}</span>) is currently pending
      approval.
    </p>
    <p
      style={{
        color: "#334155",
        fontSize: "16px",
        lineHeight: "24px",
        margin: "0 0 16px 0",
      }}
    >
      You will receive another email once an administrator has approved your
      account.
    </p>
    <p
      style={{
        color: "#334155",
        fontSize: "16px",
        lineHeight: "24px",
        margin: "0",
      }}
    >
      If you have any questions, please contact your system administrator.
    </p>
  </BaseEmailTemplate>
);
