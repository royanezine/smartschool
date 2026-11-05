import assert from "node:assert/strict";
import { once } from "node:events";
import { randomUUID } from "node:crypto";
import test from "node:test";

const databaseUrl = process.env.TEST_DATABASE_URL;

test("login subscription, public wilayah and safe OTP diagnostics", { skip: !databaseUrl }, async t => {
  assert.ok(["127.0.0.1", "localhost", "[::1]"].includes(new URL(databaseUrl!).hostname));
  process.env.DATABASE_URL = databaseUrl!;
  process.env.JWT_SECRET ||= "isolated-auth-regression";
  const { prisma } = require("../src/config/db");
  const app = require("../src/app").default;
  const bcrypt = require("bcryptjs");
  const { generatePinToken } = require("../src/utils/generateToken");
  const server = app.listen(0, "127.0.0.1"); await once(server, "listening");
  const base = `http://127.0.0.1:${server.address().port}`;
  const realFetch = globalThis.fetch;
  const suffix = randomUUID().slice(0, 8);
  const password = "Local-auth-test123!", hash = await bcrypt.hash(password, 4);
  const users: string[] = [], roles: string[] = [];
  const pack = await prisma.paket.create({data: {nama: `Auth ${suffix}`, harga: 0, durasi: 30, status: "aktif"}});
  const foundationPack = await prisma.paket.create({data: {nama: `Foundation ${suffix}`, harga: 0, durasi: 30, status: "aktif", tipe: "YAYASAN"}});
  const school = await prisma.sekolah.create({data: {nama: "Auth test", subdomain: `auth-${suffix}`, kode: `AUTH-${suffix}`, status: "aktif"}});
  const foundation = await prisma.yayasan.create({data: {nama: "Auth foundation", status: "aktif"}});
  t.after(async () => {
    t.mock.restoreAll();
    server.closeAllConnections(); await new Promise<void>(resolve => server.close(() => resolve()));
    await prisma.pengguna.deleteMany({where: {id: {in: users}}});
    await prisma.langgananSekolah.deleteMany({where: {sekolahId: school.id}});
    await prisma.sekolah.delete({where: {id: school.id}});
    await prisma.yayasan.delete({where: {id: foundation.id}});
    await prisma.peran.deleteMany({where: {id: {in: roles}}});
    await prisma.paket.deleteMany({where: {id: {in: [pack.id, foundationPack.id]}}});
    await prisma.$disconnect();
  });
  async function user(role: string, tenant: "school" | "foundation" | "none") {
    const peran = await prisma.peran.create({data: {nama: role, namaTampilan: role, status: "aktif"}}); roles.push(peran.id);
    const row = await prisma.pengguna.create({data: {namaPengguna: `${role}_${suffix}`, email: `${role}_${suffix}@example.test`,
      namaLengkap: role, kataSandi: hash, peranId: peran.id, status: "aktif",
      sekolahId: tenant === "school" ? school.id : null, yayasanId: tenant === "foundation" ? foundation.id : null}});
    users.push(row.id); return row;
  }
  const admin = await user("admin_sekolah", "school"), student = await user("siswa", "school");
  const root = await user("super_admin", "none"), foundationAdmin = await user("admin_yayasan", "foundation");
  async function http(path: string, body?: unknown) {
    const r = await realFetch(base + path, {method: body === undefined ? "GET" : "POST",
      headers: body === undefined ? {} : {"Content-Type": "application/json"},
      body: body === undefined ? undefined : JSON.stringify(body)});
    return {status: r.status, body: await r.json() as any};
  }
  const login = (who = admin, kataSandi = password) => http("/api/auth/login", {identifier: who.email, kataSandi});
  const denied = (r: any) => {
    assert.equal(r.status, 403); assert.equal(r.body.message, "Akses ditolak, masa aktif langganan sekolah telah habis");
    for (const key of ["token", "setupToken", "pinToken"]) assert.equal(r.body[key], undefined);
  };
  let subscription: any;
  await t.test("credentials precede subscription checks; missing tenant/subscription denies tokens", async () => {
    assert.equal((await login(admin, "wrong-password")).status, 401);
    denied(await login()); denied(await login(student)); denied(await login(foundationAdmin));
    assert.equal((await prisma.pengguna.findUnique({where: {id: admin.id}})).terakhirLogin, null);
    const r = await login(root); assert.equal(r.status, 200); assert.ok(r.body.token);
  });
  await t.test("valid active/trial subscriptions allow login; expired, canceled, future and missing end dates deny", async () => {
    subscription = await prisma.langgananSekolah.create({data: {sekolahId: school.id, paketId: pack.id,
      statusLangganan: "active", tanggalMulai: new Date(Date.now()-60000), tanggalBerakhir: new Date(Date.now()+86400000)}});
    let r = await login(); assert.equal(r.status, 200); assert.ok(r.body.token);
    r = await login(student); assert.equal(r.status, 200); assert.ok(r.body.setupToken); assert.equal(r.body.token, undefined);
    for (const changes of [
      {tanggalBerakhir: new Date(Date.now()-1000)},
      {tanggalBerakhir: new Date(Date.now()+86400000), statusLangganan: "canceled"},
      {statusLangganan: "active", tanggalMulai: new Date(Date.now()+60000)},
      {tanggalMulai: new Date(Date.now()-60000), tanggalBerakhir: null},
    ]) {
      await prisma.langgananSekolah.update({where: {id: subscription.id}, data: changes}); denied(await login());
    }
    await prisma.langgananSekolah.update({where: {id: subscription.id}, data: {statusLangganan: "trialing", tanggalBerakhir: new Date(Date.now()+86400000)}});
    await prisma.sekolah.update({where: {id: school.id}, data: {status: "uji coba"}});
    assert.equal((await login()).status, 200);
    await prisma.sekolah.update({where: {id: school.id}, data: {status: "nonaktif"}}); denied(await login());
    await prisma.sekolah.update({where: {id: school.id}, data: {status: "aktif"}});
  });
  await t.test("PIN completion rechecks subscription expiry and cannot issue an access token", async () => {
    await prisma.langgananSekolah.update({where: {id: subscription.id}, data: {tanggalBerakhir: new Date(Date.now()-1000)}});
    denied(await http("/api/auth/pin/setup", {setupToken: generatePinToken(student.id, "pin_setup"), pin: "123456"}));
    assert.equal((await prisma.pengguna.findUnique({where: {id: student.id}})).pinHash, null);
    await prisma.pengguna.update({where: {id: student.id}, data: {pinHash: await bcrypt.hash("123456", 4)}});
    denied(await http("/api/auth/pin/verify", {pinToken: generatePinToken(student.id, "pin_access"), pin: "123456"}));
  });
  await t.test("foundation subscription supports foundation admins and covered schools without school subscription", async () => {
    await prisma.yayasan.update({where: {id: foundation.id}, data: {paketId: foundationPack.id, statusLangganan: "active",
      tanggalMulaiLangganan: new Date(Date.now()-60000), tanggalBerakhirLangganan: new Date(Date.now()+86400000)}});
    assert.equal((await login(foundationAdmin)).status, 200);
    await prisma.sekolah.update({where: {id: school.id}, data: {yayasanId: foundation.id}});
    assert.equal((await login()).status, 200);
    let r = await http("/api/auth/pin/verify", {pinToken: generatePinToken(student.id, "pin_access"), pin: "123456"});
    assert.equal(r.status, 200); assert.ok(r.body.token);
    await prisma.yayasan.update({where: {id: foundation.id}, data: {tanggalBerakhirLangganan: new Date(Date.now()-1000)}});
    denied(await login(foundationAdmin)); denied(await login());
    await prisma.yayasan.update({where: {id: foundation.id}, data: {tanggalBerakhirLangganan: new Date(Date.now()+86400000), tanggalMulaiLangganan: new Date(Date.now()+60000)}});
    denied(await login(foundationAdmin));
  });

  await t.test("public wilayah endpoints validate, cache, coalesce, and report upstream failures", async () => {
    let calls = 0, failure = "malformed";
    const stub = t.mock.method(globalThis, "fetch", async (input: any) => {
      calls++; const url = String(input);
      if (failure === "malformed") return Response.json({data: [{id: "11"}]});
      if (url.endsWith("provinces.json")) return Response.json({data: [{id: "11", name: "Aceh"}, {id: "31", name: "Jakarta"}, {id: "32", name: "Jawa Barat"}]});
      if (url.endsWith("/11.json")) throw new DOMException("Timed out", "TimeoutError");
      if (url.endsWith("/31.json") && failure === "http") return new Response("unavailable", {status: 503});
      return Response.json({data: [{id: "32.01", name: "Kabupaten Bogor", privateExtra: "discard"}]});
    });
    try {
      assert.equal((await http("/api/wilayah/kota")).status, 400);
      assert.equal((await http("/api/wilayah/kota?provinsi_id=../../etc")).status, 400);
      assert.equal((await http("/api/wilayah/kota?provinsi_id=32&provinsi_id=31")).status, 400);
      assert.equal(calls, 0);
      assert.equal((await http("/api/wilayah/provinsi")).status, 502);
      failure = "none";
      const [a, b] = await Promise.all([http("/api/wilayah/provinsi"), http("/api/wilayah/provinsi")]);
      assert.equal(a.status, 200); assert.deepEqual(a.body, b.body); assert.equal(calls, 2);
      const kota = await http("/api/wilayah/kota?provinsi_id=32"); assert.equal(kota.status, 200);
      assert.deepEqual(kota.body.data, [{id: "32.01", name: "Kabupaten Bogor", provinsi_id: "32"}]);
      await http("/api/wilayah/kota?provinsi_id=32"); assert.equal(calls, 3);
      assert.equal((await http("/api/wilayah/kota?provinsi_id=99")).status, 404); assert.equal(calls, 3);
      failure = "http"; assert.equal((await http("/api/wilayah/kota?provinsi_id=31")).status, 502);
      failure = "none"; assert.equal((await http("/api/wilayah/kota?provinsi_id=31")).status, 200);
      assert.equal((await http("/api/wilayah/kota?provinsi_id=11")).status, 504);
    } finally { stub.mock.restore(); }
  });

  await t.test("OTP diagnostics cover missing env, OAuth, SMTP and sender rejection without leaking secrets", async () => {
    const nodemailer = require("nodemailer").default; const { google } = require("googleapis");
    const { sendOtpEmail } = require("../src/utils/email");
    const keys = ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "GOOGLE_REFRESH_TOKEN", "GOOGLE_SENDER_EMAIL"];
    const previous = keys.map(key => process.env[key]); const logs: any[] = [];
    const logger = t.mock.method(console, "error", (...args: any[]) => { logs.push(args); });
    let phase = "success", closed = 0;
    const oauth = t.mock.method(google.auth, "OAuth2", function () { return {
      transporter: {defaults: {}}, setCredentials() {}, async getAccessToken() {
        if (phase === "oauth") throw Object.assign(new Error("invalid_grant credential-secret 654321"), {response: {status: 400, data: {error: "invalid_grant", error_description: "refresh token revoked credential-secret 654321"}, config: {data: "DO_NOT_LOG_BODY"}}});
        return {token: "private-access-token"};
      },
    }; });
    const smtp = t.mock.method(nodemailer, "createTransport", () => ({
      async verify() { if (phase === "verify") throw Object.assign(new Error("SMTP auth failed credential-secret"), {code: "EAUTH", responseCode: 535}); },
      async sendMail() {
        if (phase === "send") throw Object.assign(new Error("sender domain rejected"), {code: "EENVELOPE", responseCode: 550, response: "550 sender test@example.test rejected private-access-token 654321"});
        return {accepted: ["test@example.test"], rejected: [], messageId: "local-message"};
      }, close() { closed++; },
    }));
    const params = {email: "test@example.test", namaLengkap: "<script>", kodeOtp: "654321"};
    try {
      for (const key of keys) delete process.env[key];
      await assert.rejects(sendOtpEmail(params), /configuration/);
      assert.deepEqual(logs.at(-1)[1].missing, keys);
      keys.forEach(key => process.env[key] = key === "GOOGLE_SENDER_EMAIL" ? "sender@example.test" : "credential-secret");
      for (const [value, stage] of [["oauth", "oauth_token"], ["verify", "smtp_verify"], ["send", "send_mail"]]) {
        phase = value!; await assert.rejects(sendOtpEmail(params), new RegExp(stage!));
        assert.equal(logs.at(-1)[1].stage, stage);
      }
      assert.doesNotMatch(JSON.stringify(logs), /credential-secret|private-access-token|654321|DO_NOT_LOG_BODY/);
      phase = "success"; const info = await sendOtpEmail(params); assert.equal(info.messageId, "local-message");
      assert.equal(closed, 3);
    } finally {
      oauth.mock.restore(); smtp.mock.restore(); logger.mock.restore();
      keys.forEach((key, index) => previous[index] === undefined ? delete process.env[key] : process.env[key] = previous[index]);
    }
  });
});
