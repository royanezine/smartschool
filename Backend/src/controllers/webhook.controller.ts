import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { prisma } from "../config/db";

export const handleMidtransWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      transaction_id,
    } = req.body;

    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
    const hash = crypto
      .createHash("sha512")
      .update(order_id + status_code + gross_amount + serverKey)
      .digest("hex");

    if (hash !== signature_key) {
      return res
        .status(403)
        .json({ success: false, message: "Invalid Signature Key" });
    }

    if (order_id.startsWith("REG-")) {
      const pendaftaran = await prisma.pendaftaranTenant.findFirst({
        where: { midtransOrderId: order_id },
      });

      if (!pendaftaran)
        return res
          .status(404)
          .json({ success: false, message: "Pendaftaran not found" });

      if (
        transaction_status === "capture" ||
        transaction_status === "settlement"
      ) {
        const peranAdmin = await prisma.peran.findFirst({
          where: { nama: "admin_sekolah" },
        });
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
              status: "aktif",
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
              peranId: peranAdmin!.id,
              status: "aktif",
            },
          });

          const endDate = new Date();
          endDate.setFullYear(endDate.getFullYear() + 1);

          await tx.langgananSekolah.create({
            data: {
              sekolahId: sekolah.id,
              paketId: pendaftaran.paketId,
              dibuatOleh: pengguna.id,
              statusPembayaran: "success",
              statusLangganan: "active",
              hargaSaatBerlangganan: gross_amount,
              siklusPenagihan: "annual",
              midtransInvoiceId: order_id,
              tanggalMulai: new Date(),
              tanggalBerakhir: endDate,
            },
          });

          await tx.pendaftaranTenant.update({
            where: { id: pendaftaran.id },
            data: {
              status: "aktif",
              sekolahTerbuatId: sekolah.id,
              penggunaTerbuatId: pengguna.id,
              dikonversiPada: new Date(),
            },
          });
        });
      } else if (
        transaction_status === "cancel" ||
        transaction_status === "deny" ||
        transaction_status === "expire"
      ) {
        await prisma.pendaftaranTenant.update({
          where: { id: pendaftaran.id },
          data: { status: "pembayaran_gagal" },
        });
      }
      return res.status(200).json({ received: true });
    }

    if (order_id.startsWith("INV-")) {
      const riwayat = await prisma.riwayatPembayaran.findFirst({
        where: { midtransInvoiceId: order_id },
        include: { langgananSekolah: true },
      });

      if (!riwayat)
        return res
          .status(404)
          .json({ success: false, message: "Order ID not found" });

      await prisma.$transaction(async (tx) => {
        if (
          transaction_status === "capture" ||
          transaction_status === "settlement"
        ) {
          await tx.riwayatPembayaran.update({
            where: { id: riwayat.id },
            data: {
              status: "success",
              midtransPaymentId: transaction_id,
              webhookRawPayload: req.body,
            },
          });

          const startDate = new Date();
          const endDate = new Date();
          if (riwayat.langgananSekolah.siklusPenagihan === "annual") {
            endDate.setFullYear(endDate.getFullYear() + 1);
          } else {
            endDate.setMonth(endDate.getMonth() + 1);
          }

          await tx.langgananSekolah.update({
            where: { id: riwayat.langgananSekolah.id },
            data: {
              statusPembayaran: "success",
              statusLangganan: "active",
              tanggalMulai: startDate,
              tanggalBerakhir: endDate,
            },
          });

          await tx.sekolah.update({
            where: { id: riwayat.sekolahId! },
            data: { status: "aktif" },
          });
        } else if (
          transaction_status === "cancel" ||
          transaction_status === "deny" ||
          transaction_status === "expire"
        ) {
          await tx.riwayatPembayaran.update({
            where: { id: riwayat.id },
            data: {
              status: "failed",
              midtransPaymentId: transaction_id,
              webhookRawPayload: req.body,
            },
          });

          await tx.langgananSekolah.update({
            where: { id: riwayat.langgananSekolah.id },
            data: { statusPembayaran: "expired" },
          });
        }
      });
      return res.status(200).json({ received: true });
    }

    return res
      .status(400)
      .json({ success: false, message: "Format Order ID tidak dikenali" });
  } catch (error) {
    console.error("Midtrans Webhook Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
