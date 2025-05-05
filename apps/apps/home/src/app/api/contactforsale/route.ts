import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { firstName, lastName, company, email, phoneNumber, message, product } = body;

  // Create a transporter using an App Password
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER, // Replace with your Gmail address
      pass: process.env.EMAIL_PASS, // Use an App Password
    },
  });

  try {
    // Send email to company
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `New Contact Request from ${firstName} ${lastName}`,
      text: `Dear Team,

You have received a new message from the website contact form.

Name: ${firstName} ${lastName}
Company: ${company}
Email: ${email}
Phone: ${phoneNumber}
Product(s) of Interest: ${product.join(', ')}
Message: ${message}

Please review and respond at your earliest convenience.

Best regards,  
Your Website`,
    });

    // Send thank-you email to user
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Thank you for contacting us!',
      text: `Dear ${firstName},

Thank you for reaching out! We have received your message regarding the following product(s): ${product.join(', ')}.
A representative will contact you soon.

Best regards,  
Your Company`,
    });

    return NextResponse.json({ message: 'Emails sent successfully' });
  } catch (error) {
    console.error('Failed to send email:', error);
    return NextResponse.json({ message: 'Failed to send email' }, { status: 500 });
  }
}
