-- AlterTable
ALTER TABLE "pendaftaran_tenant" ADD COLUMN "jenis_pendaftaran" VARCHAR(20) NOT NULL DEFAULT 'sekolah';
ALTER TABLE "pendaftaran_tenant" ALTER COLUMN "nama_sekolah" DROP NOT NULL;
ALTER TABLE "pendaftaran_tenant" ALTER COLUMN "jenjang_sekolah" DROP NOT NULL;
ALTER TABLE "pendaftaran_tenant" ALTER COLUMN "subdomain" DROP NOT NULL;
ALTER TABLE "pendaftaran_tenant" ALTER COLUMN "alamat_sekolah" DROP NOT NULL;
ALTER TABLE "pendaftaran_tenant" ALTER COLUMN "telepon_sekolah" DROP NOT NULL;
ALTER TABLE "pendaftaran_tenant" ALTER COLUMN "email_sekolah" DROP NOT NULL;
