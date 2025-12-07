const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  try {
    // Check if email credentials are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.error("❌ Email credentials not configured in .env file");
      throw new Error("Email service not configured");
    }

    console.log("📧 Attempting to send email...");
    console.log("To:", options.email);

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Verify transporter configuration
    await transporter.verify();
    console.log("✅ Email server connection verified");

    // Email options
    const mailOptions = {
      from: `"Co-Nexus College" <${
        process.env.EMAIL_FROM || process.env.EMAIL_USER
      }>`, // sender address
      to: options.email, // list of receivers
      subject: options.subject, // Subject line
      html: options.html, // html body
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully!");
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Email send error:", error.message);
    throw error;
  }
};

module.exports = sendEmail;
