BEGIN;

ALTER TABLE "jadwal_mengajar" ADD COLUMN IF NOT EXISTS "ruangan_id" TEXT;

CREATE INDEX IF NOT EXISTS "jadwal_mengajar_ruangan_id_idx" ON "jadwal_mengajar"("ruangan_id");

DO $$ BEGIN
  IF to_regclass('"ruangan"') IS NOT NULL
     AND NOT EXISTS (
       SELECT 1 FROM pg_constraint
       WHERE conrelid = '"jadwal_mengajar"'::regclass
         AND conname = 'jadwal_mengajar_ruangan_id_fkey'
     ) THEN
    ALTER TABLE "jadwal_mengajar"
      ADD CONSTRAINT "jadwal_mengajar_ruangan_id_fkey"
      FOREIGN KEY ("ruangan_id") REFERENCES "ruangan"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

COMMIT;