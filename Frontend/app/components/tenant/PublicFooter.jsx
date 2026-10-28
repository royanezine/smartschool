"use client";

import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Phone,
  Mail,
  ArrowUpRight,
  Camera,
  Play,
  Globe,
} from "lucide-react";

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeSection(value) {
  return text(value).toLowerCase().replace(/[\s_-]/g, "");
}

function normalizeUrl(value) {
  const url = text(value);
  if (!url) return "";

  if (/^(https?:\/\/|mailto:|tel:)/i.test(url)) return url;
  if (url.startsWith("//")) return `https:${url}`;

  return `https://${url}`;
}

function isExternalUrl(value) {
  return /^(https?:\/\/|mailto:|tel:)/i.test(text(value));
}

function internalLink(value, base) {
  const link = text(value);
  if (!link) return "";

  if (/^(https?:\/\/|mailto:|tel:)/i.test(link)) return link;
  if (link.startsWith("//")) return `https:${link}`;
  if (link === base || link.startsWith(`${base}/`)) return link;
  if (link.startsWith("/")) return `${base}${link}`;

  return `${base}/${link.replace(/^\/+/, "")}`;
}

function unwrapConfigurations(value) {
  let result = value;

  for (let i = 0; i < 6; i += 1) {
    if (!result || typeof result !== "object") return [];

    if (Array.isArray(result)) {
      return result.filter((item) => item && typeof item === "object");
    }

    if (result.data && typeof result.data === "object") {
      result = result.data;
      continue;
    }

    if (result.konfigurasi && typeof result.konfigurasi === "object") {
      result = result.konfigurasi;
      continue;
    }

    break;
  }

  if (!result || typeof result !== "object") return [];
  if (Array.isArray(result)) return result;
  if (result.halaman && result.section) return [result];

  const configs = [];

  for (const [halaman, sections] of Object.entries(result)) {
    if (!sections || typeof sections !== "object") continue;

    if (Array.isArray(sections)) {
      sections.forEach((item) => {
        if (item && typeof item === "object") {
          configs.push({ ...item, halaman: item.halaman || halaman });
        }
      });
      continue;
    }

    if (
      "section" in sections ||
      "judul" in sections ||
      "konten" in sections ||
      "ctaText" in sections ||
      "ctaLink" in sections
    ) {
      configs.push({ ...sections, halaman: sections.halaman || halaman });
      continue;
    }

    for (const [section, item] of Object.entries(sections)) {
      if (!item || typeof item !== "object" || Array.isArray(item)) continue;

      configs.push({
        ...item,
        halaman: item.halaman || halaman,
        section: item.section || section,
      });
    }
  }

  return configs;
}

function findConfig(configs, halaman, section) {
  return (
    configs.find(
      (item) =>
        normalizeSection(item?.halaman) === normalizeSection(halaman) &&
        normalizeSection(item?.section) === normalizeSection(section)
    ) || null
  );
}

function validPages(pages) {
  if (!Array.isArray(pages)) return [];

  return pages.filter((item) => {
    if (!item?.slug || !item?.judul) return false;

    const slug = text(item.slug).toLowerCase();
    const status = text(item.status).toLowerCase();

    return (
      !["articles", "artikel", "berita"].includes(slug) &&
      !["nonaktif", "inactive", "draft"].includes(status)
    );
  });
}

const theme = {
  primary: "var(--school-primary, #2563EB)",
  secondary: "var(--school-secondary, #64748B)",
  accent: "var(--school-accent, #F59E0B)",
  background: "var(--school-background, #F8FAFC)",
  surface: "var(--school-surface, #FFFFFF)",
  text: "var(--school-text, #0F172A)",
  border: "var(--school-border, #E2E8F0)",
};

function FooterLink({ href, children }) {
  if (!href) return null;

  const classes =
    "inline-flex max-w-full items-center gap-1 break-words text-sm transition-colors";

  const style = { color: theme.secondary };

  if (isExternalUrl(href)) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
        style={style}
      >
        <span>{children}</span>
        <ArrowUpRight size={13} className="shrink-0" />
      </a>
    );
  }

  return (
    <Link href={href} className={classes} style={style}>
      {children}
    </Link>
  );
}

