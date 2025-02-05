import { sendEmail, EmailType } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email, type, data } = await req.json();

    if (!email || !type) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate email type
    if (!Object.values(EmailType).includes(type as EmailType)) {
      return Response.json({ error: "Invalid email type" }, { status: 400 });
    }

    const result = await sendEmail({
      to: email,
      type: type as EmailType,
      data,
    });

    if (!result.success) {
      return Response.json({ error: "Failed to send email" }, { status: 500 });
    }

    return Response.json({ messageId: result.messageId });
  } catch (error) {
    console.error("Email sending error:", error);
    return Response.json({ error: "Failed to send email" }, { status: 500 });
  }
}
