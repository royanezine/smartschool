import { publikService } from "@/services/publik.service";
import {
  School,
  MapPin,
  Phone,
  Mail,
  Award,
  BookOpen,
  Building2,
  AlertCircle,
} from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const theme = {
  primary: "var(--school-primary, #2563EB)",
  secondary: "var(--school-secondary, #64748B)",
  accent: "var(--school-accent, #F59E0B)",
  background: "var(--school-background, #F8FAFC)",
  surface: "var(--school-surface, #FFFFFF)",
  text: "var(--school-text, #0F172A)",
  border: "var(--school-border, #E2E8F0)",
};

function getText(value, fallback = "") {
  return typeof value === "string" && value.trim()
    ? value.trim()
    : fallback;
}

function getInitial(value) {
  return getText(value, "S").charAt(0).toUpperCase();
}

function ThemeIcon({ children, className = "" }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center ${className}`}
      style={{
        color: theme.primary,
      }}
    >
      {children}
    </span>
  );
}

function InfoLabel({ children }) {
  return (
    <p
      className="text-xs font-semibold uppercase tracking-wider"
      style={{ color: theme.secondary }}
    >
      {children}
    </p>
  );
}

function InfoValue({ children }) {
  return (
    <p
      className="mt-1 break-words text-sm font-medium leading-6"
      style={{ color: theme.text }}
    >
      {children}
    </p>
  );
}

function ProfileCard({ children, className = "" }) {
  return (
    <section
      className={`min-w-0 rounded-2xl border p-6 shadow-sm sm:p-7 ${className}`}
      style={{
        backgroundColor: theme.surface,
        borderColor: theme.border,
      }}
    >
      {children}
    </section>
  );
}

function SectionHeading({ icon, children }) {
  return (
    <h2
      className="mb-6 flex items-center gap-3 text-lg font-bold sm:text-xl"
      style={{ color: theme.text }}
    >
      <ThemeIcon>{icon}</ThemeIcon>
      <span>{children}</span>
    </h2>
  );
}

function ErrorState({ tenant, notFound = false }) {
  return (
    <main
      className="flex min-h-screen items-center justify-center px-6 pt-32 pb-16"
      style={{
        backgroundColor: theme.background,
        color: theme.text,
      }}
    >
      <div
        className="w-full max-w-md rounded-2xl border p-8 text-center shadow-sm"
        style={{
          backgroundColor: theme.surface,
          borderColor: theme.border,
        }}
      >
        <div
          className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full"
          style={{
            backgroundColor:
              "color-mix(in srgb, var(--school-accent, #F59E0B) 12%, var(--school-surface, #FFFFFF))",
            color: theme.accent,
          }}
        >
          <AlertCircle size={32} />
        </div>

        <h1 className="text-xl font-bold" style={{ color: theme.text }}>
          {notFound
            ? "Profil sekolah tidak ditemukan"
            : "Profil sekolah belum dapat dimuat"}
        </h1>

        <p
          className="mt-3 text-sm leading-6"
          style={{ color: theme.secondary }}
        >
          {notFound
            ? "Data profil untuk sekolah ini belum tersedia."
            : `Terjadi kendala saat mengambil data profil sekolah ${tenant}. Periksa koneksi backend dan pastikan subdomain terdaftar.`}
        </p>
      </div>
    </main>
  );
}

export default async function ProfilSekolahPage({ params }) {
  const resolvedParams = await params;
  const tenant = resolvedParams?.tenant;

  if (!tenant) {
    return <ErrorState tenant="" notFound />;
  }

  let profil = null;

  try {
    profil = await publikService.getProfil(tenant);
  } catch (error) {
    console.error("[PROFIL SEKOLAH] Gagal mengambil data:", error);
    return <ErrorState tenant={tenant} />;
  }

  if (!profil || typeof profil !== "object") {
    return <ErrorState tenant={tenant} notFound />;
  }

  const namaSekolah = getText(profil.nama, "Sekolah");
  const jenjang = getText(profil.jenjang, "Institusi Pendidikan");
  const logo = getText(profil.logoBesarUrl) || getText(profil.logoKecilUrl);
  const alamat = getText(profil.alamat);
  const telepon = getText(profil.telepon);
  const email = getText(profil.email);
  const npsn = getText(profil.npsn);

  const deskripsi = getText(profil.deskripsi);
  const visi = getText(profil.visi);
  const misi = getText(profil.misi);

  return (
    <main
      className="min-h-screen pb-20 pt-32 sm:pb-24"
      style={{
        backgroundColor: theme.background,
        color: theme.text,
      }}
    >
      <section
        className="relative isolate overflow-hidden py-16 sm:py-20 lg:py-24"
        style={{
          backgroundColor: theme.primary,
        }}
      >
        <div
          className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full blur-3xl"
          style={{
            backgroundColor: theme.accent,
            opacity: 0.18,
          }}
        />

        <div
          className="pointer-events-none absolute -bottom-32 -right-20 h-80 w-80 rounded-full blur-3xl"
          style={{
            backgroundColor: theme.surface,
            opacity: 0.12,
          }}
        />

        <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-7 px-5 text-center sm:px-6 md:flex-row md:gap-10 md:text-left">
          {logo ? (
            <div
              className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-3xl border p-3 shadow-xl sm:h-36 sm:w-36"
              style={{
                backgroundColor: theme.surface,
                borderColor:
                  "color-mix(in srgb, var(--school-border, #E2E8F0) 75%, transparent)",
              }}
            >
              <img
                src={logo}
                alt={`Logo ${namaSekolah}`}
                className="h-full w-full object-contain"
              />
            </div>
          ) : (
            <div
              className="flex h-28 w-28 shrink-0 items-center justify-center rounded-3xl border text-white shadow-xl sm:h-36 sm:w-36"
              style={{
                backgroundColor:
                  "color-mix(in srgb, var(--school-surface, #FFFFFF) 15%, transparent)",
                borderColor:
                  "color-mix(in srgb, var(--school-surface, #FFFFFF) 25%, transparent)",
              }}
            >
              <School size={56} />
            </div>
          )}

          <div className="min-w-0">
            <div
              className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-widest"
              style={{
                color: "#FFFFFF",
                backgroundColor: "rgba(255,255,255,0.12)",
                borderColor: "rgba(255,255,255,0.25)",
              }}
            >
              <Building2 size={14} />
              Profil Institusi
            </div>

            <h1 className="mt-5 break-words text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
              {namaSekolah}
            </h1>

            <p className="mt-3 text-sm font-semibold sm:text-base" style={{ color: "#FFFFFF" }}>
              {jenjang}
            </p>

            <p
              className="mt-4 max-w-2xl text-sm leading-7 sm:text-base"
              style={{
                color: "rgba(255,255,255,0.85)",
              }}
            >
              {deskripsi ||
                `Informasi identitas, lokasi, dan kontak resmi ${namaSekolah}.`}
            </p>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-8 max-w-5xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          <ProfileCard className="sm:col-span-2 lg:col-span-3">
            <SectionHeading icon={<Award size={22} />}>
              Identitas & Legalitas
            </SectionHeading>

            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
              <div className="min-w-0">
                <InfoLabel>Nama Sekolah</InfoLabel>
                <InfoValue>{namaSekolah}</InfoValue>
              </div>

              <div className="min-w-0">
                <InfoLabel>NPSN</InfoLabel>
                <InfoValue>{npsn || "-"}</InfoValue>
              </div>

              <div className="min-w-0">
                <InfoLabel>Jenjang Pendidikan</InfoLabel>
                <InfoValue>{jenjang}</InfoValue>
              </div>
            </div>
          </ProfileCard>

          <ProfileCard className="sm:col-span-2 lg:col-span-2">
            <SectionHeading icon={<MapPin size={22} />}>
              Lokasi & Alamat
            </SectionHeading>

            <InfoLabel>Alamat Lengkap</InfoLabel>
            <p
              className="mt-2 whitespace-pre-line break-words text-sm leading-7"
              style={{ color: theme.secondary }}
            >
              {alamat || "Alamat sekolah belum diisi."}
            </p>
          </ProfileCard>

          <ProfileCard>
            <SectionHeading icon={<Phone size={22} />}>
              Kontak
            </SectionHeading>

            <div className="space-y-5">
              <div className="flex min-w-0 items-start gap-3">
                <span
                  className="mt-0.5 inline-flex shrink-0 items-center justify-center rounded-lg p-2"
                  style={{
                    color: theme.primary,
                    backgroundColor:
                      "color-mix(in srgb, var(--school-primary, #2563EB) 10%, var(--school-surface, #FFFFFF))",
                  }}
                >
                  <Phone size={15} />
                </span>

                <div className="min-w-0">
                  <InfoLabel>Telepon</InfoLabel>
                  {telepon ? (
                    <a
                      href={`tel:${telepon.replace(/[^\d+]/g, "")}`}
                      className="mt-1 block break-words text-sm font-medium hover:underline"
                      style={{ color: theme.text }}
                    >
                      {telepon}
                    </a>
                  ) : (
                    <InfoValue>-</InfoValue>
                  )}
                </div>
              </div>

              <div className="flex min-w-0 items-start gap-3">
                <span
                  className="mt-0.5 inline-flex shrink-0 items-center justify-center rounded-lg p-2"
                  style={{
                    color: theme.primary,
                    backgroundColor:
                      "color-mix(in srgb, var(--school-primary, #2563EB) 10%, var(--school-surface, #FFFFFF))",
                  }}
                >
                  <Mail size={15} />
                </span>

                <div className="min-w-0">
                  <InfoLabel>Email</InfoLabel>
                  {email ? (
                    <a
                      href={`mailto:${email}`}
                      className="mt-1 block break-all text-sm font-medium hover:underline"
                      style={{ color: theme.text }}
                    >
                      {email}
                    </a>
                  ) : (
                    <InfoValue>-</InfoValue>
                  )}
                </div>
              </div>
            </div>
          </ProfileCard>

          <ProfileCard className="sm:col-span-2 lg:col-span-3">
            <SectionHeading icon={<BookOpen size={22} />}>
              Tentang Sekolah
            </SectionHeading>

            <div
              className="max-w-none whitespace-pre-line break-words text-sm leading-7 sm:text-base"
              style={{ color: theme.secondary }}
            >
              {deskripsi ? (
                <p>{deskripsi}</p>
              ) : (
                <p>
                  Selamat datang di portal resmi {namaSekolah}. Informasi
                  mengenai profil dan kegiatan sekolah akan ditampilkan
                  melalui halaman ini.
                </p>
              )}

              {visi && (
                <div className="mt-6">
                  <h3
                    className="text-base font-bold"
                    style={{ color: theme.text }}
                  >
                    Visi
                  </h3>
                  <p className="mt-2">{visi}</p>
                </div>
              )}

              {misi && (
                <div className="mt-6">
                  <h3
                    className="text-base font-bold"
                    style={{ color: theme.text }}
                  >
                    Misi
                  </h3>
                  <p className="mt-2">{misi}</p>
                </div>
              )}
            </div>
          </ProfileCard>
        </div>

        <div
          className="mt-6 flex items-start gap-3 rounded-xl border p-4"
          style={{
            backgroundColor: theme.surface,
            borderColor: theme.border,
          }}
        >
          <ThemeIcon className="mt-0.5">
            <School size={18} />
          </ThemeIcon>

          <p
            className="text-xs leading-6 sm:text-sm"
            style={{ color: theme.secondary }}
          >
            Informasi profil ditampilkan berdasarkan data sekolah yang
            tersedia pada sistem SmartSchool.
          </p>
        </div>
      </section>
    </main>
  );
}