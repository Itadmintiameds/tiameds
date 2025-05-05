import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

// ✅ Function to Validate Email Using APILayer (MailboxLayer)
async function validateEmail(email: string): Promise<boolean> {
    try {
        const apiKey = process.env.APILAYER_ACCESS_KEY; 
        if (!apiKey) {
            console.error("❌ APILAYER_ACCESS_KEY is missing in .env file");
            return false;
        }

        // 🔍 Validate Email Using API
        const response = await fetch(
            `http://apilayer.net/api/check?access_key=${apiKey}&email=${email}&smtp=1&format=1`
        );
        const data = await response.json();
        console.log("📧 Email Validation Response:", data);

        return data.format_valid && data.smtp_check;
    } catch (error) {
        console.error("❌ Email validation failed:", error);
        return false;
    }
}

// ✅ Email Sending API
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { user, lab } = body;

        // 🔍 Validate Email Before Sending
        const isValidEmail = await validateEmail(user.email);
        if (!isValidEmail) {
            return NextResponse.json({ 
                message: "❌ Invalid email address. Please provide a valid email." 
            }, { status: 400 });
        }

        // ✅ Setup Nodemailer Transporter
        const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // 📩 Email Content
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: "Welcome to the Lab",
            text: `
Dear ${user.firstName} ${user.lastName},

You have been successfully added to the lab.

Lab Details:
- Name: ${lab.name}
- Address: ${lab.address}, ${lab.city}, ${lab.state}
- Description: ${lab.description}
- Created By: ${lab.createdByName}

Your Account Details:
- Email: ${user.email}
- Phone: ${user.phone}
- Username: ${user.username}
- Temporary Password: ${user.password}

Please log in using your email and the temporary password provided above.

Best regards,
The Lab Management Team
            `,
        };

        // 📧 Send Email
        const info = await transporter.sendMail(mailOptions);

        // ✅ Check If Email Was Rejected
        if (info.rejected.length > 0) {
            return NextResponse.json({
                message: "❌ Email was rejected by SMTP server.",
                rejectedEmails: info.rejected
            }, { status: 400 });  
        }

        return NextResponse.json({ message: "✅ Email sent successfully!" });
    } catch (error) {
        console.error("❌ Error sending email:", error);
        return NextResponse.json({ message: "❌ Failed to send email." }, { status: 500 });
    }
}
