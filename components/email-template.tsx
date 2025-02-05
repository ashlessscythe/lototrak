import * as React from "react";

interface EmailTemplateProps {
  email: string;
  appName: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  email,
  appName,
}) => (
  <div
    style={{
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      maxWidth: "600px",
      margin: "0 auto",
      backgroundColor: "#ffffff",
      borderRadius: "8px",
      overflow: "hidden",
    }}
  >
    {/* Header */}
    <div
      style={{
        backgroundColor: "#0f172a",
        padding: "32px 24px",
        textAlign: "center" as const,
      }}
    >
      <h1
        style={{
          color: "#ffffff",
          fontSize: "24px",
          fontWeight: "bold",
          margin: "0",
          textTransform: "uppercase" as const,
          letterSpacing: "1px",
        }}
      >
        Welcome to {appName}
      </h1>
    </div>

    {/* Content */}
    <div
      style={{
        padding: "32px 24px",
        backgroundColor: "#ffffff",
      }}
    >
      <div
        style={{
          backgroundColor: "#f8fafc",
          border: "1px solid #e2e8f0",
          borderRadius: "6px",
          padding: "24px",
          marginBottom: "24px",
        }}
      >
        <p
          style={{
            color: "#334155",
            fontSize: "16px",
            lineHeight: "24px",
            margin: "0 0 16px 0",
          }}
        >
          Thank you for signing up. Your account (
          <span style={{ fontWeight: "600" }}>{email}</span>) is currently
          pending approval.
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
      </div>
    </div>

    {/* Footer */}
    <div
      style={{
        backgroundColor: "#f1f5f9",
        padding: "24px",
        textAlign: "center" as const,
        borderTop: "1px solid #e2e8f0",
      }}
    >
      <p
        style={{
          color: "#64748b",
          fontSize: "14px",
          margin: "0",
        }}
      >
        © {new Date().getFullYear()} {appName}. All rights reserved.
      </p>
    </div>
  </div>
);
