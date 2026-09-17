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

    console.log("Koneksi Gmail SMTP berhasil");

    const info = await transporter.sendMail({
      from: `"SmartSchool" <${GOOGLE_SENDER_EMAIL}>`,
      to: email,
      subject: "Kode OTP Registrasi SmartSchool",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Verifikasi Registrasi SmartSchool</h2>

          <p>
            Halo <strong>${namaLengkap}</strong>,
          </p>

          <p>
            Gunakan kode OTP berikut untuk memverifikasi akun SmartSchool kamu:
          </p>

          <div
            style="
              font-size: 32px;
              font-weight: bold;
              letter-spacing: 8px;
              margin: 20px 0;
            "
          >
            ${kodeOtp}
          </div>

          <p>
            Kode OTP ini berlaku selama <strong>5 menit</strong>.
          </p>

          <p>
            Jika kamu tidak merasa melakukan registrasi, abaikan email ini.
          </p>

          <br />

          <p>
            Terima kasih,<br />
            <strong>SmartSchool Team</strong>
          </p>
        </div>
      `,
    });

    console.log("Email OTP berhasil dikirim");
    console.log("Message ID:", info.messageId);

    return info;
  } catch (error: any) {
    console.error("DETAIL ERROR EMAIL ASLI:", {
      message: error?.message,
      code: error?.code,
      response: error?.response,
      stack: error?.stack,
    });

    throw error;
  }
};