import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const databaseUrl = process.env.TEST_DATABASE_URL;

test("CMS foreign-key migration preserves legacy data", { skip: !databaseUrl }, async t => {
  assert.ok(["127.0.0.1", "localhost", "[::1]"].includes(new URL(databaseUrl!).hostname));
  const { Client } = require("pg");
  const migration = readFileSync(path.join(__dirname,
    "../prisma/migrations/20261030000000_relate_menu_konfigurasi_halaman_cms/migration.sql"), "utf8");

  for (const withLegacyMenu of [false, true]) {
    await t.test(withLegacyMenu ? "backfills existing menu rows within their own school" : "creates the previously unmigrated menu table", async () => {
      const client = new Client({connectionString:databaseUrl});
      const schema = `qa_cms_${randomUUID().replaceAll("-", "")}`;
      await client.connect();
      try {
        await client.query(`CREATE SCHEMA "${schema}"`);
        await client.query(`SET search_path TO "${schema}"`);
        await client.query(`
          CREATE TABLE sekolah (id TEXT PRIMARY KEY);
          CREATE TABLE halaman_cms (
            id TEXT PRIMARY KEY, sekolah_id TEXT NOT NULL REFERENCES sekolah(id),
            judul VARCHAR(100) NOT NULL, slug VARCHAR(100) NOT NULL UNIQUE,
            status VARCHAR(20), dibuat_pada TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            diperbarui_pada TIMESTAMP NOT NULL, dihapus_pada TIMESTAMP
          );
          INSERT INTO sekolah VALUES ('school-a'), ('school-b');
          INSERT INTO halaman_cms (id,sekolah_id,judul,slug,status,diperbarui_pada,dihapus_pada) VALUES
            ('page-home-a','school-a','Beranda','beranda-school-a','dipublikasikan',now(),null),
            ('page-contact-a','school-a','Hubungi Kami','kontak','dipublikasikan',now(),null),
            ('page-about-b','school-b','Tentang','tentang-b','dipublikasikan',now(),null),
            ('page-deleted-a','school-a','Arsip','arsip-a','dipublikasikan',now(),now());
        `);
        if (withLegacyMenu) {
          await client.query(`
            CREATE TABLE menu_konfigurasi (
              id TEXT PRIMARY KEY, sekolah_id TEXT NOT NULL REFERENCES sekolah(id),
              halaman VARCHAR(50) NOT NULL, section VARCHAR(50) NOT NULL,
              judul VARCHAR(100) NOT NULL, urutan INTEGER NOT NULL, status VARCHAR(20),
              diperbarui_pada TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            INSERT INTO menu_konfigurasi VALUES
              ('menu-title','school-a',' Beranda ','hero','Keep title',1,'aktif'),
              ('menu-title-case','school-a','BERANDA','footer','Keep footer',2,'nonaktif'),
              ('menu-slug','school-a','kontak','hero','Keep slug',1,'aktif'),
              ('menu-id','school-a','page-home-a','cta','Keep id',3,'aktif'),
              ('menu-unmatched','school-a','Kegiatan','hero','Keep unmatched',1,'aktif'),
              ('menu-foreign','school-a','Tentang','hero','Keep school',1,'aktif'),
              ('menu-deleted','school-a','Arsip','hero','Keep deleted',1,'aktif'),
              ('menu-empty','school-a','   ','hero','Keep empty',1,'aktif');
          `);
        }
        await client.query(migration);
        const columns = await client.query("SELECT column_name,is_nullable FROM information_schema.columns WHERE table_schema=$1 AND table_name='menu_konfigurasi'",[schema]);
        assert.ok(!columns.rows.some((row:any)=>row.column_name==="halaman"));
        assert.equal(columns.rows.find((row:any)=>row.column_name==="halaman_cms_id").is_nullable,"NO");
        const result = await client.query(`SELECT menu.*, page.sekolah_id AS page_school_id, page.status AS page_status
          FROM menu_konfigurasi menu JOIN halaman_cms page ON page.id=menu.halaman_cms_id ORDER BY menu.id`);
        assert.equal(result.rows.length,withLegacyMenu?8:0);
        if (withLegacyMenu) {
          const byId = Object.fromEntries(result.rows.map((row:any)=>[row.id,row]));
          for (const id of ["menu-title","menu-title-case","menu-id"]) assert.equal(byId[id].halaman_cms_id,"page-home-a");
          assert.equal(byId["menu-slug"].halaman_cms_id,"page-contact-a");
          assert.equal(byId["menu-title-case"].status,"nonaktif");
          for (const id of ["menu-unmatched","menu-foreign","menu-deleted","menu-empty"]) {
            assert.equal(byId[id].page_status,"draft");
            assert.equal(byId[id].page_school_id,"school-a");
          }
          assert.equal(byId["menu-unmatched"].judul,"Keep unmatched");
          await assert.rejects(client.query("DELETE FROM halaman_cms WHERE id='page-home-a'"), (error:any)=>/foreign key constraint.*menu_konfigurasi_halaman_cms_id_fkey/.test(error.message));
        }
        await assert.rejects(client.query("INSERT INTO menu_konfigurasi (id,sekolah_id,halaman_cms_id,section,judul,urutan,diperbarui_pada) VALUES ('invalid','school-a','missing','hero','Invalid',1,now())"), (error:any)=>error.code==="23503");
      } finally {
        await client.query("ROLLBACK");
        await client.query("SET search_path TO public");
        await client.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
        await client.end();
      }
    });
  }
});
