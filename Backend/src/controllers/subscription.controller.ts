import { Response, NextFunction } from "express";

import { AuthRequest } from "../middlewares/auth.middleware";

import { prisma } from "../config/db";

import {
  createPaymentSchema,
  extendSubscriptionSchema,
} from "../validations/subscription.validation";

import { successResponse } from "../utils/responseFormatter";

import { AppError } from "../utils/appError";

export const createPayment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user || !req.user.sekolahId) {
      throw new AppError("Akses Ditolak", 403);
    }

    const data = createPaymentSchema.parse(req.body);

    const paket = await prisma.paket.findUnique({
      where: {
        id: data.paketId,
      },
    });

    if (!paket) {
      throw new AppError(
        "Paket langganan tidak ditemukan",
        404
      );
    }

    const totalHarga =
      data.siklusPenagihan === "annual"
        ? Number(paket.harga) * 12
        : Number(paket.harga);

    const pengguna = await prisma.pengguna.findUnique({
      where: {
        id: req.user.userId,
      },
      select: {
        namaLengkap: true,
      },
    });

    const namaCustomer =
      pengguna?.namaLengkap || "Admin Sekolah";

    const midtransAuth = Buffer.from(
      process.env.MIDTRANS_SERVER_KEY + ":"
    ).toString("base64");

    const orderId = `INV-${req.user.sekolahId}-${Date.now()}`;

    const midtransResponse = await fetch(
      "https://app.sandbox.midtrans.com/snap/v1/transactions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Basic ${midtransAuth}`,
        },
        body: JSON.stringify({
          transaction_details: {
            order_id: orderId,
            gross_amount: totalHarga,
          },
          customer_details: {
            first_name: namaCustomer,
            email: req.user.email,
          },
        }),
      }
    );

    if (!midtransResponse.ok) {
      const errorData = await midtransResponse.json();

      console.error(
        "Midtrans API Error:",
        errorData
      );

      throw new AppError(
        "Gagal memproses pembayaran",
        500
      );
    }

    const snap = await midtransResponse.json();

    await prisma.$transaction(async (tx) => {
      const langganan =
        await tx.langgananSekolah.create({
          data: {
            sekolahId: req.user!.sekolahId!,
            paketId: paket.id,
            dibuatOleh: req.user!.userId,
            statusPembayaran: "pending",
            statusLangganan: "trialing",
            hargaSaatBerlangganan: totalHarga,
            siklusPenagihan: data.siklusPenagihan,
            midtransInvoiceId: orderId,
            midtransPaymentLink: snap.redirect_url,
          },
        });

      await tx.riwayatPembayaran.create({
        data: {
          langgananSekolahId: langganan.id,
          sekolahId: req.user!.sekolahId!,
          dibuatOleh: req.user!.userId,
          jumlah: totalHarga,
          status: "pending",
          midtransInvoiceId: orderId,
        },
      });
    });

    return successResponse(
      res,
      "Transaksi Midtrans berhasil dibuat",
      {
        payment_url: snap.redirect_url,
        token: snap.token,
      },
      201
    );
  } catch (error) {
    next(error);
  }
};

export const getPendingPayments = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user || !req.user.sekolahId) {
      throw new AppError(
        "Akses Ditolak: Anda tidak terhubung dengan sekolah manapun",
        403
      );
    }

    const pembayaranPending =
      await prisma.riwayatPembayaran.findMany({
        where: {
          sekolahId: req.user.sekolahId,
          status: "pending",
        },
        include: {
          langgananSekolah: {
            include: {
              paket: true,
            },
          },
        },
        orderBy: {
          dibuatPada: "desc",
        },
      });

    return successResponse(
      res,
      "Berhasil mendapatkan riwayat pembayaran",
      pembayaranPending,
      200
    );
  } catch (error) {
    next(error);
  }
};

