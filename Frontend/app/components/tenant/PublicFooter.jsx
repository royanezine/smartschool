"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  MapPin,
  Phone,
  Mail,
  ArrowUpRight,
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
        halaman:
          item.halamanCms?.slug ||
          item.halamanCms?.nama ||
          item.halamanCms?.judul ||
          item.halaman ||
          halaman,
        section: item.section || section,
      });
    }
  }

  return configs;
}

function findConfig(configs, halaman, section) {
  const targetHalaman = normalizeSection(halaman);
  const targetSection = normalizeSection(section);

  const exactMatch = configs.find((item) => {
    const namaHalaman =
      item?.halamanCms?.slug ||
      item?.halamanCms?.nama ||
      item?.halamanCms?.judul ||
      item?.halamanSlug ||
      item?.halaman;

    return (
      normalizeSection(namaHalaman) === targetHalaman &&
      normalizeSection(item?.section) === targetSection
    );
  });

  if (exactMatch) return exactMatch;

  return (
    configs.find(
      (item) => normalizeSection(item?.section) === targetSection
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

/* ============================================================
   THEME
   ============================================================ */
const theme = {
  primary: "var(--school-primary, #2563EB)",
  secondary: "var(--school-secondary, #64748B)",
  accent: "var(--school-accent, #F59E0B)",
  background: "var(--school-background, #F8FAFC)",
  surface: "var(--school-surface, #FFFFFF)",
  text: "var(--school-text, #0F172A)",
  border: "var(--school-border, #E2E8F0)",
};

/* ============================================================
   BRAND ICONS (SVG Murni agar tidak perlu install library baru)
   ============================================================ */
const BrandIcons = {
  instagram: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
  ),
  facebook: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
    </svg>
  ),
  youtube: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
    </svg>
  ),
  twitter: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
    </svg>
  ),
  linkedin: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
      <rect x="2" y="9" width="4" height="12"></rect>
      <circle cx="4" cy="4" r="2"></circle>
    </svg>
  ),
  tiktok: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
    </svg>
  ),
  whatsapp: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
    </svg>
  ),
  globe: (props) => <Globe {...props} />,
};

/* ============================================================
   REVEAL — animasi scroll
   ============================================================ */
function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, visible];
}

function RevealSection({ children, delay = 0, className = "" }) {
  const [ref, visible] = useReveal();

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}

/* ============================================================
   LINK
   ============================================================ */
function FooterLink({ href, children }) {
  if (!href) return null;

  const classes =
    "group/link relative inline-flex max-w-full items-center gap-1.5 break-words text-sm transition-colors duration-300";
  const style = { color: theme.secondary };

  const content = (
    <>
      <span className="relative">
        {children}
        <span
          className="absolute -bottom-0.5 left-0 h-px w-0 transition-all duration-500 ease-out group-hover/link:w-full"
          style={{ backgroundColor: theme.primary }}
        />
      </span>
      {isExternalUrl(href) && (
        <ArrowUpRight
          size={12}
          className="shrink-0 opacity-0 transition-all duration-300 group-hover/link:translate-x-0.5 group-hover/link:opacity-100"
        />
      )}
    </>
  );

  const onEnter = (e) => (e.currentTarget.style.color = theme.primary);
  const onLeave = (e) => (e.currentTarget.style.color = theme.secondary);

  if (isExternalUrl(href)) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
        style={style}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      href={href}
      className={classes}
      style={style}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {content}
    </Link>
  );
}


