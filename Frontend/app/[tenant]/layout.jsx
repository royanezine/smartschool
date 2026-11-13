import PublicLayout, {
  loadPublicLayout,
} from "@/app/components/tenant/PublicLayout";

import PublicTheme from "@/app/components/tenant/PublicTheme";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const RESERVED_TENANTS = [
  "www",
  "api",
  "admin",
  "guru",
  "siswa",
  "yayasan",
  "super-admin",
  "login",
  "register",
  "forgot-password",
  "onboarding",
  "pin",
  ".git",
];

function isValidTenant(value) {
  if (typeof value !== "string") {
    return false;
  }

  const tenant = value.trim().toLowerCase();

  if (
    !tenant ||
    RESERVED_TENANTS.includes(tenant)
  ) {
    return false;
  }

  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(tenant);
}

function TenantNotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-16 text-slate-900">
      <div className="max-w-lg text-center">
        <h1 className="text-2xl font-bold">
          Website Sekolah Tidak Ditemukan
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          Subdomain sekolah tidak valid atau website
          sekolah belum tersedia.
        </p>
      </div>
    </main>
  );
}

export default async function TenantLayout({
  children,
  params,
}) {
  const resolvedParams = await params;

  const tenant = String(
    resolvedParams?.tenant || ""
  )
    .trim()
    .toLowerCase();

  if (!isValidTenant(tenant)) {
    return <TenantNotFound />;
  }

  let data = {
    profil: null,
    tema: null,
    halaman: [],
    konfigurasi: {},
  };

  try {
    const result = await loadPublicLayout(tenant);

    data = {
      profil: result?.profil ?? null,

      tema: result?.tema ?? null,

      halaman: Array.isArray(result?.halaman)
        ? result.halaman
        : [],

      konfigurasi:
        result?.konfigurasi ?? {},
    };
  } catch (error) {
    console.error(
      `[TENANT LAYOUT] Gagal memuat tenant "${tenant}":`,
      error
    );
  }

  return (
    <>
      <PublicTheme tenant={tenant} />

      <PublicLayout
        subdomain={tenant}
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