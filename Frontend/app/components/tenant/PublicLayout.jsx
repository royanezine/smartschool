
import PublicNavbar from "./PublicNavbar";
import PublicFooter from "./PublicFooter";
import PublicSection from "./PublicSection";
import { publikService } from "@/services/publik.service";
import { normalizePublicConfig } from "./normalizePublicConfig";

/* =========================================================
   MEMUAT DATA WEBSITE PUBLIK BERDASARKAN SUBDOMAIN
========================================================= */

export async function loadPublicLayout(subdomain) {
  const [
    profilResult,
    temaResult,
    halamanResult,
    konfigurasiResult,
  ] = await Promise.allSettled([
    publikService.getProfil(subdomain),
    publikService.getTema(subdomain),
    publikService.getDaftarHalaman(subdomain),
    publikService.getKonfigurasi(subdomain),
  ]);

  const profil =
    profilResult.status === "fulfilled"
      ? profilResult.value
      : null;

  const tema =
    temaResult.status === "fulfilled"
      ? temaResult.value
      : null;

  const halaman =
    halamanResult.status === "fulfilled" &&
    Array.isArray(halamanResult.value)
      ? halamanResult.value
      : [];

  const konfigurasi =
    konfigurasiResult.status === "fulfilled"
      ? konfigurasiResult.value
      : [];

  if (profilResult.status === "rejected") {
    console.error(
      "[PUBLIC LAYOUT] Gagal mengambil profil:",
      profilResult.reason
    );
  }

  if (temaResult.status === "rejected") {
    console.error(
      "[PUBLIC LAYOUT] Gagal mengambil tema:",
      temaResult.reason
    );
  }

  if (halamanResult.status === "rejected") {
    console.error(
      "[PUBLIC LAYOUT] Gagal mengambil daftar halaman:",
      halamanResult.reason
    );
  }

  if (konfigurasiResult.status === "rejected") {
    console.error(
      "[PUBLIC LAYOUT] Gagal mengambil konfigurasi:",
      konfigurasiResult.reason
    );
  }

  return {
    profil,
    tema,
    halaman,
    konfigurasi,
  };
}

/* =========================================================
   LAYOUT WEBSITE PUBLIK
========================================================= */

export default function PublicLayout({
  profil,
  tema,
  halaman = [],
  konfigurasi = [],
  children,
}) {
  const daftarHalaman = Array.isArray(halaman)
    ? halaman
    : [];

  const daftarKonfigurasi = normalizePublicConfig(
    konfigurasi
  );

  const konfigurasiAktif = daftarKonfigurasi.filter(
    (item) =>
      String(item?.status || "").toLowerCase() === "aktif"
  );

 return (
  <div
    className="relative flex min-h-screen w-full flex-col"
    style={{
      margin: 0,
      padding: 0,
      backgroundColor: "var(--school-background, #F8FAFC)",
      color: "var(--school-text, #0F172A)",
    }}
  >
    <PublicNavbar
      sekolah={profil || {}}
      halaman={daftarHalaman}
    />

    <main className="flex w-full flex-1 flex-col">
      {children}

      {konfigurasiAktif.map((item, index) => (
        <PublicSection
          key={
            item.id ||
            `${item.halaman}-${item.section}-${item.urutan ?? index}`
          }
          config={item}
        />
      ))}
    </main>

    <PublicFooter
      sekolah={profil || {}}
      halaman={daftarHalaman}
      konfigurasi={daftarKonfigurasi}
    />
  </div>
);
}
