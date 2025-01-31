import { sendEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await sendEmail(email);

    if (!result.success) {
      return Response.json({ error: "Failed to send email" }, { status: 500 });
    }

    return Response.json({ messageId: result.messageId });
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
