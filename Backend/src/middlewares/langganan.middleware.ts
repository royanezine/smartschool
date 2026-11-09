import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";
import { prisma } from "../config/db";
import { isSuperAdmin } from "../utils/rbac";
import { cekLanggananYayasan } from "../utils/yayasanLangganan";

export interface LanggananContext {
  sekolahId: string;
  sumber: "yayasan" | "sekolah";
  langgananId: string | null;
  paketId: string | null;
  statusLangganan: string | null;
  tanggalBerakhir: Date | null;
}

export interface LanggananRequest extends AuthRequest {
  langganan?: LanggananContext;
}

const STATUS_PEMBAYARAN_TIDAK_VALID = [
  "pending",
  "failed",
  "expired",
  "cancel",
  "cancelled",
  "deny",
];

const STATUS_LANGGANAN_AKTIF = ["active", "trialing"];

const tolak = (
  res: Response,
  status: number,
  message: string,
  errorCode: string,
) => res.status(status).json({ success: false, message, errorCode });

const bersihkanBody = (req: LanggananRequest) => {
  const body = req.body;
  if (body && typeof body === "object" && !Array.isArray(body)) {
    delete body.sekolahId;
    delete body.yayasanId;
  }
};

export const requireKepemilikanSekolah = async (
  req: LanggananRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      return tolak(res, 401, "Unauthorized", "UNAUTHORIZED");
    }

    if (isSuperAdmin(req.user.role)) {
      return next();
    }

    const sekolahId = req.user.sekolahId;

    if (!sekolahId) {
      return tolak(
        res,
        403,
        "Akses Ditolak: Anda tidak terhubung dengan sekolah manapun",
        "NO_TENANT_LINKED",
      );
    }

    const sekolah = await prisma.sekolah.findFirst({
      where: { id: sekolahId, dihapusPada: null },
      select: { id: true },
    });

    if (!sekolah) {
      return tolak(res, 404, "Sekolah tidak ditemukan", "TENANT_NOT_FOUND");
    }

    bersihkanBody(req);
    next();
  } catch (error) {
    next(error);
  }
};

export const requireLangganan = (kodeModul?: string) => {
  return async (req: LanggananRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return tolak(res, 401, "Unauthorized", "UNAUTHORIZED");
      }

      if (isSuperAdmin(req.user.role)) {
        return next();
      }

      const sekolahId = req.user.sekolahId;

      if (!sekolahId) {
        return tolak(
          res,
          403,
          "Akses Ditolak: Anda tidak terhubung dengan sekolah manapun",
          "NO_TENANT_LINKED",
        );
      }

      const sekolah = await prisma.sekolah.findUnique({
        where: { id: sekolahId },
        select: {
          id: true,
          dihapusPada: true,
          yayasanId: true,
          langgananSekolah: {
            select: {
              id: true,
              paketId: true,
              statusPembayaran: true,
              statusLangganan: true,
              tanggalMulai: true,
              tanggalBerakhir: true,
            },
            orderBy: { dibuatPada: "desc" },
          },
        },
      });

      if (!sekolah || sekolah.dihapusPada !== null) {
        return tolak(res, 404, "Sekolah tidak ditemukan", "TENANT_NOT_FOUND");
      }

      if (kodeModul && !(req.user.modulAktif ?? []).includes(kodeModul)) {
        return tolak(
          res,
          403,
          "Modul ini tidak termasuk dalam paket langganan sekolah Anda",
          "MODULE_NOT_IN_PACKAGE",
        );
      }

      if (sekolah.yayasanId) {
        const { aktif } = await cekLanggananYayasan(sekolah.yayasanId);
        if (aktif) {
          req.langganan = {
            sekolahId,
            sumber: "yayasan",
            langgananId: null,
            paketId: null,
            statusLangganan: "active",
            tanggalBerakhir: null,
          };
          bersihkanBody(req);
          return next();
        }
      }

      const sekarang = new Date();

      const dibayar = sekolah.langgananSekolah.filter(
        (l) => !STATUS_PEMBAYARAN_TIDAK_VALID.includes(l.statusPembayaran ?? ""),
      );

      if (dibayar.length === 0) {
        return tolak(
          res,
          403,
          "Sekolah belum memiliki langganan",
          "SUBSCRIPTION_REQUIRED",
        );
      }

      const berlaku = dibayar.filter(
        (l) =>
          STATUS_LANGGANAN_AKTIF.includes(l.statusLangganan ?? "") &&
          (!l.tanggalMulai || l.tanggalMulai <= sekarang) &&
          (!l.tanggalBerakhir || l.tanggalBerakhir >= sekarang),
      );

      if (berlaku.length > 0) {
        const terbaik = berlaku.reduce((a, b) => {
          const ta = a.tanggalBerakhir ? a.tanggalBerakhir.getTime() : Infinity;
          const tb = b.tanggalBerakhir ? b.tanggalBerakhir.getTime() : Infinity;
          return tb > ta ? b : a;
        });

        req.langganan = {
          sekolahId,
          sumber: "sekolah",
          langgananId: terbaik.id,
          paketId: terbaik.paketId,
          statusLangganan: terbaik.statusLangganan,
          tanggalBerakhir: terbaik.tanggalBerakhir,
        };
        bersihkanBody(req);
        return next();
      }

      const kedaluwarsa = dibayar.filter(
        (l) =>
          STATUS_LANGGANAN_AKTIF.includes(l.statusLangganan ?? "") &&
          !!l.tanggalBerakhir &&
          l.tanggalBerakhir < sekarang,
      );

      if (kedaluwarsa.length > 0) {
        await prisma.langgananSekolah.updateMany({
          where: { id: { in: kedaluwarsa.map((l) => l.id) } },
          data: { statusLangganan: "expired" },
        });

        return tolak(
          res,
          403,
          "Masa langganan telah kadaluarsa",
          "SUBSCRIPTION_EXPIRED",
        );
      }

      const belumMulai = dibayar.some(
        (l) =>
          STATUS_LANGGANAN_AKTIF.includes(l.statusLangganan ?? "") &&
          !!l.tanggalMulai &&
          l.tanggalMulai > sekarang,
      );

      if (belumMulai) {
        return tolak(
          res,
          403,
          "Langganan belum dimulai",
          "SUBSCRIPTION_NOT_STARTED",
        );
      }

      if (dibayar.some((l) => l.statusLangganan === "expired")) {
        return tolak(
          res,
          403,
          "Masa langganan telah kadaluarsa",
          "SUBSCRIPTION_EXPIRED",
        );
      }

      return tolak(
        res,
        403,
        "Langganan sekolah tidak aktif",
        "SUBSCRIPTION_INACTIVE",
      );
    } catch (error) {
      next(error);
    }
  };
};

export const requireSubscription = requireLangganan();