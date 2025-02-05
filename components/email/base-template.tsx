import * as React from "react";

interface BaseEmailTemplateProps {
  children: React.ReactNode;
  appName: string;
}

export const BaseEmailTemplate: React.FC<Readonly<BaseEmailTemplateProps>> = ({
  children,
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
        {appName}
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
        {children}
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
