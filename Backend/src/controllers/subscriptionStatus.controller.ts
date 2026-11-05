import { Response, NextFunction } from "express";
import { z } from "zod";
import { AuthRequest } from "../middlewares/auth.middleware";
import { prisma } from "../config/db";
import { AppError } from "../utils/appError";
import { successResponse } from "../utils/responseFormatter";

export const cekStatusPembayaranLangganan = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user || !req.user.sekolahId) {
      throw new AppError("Akses Ditolak", 403);
    }

    const orderId = z.string().trim().min(5).max(100).parse(req.params.orderId);
    if (!orderId.startsWith("INV-")) {
      throw new AppError("Order ID tidak valid", 400);
    }

    const riwayat = await prisma.riwayatPembayaran.findFirst({
      where: { midtransInvoiceId: orderId, sekolahId: req.user.sekolahId },
      include: { langgananSekolah: true },
    });
    if (!riwayat) throw new AppError("Pembayaran tidak ditemukan", 404);

    if (riwayat.status === "success") {
      return successResponse(res, "Pembayaran sudah berhasil", {
        order_id: orderId,
        status: "success",
      });
    }

    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey) {
      throw new AppError("Konfigurasi pembayaran belum lengkap", 500);
    }

    const respons = await fetch(
      `${process.env.MIDTRANS_API_URL || "https://api.sandbox.midtrans.com"}/v2/${encodeURIComponent(orderId)}/status`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Basic ${Buffer.from(`${serverKey}:`).toString("base64")}`,
        },
        signal: AbortSignal.timeout(15000),
      },
    );

    const body: any = await respons.json().catch(() => ({}));
    if (!respons.ok && respons.status !== 404) {
      throw new AppError("Gagal memeriksa pembayaran ke Midtrans", 502);
    }

    if (!body || body.order_id !== orderId || !body.transaction_status) {
      return successResponse(res, "Pembayaran belum ditemukan di Midtrans", {
        order_id: orderId,
        status: riwayat.status,
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
        const diubah = await tx.riwayatPembayaran.updateMany({
          where: { id: riwayat.id, status: { not: "success" } },
          data: {
            status: "success",
            metode: body.payment_type ?? null,
            midtransPaymentId: body.transaction_id ?? null,
            webhookRawPayload: body,
          },
        });
        if (!diubah.count) return;

        const tanggalMulai = new Date();
        const tanggalBerakhir = new Date();
        if (riwayat.langgananSekolah.siklusPenagihan === "annual") {
          tanggalBerakhir.setFullYear(tanggalBerakhir.getFullYear() + 1);
        } else {
          tanggalBerakhir.setMonth(tanggalBerakhir.getMonth() + 1);
        }

        await tx.langgananSekolah.update({
          where: { id: riwayat.langgananSekolah.id },
          data: {
            statusPembayaran: "success",
            statusLangganan: "active",
            tanggalMulai,
            tanggalBerakhir,
          },
        });

        await tx.sekolah.update({
          where: { id: riwayat.sekolahId },
          data: { status: "aktif" },
        });
      });

      return successResponse(res, "Pembayaran terkonfirmasi, langganan diaktifkan", {
        order_id: orderId,
        status: "success",
      });
    }

    if (gagal) {
      await prisma.$transaction(async (tx) => {
        const diubah = await tx.riwayatPembayaran.updateMany({
          where: { id: riwayat.id, status: "pending" },
          data: {
            status: "failed",
            midtransPaymentId: body.transaction_id ?? null,
            webhookRawPayload: body,
          },
        });
        if (!diubah.count) return;

        await tx.langgananSekolah.update({
          where: { id: riwayat.langgananSekolah.id },
          data: { statusPembayaran: "expired" },
        });
      });

      return successResponse(res, "Pembayaran gagal atau kedaluwarsa", {
        order_id: orderId,
        status: "failed",
      });
    }

    return successResponse(res, "Menunggu pembayaran", {
      order_id: orderId,
      status: riwayat.status,
    });
  } catch (error) {
    next(error);
  }
};