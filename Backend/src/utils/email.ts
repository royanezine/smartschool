import nodemailer, { SendMailOptions, Transporter } from "nodemailer";
import { randomUUID } from "node:crypto";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { google } from "googleapis";

interface SendOtpParams {
  email: string;
  namaLengkap: string;
  kodeOtp: string;
}

interface SendPpdbRegistrationParams {
  email: string;
  namaLengkap: string;
  nomorPendaftaran: string;
  namaSekolah: string;
}

const maskEmail = (email: string) => {
  const [name, domain] = email.split("@");

  if (!name || !domain) {
    return "***";
  }

  return `${name.slice(0, 2)}***@${domain}`;
};

const escapeHtml = (nilai: string) =>
  nilai
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const REQUIRED_ENV = ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "GOOGLE_REFRESH_TOKEN", "GOOGLE_SENDER_EMAIL"] as const;

// Log only selected diagnostic fields; provider errors may contain OAuth request bodies.
function safeDetail(value: unknown, sensitive: string[]) {
  if (typeof value !== "string" && typeof value !== "number") return undefined;
  let text = String(value);
  for (const secret of sensitive.filter(Boolean).sort((a, b) => b.length - a.length)) {
    text = text.split(secret).join("[REDACTED]").split(encodeURIComponent(secret)).join("[REDACTED]");
  }
  return text.replace(/(?:Bearer|OAuth)\s+[^\s,;]+/gi, "Bearer [REDACTED]")
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[EMAIL]")
    .replace(/[\r\n]/g, " ").slice(0, 1500);
}

async function kirimEmail(
  purpose: "otp" | "ppdb", recipient: string, sensitiveValues: string[],
  compose: (sender: string) => SendMailOptions,
) {
  const requestId = randomUUID();
  const started = Date.now();
  let stage = "configuration";
  let transporter: Transporter<SMTPTransport.SentMessageInfo> | undefined;
  const config = Object.fromEntries(REQUIRED_ENV.map(key => [key, process.env[key]?.trim() ?? ""])) as Record<typeof REQUIRED_ENV[number], string>;
  const missing = REQUIRED_ENV.filter(key => !config[key]);
  const secrets = [...Object.values(config), ...sensitiveValues];
  try {
    if (missing.length) throw Object.assign(new Error("Konfigurasi Gmail OAuth2 belum lengkap"), {code: "EMAIL_CONFIG_MISSING"});
    if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(config.GOOGLE_SENDER_EMAIL)) {
      throw Object.assign(new Error("Format GOOGLE_SENDER_EMAIL tidak valid"), {code: "EMAIL_CONFIG_INVALID"});
    }
    stage = "oauth_token";
    const oauth2Client = new google.auth.OAuth2(config.GOOGLE_CLIENT_ID, config.GOOGLE_CLIENT_SECRET);
    oauth2Client.setCredentials({refresh_token: config.GOOGLE_REFRESH_TOKEN});
    // Bound the OAuth HTTP request as well as the SMTP connection.
    oauth2Client.transporter.defaults = {...oauth2Client.transporter.defaults, timeout: 10000};
    const {token} = await oauth2Client.getAccessToken();
    if (!token) throw Object.assign(new Error("Google tidak mengembalikan access token"), {code: "EMAIL_OAUTH_TOKEN_MISSING"});
    secrets.push(token);
    stage = "smtp_verify";
    transporter = nodemailer.createTransport({
      service: "gmail", family: 4,
      connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 20000,
      auth: {
        type: "OAuth2", user: config.GOOGLE_SENDER_EMAIL,
        clientId: config.GOOGLE_CLIENT_ID, clientSecret: config.GOOGLE_CLIENT_SECRET,
        refreshToken: config.GOOGLE_REFRESH_TOKEN, accessToken: token,
      },
    } as SMTPTransport.Options);
    await transporter.verify();
    stage = "send_mail";
    const info = await transporter.sendMail(compose(config.GOOGLE_SENDER_EMAIL));
    if (info.rejected?.length || !info.accepted?.length) {
      throw Object.assign(new Error("Server SMTP menolak penerima email"), {code: "EMAIL_RECIPIENT_REJECTED", response: info.response});
    }
    console.log("[EMAIL] SMTP menerima email", {requestId, purpose, recipient: maskEmail(recipient), messageId: info.messageId, durationMs: Date.now() - started});
    return info;
  } catch (error: any) {
    const clean = (value: unknown) => safeDetail(value, secrets);
    console.error("[EMAIL] Pengiriman gagal", {
      requestId, purpose, provider: "gmail_oauth2", stage,
      environment: process.env.NODE_ENV || "development", recipient: maskEmail(recipient),
      durationMs: Date.now() - started,
      configured: Object.fromEntries(REQUIRED_ENV.map(key => [key, Boolean(config[key])])), missing,
      errorName: clean(error?.name), code: clean(error?.code), message: clean(error?.message),
      command: clean(error?.command), smtpResponseCode: error?.responseCode,
      smtpResponse: clean(typeof error?.response === "string" ? error.response : undefined),
      httpStatus: error?.response?.status,
      providerError: clean(error?.response?.data?.error),
      providerDescription: clean(error?.response?.data?.error_description),
      hint: stage === "configuration" ? "Lengkapi environment email pada deployment backend."
        : stage === "oauth_token" ? "Periksa refresh token, OAuth client, consent screen, dan scope https://mail.google.com/."
        : "Periksa respons SMTP: autentikasi (535), penerima/pengirim (550/553), atau koneksi/port keluar. Verifikasi domain hanya jika diwajibkan penyedia email.",
    });
    // Do not propagate raw provider errors: global/controller logging could leak credentials.
    throw Object.assign(new Error(`Pengiriman email gagal pada tahap ${stage}. Referensi: ${requestId}`), {code: "EMAIL_DELIVERY_FAILED"});
  } finally {
    transporter?.close();
  }
}

