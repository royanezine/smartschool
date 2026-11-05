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

// Read-only: denying login must not mutate subscription/payment records.
// Apply this again at the PIN completion step, since a challenge may outlive a subscription.
export async function assertLoginSubscription(user: LoginTenantUser) {
  if (!user.peran || user.peran.status !== "aktif" || user.peran.dihapusPada) {
    throw new AppError("Peran akun tidak aktif. Hubungi administrator.", 403);
  }
  if (isSuperAdmin(user.peran.nama)) return;

  const denied = () => new AppError(
    "Akses ditolak, masa aktif langganan sekolah telah habis", 403,
    "SUBSCRIPTION_REQUIRED_OR_EXPIRED",
  );
  if (normalizeRole(user.peran.nama) === "admin_yayasan") {
    if (!user.yayasanId || !(await cekLanggananYayasan(user.yayasanId)).aktif) throw denied();
    return;
  }

  const school = user.sekolah;
  if (!user.sekolahId || !school || school.dihapusPada ||
      !["aktif", "uji coba"].includes(school.status ?? "")) throw denied();

  // Existing tenant policy allows a school's subscription to be covered by its foundation.
  if (school.yayasanId && (await cekLanggananYayasan(school.yayasanId)).aktif) return;

  const subscription = await prisma.langgananSekolah.findFirst({
    where: { sekolahId: user.sekolahId },
    orderBy: [{ dibuatPada: "desc" }, { id: "desc" }],
    select: { statusLangganan: true, tanggalMulai: true, tanggalBerakhir: true },
  });
  const now = new Date();
  if (!subscription || !["active", "trialing"].includes(subscription.statusLangganan ?? "") ||
      (subscription.tanggalMulai && subscription.tanggalMulai > now) ||
      !subscription.tanggalBerakhir || subscription.tanggalBerakhir <= now) throw denied();
}
