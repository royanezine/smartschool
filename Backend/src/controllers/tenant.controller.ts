import { Request, Response, NextFunction } from "express";
import { TipePaket } from "@prisma/client";
import { prisma } from "../config/db";
import { AppError } from "../utils/appError";
import { successResponse } from "../utils/responseFormatter";
import {
  tenantOnboardingSchema,
  verifyTenantSchema,
} from "../validations/tenant.validation";
import bcrypt from "bcryptjs";
import { generateOtp } from "../utils/generateOtp";
import { sendOtpEmail } from "../utils/email";
import crypto from "crypto";

const MIDTRANS_CHARGE_URL = "https://api.sandbox.midtrans.com/v2/charge";

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

    const isYayasan = validatedData.jenisPendaftaran === "yayasan";

    if (!isYayasan && validatedData.subdomain) {
      const existingSubdomain = await prisma.sekolah.findUnique({
        where: { subdomain: validatedData.subdomain },
      });
      if (existingSubdomain) throw new AppError("Subdomain sudah digunakan", 400);
    }

    if (isYayasan && validatedData.npypYayasan) {
      const existingNpyp = await prisma.yayasan.findUnique({
        where: { npyp: validatedData.npypYayasan },
      });
      if (existingNpyp) throw new AppError("NPYP Yayasan sudah terdaftar", 400);
    }

    const paket = await prisma.paket.findUnique({
      where: { id: validatedData.paketId },
    });
    if (!paket) throw new AppError("Paket langganan tidak ditemukan", 400);

    const tipeDiharapkan = isYayasan ? TipePaket.YAYASAN : TipePaket.SEKOLAH;
    if (paket.tipe !== tipeDiharapkan) {
      throw new AppError(
        isYayasan
          ? "Pendaftaran yayasan wajib memakai paket yayasan"
          : "Pendaftaran sekolah tidak dapat memakai paket yayasan",
        400,
      );
    }

    const hashedPassword = await bcrypt.hash(validatedData.kataSandi, 10);
    const otp = generateOtp();

    await prisma.$transaction(async (tx) => {
      await tx.pendaftaranTenant.deleteMany({
        where: {
          emailPendaftar: validatedData.email,
          status: "menunggu_verifikasi",
        },
      });

      await tx.pendaftaranTenant.create({
        data: {
          jenisPendaftaran: isYayasan ? "yayasan" : "sekolah",
          namaPendaftar: validatedData.nama,
          emailPendaftar: validatedData.email,
          kataSandiPendaftar: hashedPassword,

          namaYayasan: validatedData.namaYayasan ?? null,
          alamatYayasan: validatedData.alamatYayasan ?? null,
          teleponYayasan: validatedData.teleponYayasan ?? null,
          emailYayasan: validatedData.emailYayasan ?? null,
          npypYayasan: validatedData.npypYayasan ?? null,

          namaSekolah: isYayasan ? null : (validatedData.namaSekolah ?? null),
          jenjangSekolah: isYayasan ? null : (validatedData.jenjang ?? null),
          subdomain: isYayasan ? null : (validatedData.subdomain ?? null),
          alamatSekolah: isYayasan ? null : (validatedData.alamatSekolah ?? null),
          teleponSekolah: isYayasan ? null : (validatedData.teleponSekolah ?? null),
          emailSekolah: isYayasan ? null : (validatedData.email ?? null),
          logoSekolah: isYayasan ? null : (validatedData.logo ?? null),

          paketId: validatedData.paketId,
          kodeOtp: otp,
          otpTimeout: new Date(Date.now() + 5 * 60 * 1000),
          status: "menunggu_verifikasi",
        },
      });
    });

    try {
      await sendOtpEmail({
        email: validatedData.email,
        namaLengkap: validatedData.nama,
        kodeOtp: otp,
      });
    } catch (error: any) {
      console.error("[TENANT] Pengiriman OTP gagal", {
        message: error?.message,
        code: error?.code,
        command: error?.command,
        responseCode: error?.responseCode,
      });
      throw new AppError(
        "Pendaftaran tersimpan, tetapi email OTP gagal dikirim. Silakan coba lagi.",
        502,
      );
    }

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

