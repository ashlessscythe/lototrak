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
      fontFamily: "Arial, sans-serif",
      maxWidth: "600px",
      margin: "0 auto",
      padding: "20px",
    }}
  >
    <h1 style={{ color: "#333" }}>Welcome to {appName}!</h1>
    <p style={{ color: "#666", fontSize: "16px", lineHeight: 1.5 }}>
      Thank you for signing up. Your account ({email}) is currently pending
      approval.
    </p>
    <p style={{ color: "#666", fontSize: "16px", lineHeight: 1.5 }}>
      You will receive another email once an administrator has approved your
      account.
    </p>
    <p style={{ color: "#666", fontSize: "16px", lineHeight: 1.5 }}>
      If you have any questions, please contact your system administrator.
    </p>
  </div>
);