export const extendSubscription = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user || !req.user.sekolahId) {
      throw new AppError(
        "Akses Ditolak: Anda tidak terhubung dengan sekolah manapun",
        403
      );
    }

    const data = extendSubscriptionSchema.parse(
      req.body
    );

    const paket = await prisma.paket.findUnique({
      where: {
        id: data.paketId,
      },
    });

    if (!paket) {
      throw new AppError(
        "Paket langganan tidak ditemukan",
        404
      );
    }

    const langgananAktif =
      await prisma.langgananSekolah.findFirst({
        where: {
          sekolahId: req.user.sekolahId,
          statusLangganan: "active",
          dihapusOleh: null,
        },
        orderBy: {
          tanggalBerakhir: "desc",
        },
      });

    const tanggalMulai = langgananAktif?.tanggalBerakhir
      ? new Date(langgananAktif.tanggalBerakhir)
      : new Date();

    if (!langgananAktif) {
      tanggalMulai.setHours(0, 0, 0, 0);
    }

    const tanggalBerakhir = new Date(
      tanggalMulai
    );

    if (data.siklusPenagihan === "annual") {
      tanggalBerakhir.setFullYear(
        tanggalBerakhir.getFullYear() + 1
      );
    } else {
      tanggalBerakhir.setMonth(
        tanggalBerakhir.getMonth() + 1
      );
    }

    const totalHarga =
      data.siklusPenagihan === "annual"
        ? Number(paket.harga) * 12
        : Number(paket.harga);

    const pengguna = await prisma.pengguna.findUnique({
      where: {
        id: req.user.userId,
      },
      select: {
        namaLengkap: true,
      },
    });

    const namaCustomer =
      pengguna?.namaLengkap || "Admin Sekolah";

    const midtransServerKey =
      process.env.MIDTRANS_SERVER_KEY;

    if (!midtransServerKey) {
      throw new AppError(
        "MIDTRANS_SERVER_KEY belum dikonfigurasi",
        500
      );
    }

    const midtransAuth = Buffer.from(
      `${midtransServerKey}:`
    ).toString("base64");

    const orderId = `INV-EXT-${req.user.sekolahId}-${Date.now()}`;

    const midtransResponse = await fetch(
      "https://app.sandbox.midtrans.com/snap/v1/transactions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Basic ${midtransAuth}`,
        },
        body: JSON.stringify({
          transaction_details: {
            order_id: orderId,
            gross_amount: totalHarga,
          },
          customer_details: {
            first_name: namaCustomer,
            email: req.user.email,
          },
        }),
      }
    );

    if (!midtransResponse.ok) {
      const errorData = await midtransResponse.json();

      console.error(
        "Midtrans API Error:",
        errorData
      );

      throw new AppError(
        "Gagal membuat invoice perpanjangan",
        500
      );
    }

    const snap = await midtransResponse.json();

    const result = await prisma.$transaction(
      async (tx) => {
        const langganan =
          await tx.langgananSekolah.create({
            data: {
              sekolahId: req.user!.sekolahId!,
              paketId: paket.id,
              dibuatOleh: req.user!.userId,
              tanggalMulai,
              tanggalBerakhir,
              statusPembayaran: "pending",
              statusLangganan: "trialing",
              hargaSaatBerlangganan: totalHarga,
              siklusPenagihan:
                data.siklusPenagihan,
              midtransInvoiceId: orderId,
              midtransPaymentLink:
                snap.redirect_url,
            },
          });

        const riwayatPembayaran =
          await tx.riwayatPembayaran.create({
            data: {
              langgananSekolahId: langganan.id,
              sekolahId: req.user!.sekolahId!,
              dibuatOleh: req.user!.userId,
              jumlah: totalHarga,
              status: "pending",
              midtransInvoiceId: orderId,
            },
          });

        return {
          langganan,
          riwayatPembayaran,
        };
      }
    );

    return successResponse(
      res,
      "Invoice perpanjangan paket berhasil dibuat",
      {
        langganan: result.langganan,
        pembayaran: result.riwayatPembayaran,
        payment_url: snap.redirect_url,
        token: snap.token,
        tanggalMulai,
        tanggalBerakhir,
      },
      201
    );
  } catch (error) {
    next(error);
  }
};

export const getAllLanggananSekolah = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const langganan = await prisma.langgananSekolah.findMany({
      include: {
        sekolah: true,
        paket: true,
      },
      orderBy: {
        dibuatPada: "desc",
      },
    });

    return successResponse(
      res,
      "Berhasil mendapatkan seluruh data langganan sekolah",
      langganan,
      200
    );
  } catch (error) {
    next(error);
  }
};