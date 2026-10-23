
import PublicNavbar from "./PublicNavbar";
import PublicFooter from "./PublicFooter";
import PublicTheme from "./PublicTheme";
import { publikService } from "@/services/publik.service";

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
    console.error("[PUBLIC LAYOUT] Gagal mengambil profil:", profilResult.reason);
  }

  if (temaResult.status === "rejected") {
    console.error("[PUBLIC LAYOUT] Gagal mengambil tema:", temaResult.reason);
  }

  if (halamanResult.status === "rejected") {
    console.error("[PUBLIC LAYOUT] Gagal mengambil halaman:", halamanResult.reason);
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

export default function PublicLayout({
  profil,
  tema,
  halaman = [],
  konfigurasi = [],
  children,
}) {
  if (!profil) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-16">
        <div
          className="w-full max-w-lg rounded-2xl border p-8 text-center shadow-sm"
          style={{
            backgroundColor: "var(--warna-netral-putih, #FFFFFF)",
            borderColor: "var(--warna-netral-garis, #E2E8F0)",
            color: "var(--warna-netral-teks, #0F172A)",
          }}
        >
          <div
            className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{
              backgroundColor: "var(--warna-netral-latar, #F8FAFC)",
              color: "var(--warna-primer-utama, #2563EB)",
            }}
          >
            <svg
              width="27"
              height="27"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 21h18" />
              <path d="M5 21V7l7-4 7 4v14" />
              <path d="M9 21v-5h6v5" />
              <path d="M9 9h.01M15 9h.01M9 12h.01M15 12h.01" />
            </svg>
          </div>

          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            Website sekolah belum dapat ditampilkan
          </h1>

          <p
            className="mt-3 text-sm leading-6"
            style={{ color: "var(--warna-netral-teksLembut, #64748B)" }}
          >
            Data profil sekolah belum berhasil dimuat. Silakan periksa
            koneksi atau coba kembali beberapa saat lagi.
          </p>
        </div>
      </main>
    );
  }

  const daftarHalaman = Array.isArray(halaman) ? halaman : [];
  const daftarKonfigurasi = konfigurasi ?? [];

  return (
    <>
      <PublicTheme tema={tema} />

      <div
        className="flex min-h-screen w-full flex-col"
        style={{
          backgroundColor: "var(--warna-netral-latar, #F8FAFC)",
          color: "var(--warna-netral-teks, #0F172A)",
        }}
      >
        <PublicNavbar sekolah={profil} halaman={daftarHalaman} />

        <main className="min-w-0 w-full flex-1">
          <div className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
            {children}
          </div>
        </main>

        <PublicFooter
          sekolah={profil}
          halaman={daftarHalaman}
          konfigurasi={daftarKonfigurasi}
        />
      </div>
    </>
  );
}
