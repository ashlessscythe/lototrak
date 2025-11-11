import { NextResponse } from "next/server";
import { sendEmail, EmailType } from "@/lib/email";
import { ApiErrors, handleApiError } from "@/lib/api/errors";
import { logger } from "@/lib/utils/logger";

export async function POST(req: Request) {
  try {
    const { email, type, data } = await req.json();

    if (!email || !type) {
      return ApiErrors.missingFields(["email", "type"]);
    }

    if (!Object.values(EmailType).includes(type as EmailType)) {
      return ApiErrors.badRequest("Invalid email type");
    }

    const result = await sendEmail({
      to: email,
      type: type as EmailType,
      data,
    });

    if (!result.success) {
      return ApiErrors.internalError("Failed to send email");
    }

    logger.info("Email sent", { email, type });
    return NextResponse.json({ messageId: result.messageId });
  } catch (error) {
    return handleApiError(error, "SEND_EMAIL");
  }
}
