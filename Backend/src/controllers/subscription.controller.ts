import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { prisma } from "../config/db";
import {
  createPaymentSchema,
  extendSubscriptionSchema,
} from "../validations/subscription.validation";
import { successResponse } from "../utils/responseFormatter";
import { AppError } from "../utils/appError";
import { isSuperAdmin } from "../utils/rbac";
import { buatOrderIdMidtrans } from "../utils/midtransOrderId";

const MIDTRANS_SNAP_URL = "https://app.sandbox.midtrans.com/snap/v1/transactions";

const buatTransaksiSnap = async (params: {
  orderId: string;
  grossAmount: number;
  namaCustomer: string;
  email?: string;
  pesanGagal: string;
}) => {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) {
    throw new AppError("MIDTRANS_SERVER_KEY belum dikonfigurasi", 500);
  }

  const auth = Buffer.from(`${serverKey}:`).toString("base64");

  const response = await fetch(MIDTRANS_SNAP_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify({
      transaction_details: {
        order_id: params.orderId,
        gross_amount: params.grossAmount,
      },
      customer_details: {
        first_name: params.namaCustomer,
        email: params.email,
      },
    }),
  });

  const body: any = await response.json().catch(() => ({}));

  if (!response.ok || !body.token) {
    console.error("Midtrans API Error:", {
      httpStatus: response.status,
      orderId: params.orderId,
      response: body,
    });

    const pesan = Array.isArray(body.error_messages)
      ? body.error_messages.join(", ")
      : body.status_message;

    throw new AppError(pesan || params.pesanGagal, 502);
  }

  return body as { token: string; redirect_url: string };
};

export const createPayment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user || !req.user.sekolahId) {
      throw new AppError("Akses Ditolak", 403);
    }

    const data = createPaymentSchema.parse(req.body);

    const paket = await prisma.paket.findUnique({
      where: { id: data.paketId },
    });

    if (!paket) {
      throw new AppError("Paket langganan tidak ditemukan", 404);
    }

    const totalHarga =
      data.siklusPenagihan === "annual"
        ? Number(paket.harga) * 12
        : Number(paket.harga);

    const pengguna = await prisma.pengguna.findUnique({
      where: { id: req.user.userId },
      select: { namaLengkap: true },
    });

    const namaCustomer = pengguna?.namaLengkap || "Admin Sekolah";

    const orderId = buatOrderIdMidtrans("INV", req.user.sekolahId);

    const snap = await buatTransaksiSnap({
      orderId,
      grossAmount: totalHarga,
      namaCustomer,
      email: req.user.email,
      pesanGagal: "Gagal memproses pembayaran",
    });

    await prisma.$transaction(async (tx) => {
      const langganan = await tx.langgananSekolah.create({
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
        order_id: orderId,
        payment_url: snap.redirect_url,
        token: snap.token,
      },
      201,
    );
  } catch (error) {
    next(error);
  }
};

export const getPendingPayments = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user || !req.user.sekolahId) {
      throw new AppError(
        "Akses Ditolak: Anda tidak terhubung dengan sekolah manapun",
        403,
      );
    }

    const pembayaranPending = await prisma.riwayatPembayaran.findMany({
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
    });

    return successResponse(
      res,
      "Berhasil mendapatkan riwayat pembayaran",
      pembayaranPending,
      200,
    );
  } catch (error) {
    next(error);
  }
};

export const extendSubscription = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user || !req.user.sekolahId) {
      throw new AppError(
        "Akses Ditolak: Anda tidak terhubung dengan sekolah manapun",
        403,
      );
    }

    const data = extendSubscriptionSchema.parse(req.body);

    const paket = await prisma.paket.findUnique({
      where: { id: data.paketId },
    });

    if (!paket) {
      throw new AppError("Paket langganan tidak ditemukan", 404);
    }

    const langgananAktif = await prisma.langgananSekolah.findFirst({
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

    const tanggalBerakhir = new Date(tanggalMulai);

    if (data.siklusPenagihan === "annual") {
      tanggalBerakhir.setFullYear(tanggalBerakhir.getFullYear() + 1);
    } else {
      tanggalBerakhir.setMonth(tanggalBerakhir.getMonth() + 1);
    }

    const totalHarga =
      data.siklusPenagihan === "annual"
        ? Number(paket.harga) * 12
        : Number(paket.harga);

    const pengguna = await prisma.pengguna.findUnique({
      where: { id: req.user.userId },
      select: { namaLengkap: true },
    });

    const namaCustomer = pengguna?.namaLengkap || "Admin Sekolah";

    const orderId = buatOrderIdMidtrans("INV-EXT", req.user.sekolahId);

    const snap = await buatTransaksiSnap({
      orderId,
      grossAmount: totalHarga,
      namaCustomer,
      email: req.user.email,
      pesanGagal: "Gagal membuat invoice perpanjangan",
    });

    const result = await prisma.$transaction(async (tx) => {
      const langganan = await tx.langgananSekolah.create({
        data: {
          sekolahId: req.user!.sekolahId!,
          paketId: paket.id,
          dibuatOleh: req.user!.userId,
          tanggalMulai,
          tanggalBerakhir,
          statusPembayaran: "pending",
          statusLangganan: "trialing",
          hargaSaatBerlangganan: totalHarga,
          siklusPenagihan: data.siklusPenagihan,
          midtransInvoiceId: orderId,
          midtransPaymentLink: snap.redirect_url,
        },
      });

      const riwayatPembayaran = await tx.riwayatPembayaran.create({
        data: {
          langgananSekolahId: langganan.id,
          sekolahId: req.user!.sekolahId!,
          dibuatOleh: req.user!.userId,
          jumlah: totalHarga,
          status: "pending",
          midtransInvoiceId: orderId,
        },
      });

      return { langganan, riwayatPembayaran };
    });

    return successResponse(
      res,
      "Invoice perpanjangan paket berhasil dibuat",
      {
        order_id: orderId,
        langganan: result.langganan,
        pembayaran: result.riwayatPembayaran,
        payment_url: snap.redirect_url,
        token: snap.token,
        tanggalMulai,
        tanggalBerakhir,
      },
      201,
    );
  } catch (error) {
    next(error);
  }
};

export const getAllLanggananSekolah = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const isSuper = isSuperAdmin(req.user?.role);
    const sekolahId = req.user?.sekolahId;

    const where: any = {};
    if (!isSuper) {
      if (!sekolahId) {
        throw new AppError(
          "Akses ditolak: Anda tidak terhubung dengan sekolah",
          403,
          "NO_TENANT_LINKED",
        );
      }
      where.sekolahId = sekolahId;
    }

    const langganan = await prisma.langgananSekolah.findMany({
      where,
      include: {
        sekolah: true,
        paket: true,
      },
    });

    return successResponse(
      res,
      "Berhasil mendapatkan seluruh data langganan sekolah",
      langganan,
      200,
    );
  } catch (error) {
    next(error);
  }
};