export interface KonversiTenantOptions {
  isTrial: boolean;
  grossAmount?: number;
  orderId?: string;
}

export const konversiPendaftaranTenant = async (
  tx: any,
  pendaftaranId: string,
  options: KonversiTenantOptions,
) => {
  const pendaftaran = await tx.pendaftaranTenant.findUnique({
    where: { id: pendaftaranId },
    include: { paket: true },
  });

  if (!pendaftaran) {
    throw new AppError("Data pendaftaran tidak ditemukan", 404);
  }

  if (pendaftaran.status === "aktif") {
    return {
      alreadyActive: true,
      jenisPendaftaran: pendaftaran.jenisPendaftaran,
      sekolahTerbuatId: pendaftaran.sekolahTerbuatId,
      yayasanTerbuatId: pendaftaran.yayasanTerbuatId,
      penggunaTerbuatId: pendaftaran.penggunaTerbuatId,
    };
  }

  const randomChars = crypto.randomBytes(3).toString("hex").toUpperCase();
  const baseUsername =
    pendaftaran.emailPendaftar.split("@")[0]?.replace(/[^a-zA-Z0-9_]/g, "") ||
    "user";
  const namaPengguna = `${baseUsername}_${randomChars.toLowerCase()}`;

  if (pendaftaran.jenisPendaftaran === "yayasan") {
    const peranAdminYayasan = await tx.peran.findFirst({
      where: { nama: "admin_yayasan" },
    });
    if (!peranAdminYayasan) {
      throw new AppError(
        "Sistem bermasalah: Peran admin_yayasan tidak ditemukan",
        500,
      );
    }

    let yayasan = null;
    if (pendaftaran.npypYayasan) {
      yayasan = await tx.yayasan.findUnique({
        where: { npyp: pendaftaran.npypYayasan },
      });
    }

    if (!yayasan) {
      yayasan = await tx.yayasan.create({
        data: {
          nama: pendaftaran.namaYayasan || pendaftaran.namaPendaftar,
          alamat: pendaftaran.alamatYayasan ?? null,
          telepon: pendaftaran.teleponYayasan ?? null,
          email: pendaftaran.emailYayasan ?? pendaftaran.emailPendaftar,
          npyp: pendaftaran.npypYayasan ?? null,
          status: "aktif",
        },
      });
    }

    const mulaiLangganan = new Date();
    const berakhirLangganan = new Date(mulaiLangganan);
    if (options.isTrial) {
      berakhirLangganan.setMonth(berakhirLangganan.getMonth() + 1);
    } else {
      berakhirLangganan.setDate(
        berakhirLangganan.getDate() + pendaftaran.paket.durasi,
      );
    }

    yayasan = await tx.yayasan.update({
      where: { id: yayasan.id },
      data: {
        paketId: pendaftaran.paketId,
        statusLangganan: options.isTrial ? "trialing" : "active",
        tanggalMulaiLangganan: mulaiLangganan,
        tanggalBerakhirLangganan: berakhirLangganan,
      },
    });

    const pengguna = await tx.pengguna.create({
      data: {
        namaPengguna,
        email: pendaftaran.emailPendaftar,
        kataSandi: pendaftaran.kataSandiPendaftar,
        namaLengkap: pendaftaran.namaPendaftar,
        yayasanId: yayasan.id,
        sekolahId: null,
        peranId: peranAdminYayasan.id,
        status: "aktif",
      },
    });

    await tx.pendaftaranTenant.update({
      where: { id: pendaftaran.id },
      data: {
        status: "aktif",
        kodeOtp: null,
        otpTimeout: null,
        yayasanTerbuatId: yayasan.id,
        penggunaTerbuatId: pengguna.id,
        dikonversiPada: new Date(),
      },
    });

    return {
      alreadyActive: false,
      jenisPendaftaran: "yayasan",
      yayasan,
      pengguna,
    };
  } else {
    const peranAdminSekolah = await tx.peran.findFirst({
      where: { nama: "admin_sekolah" },
    });
    if (!peranAdminSekolah) {
      throw new AppError(
        "Sistem bermasalah: Peran admin_sekolah tidak ditemukan",
        500,
      );
    }

    let yayasanId: string | null = null;
    if (pendaftaran.namaYayasan) {
      let yayasan = null;
      if (pendaftaran.npypYayasan) {
        yayasan = await tx.yayasan.findUnique({
          where: { npyp: pendaftaran.npypYayasan },
        });
      }
      if (!yayasan) {
        yayasan = await tx.yayasan.create({
          data: {
            nama: pendaftaran.namaYayasan,
            alamat: pendaftaran.alamatYayasan ?? null,
            telepon: pendaftaran.teleponYayasan ?? null,
            email: pendaftaran.emailYayasan ?? null,
            npyp: pendaftaran.npypYayasan ?? null,
            status: "aktif",
          },
        });
      }
      yayasanId = yayasan.id;
    }

    const kodeSekolah = `SCH-${randomChars}`;

    const sekolah = await tx.sekolah.create({
      data: {
        nama: pendaftaran.namaSekolah!,
        subdomain: pendaftaran.subdomain!,
        kode: kodeSekolah,
        alamat: pendaftaran.alamatSekolah ?? null,
        telepon: pendaftaran.teleponSekolah ?? null,
        email: pendaftaran.emailSekolah ?? pendaftaran.emailPendaftar,
        logoBesarUrl: pendaftaran.logoSekolah ?? null,
        status: options.isTrial ? "uji coba" : "aktif",
        jenjang: pendaftaran.jenjangSekolah ?? null,
        konfigurasi: pendaftaran.jenjangSekolah
          ? { jenjang: pendaftaran.jenjangSekolah }
          : undefined,
        yayasanId,
      },
    });

    const pengguna = await tx.pengguna.create({
      data: {
        namaPengguna,
        email: pendaftaran.emailPendaftar,
        kataSandi: pendaftaran.kataSandiPendaftar,
        namaLengkap: pendaftaran.namaPendaftar,
        sekolahId: sekolah.id,
        yayasanId,
        peranId: peranAdminSekolah.id,
        status: "aktif",
      },
    });

    const endDate = new Date();
    if (options.isTrial) {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    const langganan = await tx.langgananSekolah.create({
      data: {
        sekolahId: sekolah.id,
        paketId: pendaftaran.paketId,
        dibuatOleh: pengguna.id,
        statusPembayaran: "success",
        statusLangganan: options.isTrial ? "trialing" : "active",
        hargaSaatBerlangganan: options.isTrial
          ? 0
          : (options.grossAmount ?? Number(pendaftaran.paket.harga)),
        siklusPenagihan: options.isTrial ? "monthly" : "annual",
        midtransInvoiceId: options.orderId ?? null,
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
        yayasanTerbuatId: yayasanId ?? undefined,
        sekolahTerbuatId: sekolah.id,
        penggunaTerbuatId: pengguna.id,
        dikonversiPada: new Date(),
      },
    });

    return {
      alreadyActive: false,
      jenisPendaftaran: "sekolah",
      sekolah,
      pengguna,
      langganan,
    };
  }
};

export const verifyAndPay = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validationResult = verifyTenantSchema.safeParse({
      ...req.body,
      bank: req.body.bank ? String(req.body.bank).toLowerCase().trim() : undefined,
    });

    if (!validationResult.success) {
      const firstIssue = validationResult.error.issues[0];
      throw new AppError(firstIssue?.message || "Data validasi tidak valid", 400);
    }

    const { email: emailInput, kodeOtp, bank: selectedBank } = validationResult.data;
    const otpInput = kodeOtp.replace(/\s+/g, "");

    const pendaftaran = await prisma.pendaftaranTenant.findFirst({
      where: {
        emailPendaftar: { equals: emailInput, mode: "insensitive" },
        status: "menunggu_verifikasi",
      },
      orderBy: { otpTimeout: "desc" },
    });

    if (!pendaftaran)
      throw new AppError("Data pendaftaran tidak ditemukan", 404);
    if (String(pendaftaran.kodeOtp ?? "") !== otpInput)
      throw new AppError("Kode OTP salah", 400);
    if (pendaftaran.otpTimeout && new Date() > pendaftaran.otpTimeout) {
      throw new AppError("Kode OTP sudah kadaluarsa", 400);
    }

    const paket = await prisma.paket.findUnique({
      where: { id: pendaftaran.paketId },
    });
    if (!paket) throw new AppError("Paket tidak ditemukan", 404);

    if (Number(paket.harga) > 0) {
      if (!selectedBank) {
        throw new AppError(
          "Pilihan bank wajib dipilih untuk pembayaran (bca, bni, bri, mandiri, permata)",
          400,
        );
      }

      const serverKey = process.env.MIDTRANS_SERVER_KEY;
      if (!serverKey)
        throw new AppError("Konfigurasi pembayaran belum lengkap", 500);

      const orderId = `REG-${pendaftaran.id.substring(0, 8)}-${Date.now()}`;
      const midtransAuth = Buffer.from(serverKey + ":").toString("base64");
      const totalHarga = Number(paket.harga);

      const payload: Record<string, any> = {
        payment_type: selectedBank === "mandiri" ? "echannel" : "bank_transfer",
        transaction_details: {
          order_id: orderId,
          gross_amount: totalHarga,
        },
        customer_details: {
          first_name: pendaftaran.namaPendaftar,
          email: pendaftaran.emailPendaftar,
        },
      };

      if (selectedBank === "mandiri") {
        payload.echannel = {
          bill_info1: "Payment",
          bill_info2: "Debt",
        };
      } else {
        payload.bank_transfer = {
          bank: selectedBank,
        };
      }

      const midtransResponse = await fetch(MIDTRANS_CHARGE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Basic ${midtransAuth}`,
        },
        body: JSON.stringify(payload),
      });

      const chargeResponse: any = await midtransResponse.json();

      if (!midtransResponse.ok || chargeResponse.status_code !== "201") {
        console.error("[TENANT] Midtrans Core API error:", {
          httpStatus: midtransResponse.status,
          response: chargeResponse,
          bank: selectedBank,
          orderId,
        });

        throw new AppError(
          chargeResponse.status_message ||
            "Gagal membuat transaksi pembayaran. Periksa konfigurasi pembayaran atau coba lagi nanti.",
          502,
        );
      }

      let vaNumber: string | null = null;
      if (selectedBank === "mandiri") {
        vaNumber =
          chargeResponse.biller_code && chargeResponse.bill_key
            ? `${chargeResponse.biller_code} - ${chargeResponse.bill_key}`
            : chargeResponse.bill_key || chargeResponse.biller_code || null;
      } else if (selectedBank === "permata") {
        vaNumber = chargeResponse.permata_va_number || null;
      } else {
        vaNumber = chargeResponse.va_numbers?.[0]?.va_number || null;
      }

      await prisma.$transaction(async (tx) => {
        await tx.pendaftaranTenant.update({
          where: { id: pendaftaran.id },
          data: {
            midtransOrderId: orderId,
            kodeOtp: null,
            otpTimeout: null,
            status: "menunggu_pembayaran",
          },
        });
      });

      return successResponse(
        res,
        "Verifikasi sukses. Silakan lakukan pembayaran.",
        {
          order_id: orderId,
          gross_amount: totalHarga,
          bank: selectedBank,
          va_number: vaNumber,
          biller_code: chargeResponse.biller_code || null,
          bill_key: chargeResponse.bill_key || null,
          expiry_time: chargeResponse.expiry_time || null,
          is_trial: false,
        },
        201,
      );
    } else {
      await prisma.$transaction(async (tx) => {
        await konversiPendaftaranTenant(tx, pendaftaran.id, {
          isTrial: true,
          grossAmount: 0,
        });
      });

      const isYayasan = pendaftaran.jenisPendaftaran === "yayasan";
      return successResponse(
        res,
        isYayasan
          ? "Yayasan berhasil dibuat! Silakan login."
          : "Sekolah uji coba berhasil dibuat! Silakan login.",
        {
          is_trial: true,
          jenis_pendaftaran: pendaftaran.jenisPendaftaran,
        },
      );
    }
  } catch (error) {
    next(error);
  }
};