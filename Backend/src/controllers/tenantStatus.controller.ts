import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../config/db";
import { AppError } from "../utils/appError";
import { successResponse } from "../utils/responseFormatter";
import { konversiPendaftaranTenant } from "./tenant.controller";

const MIDTRANS_API_URL =
  process.env.MIDTRANS_API_URL || "https://api.sandbox.midtrans.com";

export const cekStatusPembayaranTenant = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const orderId = z.string().trim().min(5).max(100).parse(req.params.orderId);
    if (!orderId.startsWith("REG-")) {
      throw new AppError("Order ID tidak valid", 400);
    }

    const pendaftaran = await prisma.pendaftaranTenant.findFirst({
      where: { midtransOrderId: orderId },
    });
    if (!pendaftaran) throw new AppError("Pendaftaran tidak ditemukan", 404);

    if (pendaftaran.status === "aktif") {
      return successResponse(res, "Pendaftaran sudah aktif", {
        status: "aktif",
        jenisPendaftaran: pendaftaran.jenisPendaftaran,
      });
    }

    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey) throw new AppError("Konfigurasi pembayaran belum lengkap", 500);

    const respons = await fetch(
      `${MIDTRANS_API_URL}/v2/${encodeURIComponent(orderId)}/status`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Basic ${Buffer.from(`${serverKey}:`).toString("base64")}`,
        },
      },
    );
    const body: any = await respons.json().catch(() => ({}));

    if (!body || body.order_id !== orderId || !body.transaction_status) {
      return successResponse(res, "Pembayaran belum ditemukan di Midtrans", {
        status: pendaftaran.status,
        jenisPendaftaran: pendaftaran.jenisPendaftaran,
      });
    }

    const statusTransaksi: string = body.transaction_status;
    const fraud: string | undefined = body.fraud_status;
    const berhasil =
      statusTransaksi === "settlement" ||
      (statusTransaksi === "capture" && (!fraud || fraud === "accept"));
    const gagal = ["cancel", "deny", "expire"].includes(statusTransaksi);

    if (berhasil) {
      await prisma.$transaction(async (tx) => {
        await konversiPendaftaranTenant(tx, pendaftaran.id, {
          isTrial: false,
          grossAmount: Number(body.gross_amount) || 0,
          orderId,
        });
      });
      return successResponse(res, "Pembayaran terkonfirmasi, akun diaktifkan", {
        status: "aktif",
        jenisPendaftaran: pendaftaran.jenisPendaftaran,
      });
    }

    if (gagal) {
      await prisma.pendaftaranTenant.update({
        where: { id: pendaftaran.id },
        data: { status: "pembayaran_gagal" },
      });
      return successResponse(res, "Pembayaran gagal atau kedaluwarsa", {
        status: "pembayaran_gagal",
        jenisPendaftaran: pendaftaran.jenisPendaftaran,
      });
    }

    return successResponse(res, "Menunggu pembayaran", {
      status: pendaftaran.status,
      jenisPendaftaran: pendaftaran.jenisPendaftaran,
    });
  } catch (error) {
    next(error);
  }
};