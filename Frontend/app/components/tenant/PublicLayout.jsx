import PublicNavbar from "./PublicNavbar";
import PublicFooter from "./PublicFooter";
import PublicSection from "./PublicSection";

import { publikService } from "@/services/publik.service";
import { normalizePublicConfig } from "./normalizePublicConfig";

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
  if (typeof value !== "string") return false;

  const tenant = value.trim().toLowerCase();

  if (
    !tenant ||
    RESERVED_TENANTS.includes(tenant)
  ) {
    return false;
  }

  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(tenant);
}

export async function loadPublicLayout(subdomain) {
  const tenant = String(subdomain || "")
    .trim()
    .toLowerCase();

  if (!isValidTenant(tenant)) {
    console.warn(
      "[PUBLIC LAYOUT] Subdomain tidak valid:",
      subdomain
    );

    return {
      profil: null,
      tema: null,
      halaman: [],
      konfigurasi: {},
    };
  }

  console.log(
    `[PUBLIC LAYOUT] Memuat website tenant: ${tenant}`
  );

  const [
    profilResult,
    temaResult,
    halamanResult,
    konfigurasiResult,
  ] = await Promise.allSettled([
    publikService.getProfil(tenant),
    publikService.getTema(tenant),
    publikService.getDaftarHalaman(tenant),
    publikService.getKonfigurasi(tenant),
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
      ? konfigurasiResult.value ?? {}
      : {};

  const results = [
    {
      name: "profil",
      result: profilResult,
    },
    {
      name: "tema",
      result: temaResult,
    },
    {
      name: "halaman",
      result: halamanResult,
    },
    {
      name: "konfigurasi",
      result: konfigurasiResult,
    },
  ];

  results.forEach(({ name, result }) => {
    if (result.status === "rejected") {
      console.error(
        `[PUBLIC LAYOUT] Gagal mengambil ${name} untuk tenant "${tenant}":`,
        result.reason
      );
    }
  });

  return {
    profil,
    tema,
    halaman,
    konfigurasi,
  };
}

export default function PublicLayout({
  subdomain,
  profil,
  tema,
  halaman = [],
  konfigurasi = {},
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
      String(item?.status || "").toLowerCase() ===
      "aktif"
  );

  return (
    <div
      className="relative flex min-h-screen w-full flex-col"
      data-school-subdomain={subdomain}
      style={{
        margin: 0,
        padding: 0,
        backgroundColor:
          "var(--school-background, #F8FAFC)",
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