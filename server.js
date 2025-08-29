import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ CORS: localhost (dev) + live domain + www subdomain + vercel
const corsOptions = {
  origin: [
    "http://localhost:5173", 
    "http://localhost:3000", 
    "https://tradesmartly.co.in",
    "https://www.tradesmartly.co.in",
    "https://tradingadd.vercel.app"
  ], // React dev + production domains + vercel
  credentials: true,
};
app.use(cors(corsOptions));

app.use(express.json());

// ✅ Nodemailer transporter (Zoho)
const transporter = nodemailer.createTransport({
  host: "smtp.zoho.in",
  port: 465,
  secure: true,
  auth: {
    user: "support@tradesmartly.co.in", // Zoho mail
    pass: process.env.ZOHO_PASS || "bsG6fDwb1VWW", // use .env in prod
  },
});

// ✅ Send Mail API
app.post("/send-mail", async (req, res) => {
  let { name, email, subject, message } = req.body;

  if (!subject || subject.trim() === "") {
    subject = "New Contact Form Submission";
  }

  try {
    let info = await transporter.sendMail({
      from: `"${name}" <support@tradesmartly.co.in>`,
      replyTo: email,
      to: "support@tradesmartly.co.in", // receiver same as support mail
      subject: subject,
      text: `You have a new message from ${name} (${email}):\n\n${message}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color:#2c3e50;">📩 ${subject}</h2>
          <p><b>Name:</b> ${name}</p>
          <p><b>Email:</b> <a href="mailto:${email}">${email}</a></p>
          <p><b>Subject:</b> ${subject}</p>
          <p><b>Message:</b></p>
          <div style="padding:10px; background:#f4f4f4; border-radius:8px;">
            ${message}
          </div>
        </div>
      `,
    });

    console.log("✅ Email sent: ", info.messageId);
    res.json({ success: true, message: "Email sent successfully!" });
  } catch (error) {
    console.error("❌ Error sending mail: ", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});