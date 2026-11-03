CREATE TABLE "review_pengguna" (
  "id" TEXT NOT NULL,
  "pengguna_id" TEXT NOT NULL,
  "rating" INTEGER NOT NULL,
  "komentar" TEXT NOT NULL,
  "status" VARCHAR(20) NOT NULL DEFAULT 'menunggu',
  "dibuat_pada" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "diperbarui_pada" TIMESTAMP NOT NULL,
  CONSTRAINT "review_pengguna_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "review_pengguna_rating_check" CHECK ("rating" BETWEEN 1 AND 5),
  CONSTRAINT "review_pengguna_komentar_check" CHECK (char_length(btrim("komentar")) BETWEEN 1 AND 500),
  CONSTRAINT "review_pengguna_status_check" CHECK ("status" IN ('menunggu', 'tampil', 'disembunyikan'))
);
CREATE UNIQUE INDEX "review_pengguna_pengguna_id_key" ON "review_pengguna"("pengguna_id");
CREATE INDEX "review_pengguna_status_dibuat_pada_idx" ON "review_pengguna"("status", "dibuat_pada");
ALTER TABLE "review_pengguna" ADD CONSTRAINT "review_pengguna_pengguna_id_fkey"
  FOREIGN KEY ("pengguna_id") REFERENCES "pengguna"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- Reviews are served through Express's ownership/moderation rules. Do not expose
-- drafts via Supabase's anon/authenticated Data API.
ALTER TABLE "review_pengguna" ENABLE ROW LEVEL SECURITY;