function SocialLink({ href, label }) {
  if (!href) return null;

  const lower = text(label).toLowerCase();

  const Icon = lower.includes("instagram")
    ? Camera
    : lower.includes("youtube") || lower.includes("youtu.be")
      ? Play
      : Globe;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="inline-flex max-w-full items-center gap-2 break-words text-sm transition-colors"
      style={{ color: theme.secondary }}
    >
      <Icon size={17} className="shrink-0" />
      <span className="break-all">{label}</span>
      <ArrowUpRight size={12} className="shrink-0" />
    </a>
  );
}

function FooterHeading({ children }) {
  return (
    <h3
      className="break-words text-sm font-bold tracking-tight"
      style={{ color: theme.text }}
    >
      {children}
    </h3>
  );
}

export default function PublicFooter({
  sekolah = {},
  halaman = [],
  konfigurasi = [],
}) {
  const subdomain = text(sekolah.subdomain);
  const base = subdomain ? `/${subdomain}` : "/";

  const namaSekolah = text(sekolah.nama) || "Sekolah";
  const jenjang = text(sekolah.jenjang);
  const logo = text(sekolah.logoBesarUrl) || text(sekolah.logoKecilUrl);
  const alamat = text(sekolah.alamat);
  const telepon = text(sekolah.telepon);
  const email = text(sekolah.email);

  const configs = unwrapConfigurations(konfigurasi).filter((item) => {
    const status = text(item?.status).toLowerCase();

    return !["nonaktif", "inactive", "draft"].includes(status);
  });

  const identitas = findConfig(configs, "footer", "identitas");
  const navigasi = findConfig(configs, "footer", "navigasi");

  const infoKontak =
    findConfig(configs, "kontak", "info_utama") ||
    findConfig(configs, "footer", "kontak");

  const infoSosmed =
    findConfig(configs, "kontak", "sosmed") ||
    findConfig(configs, "footer", "mediasosial");

  const judulIdentitas = text(identitas?.judul) || namaSekolah;
  const deskripsi = text(identitas?.konten) || text(sekolah.deskripsi);
  const subJudulIdentitas = text(identitas?.subJudul) || jenjang;
  const gambarIdentitas = text(identitas?.gambarUrl) || logo;

  const pages = validPages(halaman);

  const socials = [
    { nama: "Instagram", url: normalizeUrl(sekolah.instagramUrl) },
    { nama: "Facebook", url: normalizeUrl(sekolah.facebookUrl) },
    { nama: "YouTube", url: normalizeUrl(sekolah.youtubeUrl) },
  ].filter((item) => item.url);

  if (socials.length === 0 && text(infoSosmed?.ctaLink)) {
    socials.push({
      nama:
        text(infoSosmed?.ctaText) ||
        text(infoSosmed?.judul) ||
        "Media Sosial",
      url: normalizeUrl(infoSosmed.ctaLink),
    });
  }

  const tahun = new Date().getFullYear();

  return (
    <footer
      className="mt-auto border-t"
      style={{
        backgroundColor: theme.surface,
        borderColor: theme.border,
        color: theme.text,
      }}
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
        <div className="grid grid-cols-1 gap-9 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          {/* IDENTITAS SEKOLAH */}
          <section className="min-w-0">
            <div className="mb-4 flex items-center gap-3">
              {gambarIdentitas ? (
                <div
                  className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border p-1"
                  style={{
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                  }}
                >
                  <Image
                    src={gambarIdentitas}
                    alt={`Logo ${namaSekolah}`}
                    fill
                    sizes="48px"
                    unoptimized
                    className="object-contain p-1"
                  />
                </div>
              ) : (
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-bold text-white"
                  style={{ backgroundColor: theme.primary }}
                >
                  {namaSekolah.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="min-w-0">
                <FooterHeading>{judulIdentitas}</FooterHeading>

                {subJudulIdentitas && (
                  <p
                    className="mt-1 text-xs"
                    style={{ color: theme.secondary }}
                  >
                    {subJudulIdentitas}
                  </p>
                )}
              </div>
            </div>

            {deskripsi && (
              <p
                className="whitespace-pre-line break-words text-sm leading-6"
                style={{ color: theme.secondary }}
              >
                {deskripsi}
              </p>
            )}

            {alamat && (
              <div className="mt-4 flex items-start gap-2 text-sm leading-6">
                <MapPin
                  size={16}
                  className="mt-1 shrink-0"
                  style={{ color: theme.primary }}
                />
                <span
                  className="break-words"
                  style={{ color: theme.secondary }}
                >
                  {alamat}
                </span>
              </div>
            )}

            {text(identitas?.ctaText) && text(identitas?.ctaLink) && (
              <div className="mt-4">
                <FooterLink href={internalLink(identitas.ctaLink, base)}>
                  {identitas.ctaText}
                </FooterLink>
              </div>
            )}
          </section>

          {/* NAVIGASI WEBSITE */}
          <section className="min-w-0">
            <FooterHeading>
              {text(navigasi?.judul) || "Jelajahi Website"}
            </FooterHeading>

            {text(navigasi?.konten) && (
              <p
                className="mt-2 whitespace-pre-line text-sm leading-6"
                style={{ color: theme.secondary }}
              >
                {navigasi.konten}
              </p>
            )}

            <ul className="mt-4 space-y-3">
              <li>
                <FooterLink href={base}>Beranda</FooterLink>
              </li>
              <li>
                <FooterLink href={`${base}/tentang`}>Tentang Sekolah</FooterLink>
              </li>
              <li>
                <FooterLink href={`${base}/articles`}>Berita & Artikel</FooterLink>
              </li>

              {pages.map((item) => (
                <li key={item.id || item.slug}>
                  <FooterLink
                    href={`${base}/${String(item.slug).replace(/^\/+/, "")}`}
                  >
                    {item.judul}
                  </FooterLink>
                </li>
              ))}
            </ul>
          </section>

          {/* INFORMASI KONTAK */}
          <section className="min-w-0">
            <FooterHeading>
              {text(infoKontak?.judul) || "Hubungi Kami"}
            </FooterHeading>

            <div className="mt-4 space-y-4">
              {telepon && (
                <a
                  href={`tel:${telepon.replace(/[^\d+]/g, "")}`}
                  className="flex items-start gap-2 text-sm transition-colors"
                  style={{ color: theme.secondary }}
                >
                  <Phone
                    size={16}
                    className="mt-0.5 shrink-0"
                    style={{ color: theme.primary }}
                  />
                  <span className="break-words">{telepon}</span>
                </a>
              )}

              {email && (
                <a
                  href={`mailto:${email}`}
                  className="flex items-start gap-2 text-sm transition-colors"
                  style={{ color: theme.secondary }}
                >
                  <Mail
                    size={16}
                    className="mt-0.5 shrink-0"
                    style={{ color: theme.primary }}
                  />
                  <span className="break-all">{email}</span>
                </a>
              )}

              {text(infoKontak?.konten) && (
                <p
                  className="whitespace-pre-line text-sm leading-6"
                  style={{ color: theme.secondary }}
                >
                  {infoKontak.konten}
                </p>
              )}

              {!telepon && !email && !text(infoKontak?.konten) && (
                <p
                  className="text-sm leading-6"
                  style={{ color: theme.secondary }}
                >
                  Informasi kontak belum tersedia.
                </p>
              )}
            </div>
          </section>

          {/* MEDIA SOSIAL */}
          <section className="min-w-0">
            <FooterHeading>
              {text(infoSosmed?.judul) || "Ikuti Kami"}
            </FooterHeading>

            {text(infoSosmed?.konten) && (
              <p
                className="mt-3 whitespace-pre-line text-sm leading-6"
                style={{ color: theme.secondary }}
              >
                {infoSosmed.konten}
              </p>
            )}

            {socials.length > 0 ? (
              <div className="mt-4 flex flex-col items-start gap-3">
                {socials.map((item) => (
                  <SocialLink
                    key={item.nama}
                    href={item.url}
                    label={item.nama}
                  />
                ))}
              </div>
            ) : (
              <p
                className="mt-3 text-sm leading-6"
                style={{ color: theme.secondary }}
              >
                Media sosial belum tersedia.
              </p>
            )}
          </section>
        </div>

        {/* COPYRIGHT */}
        <div
          className="mt-10 flex flex-col gap-2 border-t pt-5 text-xs leading-5 sm:flex-row sm:items-center sm:justify-between"
          style={{
            borderColor: theme.border,
            color: theme.secondary,
          }}
        >
          <p>
            © {tahun} {namaSekolah}. Hak cipta dilindungi.
          </p>

          <p>
            SmartSchool — All-in-One School Management System
          </p>
        </div>
      </div>
    </footer>
  );
}