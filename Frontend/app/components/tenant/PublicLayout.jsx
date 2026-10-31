import PublicNavbar from "./PublicNavbar";
import PublicFooter from "./PublicFooter";
import { publikService } from "@/services/publik.service";
import { AlertTriangle } from "lucide-react";
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
  /* -------------------------------------------------------
     FALLBACK JIKA PROFIL SEKOLAH TIDAK TERSEDIA
  ------------------------------------------------------- */

  if (!profil) {
    return (
      <main
        className="flex min-h-screen items-center justify-center px-4 py-16"
        style={{
          backgroundColor: "var(--school-background, #F8FAFC)",
          color: "var(--school-text, #0F172A)",
        }}
      >
        <div
          className="w-full max-w-lg rounded-3xl border p-8 text-center shadow-xl"
          style={{
            backgroundColor: "var(--school-surface, #FFFFFF)",
            borderColor: "var(--school-border, #E2E8F0)",
          }}
        >
          <div
            className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full"
            style={{
              backgroundColor:
                "color-mix(in srgb, var(--school-accent, #F59E0B) 12%, white)",
              color: "var(--school-accent, #F59E0B)",
            }}
          >
            <AlertTriangle size={32} />
          </div>

          <h1
            className="text-xl font-bold tracking-tight sm:text-2xl"
            style={{ color: "var(--school-text, #0F172A)" }}
          >
            Website sekolah belum dapat ditampilkan
          </h1>

          <p
            className="mt-3 text-sm leading-relaxed"
            style={{ color: "var(--school-secondary, #64748B)" }}
          >
            Data profil sekolah belum berhasil dimuat. Silakan periksa
            koneksi internet Anda atau coba kembali beberapa saat lagi.
          </p>
        </div>
      </main>
    );
  }

  /* -------------------------------------------------------
     NORMALISASI DATA
  ------------------------------------------------------- */

  const daftarHalaman = Array.isArray(halaman) ? halaman : [];

  const daftarKonfigurasi = normalizePublicConfig(konfigurasi);
  /* -------------------------------------------------------
     RENDER LAYOUT
  ------------------------------------------------------- */

  return (
    <div
      className="flex min-h-screen w-full flex-col"
      style={{
        backgroundColor: "var(--school-background, #F8FAFC)",
        color: "var(--school-text, #0F172A)",
      }}
    >
      <PublicNavbar
        sekolah={profil}
        halaman={daftarHalaman}
      />

     
<main className="flex w-full flex-1 flex-col">
  {children}

  {daftarKonfigurasi
    .filter(
      (item) =>
        String(item.status || "").toLowerCase() === "aktif"
    )
    .map((item) => (
      <PublicSection
        key={item.id || `${item.halaman}-${item.section}-${item.urutan}`}
        config={item}
      />
    ))}
</main>


      <PublicFooter
        sekolah={profil}
        halaman={daftarHalaman}
        konfigurasi={daftarKonfigurasi}
      />
    </div>
  );
}