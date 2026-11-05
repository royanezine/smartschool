import { prisma } from "../config/db";
import { AppError } from "../utils/appError";
import { isSuperAdmin, normalizeRole } from "../utils/rbac";
import { cekLanggananYayasan } from "../utils/yayasanLangganan";

type LoginTenantUser = {
  sekolahId: string | null;
  yayasanId: string | null;
  peran: { nama: string; status: string | null; dihapusPada: Date | null } | null;
  sekolah: { status: string | null; dihapusPada: Date | null; yayasanId: string | null } | null;
};

const SUBSCRIPTION_ERROR_CODE = {
  REQUIRED: "SUBSCRIPTION_REQUIRED",
  EXPIRED: "SUBSCRIPTION_EXPIRED",
  INACTIVE: "SUBSCRIPTION_INACTIVE",
  PENDING_PAYMENT: "SUBSCRIPTION_PENDING_PAYMENT",
  NOT_STARTED: "SUBSCRIPTION_NOT_STARTED",
  TENANT_INACTIVE: "SUBSCRIPTION_TENANT_INACTIVE",
} as const;

function denySubscription(errorCode: string, message: string): never {
  throw new AppError(message, 403, errorCode);
}

export async function assertLoginSubscription(user: LoginTenantUser): Promise<void> {
  if (!user.peran || user.peran.status !== "aktif" || user.peran.dihapusPada) {
    throw new AppError("Peran akun tidak aktif. Hubungi administrator.", 403);
  }

  if (isSuperAdmin(user.peran.nama)) {
    return;
  }

  const role = normalizeRole(user.peran.nama);

  if (role === "admin_yayasan") {
    if (!user.yayasanId) {
      denySubscription(
        SUBSCRIPTION_ERROR_CODE.REQUIRED,
        "Akun admin yayasan belum terhubung dengan yayasan manapun",
      );
    }

    const yayasanCheck = await cekLanggananYayasan(user.yayasanId);
    if (!yayasanCheck.aktif) {
      denySubscription(
        SUBSCRIPTION_ERROR_CODE.EXPIRED,
        "Akses ditolak, masa aktif langganan yayasan telah habis",
      );
    }
    return;
  }

  const school = user.sekolah;

  if (!user.sekolahId || !school || school.dihapusPada) {
    denySubscription(
      SUBSCRIPTION_ERROR_CODE.TENANT_INACTIVE,
      "Akses ditolak, sekolah tidak ditemukan atau sudah tidak aktif",
    );
  }

  if (!["aktif", "uji coba"].includes(school.status ?? "")) {
    denySubscription(
      SUBSCRIPTION_ERROR_CODE.TENANT_INACTIVE,
      "Akses ditolak, status sekolah tidak aktif",
    );
  }

  if (school.yayasanId) {
    const yayasanCheck = await cekLanggananYayasan(school.yayasanId);
    if (yayasanCheck.aktif) {
      return;
    }
  }

  const now = new Date();

  const subscriptions = await prisma.langgananSekolah.findMany({
    where: {
      sekolahId: user.sekolahId,
      statusPembayaran: "success",
    },
    orderBy: [{ dibuatPada: "desc" }, { id: "desc" }],
    select: {
      statusLangganan: true,
      statusPembayaran: true,
      tanggalMulai: true,
      tanggalBerakhir: true,
    },
  });

  if (subscriptions.length === 0) {
    const pending = await prisma.langgananSekolah.findFirst({
      where: {
        sekolahId: user.sekolahId,
        statusPembayaran: "pending",
      },
      orderBy: [{ dibuatPada: "desc" }, { id: "desc" }],
      select: { id: true },
    });

    if (pending) {
      denySubscription(
        SUBSCRIPTION_ERROR_CODE.PENDING_PAYMENT,
        "Akses ditolak, pembayaran langganan belum diselesaikan",
      );
    }

    denySubscription(
      SUBSCRIPTION_ERROR_CODE.REQUIRED,
      "Akses ditolak, sekolah belum memiliki langganan aktif",
    );
  }

  const activeSubscription = subscriptions.find((sub) => {
    if (!["active", "trialing"].includes(sub.statusLangganan ?? "")) return false;
    if (!sub.tanggalBerakhir) return false;
    if (sub.tanggalBerakhir <= now) return false;
    if (sub.tanggalMulai && sub.tanggalMulai > now) return false;
    return true;
  });

  if (activeSubscription) {
    return;
  }

  const futureSubscription = subscriptions.find((sub) => {
    if (!["active", "trialing"].includes(sub.statusLangganan ?? "")) return false;
    return sub.tanggalMulai && sub.tanggalMulai > now;
  });

  if (futureSubscription) {
    denySubscription(
      SUBSCRIPTION_ERROR_CODE.NOT_STARTED,
      "Akses ditolak, masa aktif langganan belum dimulai",
    );
  }

  const hasExpired = subscriptions.some(
    (sub) => sub.tanggalBerakhir && sub.tanggalBerakhir <= now,
  );

  if (hasExpired) {
    denySubscription(
      SUBSCRIPTION_ERROR_CODE.EXPIRED,
      "Akses ditolak, masa aktif langganan sekolah telah habis",
    );
  }

  denySubscription(
    SUBSCRIPTION_ERROR_CODE.INACTIVE,
    "Akses ditolak, langganan sekolah tidak aktif",
  );
}