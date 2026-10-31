-- The original init omitted this table although the next historical migration
-- alters it. Do not change checksums of already-applied migrations.
-- IF NOT EXISTS also supports installations that created it through db push.
CREATE TABLE IF NOT EXISTS "pendaftaran_tenant" (
  "id" TEXT NOT NULL,
  "nama_sekolah" VARCHAR(100) NOT NULL,
  "jenjang_sekolah" VARCHAR(20) NOT NULL,
  "subdomain" VARCHAR(50) NOT NULL,
  "alamat_sekolah" TEXT NOT NULL,
  "telepon_sekolah" VARCHAR(20) NOT NULL,
  "email_sekolah" VARCHAR(100) NOT NULL,
  CONSTRAINT "pendaftaran_tenant_pkey" PRIMARY KEY ("id")
);
