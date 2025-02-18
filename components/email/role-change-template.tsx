import * as React from "react";
import { BaseEmailTemplate } from "./base-template";

interface RoleChangeTemplateProps {
  email: string;
  appName: string;
  newRole: string;
}

export const RoleChangeTemplate: React.FC<RoleChangeTemplateProps> = ({
  email,
  appName,
  newRole,
}) => {
  return (
    <BaseEmailTemplate appName={appName}>
      <h1>Your Account Has Been Approved</h1>
      <p>Hello {email},</p>
      <p>
        Your {appName} account has been approved. You now have{" "}
        {newRole.toLowerCase()} access to the system.
      </p>
      <p>You can now log in to your account and start using {appName}.</p>
      <p>
        Best regards,
        <br />
        The {appName} Team
      </p>
    </BaseEmailTemplate>
  );
};
