import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
const url = process.env.TEST_DATABASE_URL;
test("review migration enforces database constraints and ownership uniqueness", { skip: !url }, async () => {
  assert.ok(["127.0.0.1", "localhost", "[::1]"].includes(new URL(url!).hostname));
  const { Client } = require("pg"); const client = new Client({ connectionString: url });
  const schema = `qa_reviews_${randomUUID().replaceAll("-", "")}`;
  await client.connect();
  try {
    await client.query(`CREATE SCHEMA "${schema}"; SET search_path TO "${schema}"; CREATE TABLE pengguna (id TEXT PRIMARY KEY); INSERT INTO pengguna VALUES ('owner')`);
    await client.query(readFileSync(path.join(__dirname,"../prisma/migrations/20261103120000_add_review_pengguna/migration.sql"),"utf8"));
    assert.equal((await client.query(`SELECT relrowsecurity FROM pg_class WHERE oid='review_pengguna'::regclass`)).rows[0].relrowsecurity,true);
    for (const values of [[0,"ok","menunggu"],[6,"ok","menunggu"],[5,"x".repeat(501),"menunggu"],[5," ","menunggu"],[5,"ok","unknown"]]) {
      await assert.rejects(client.query(`INSERT INTO review_pengguna(id,pengguna_id,rating,komentar,status,diperbarui_pada) VALUES ('invalid','owner',$1,$2,$3,now())`, values), { code: "23514" });
    }
    await client.query(`INSERT INTO review_pengguna(id,pengguna_id,rating,komentar,diperbarui_pada) VALUES ('valid','owner',5,'ok',now())`);
    await assert.rejects(client.query(`INSERT INTO review_pengguna(id,pengguna_id,rating,komentar,diperbarui_pada) VALUES ('duplicate','owner',4,'duplicate',now())`), { code: "23505" });
    await client.query(`DELETE FROM pengguna WHERE id='owner'`);
    assert.equal((await client.query(`SELECT count(*)::int AS n FROM review_pengguna`)).rows[0].n,0);
  } finally { await client.query(`DROP SCHEMA "${schema}" CASCADE`); await client.end(); }
});
