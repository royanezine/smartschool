
"use client";

import Link from "next/link";

function normalizeText(value) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function normalizeUrl(value) {
  const url = normalizeText(value);

  if (!url) return "";

  if (url.startsWith("/") && !url.startsWith("//")) {
    return url;
  }

  try {
    const parsed = new URL(url);

    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.href;
    }
  } catch {
    return "";
  }

  return "";
}

function isExternalUrl(url) {
  return /^https?:\/\//i.test(url);
}

function isInactiveStatus(status) {
  return normalizeText(status).toLowerCase() === "nonaktif";
}

function getSectionClass(section) {
  const normalized = normalizeText(section)
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-");

  return normalized ? `public-section--${normalized}` : "";
}

function renderContent(content) {
  const text = normalizeText(content);

  if (!text) return null;

  return text.split(/\r?\n/).map((line, index) => (
    <span key={`${index}-${line}`}>
      {line}
      {index < text.split(/\r?\n/).length - 1 && <br />}
    </span>
  ));
}

export default function PublicSection({
  config,
  className = "",
  showInactive = false,
}) {
  if (!config || typeof config !== "object") {
    return null;
  }

  if (!showInactive && isInactiveStatus(config.status)) {
    return null;
  }

  const halaman = normalizeText(config.halaman);
  const section = normalizeText(config.section);
  const judul = normalizeText(config.judul);
  const subJudul = normalizeText(config.subJudul);
  const konten = normalizeText(config.konten);
  const gambarUrl = normalizeUrl(config.gambarUrl);
  const ctaText = normalizeText(config.ctaText);
  const ctaLink = normalizeUrl(config.ctaLink);

  const urutan = Number(config.urutan);
  const sectionClass = getSectionClass(section);

  const classes = [
    "public-section",
    sectionClass,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (
    !judul &&
    !subJudul &&
    !konten &&
    !gambarUrl &&
    !(ctaText && ctaLink)
  ) {
    return null;
  }

  return (
    <section
      className={classes}
      data-halaman={halaman}
      data-section={section}
      data-urutan={Number.isFinite(urutan) ? urutan : 1}
    >
      <div className="public-section__container">
        <div className="public-section__content">
          {subJudul && (
            <p className="public-section__subtitle">
              {subJudul}
            </p>
          )}

          {judul && (
            <h2 className="public-section__title">
              {judul}
            </h2>
          )}

          {konten && (
            <div className="public-section__description">
              {renderContent(konten)}
            </div>
          )}

          {ctaText && ctaLink && (
            isExternalUrl(ctaLink) ? (
              <a
                href={ctaLink}
                className="public-section__cta"
                target="_blank"
                rel="noopener noreferrer"
              >
                {ctaText}
                <span aria-hidden="true"> →</span>
              </a>
            ) : (
              <Link href={ctaLink} className="public-section__cta">
                {ctaText}
                <span aria-hidden="true"> →</span>
              </Link>
            )
          )}
        </div>

        {gambarUrl && (
          <div className="public-section__image-wrapper">
            <img
              src={gambarUrl}
              alt={judul || subJudul || "Gambar website sekolah"}
              className="public-section__image"
              loading="lazy"
            />
          </div>
        )}
      </div>

      <style jsx>{`
        .public-section {
          box-sizing: border-box;
          width: 100%;
          padding: 32px 0;
          background: transparent;
          color: var(--public-text, #831843);
        }

        .public-section__container {
          box-sizing: border-box;
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 32px 36px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 40px;
          background: linear-gradient(
            135deg,
            #fff7fa 0%,
            #fff0f5 55%,
            #fce7f3 100%
          );
          border: 1px solid #fbcfe8;
          border-radius: 20px;
          box-shadow: 0 8px 24px rgba(190, 24, 93, 0.07);
        }

        .public-section__content {
          flex: 1;
          min-width: 0;
        }

        .public-section__title {
          margin: 0 0 16px;
          color: var(--public-primary, #9d174d);
          font-size: clamp(1.5rem, 3vw, 2.25rem);
          font-weight: 800;
          line-height: 1.25;
          overflow-wrap: anywhere;
        }

        .public-section__subtitle {
          margin: 0 0 12px;
          color: var(--public-secondary, #be567e);
          font-size: 1.05rem;
          font-weight: 600;
          line-height: 1.6;
          overflow-wrap: anywhere;
        }

        .public-section__description {
          color: var(--public-text, #831843);
          font-size: 1rem;
          line-height: 1.8;
          overflow-wrap: anywhere;
          white-space: normal;
        }

        .public-section__cta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 20px;
          padding: 11px 20px;
          border: 1px solid #f9a8d4;
          border-radius: 10px;
          background: var(--public-primary, #db2777);
          color: #ffffff;
          font-size: 0.95rem;
          font-weight: 700;
          text-decoration: none;
          transition:
            background 0.2s ease,
            transform 0.2s ease,
            box-shadow 0.2s ease;
          overflow-wrap: anywhere;
        }

        .public-section__cta:hover {
          background: #be185d;
          transform: translateY(-2px);
          box-shadow: 0 5px 14px rgba(190, 24, 93, 0.18);
        }

        .public-section__image-wrapper {
          flex: 1;
          min-width: 0;
          max-width: 480px;
        }

        .public-section__image {
          display: block;
          width: 100%;
          max-height: 360px;
          object-fit: cover;
          border: 3px solid #ffffff;
          border-radius: 16px;
          box-shadow: 0 8px 22px rgba(157, 23, 77, 0.12);
        }

        @media (max-width: 768px) {
          .public-section {
            padding: 20px 0;
          }

          .public-section__container {
            flex-direction: column;
            align-items: stretch;
            gap: 22px;
            padding: 24px 20px;
            border-radius: 16px;
          }

          .public-section__image-wrapper {
            max-width: 100%;
          }

          .public-section__image {
            max-height: 300px;
          }

          .public-section__title {
            font-size: 1.65rem;
          }
        }
      `}</style>
    </section>
  );
}
