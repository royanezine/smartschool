
import {
  loadPublicLayout,
} from "@/app/components/tenant/PublicLayout";

import PublicLayout from "@/app/components/tenant/PublicLayout";
import PublicTheme from "@/app/components/tenant/PublicTheme";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function TenantLayout({ children, params }) {
  const resolvedParams = await params;
  const tenant = resolvedParams?.tenant;

  if (!tenant) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-16 text-slate-900">
        <div className="max-w-lg text-center">
          <h1 className="text-2xl font-bold">
            Subdomain sekolah tidak ditemukan
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            Parameter tenant tidak tersedia pada alamat website ini.
            Pastikan URL menggunakan subdomain sekolah yang valid.
          </p>
        </div>
      </main>
    );
  }

  let data = {
    profil: null,
    tema: null,
    halaman: [],
    konfigurasi: [],
  };

  let loadError = null;

  try {
    const result = await loadPublicLayout(tenant);

    data = {
      profil: result?.profil ?? null,
      tema: result?.tema ?? null,
      halaman: Array.isArray(result?.halaman)
        ? result.halaman
        : [],
      konfigurasi: Array.isArray(result?.konfigurasi)
        ? result.konfigurasi
        : result?.konfigurasi ?? [],
    };
  } catch (error) {
    loadError =
      error instanceof Error
        ? error.message
        : "Terjadi kesalahan ketika mengambil data website.";

    console.error(
      `[TENANT LAYOUT] Gagal memuat data tenant "${tenant}":`,
      error
    );
  }

  return (
    <>
      {/* Mengambil tema berdasarkan subdomain sekolah */}
      <PublicTheme tenant={tenant} />

      {/* Pesan error hanya ditampilkan ketika development */}
      {loadError && process.env.NODE_ENV === "development" && (
        <div className="border-b border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <strong>Data website gagal dimuat.</strong>

          <p className="mt-1 break-words">{loadError}</p>
        </div>
      )}

      {/* Layout publik tetap menangani profil, navbar, dan footer */}
      <PublicLayout
        profil={data.profil}
        tema={data.tema}
        halaman={data.halaman}
        konfigurasi={data.konfigurasi}
      >
        {children}
      </PublicLayout>
    </>
  );
}
