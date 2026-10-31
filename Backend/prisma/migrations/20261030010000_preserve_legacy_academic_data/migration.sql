-- Preserve IDs and rows when upgrading the original naming to today's schema.
-- Databases that already have the new tables are left intact; the following
-- reconciliation migration copies remaining legacy rows without overwriting IDs.
DO $$
DECLARE names TEXT[]; pair TEXT[];
BEGIN
  FOREACH pair SLICE 1 IN ARRAY ARRAY[
    ['siswa_kelas','anggota_kelas'], ['ujian','asesmen'],
    ['soal_ujian','soal_asesmen'], ['percobaan_ujian','percobaan_asesmen'],
    ['jawaban_ujian','jawaban_asesmen'], ['hasil_ujian','hasil_asesmen']
  ] LOOP
    IF to_regclass(format('%I', pair[1])) IS NOT NULL AND to_regclass(format('%I', pair[2])) IS NULL THEN
      EXECUTE format('ALTER TABLE %I RENAME TO %I', pair[1], pair[2]);
    END IF;
  END LOOP;
  FOREACH names SLICE 1 IN ARRAY ARRAY[
    ['asesmen','jenis','tipe'], ['asesmen','mode_ujian','mode_asesmen'],
    ['soal_asesmen','ujian_id','asesmen_id'], ['soal_asesmen','jawaban_benar','kunci_jawaban'],
    ['percobaan_asesmen','ujian_id','asesmen_id'], ['percobaan_asesmen','pengguna_id','siswa_id'],
    ['jawaban_asesmen','percobaan_ujian_id','percobaan_asesmen_id'],
    ['hasil_asesmen','percobaan_ujian_id','percobaan_asesmen_id'],
    ['kelas','ruangan','nomor_ruangan'], ['pengguna','no_telepon','no_telepon_rumah'],
    ['sekolah','logo','logo_besar_url']
  ] LOOP
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = names[1] AND column_name = names[2])
      AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = names[1] AND column_name = names[3]) THEN
      EXECUTE format('ALTER TABLE %I RENAME COLUMN %I TO %I', names[1], names[2], names[3]);
    END IF;
  END LOOP;
END $$;
