import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { google } from "googleapis";

interface SendOtpParams {
  email: string;
  namaLengkap: string;
  kodeOtp: string;
}

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REFRESH_TOKEN,
  GOOGLE_SENDER_EMAIL,
} = process.env;

if (
  !GOOGLE_CLIENT_ID ||
  !GOOGLE_CLIENT_SECRET ||
  !GOOGLE_REFRESH_TOKEN ||
  !GOOGLE_SENDER_EMAIL
) {
  throw new Error(
    "Konfigurasi Gmail OAuth2 belum lengkap di environment variables",
  );
}

const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
);

oauth2Client.setCredentials({
  refresh_token: GOOGLE_REFRESH_TOKEN,
});

const maskEmail = (email: string) => {
  const [name, domain] = email.split("@");

  if (!name || !domain) {
    return "***";
  }

  return `${name.slice(0, 2)}***@${domain}`;
};

export const sendOtpEmail = async ({
  email,
  namaLengkap,
  kodeOtp,
}: SendOtpParams) => {
  try {
    const accessTokenResponse = await oauth2Client.getAccessToken();

    const accessToken = accessTokenResponse.token;

    if (!accessToken) {
      throw new Error("Gagal mendapatkan Google OAuth2 access token");
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      family: 4,
      auth: {
        type: "OAuth2",
        user: GOOGLE_SENDER_EMAIL,
        clientId: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        refreshToken: GOOGLE_REFRESH_TOKEN,
        accessToken,
      },
    } as SMTPTransport.Options);

    await transporter.verify();

    console.log("[EMAIL] SMTP Gmail berhasil diverifikasi");

    const info = await transporter.sendMail({
      from: `"SmartSchool" <${GOOGLE_SENDER_EMAIL}>`,
      to: email,
      subject: "Kode OTP Registrasi SmartSchool",

      text: `
Halo ${namaLengkap},

Kode OTP SmartSchool Anda: ${kodeOtp}

Kode berlaku selama 5 menit.
      `.trim(),

      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Verifikasi Registrasi SmartSchool</h2>

          <p>
            Halo <strong>${namaLengkap}</strong>,
          </p>

          <p>
            Gunakan kode OTP berikut:
          </p>

          <h1
            style="
              letter-spacing: 8px;
              font-size: 32px;
            "
          >
            ${kodeOtp}
          </h1>

          <p>
            Kode OTP berlaku selama <strong>5 menit</strong>.
          </p>

          <p>
            Terima kasih,<br />
            <strong>SmartSchool Team</strong>
          </p>
        </div>
      `,
    });

    console.log("[EMAIL] OTP berhasil dikirim");
    console.log("[EMAIL] Recipient:", maskEmail(email));
    console.log("[EMAIL] Message ID:", info.messageId);

    return info;
  } catch (error: any) {
    console.error("[EMAIL] GAGAL MENGIRIM OTP");
    console.error("[EMAIL] Detail:", {
      name: error?.name,
      message: error?.message,
      code: error?.code,
      command: error?.command,
      responseCode: error?.responseCode,
      response: error?.response,
      rejected: error?.rejected,
      rejectedErrors: error?.rejectedErrors,
      stack: error?.stack,
    });

    throw error;
  }
};
