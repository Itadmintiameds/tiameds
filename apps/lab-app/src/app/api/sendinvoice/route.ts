import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import type { NextRequest } from "next/server";
import { AxiosError } from "axios";

// ✅ Updated Next.js 13+ route configuration
export const dynamic = "force-dynamic"; 
export const runtime = "nodejs"; 

// ✅ POST API function for handling file uploads and sending emails
export async function POST(req: NextRequest) {
  try {
    // 📌 Parse incoming FormData
    const formData = await req.formData();
    const email = formData.get("email") as string;
    const file = formData.get("file") as File; // FormData `file` is a `File` object

    if (!email) {
      return NextResponse.json({ message: "❌ No email provided" }, { status: 400 });
    }
    if (!file) {
      return NextResponse.json({ message: "❌ No file uploaded" }, { status: 400 });
    }

    // ✅ Convert File to Buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // 📧 Configure Nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 📩 Email options with attachment
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Invoice",
      text: "Please find your attached invoice below.",
      attachments: [
        {
          filename: file.name,
          content: fileBuffer,
          contentType: file.type,
        },
      ],
    };

    // ✅ Send Email
    await transporter.sendMail(mailOptions);
    return NextResponse.json({ message: "✅ Email sent successfully!" }, { status: 200 });

  } catch (error) {
    // Handle email sending error

    // Handle Axios errors separately
    if (error instanceof AxiosError) {
      return NextResponse.json({ message: "❌ Failed to send email (Axios Error)", error: error.message }, { status: 500 });
    }

    // Generic Error Handling
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ message: "❌ Failed to send email", error: errorMessage }, { status: 500 });
  }
}
