import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/db";
import { AppError } from "../utils/appError";
import { successResponse } from "../utils/responseFormatter";
import { tenantOnboardingSchema } from "../validations/tenant.validation";
import bcrypt from "bcryptjs";
import { generateOtp } from "../utils/generateOtp";
import { sendOtpEmail } from "../utils/email";
import crypto from "crypto";

export const registerTenant = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validatedData = tenantOnboardingSchema.parse(req.body);

    const existingEmail = await prisma.pengguna.findUnique({
      where: { email: validatedData.email },
    });
    if (existingEmail) throw new AppError("Email sudah terdaftar", 400);

    const existingSubdomain = await prisma.sekolah.findUnique({
      where: { subdomain: validatedData.subdomain },
    });
    if (existingSubdomain) throw new AppError("Subdomain sudah digunakan", 400);

    const paket = await prisma.paket.findUnique({
      where: { id: validatedData.paketId },
    });
    if (!paket) throw new AppError("Paket langganan tidak ditemukan", 400);

    const hashedPassword = await bcrypt.hash(validatedData.kataSandi, 10);
    const otp = generateOtp();

    await prisma.pendaftaranTenant.create({
      data: {
        namaPendaftar: validatedData.nama,
        emailPendaftar: validatedData.email,
        kataSandiPendaftar: hashedPassword,
        namaSekolah: validatedData.namaSekolah,
        jenjangSekolah: validatedData.jenjang,
        subdomain: validatedData.subdomain,
        alamatSekolah: validatedData.alamatSekolah,
        teleponSekolah: validatedData.teleponSekolah,
        emailSekolah: validatedData.email, // Fallback ke email pendaftar
        logoSekolah: validatedData.logo ?? null,
        paketId: validatedData.paketId,
        kodeOtp: otp,
        otpTimeout: new Date(Date.now() + 5 * 60 * 1000),
        status: "menunggu_verifikasi",
      },
    });

    await sendOtpEmail({
      email: validatedData.email,
      namaLengkap: validatedData.nama,
      kodeOtp: otp,
    });

    return successResponse(
      res,
      "Pendaftaran berhasil. Cek email untuk OTP.",
      null,
      201,
    );
  } catch (error) {
    next(error);
  }
};

