BEGIN;

-- MenuKonfigurasi was previously added via db push without a checked-in migration.
-- Support both those databases and databases built from the migration history.
CREATE TABLE IF NOT EXISTS "menu_konfigurasi" (
    "id" TEXT NOT NULL,
    "sekolah_id" TEXT NOT NULL,
    "dibuat_oleh" TEXT,
    "diperbarui_oleh" TEXT,
    "dihapus_oleh" TEXT,
    "halaman" VARCHAR(50) NOT NULL,
    "section" VARCHAR(50) NOT NULL,
    "judul" VARCHAR(100) NOT NULL,
    "sub_judul" VARCHAR(255),
    "konten" TEXT,
    "gambar_url" VARCHAR(255),
    "cta_text" VARCHAR(50),
    "cta_link" VARCHAR(255),
    "urutan" INTEGER NOT NULL,
    "status" VARCHAR(20),
    "dibuat_pada" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP NOT NULL,
    CONSTRAINT "menu_konfigurasi_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "menu_konfigurasi_sekolah_id_fkey"
      FOREIGN KEY ("sekolah_id") REFERENCES "sekolah"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

ALTER TABLE "menu_konfigurasi" ADD COLUMN "halaman_cms_id" TEXT;

-- Resolve legacy text to an existing page in the SAME school, by ID, slug or title.
-- Preserve unmatched content in a draft page for review instead of dropping menu rows.
CREATE TEMP TABLE "legacy_menu_pages" ON COMMIT DROP AS
SELECT legacy.*, COALESCE(page.id,
    md5('legacy-menu-page:' || legacy.sekolah_id || ':' || legacy.page_key)::uuid::text
) AS page_id, page.id IS NULL AS needs_page
FROM (
    SELECT sekolah_id, lower(btrim(halaman)) AS page_key,
           COALESCE(NULLIF(min(btrim(halaman)), ''), 'Halaman Lama') AS page_title
    FROM menu_konfigurasi
    GROUP BY sekolah_id, lower(btrim(halaman))
) legacy
LEFT JOIN LATERAL (
    SELECT id FROM halaman_cms
    WHERE sekolah_id = legacy.sekolah_id AND dihapus_pada IS NULL
      AND (lower(id) = legacy.page_key OR lower(slug) = legacy.page_key
           OR lower(btrim(judul)) = legacy.page_key)
    ORDER BY CASE WHEN lower(id) = legacy.page_key THEN 0
                  WHEN lower(slug) = legacy.page_key THEN 1 ELSE 2 END,
             dibuat_pada, id
    LIMIT 1
) page ON true;

INSERT INTO halaman_cms (id, sekolah_id, judul, slug, status, dibuat_pada, diperbarui_pada)
SELECT page_id, sekolah_id, page_title, 'menu-legacy-' || replace(page_id, '-', ''),
       'draft', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM legacy_menu_pages WHERE needs_page;

UPDATE menu_konfigurasi menu SET halaman_cms_id = page.page_id
FROM legacy_menu_pages page
WHERE menu.sekolah_id = page.sekolah_id AND lower(btrim(menu.halaman)) = page.page_key;

ALTER TABLE "menu_konfigurasi" ALTER COLUMN "halaman_cms_id" SET NOT NULL;
ALTER TABLE "menu_konfigurasi" ADD CONSTRAINT "menu_konfigurasi_halaman_cms_id_fkey"
    FOREIGN KEY ("halaman_cms_id") REFERENCES "halaman_cms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX "menu_konfigurasi_halaman_cms_id_section_idx" ON "menu_konfigurasi"("halaman_cms_id", "section");
ALTER TABLE "menu_konfigurasi" DROP COLUMN "halaman";

COMMIT;