export const sendOtpEmail = async ({
  email,
  namaLengkap,
  kodeOtp,
}: SendOtpParams) => {
  return kirimEmail("otp", email, [kodeOtp], sender => ({
      from: `"SmartSchool" <${sender}>`,
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
            Halo <strong>${escapeHtml(namaLengkap)}</strong>,
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
  }));
};

export const sendPpdbRegistrationEmail = async ({
  email,
  namaLengkap,
  nomorPendaftaran,
  namaSekolah,
}: SendPpdbRegistrationParams) => {
  const nama = escapeHtml(namaLengkap);
  const sekolah = escapeHtml(namaSekolah);
  const nomor = escapeHtml(nomorPendaftaran);

  return kirimEmail("ppdb", email, [nomorPendaftaran], sender => ({
    from: `"SmartSchool" <${sender}>`,
    to: email,
    subject: `Nomor Pendaftaran SPMB ${namaSekolah}`,

    text: `
Halo ${namaLengkap},

Pendaftaran SPMB di ${namaSekolah} berhasil dikirim.

Nomor pendaftaran Anda: ${nomorPendaftaran}

Gunakan nomor pendaftaran dan NIK Anda untuk masuk dan memantau status pendaftaran, peringkat, serta kelengkapan berkas.
    `.trim(),

    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>Pendaftaran SPMB Berhasil</h2>

        <p>
          Halo <strong>${nama}</strong>,
        </p>

        <p>
          Pendaftaran SPMB di <strong>${sekolah}</strong> berhasil dikirim.
        </p>

        <p>Nomor pendaftaran Anda:</p>

        <h1 style="letter-spacing: 2px; font-size: 28px;">
          ${nomor}
        </h1>

        <p>
          Gunakan nomor pendaftaran dan NIK Anda untuk masuk dan memantau
          status pendaftaran, peringkat, serta kelengkapan berkas.
        </p>

        <p>
          Terima kasih,<br />
          <strong>SmartSchool Team</strong>
        </p>
      </div>
    `,
  }));
};
