import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { google } from "googleapis";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID as string;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET as string;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN as string;
const SENDER_EMAIL = process.env.GOOGLE_SENDER_EMAIL as string;

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  "https://developers.google.com/oauthplayground",
);

oAuth2Client.setCredentials({
  refresh_token: REFRESH_TOKEN,
});

interface SendOtpParams {
  email: string;
  namaLengkap: string;
  kodeOtp: string;
}

export const sendOtpEmail = async ({
  email,
  namaLengkap,
  kodeOtp,
}: SendOtpParams) => {
  try {
    // Ambil access token dari refresh token
    const accessTokenResponse = await oAuth2Client.getAccessToken();
    const accessToken = accessTokenResponse.token;

    if (!accessToken) {
      throw new Error("Gagal mendapatkan Google OAuth2 access token");
    }

    // Buat transporter Gmail
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      family: 4,
      auth: {
        type: "OAuth2",
        user: SENDER_EMAIL,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken,
      },
    } as SMTPTransport.Options);

    // Cek koneksi SMTP sebelum mengirim
    await transporter.verify();

    console.log("Koneksi Gmail SMTP berhasil");

    const info = await transporter.sendMail({
      from: `"SmartSchool" <${SENDER_EMAIL}>`,
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

    console.log("✅ Email OTP berhasil dikirim");
    console.log("📨 Message ID:", info.messageId);

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