function SocialLink({ href, label }) {
  if (!href) return null;

  const lower = text(label).toLowerCase();
  
  const Icon =
    lower.includes("instagram") || lower.includes("ig")
      ? BrandIcons.instagram
      : lower.includes("facebook") || lower.includes("fb")
        ? BrandIcons.facebook
        : lower.includes("youtube") || lower.includes("youtu.be")
          ? BrandIcons.youtube
          : lower.includes("twitter") || lower.includes("x.com")
            ? BrandIcons.twitter
            : lower.includes("linkedin")
              ? BrandIcons.linkedin
              : lower.includes("tiktok")
                ? BrandIcons.tiktok
                : lower.includes("whatsapp") || lower.includes("wa")
                  ? BrandIcons.whatsapp
                  : BrandIcons.globe;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="group/social inline-flex max-w-full items-center gap-3 break-words text-sm transition-colors duration-300"
      style={{ color: theme.secondary }}
      onMouseEnter={(e) => (e.currentTarget.style.color = theme.primary)}
      onMouseLeave={(e) => (e.currentTarget.style.color = theme.secondary)}
    >
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-all duration-300 group-hover/social:-translate-y-0.5 group-hover/social:shadow-sm"
        style={{
          borderColor: theme.border,
          backgroundColor: theme.surface,
        }}
      >
        {/* Render SVG Icon */}
        <Icon size={16} className="shrink-0" />
      </span>
      <span className="break-all font-medium">{label}</span>
      <ArrowUpRight
        size={12}
        className="shrink-0 opacity-0 transition-all duration-300 group-hover/social:translate-x-0.5 group-hover/social:opacity-100"
      />
    </a>
  );
}

/* ============================================================
   HEADING
   ============================================================ */
function FooterHeading({ children }) {
  return (
    <div className="mb-5">
      <h3
        className="text-[11px] font-semibold uppercase tracking-[0.18em]"
        style={{ color: theme.text }}
      >
        {children}
      </h3>
      <span
        className="mt-3 block h-px w-6"
        style={{ backgroundColor: theme.primary, opacity: 0.6 }}
      />
    </div>
  );
}

