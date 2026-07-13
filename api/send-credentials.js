import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { name, email, password } = req.body || {};
  if (!name || !email || !password) {
    res.status(400).json({ error: "Missing name, email, or password" });
    return;
  }

  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;
  if (!gmailUser || !gmailPass) {
    res.status(500).json({ error: "Email is not configured on the server" });
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: gmailUser, pass: gmailPass },
    });

    await transporter.sendMail({
      from: `"CHED NSS Attendance Clock-In" <${gmailUser}>`,
      to: email,
      subject: "Your CHED NSS Attendance Clock-In account",
      text: `Hi ${name},

An account has been created for you on CHED NSS Attendance Clock-In.

Email: ${email}
Password: ${password}

Please log in and consider changing your password after your first sign-in.

- CHED NSS Attendance Clock-In`,
    });

    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
