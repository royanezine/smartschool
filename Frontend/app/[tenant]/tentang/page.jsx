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
  ArrowUpRight,
  Globe,
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
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  if (typeof value === "number") {
    return String(value);
  }

  return fallback;
}

function ThemeIcon({ children, className = "" }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center ${className}`}
      style={{ color: theme.primary }}
    >
      {children}
    </span>
  );
}

function SectionHeading({ icon, children, description }) {
  return (
    <div className="mb-6 flex items-start gap-3">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
        style={{
          backgroundColor:
            "color-mix(in srgb, var(--school-primary, #2563EB) 8%, var(--school-surface, #FFFFFF))",
          color: theme.primary,
        }}
      >
        {icon}
      </div>

      <div className="min-w-0 pt-0.5">
        <h2
          className="text-sm font-semibold uppercase tracking-[0.12em] sm:text-[13px]"
          style={{ color: theme.text }}
        >
          {children}
        </h2>

        {description && (
          <p
            className="mt-1.5 text-sm leading-6"
            style={{ color: theme.secondary }}
          >
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div className="min-w-0">
      <p
        className="text-[11px] font-semibold uppercase tracking-[0.12em]"
        style={{ color: theme.secondary }}
      >
        {label}
      </p>

      <p
        className="mt-2 break-words text-sm font-semibold leading-6"
        style={{ color: theme.text }}
      >
        {value || "-"}
      </p>
    </div>
  );
}

function ProfileCard({ children, className = "" }) {
  return (
    <section
      className={`min-w-0 rounded-xl border p-5 transition-shadow duration-300 sm:p-7 ${className}`}
      style={{
        backgroundColor: theme.surface,
        borderColor: theme.border,
        boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
      }}
    >
      {children}
    </section>
  );
}

function ContactItem({ icon, label, value, href }) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
        style={{
          backgroundColor:
            "color-mix(in srgb, var(--school-primary, #2563EB) 7%, var(--school-surface, #FFFFFF))",
          color: theme.primary,
        }}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1 pt-0.5">
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.12em]"
          style={{ color: theme.secondary }}
        >
          {label}
        </p>

        {value ? (
          href ? (
            <a
              href={href}
              className="mt-1 block break-words text-sm font-medium leading-6 transition-colors duration-200 hover:underline"
              style={{ color: theme.text }}
            >
              {value}
            </a>
          ) : (
            <p
              className="mt-1 break-words text-sm font-medium leading-6"
              style={{ color: theme.text }}
            >
              {value}
            </p>
          )
        ) : (
          <p
            className="mt-1 text-sm"
            style={{ color: theme.secondary }}
          >
            Belum tersedia
          </p>
        )}
      </div>
    </div>
  );
}

function ErrorState({ tenant, notFound = false }) {
  return (
    <main
      className="flex min-h-[60vh] items-center justify-center px-5 py-16"
      style={{
        backgroundColor: theme.background,
        color: theme.text,
      }}
    >
      <div
        className="w-full max-w-md rounded-xl border p-8 text-center"
        style={{
          backgroundColor: theme.surface,
          borderColor: theme.border,
          boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
        }}
      >
        <div
          className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-lg"
          style={{
            backgroundColor:
              "color-mix(in srgb, var(--school-accent, #F59E0B) 10%, var(--school-surface, #FFFFFF))",
            color: theme.accent,
          }}
        >
          <AlertCircle size={24} />
        </div>

        <h1 className="text-lg font-semibold tracking-tight">
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
            : `Terjadi kendala saat mengambil profil sekolah ${tenant}. Silakan periksa koneksi server dan coba kembali.`}
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

  let response;

  try {
    response = await publikService.getProfil(tenant);
  } catch (error) {
    console.error("[PROFIL SEKOLAH] Gagal mengambil data:", error);
    return <ErrorState tenant={tenant} />;
  }

  let profil = response;

  for (let i = 0; i < 8; i++) {
    if (
      !profil ||
      typeof profil !== "object" ||
      Array.isArray(profil) ||
      !Object.prototype.hasOwnProperty.call(profil, "data")
    ) {
      break;
    }

    profil = profil.data;
  }

  if (
    profil?.sekolah &&
    typeof profil.sekolah === "object" &&
    !Array.isArray(profil.sekolah)
  ) {
    profil = profil.sekolah;
  }

  if (!profil || typeof profil !== "object" || Array.isArray(profil)) {
    return <ErrorState tenant={tenant} notFound />;
  }

  const namaSekolah = getText(profil.nama, "Sekolah");
  const jenjang = getText(profil.jenjang, "Institusi Pendidikan");

  const logo =
    getText(profil.logoBesarUrl) ||
    getText(profil.logoKecilUrl);

  const alamat = getText(profil.alamat);
  const telepon = getText(profil.telepon);
  const email = getText(profil.email);
  const npsn = getText(profil.npsn);
  const deskripsi = getText(profil.deskripsi);
  const visi = getText(profil.visi);
  const misi = getText(profil.misi);
  const website = getText(profil.website);

  const nomorTelepon = telepon.replace(/[^\d+]/g, "");

  return (
    <main
      className="min-h-screen w-full overflow-x-clip pb-14 sm:pb-20"
      style={{
        backgroundColor: theme.background,
        color: theme.text,
      }}
    >
      <section
        className="relative isolate w-full overflow-hidden"
        style={{
          backgroundColor: theme.primary,
        }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-40 -top-40 h-[460px] w-[460px] rounded-full blur-3xl"
          style={{
            backgroundColor: theme.accent,
            opacity: 0.1,
          }}
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-48 right-[-8%] h-[520px] w-[520px] rounded-full blur-3xl"
          style={{
            backgroundColor: theme.surface,
            opacity: 0.1,
          }}
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(115deg, rgba(15,23,42,0.15) 0%, transparent 55%)",
          }}
        />

        <div className="relative mx-auto flex w-full max-w-7xl flex-col items-center gap-8 px-5 py-16 sm:px-8 sm:py-20 md:flex-row md:gap-10 md:py-24 lg:gap-14 lg:px-12 lg:py-28">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center sm:h-28 sm:w-28 md:h-32 md:w-32">
            {logo ? (
              <div
                className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl border p-4"
                style={{
                  backgroundColor: "rgba(255,255,255,0.12)",
                  borderColor: "rgba(255,255,255,0.22)",
                  boxShadow: "0 12px 35px rgba(15,23,42,0.12)",
                  backdropFilter: "blur(6px)",
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
                className="flex h-full w-full items-center justify-center rounded-2xl border text-white"
                style={{
                  backgroundColor: "rgba(255,255,255,0.12)",
                  borderColor: "rgba(255,255,255,0.22)",
                  backdropFilter: "blur(6px)",
                }}
              >
                <School size={48} strokeWidth={1.6} />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 text-center md:text-left">
            <div
              className="inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] sm:text-[11px]"
              style={{
                color: "#FFFFFF",
                backgroundColor: "rgba(255,255,255,0.1)",
                borderColor: "rgba(255,255,255,0.2)",
              }}
            >
              <Building2 size={13} />
              Profil Institusi
            </div>

            <h1 className="mt-5 break-words text-3xl font-bold leading-[1.15] tracking-tight text-white sm:text-4xl md:text-5xl lg:text-[52px]">
              {namaSekolah}
            </h1>

            <div
              className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm font-medium md:justify-start sm:text-base"
              style={{ color: "rgba(255,255,255,0.9)" }}
            >
              <School size={16} />
              <span>{jenjang}</span>
            </div>

            <p
              className="mx-auto mt-6 max-w-2xl whitespace-pre-line text-sm leading-7 sm:text-base md:mx-0"
              style={{ color: "rgba(255,255,255,0.85)" }}
            >
              {deskripsi ||
                `Informasi identitas, lokasi, dan kontak resmi ${namaSekolah}.`}
            </p>

            {alamat && (
              <div
                className="mt-5 flex items-start justify-center gap-2 text-sm md:justify-start"
                style={{ color: "rgba(255,255,255,0.85)" }}
              >
                <MapPin size={16} className="mt-0.5 shrink-0" />
                <span className="max-w-xl whitespace-pre-line break-words">
                  {alamat}
                </span>
              </div>
            )}
          </div>

          <div
            className="hidden min-w-[160px] shrink-0 rounded-xl border p-5 lg:block"
            style={{
              backgroundColor: "rgba(255,255,255,0.08)",
              borderColor: "rgba(255,255,255,0.18)",
              backdropFilter: "blur(6px)",
            }}
          >
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.18em]"
              style={{ color: "rgba(255,255,255,0.72)" }}
            >
              Jenjang
            </p>

            <p className="mt-2 break-words text-base font-semibold text-white">
              {jenjang}
            </p>

            {npsn && (
              <>
                <div
                  className="my-4 border-t"
                  style={{ borderColor: "rgba(255,255,255,0.2)" }}
                />

                <p
                  className="text-[10px] font-semibold uppercase tracking-[0.18em]"
                  style={{ color: "rgba(255,255,255,0.72)" }}
                >
                  NPSN
                </p>

                <p className="mt-2 break-words text-sm font-semibold text-white">
                  {npsn}
                </p>
              </>
            )}
          </div>
        </div>

        <div
          className="absolute inset-x-0 bottom-0 h-px"
          style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
        />
      </section>

      <section className="relative mx-auto w-full max-w-7xl px-4 pt-8 sm:px-8 sm:pt-10 lg:px-12">
        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-3 lg:gap-6">
          <ProfileCard className="lg:col-span-2">
            <SectionHeading
              icon={<Award size={18} />}
              description="Informasi resmi dan identitas institusi pendidikan."
            >
              Identitas & Legalitas
            </SectionHeading>

            <div
              className="mb-6 h-px w-full"
              style={{ backgroundColor: theme.border }}
            />

            <div className="grid gap-x-6 gap-y-6 sm:grid-cols-2 xl:grid-cols-3">
              <InfoItem label="Nama Sekolah" value={namaSekolah} />
              <InfoItem label="NPSN" value={npsn} />
              <InfoItem label="Jenjang Pendidikan" value={jenjang} />
            </div>
          </ProfileCard>

          <ProfileCard>
            <SectionHeading
              icon={<Phone size={18} />}
              description="Saluran komunikasi resmi sekolah."
            >
              Informasi Kontak
            </SectionHeading>

            <div
              className="mb-6 h-px w-full"
              style={{ backgroundColor: theme.border }}
            />

            <div className="space-y-5">
              <ContactItem
                icon={<Phone size={15} />}
                label="Nomor Telepon"
                value={telepon}
                href={telepon ? `tel:${nomorTelepon}` : undefined}
              />

              <ContactItem
                icon={<Mail size={15} />}
                label="Alamat Email"
                value={email}
                href={email ? `mailto:${email}` : undefined}
              />

              {website && (
                <ContactItem
                  icon={<Globe size={15} />}
                  label="Website"
                  value={website}
                  href={
                    /^https?:\/\//i.test(website)
                      ? website
                      : `https://${website}`
                  }
                />
              )}
            </div>
          </ProfileCard>

          <ProfileCard className="lg:col-span-1">
            <SectionHeading
              icon={<MapPin size={18} />}
              description="Lokasi dan alamat institusi."
            >
              Lokasi Sekolah
            </SectionHeading>

            <div
              className="mb-5 h-px w-full"
              style={{ backgroundColor: theme.border }}
            />

            <p
              className="whitespace-pre-line break-words text-sm leading-7"
              style={{ color: theme.secondary }}
            >
              {alamat || "Alamat sekolah belum diisi."}
            </p>

            {alamat && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(alamat)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group/loc mt-5 inline-flex items-center gap-2 text-sm font-semibold transition-opacity duration-200 hover:opacity-75"
                style={{ color: theme.primary }}
              >
                Lihat lokasi
                <ArrowUpRight
                  size={15}
                  className="transition-transform duration-300 group-hover/loc:translate-x-0.5 group-hover/loc:-translate-y-0.5"
                />
              </a>
            )}
          </ProfileCard>

          <ProfileCard className="lg:col-span-2">
            <SectionHeading
              icon={<BookOpen size={18} />}
              description="Kenali visi, misi, dan informasi institusi."
            >
              Tentang Sekolah
            </SectionHeading>

            <div
              className="mb-6 h-px w-full"
              style={{ backgroundColor: theme.border }}
            />

            <div className="space-y-7">
              <div>
                <h3
                  className="text-[11px] font-semibold uppercase tracking-[0.12em]"
                  style={{ color: theme.secondary }}
                >
                  Deskripsi Sekolah
                </h3>

                <p
                  className="mt-2.5 whitespace-pre-line break-words text-sm leading-7"
                  style={{ color: theme.text }}
                >
                  {deskripsi ||
                    `Selamat datang di portal resmi ${namaSekolah}. Informasi mengenai profil dan kegiatan sekolah akan ditampilkan melalui website ini.`}
                </p>
              </div>

              {visi && (
                <div
                  className="border-t pt-6"
                  style={{ borderColor: theme.border }}
                >
                  <h3
                    className="text-[11px] font-semibold uppercase tracking-[0.12em]"
                    style={{ color: theme.secondary }}
                  >
                    Visi
                  </h3>

                  <p
                    className="mt-2.5 whitespace-pre-line break-words text-sm leading-7"
                    style={{ color: theme.text }}
                  >
                    {visi}
                  </p>
                </div>
              )}

              {misi && (
                <div
                  className="border-t pt-6"
                  style={{ borderColor: theme.border }}
                >
                  <h3
                    className="text-[11px] font-semibold uppercase tracking-[0.12em]"
                    style={{ color: theme.secondary }}
                  >
                    Misi
                  </h3>

                  <p
                    className="mt-2.5 whitespace-pre-line break-words text-sm leading-7"
                    style={{ color: theme.text }}
                  >
                    {misi}
                  </p>
                </div>
              )}
            </div>
          </ProfileCard>
        </div>

        <div
          className="mt-6 flex items-start gap-3 rounded-xl border px-4 py-4 sm:px-5"
          style={{
            backgroundColor: theme.surface,
            borderColor: theme.border,
            boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
          }}
        >
          <ThemeIcon className="mt-0.5">
            <School size={16} />
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