const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  family: 4,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((err, success) => {
  if (err) {
    console.error("❌ Email service NOT configured correctly:", err.message);
    console.log("EMAIL_USER:", process.env.EMAIL_USER);
    console.log("EMAIL_PASS exists:", !!process.env.EMAIL_PASS);
  } else {
    console.log("✅ Email service ready to send messages");
  }
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });
    console.log(`✅ Email sent to ${to}: ${info.messageId}`);
    return true;
  } catch (err) {
    console.error(`❌ Email send FAILED to ${to}:`, err.message);
    return false;
  }
};

module.exports = sendEmail;