/* ============================================================
   MAIN COMPONENT
   ============================================================ */
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
      className="relative mt-auto overflow-hidden border-t"
      style={{
        backgroundColor: theme.surface,
        borderColor: theme.border,
        color: theme.text,
      }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${theme.primary}, transparent)`,
          opacity: 0.35,
        }}
      />

      <div className="relative mx-auto w-full max-w-7xl px-5 py-14 sm:px-8 sm:py-16 lg:px-10 lg:py-20">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-12 lg:gap-10">
          
          {/* IDENTITAS */}
          <RevealSection delay={0} className="lg:col-span-4">
            <section className="min-w-0">
              <div className="flex items-center gap-3">
                {gambarIdentitas ? (
                  <div
                    className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border p-1.5"
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
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-base font-bold text-white"
                    style={{ backgroundColor: theme.primary }}
                  >
                    {namaSekolah.charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="min-w-0">
                  <h3 className="truncate text-base font-semibold tracking-tight">
                    {judulIdentitas}
                  </h3>
                  {subJudulIdentitas && (
                    <p
                      className="mt-0.5 text-[11px] uppercase tracking-[0.15em]"
                      style={{ color: theme.secondary }}
                    >
                      {subJudulIdentitas}
                    </p>
                  )}
                </div>
              </div>

              {deskripsi && (
                <p
                  className="mt-6 max-w-sm whitespace-pre-line break-words text-sm leading-relaxed"
                  style={{ color: theme.secondary }}
                >
                  {deskripsi}
                </p>
              )}

              {alamat && (
                <div className="mt-6 flex items-start gap-2.5 text-sm leading-relaxed">
                  <MapPin
                    size={14}
                    className="mt-1 shrink-0"
                    style={{ color: theme.secondary }}
                  />
                  <span className="break-words" style={{ color: theme.secondary }}>
                    {alamat}
                  </span>
                </div>
              )}

              {text(identitas?.ctaText) && text(identitas?.ctaLink) && (
                <div className="mt-6">
                  <FooterLink href={internalLink(identitas.ctaLink, base)}>
                    {identitas.ctaText}
                  </FooterLink>
                </div>
              )}
            </section>
          </RevealSection>

          {/* NAVIGASI */}
          <RevealSection delay={80} className="lg:col-span-3">
            <section className="min-w-0">
              <FooterHeading>
                {text(navigasi?.judul) || "Navigasi"}
              </FooterHeading>

              {text(navigasi?.konten) && (
                <p
                  className="mb-4 whitespace-pre-line text-sm leading-relaxed"
                  style={{ color: theme.secondary }}
                >
                  {navigasi.konten}
                </p>
              )}

            <ul className="space-y-3">
  <li>
    <FooterLink href={base || "/"}>
      Beranda
    </FooterLink>
  </li>

  <li>
    <FooterLink href={`${base}/tentang`}>
      Tentang
    </FooterLink>
  </li>

  <li>
    <FooterLink href={`${base}/articles`}>
      Artikel
    </FooterLink>
  </li>

  {pages
    .filter((item) => {
      const slug = String(item.slug || "")
        .replace(/^\/+|\/+$/g, "")
        .toLowerCase();

      const judul = String(item.judul || item.title || "")
        .trim()
        .toLowerCase();

      return (
        slug &&
        !["beranda", "home", "homepage", "tentang", "articles", "artikel", "berita"].includes(slug) &&
        !["beranda", "home", "tentang", "artikel"].includes(judul)
      );
    })
    .map((item) => {
      const slug = String(item.slug || "")
        .replace(/^\/+|\/+$/g, "");

      return (
        <li key={item.id || slug}>
          <FooterLink href={`${base.replace(/\/+$/, "")}/${slug}`}>
            {item.judul || item.title}
          </FooterLink>
        </li>
      );
    })}
</ul>
            </section>
          </RevealSection>

          {/* KONTAK */}
          <RevealSection delay={160} className="lg:col-span-3">
            <section className="min-w-0">
              <FooterHeading>
                {text(infoKontak?.judul) || "Kontak"}
              </FooterHeading>

              <div className="space-y-3.5">
                {telepon && (
                  <a
                    href={`tel:${telepon.replace(/[^\d+]/g, "")}`}
                    className="flex items-start gap-2.5 text-sm transition-colors duration-300"
                    style={{ color: theme.secondary }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = theme.primary)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = theme.secondary)}
                  >
                    <Phone size={14} className="mt-0.5 shrink-0" />
                    <span className="break-words">{telepon}</span>
                  </a>
                )}

                {email && (
                  <a
                    href={`mailto:${email}`}
                    className="flex items-start gap-2.5 text-sm transition-colors duration-300"
                    style={{ color: theme.secondary }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = theme.primary)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = theme.secondary)}
                  >
                    <Mail size={14} className="mt-0.5 shrink-0" />
                    <span className="break-all">{email}</span>
                  </a>
                )}

                {text(infoKontak?.konten) && (
                  <p
                    className="whitespace-pre-line text-sm leading-relaxed"
                    style={{ color: theme.secondary }}
                  >
                    {infoKontak.konten}
                  </p>
                )}

                {!telepon && !email && !text(infoKontak?.konten) && (
                  <p className="text-sm" style={{ color: theme.secondary }}>
                    Belum tersedia.
                  </p>
                )}
              </div>
            </section>
          </RevealSection>

          {/* SOSIAL */}
          <RevealSection delay={240} className="lg:col-span-2">
            <section className="min-w-0">
              <FooterHeading>
                {text(infoSosmed?.judul) || "Ikuti Kami"}
              </FooterHeading>

              {text(infoSosmed?.konten) && (
                <p
                  className="mb-4 whitespace-pre-line text-sm leading-relaxed"
                  style={{ color: theme.secondary }}
                >
                  {infoSosmed.konten}
                </p>
              )}

              {socials.length > 0 ? (
                <div className="flex flex-col items-start gap-3">
                  {socials.map((item) => (
                    <SocialLink
                      key={item.nama}
                      href={item.url}
                      label={item.nama}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm" style={{ color: theme.secondary }}>
                  Belum tersedia.
                </p>
              )}
            </section>
          </RevealSection>
        </div>

        {/* COPYRIGHT */}
        <div
          className="mt-16 flex flex-col gap-3 border-t pt-6 text-xs sm:flex-row sm:items-center sm:justify-between"
          style={{
            borderColor: theme.border,
            color: theme.secondary,
          }}
        >
          <p>
            © {tahun} {namaSekolah}. Seluruh hak cipta dilindungi.
          </p>

          <p className="inline-flex items-center gap-2">
            <span>SmartSchool</span>
            <span
              className="inline-block h-1 w-1 rounded-full"
              style={{ backgroundColor: theme.secondary, opacity: 0.4 }}
            />
            <span>School Management System</span>
          </p>
        </div>
      </div>
    </footer>
  );
}