export const verifyAndPay = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // 1. Tambahkan parameter 'bank' yang harus dikirim oleh Frontend
    const { email, kodeOtp, bank } = req.body;
    if (!email || !kodeOtp)
      throw new AppError("Email dan OTP wajib diisi", 400);

    // Validasi input bank (sementara batasi ke bank yang umum untuk bank_transfer)
    const allowedBanks = ["bca", "bni", "bri"];
    if (bank && !allowedBanks.includes(bank.toLowerCase())) {
      throw new AppError(
        "Pilihan bank saat ini hanya mendukung: bca, bni, bri",
        400,
      );
    }

    const pendaftaran = await prisma.pendaftaranTenant.findFirst({
      where: { emailPendaftar: email, status: "menunggu_verifikasi" },
    });

    if (!pendaftaran)
      throw new AppError("Data pendaftaran tidak ditemukan", 404);
    if (pendaftaran.kodeOtp !== kodeOtp)
      throw new AppError("Kode OTP salah", 400);
    if (pendaftaran.otpTimeout && new Date() > pendaftaran.otpTimeout) {
      throw new AppError("Kode OTP sudah kadaluarsa", 400);
    }

    const paket = await prisma.paket.findUnique({
      where: { id: pendaftaran.paketId },
    });
    if (!paket) throw new AppError("Paket tidak ditemukan", 404);

    // LOGIKA JIKA PAKET BERBAYAR
    if (Number(paket.harga) > 0) {
      if (!bank)
        throw new AppError(
          "Pilihan bank wajib dikirim untuk paket berbayar",
          400,
        );

      const orderId = `REG-${pendaftaran.id.substring(0, 8)}-${Date.now()}`;
      const midtransAuth = Buffer.from(
        process.env.MIDTRANS_SERVER_KEY + ":",
      ).toString("base64");

      // 2. Tembak endpoint Core API Midtrans
      const midtransResponse = await fetch(
        "https://api.sandbox.midtrans.com/v2/charge",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Basic ${midtransAuth}`,
          },
          body: JSON.stringify({
            payment_type: "bank_transfer",
            transaction_details: {
              order_id: orderId,
              gross_amount: Number(paket.harga),
            },
            bank_transfer: {
              bank: bank.toLowerCase(),
            },
            customer_details: {
              first_name: pendaftaran.namaPendaftar,
              email: pendaftaran.emailPendaftar,
            },
          }),
        },
      );

      const charge = await midtransResponse.json();

      if (!midtransResponse.ok || charge.status_code !== "201") {
        console.error("Midtrans Error:", charge);
        throw new AppError("Gagal membuat Virtual Account Midtrans", 500);
      }

      await prisma.pendaftaranTenant.update({
        where: { id: pendaftaran.id },
        data: {
          midtransOrderId: orderId,
          kodeOtp: null,
          otpTimeout: null,
          status: "menunggu_pembayaran",
        },
      });

      // 3. Kembalikan Nomor VA ke Frontend agar mereka bisa menampilkannya di UI
      return successResponse(res, "Verifikasi sukses. Silakan bayar.", {
        order_id: orderId,
        bank: bank.toUpperCase(),
        va_number: charge.va_numbers[0].va_number, // Ini yang dibutuhkan FE
        gross_amount: Number(paket.harga),
        is_trial: false,
      });
    } else {
      // LOGIKA JIKA PAKET GRATIS / TRIAL (Tidak ada perubahan)
      const peranAdmin = await prisma.peran.findFirst({
        where: { nama: "admin_sekolah" },
      });
      if (!peranAdmin)
        throw new AppError(
          "Sistem bermasalah: Peran admin tidak ditemukan",
          500,
        );

      const randomChars = crypto.randomBytes(3).toString("hex").toUpperCase();
      const kodeSekolah = `SCH-${randomChars}`;
      const baseUsername =
        pendaftaran.emailPendaftar.split("@")[0] || pendaftaran.emailPendaftar;

      await prisma.$transaction(async (tx) => {
        const sekolah = await tx.sekolah.create({
          data: {
            nama: pendaftaran.namaSekolah,
            subdomain: pendaftaran.subdomain,
            kode: kodeSekolah,
            alamat: pendaftaran.alamatSekolah,
            telepon: pendaftaran.teleponSekolah,
            email: pendaftaran.emailSekolah,
            logoBesarUrl: pendaftaran.logoSekolah,
            status: "uji coba",
            jenjang: pendaftaran.jenjangSekolah,
            konfigurasi: { jenjang: pendaftaran.jenjangSekolah },
          },
        });

        const pengguna = await tx.pengguna.create({
          data: {
            namaPengguna: `${baseUsername}_${randomChars.toLowerCase()}`,
            email: pendaftaran.emailPendaftar,
            kataSandi: pendaftaran.kataSandiPendaftar,
            namaLengkap: pendaftaran.namaPendaftar,
            sekolahId: sekolah.id,
            peranId: peranAdmin.id,
            status: "aktif",
          },
        });

        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);

        await tx.langgananSekolah.create({
          data: {
            sekolahId: sekolah.id,
            paketId: paket.id,
            dibuatOleh: pengguna.id,
            statusPembayaran: "success",
            statusLangganan: "trialing",
            hargaSaatBerlangganan: 0,
            siklusPenagihan: "monthly",
            tanggalMulai: new Date(),
            tanggalBerakhir: endDate,
          },
        });

        await tx.pendaftaranTenant.update({
          where: { id: pendaftaran.id },
          data: {
            status: "aktif",
            kodeOtp: null,
            otpTimeout: null,
            sekolahTerbuatId: sekolah.id,
            penggunaTerbuatId: pengguna.id,
            dikonversiPada: new Date(),
          },
        });
      });

      return successResponse(
        res,
        "Sekolah uji coba berhasil dibuat! Silakan login.",
        { is_trial: true },
      );
    }
  } catch (error) {
    next(error);
  }
};
