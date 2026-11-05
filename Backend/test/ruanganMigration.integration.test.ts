import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { randomUUID } from "node:crypto";
import path from "node:path";
import test from "node:test";
import { Client } from "pg";

const databaseUrl = process.env.TEST_DATABASE_URL;
test("room migration preserves locations and unrelated data atomically", {skip: !databaseUrl}, async t => {
  assert.ok(["127.0.0.1", "localhost", "[::1]"].includes(new URL(databaseUrl!).hostname));
  const name = readdirSync(path.join(process.cwd(), "prisma/migrations")).find(n => n.endsWith("_perbaiki_relasi_ruangan_kelas"));
  assert.ok(name);
  const sql = readFileSync(path.join(process.cwd(), "prisma/migrations", name, "migration.sql"), "utf8");
  const client = new Client({connectionString: databaseUrl}); await client.connect();
  t.after(async () => {await client.end();});
  async function scenario(existingRoom: boolean, run: () => Promise<void>) {
    const schema = `room_${randomUUID().replaceAll("-", "")}`;
    await client.query(`CREATE SCHEMA "${schema}"; SET search_path TO "${schema}"`);
    try {
      await client.query(`
        CREATE TABLE sekolah (id TEXT PRIMARY KEY, nama TEXT);
        CREATE TABLE gedung (id TEXT PRIMARY KEY, sekolah_id TEXT REFERENCES sekolah(id));
        CREATE TABLE lantai (id TEXT PRIMARY KEY, gedung_id TEXT REFERENCES gedung(id));
        CREATE TABLE kelas (id TEXT PRIMARY KEY, sekolah_id TEXT REFERENCES sekolah(id), nama VARCHAR(50),
          nomor_ruangan VARCHAR(20), gedung_id TEXT REFERENCES gedung(id), lantai_id TEXT REFERENCES lantai(id),
          dihapus_pada TIMESTAMP(6), catatan TEXT);
        CREATE TABLE riwayat_pembayaran (id TEXT PRIMARY KEY, xendit_invoice_id TEXT, xendit_payment_id TEXT, jumlah NUMERIC);
        INSERT INTO sekolah VALUES ('school-a','School A'), ('school-b','School B');
        INSERT INTO gedung VALUES ('building-a','school-a'), ('building-b','school-b'), ('building-a2','school-a');
        INSERT INTO lantai VALUES ('floor-a','building-a'), ('floor-b','building-b');
        INSERT INTO riwayat_pembayaran VALUES ('payment-original','invoice-original','payment-id-original',123456.78);
      `);
      if (existingRoom) await client.query(`CREATE TABLE ruangan (id TEXT PRIMARY KEY, sekolah_id TEXT REFERENCES sekolah(id), nama VARCHAR(100) NOT NULL,
        lokasi VARCHAR(255), kapasitas INTEGER, keterangan VARCHAR(255), dibuat_pada TIMESTAMP(6) DEFAULT now(), diperbarui_pada TIMESTAMP(6) NOT NULL, dihapus_pada TIMESTAMP(6));
        INSERT INTO ruangan(id,sekolah_id,nama,lokasi,diperbarui_pada) VALUES ('existing-room','school-a','Existing room','Original location',now());`);
      await run();
    } finally {
      await client.query("ROLLBACK");
      await client.query(`SET search_path TO public; DROP SCHEMA "${schema}" CASCADE`);
    }
  }
  for (const existingRoom of [false, true]) await t.test(`backfill preserves classes, raw room numbers and payment data (existing room=${existingRoom})`, async () => {
    await scenario(existingRoom, async () => {
      await client.query(`INSERT INTO kelas VALUES
        ('class-full','school-a','X A','  R-01  ','building-a','floor-a',NULL,'keep-full'),
        ('class-floor','school-a','X B',NULL,NULL,'floor-a',NULL,'keep-floor'),
        ('class-empty','school-a','X C',NULL,NULL,NULL,NULL,'keep-empty'),
        ('class-number','school-a','X D','',NULL,NULL,'2025-01-01','keep-deleted');`);
      const payments = (await client.query("TABLE riwayat_pembayaran")).rows;
      const schools = (await client.query("SELECT * FROM sekolah ORDER BY id")).rows;
      const room = existingRoom ? (await client.query("TABLE ruangan")).rows[0] : null;
      await client.query(sql);
      const rows = (await client.query(`SELECT k.id,k.catatan,k.ruangan_id,k.dihapus_pada,r.lokasi,r.gedung_id,r.lantai_id,r.sekolah_id
        FROM kelas k LEFT JOIN ruangan r ON r.id=k.ruangan_id ORDER BY k.id`)).rows;
      assert.equal(rows.length, 4);
      const full = rows.find(r => r.id === "class-full")!;
      assert.equal(full.lokasi, "  R-01  "); assert.equal(full.gedung_id, "building-a"); assert.equal(full.lantai_id, "floor-a"); assert.equal(full.catatan, "keep-full");
      const floor = rows.find(r => r.id === "class-floor")!; assert.equal(floor.gedung_id, "building-a"); assert.equal(floor.lantai_id, "floor-a");
      assert.equal(rows.find(r => r.id === "class-empty")!.ruangan_id, null);
      const deleted = rows.find(r => r.id === "class-number")!; assert.equal(deleted.lokasi, ""); assert.ok(deleted.dihapus_pada);
      assert.deepEqual((await client.query("TABLE riwayat_pembayaran")).rows, payments);
      assert.deepEqual((await client.query("SELECT * FROM sekolah ORDER BY id")).rows, schools);
      if (existingRoom) {
        const kept = (await client.query("SELECT * FROM ruangan WHERE id='existing-room'")).rows[0];
        assert.deepEqual({...kept, gedung_id: undefined, lantai_id: undefined}, {...room, gedung_id: undefined, lantai_id: undefined});
      }
      const columns = (await client.query("SELECT column_name FROM information_schema.columns WHERE table_schema=current_schema() AND table_name='kelas'")).rows.map(r => r.column_name);
      assert.ok(columns.includes("ruangan_id"));
      assert.ok(!columns.some(c => ["gedung_id", "lantai_id", "nomor_ruangan"].includes(c)));
      assert.equal((await client.query("SELECT count(*)::int AS n FROM gedung")).rows[0].n, 3);
      assert.equal((await client.query("SELECT count(*)::int AS n FROM lantai")).rows[0].n, 2);
    });
  });
  for (const [label, building, floor] of [["floor/building mismatch", "building-a2", "floor-a"], ["cross-tenant location", "building-b", "floor-b"]]) {
    await t.test(`${label} aborts and rolls back schema/data changes`, async () => {
      await scenario(false, async () => {
        await client.query("INSERT INTO kelas VALUES ('bad','school-a','Bad','R-BAD',$1,$2,NULL,'preserve')", [building, floor]);
        const before = (await client.query("TABLE kelas")).rows;
        await assert.rejects(client.query(sql), /Lokasi kelas tidak konsisten/);
        await client.query("ROLLBACK");
        assert.deepEqual((await client.query("TABLE kelas")).rows, before);
        assert.equal((await client.query("SELECT to_regclass(current_schema() || '.ruangan') AS room")).rows[0].room, null);
        assert.equal((await client.query("SELECT count(*)::int AS n FROM riwayat_pembayaran")).rows[0].n, 1);
      });
    });
  }
});
