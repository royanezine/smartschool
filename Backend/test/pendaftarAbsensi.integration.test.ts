import assert from "node:assert/strict";
import { once } from "node:events";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { todayDateOnly, localClockMinutes } from "../src/utils/dateOnly";

const testDatabaseUrl = process.env.TEST_DATABASE_URL;

test("pendaftar and attendance HTTP API with PostgreSQL", { skip: !testDatabaseUrl }, async t => {
  const database = new URL(testDatabaseUrl!);
  assert.ok(["127.0.0.1", "localhost", "[::1]"].includes(database.hostname), "Integration tests require a separate local database");
  process.env.DATABASE_URL = testDatabaseUrl;
  process.env.JWT_SECRET ||= "isolated-local-api-integration-test-secret";
  process.env.NODE_ENV = "test";
  const { prisma } = require("../src/config/db");
  const app = require("../src/app").default;
  const { generateAccessToken } = require("../src/utils/generateToken");
  const bcrypt = require("bcryptjs");
  const ExcelJS = require("exceljs");
  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  const base = `http://127.0.0.1:${server.address().port}`;
  const schoolIds: string[] = [];
  const roleIds: string[] = [];
  const userIds: string[] = [];
  const createdIzin: string[] = [];
  let paketId: string | undefined;
  t.after(async () => {
    server.closeAllConnections();
    await new Promise<void>(resolve => server.close(() => resolve()));
    await prisma.absensi.deleteMany({where:{penggunaId:{in:userIds}}});
    await prisma.berkasPpdb.deleteMany({where:{pendaftaranPpdb:{sekolahId:{in:schoolIds}}}});
    await prisma.hasilSeleksiPpdb.deleteMany({where:{pendaftaranPpdb:{sekolahId:{in:schoolIds}}}});
    await prisma.pendaftaranPpdb.deleteMany({where:{sekolahId:{in:schoolIds}}});
    await prisma.jalurPpdb.deleteMany({where:{sekolahId:{in:schoolIds}}});
    await prisma.langgananSekolah.deleteMany({where:{sekolahId:{in:schoolIds}}});
    await prisma.kelas.deleteMany({where:{sekolahId:{in:schoolIds}}});
    await prisma.tahunAjaran.deleteMany({where:{sekolahId:{in:schoolIds}}});
    await prisma.pengguna.deleteMany({where:{id:{in:userIds}}});
    await prisma.shiftKerja.deleteMany({where:{sekolahId:{in:schoolIds}}});
    await prisma.peranIzin.deleteMany({where:{peranId:{in:roleIds}}});
    await prisma.peran.deleteMany({where:{id:{in:roleIds}}});
    await prisma.sekolah.deleteMany({where:{id:{in:schoolIds}}});
    if (paketId) await prisma.paket.delete({where:{id:paketId}});
    await prisma.izin.deleteMany({where:{id:{in:createdIzin}}});
    await prisma.$disconnect();
  });

  const suffix = randomUUID().slice(0,8);
  async function school(label: string) {
    const row = await prisma.sekolah.create({data:{nama:`QA ${label}`,kode:`${label}-${suffix}`,subdomain:`qa-${label.toLowerCase()}-${suffix}`,status:"aktif",metodeAbsensiAktif:["manual"]}});
    schoolIds.push(row.id);
    return row;
  }
  const schoolA = await school("A");
  const schoolB = await school("B");
  async function role(nama: string, sekolahId: string) {
    const row = await prisma.peran.create({data:{nama,namaTampilan:nama,sekolahId,status:"aktif"}});
    roleIds.push(row.id);
    return row;
  }
  const adminRole = await role("admin_sekolah",schoolA.id);
  const studentRole = await role("siswa",schoolA.id);
  const teacherRole = await role("guru",schoolA.id);
  const otherRole = await role("siswa",schoolB.id);
  for (const nama of ["ppdb.view","lms.view","lms.update","lms.create","laporan.view","absensi.view"]) {
    let izin = await prisma.izin.findUnique({where:{nama}});
    if (!izin) {
      izin = await prisma.izin.create({data:{nama,modul:nama.split(".")[0],aksi:nama.split(".")[1],status:"aktif"}});
      createdIzin.push(izin.id);
    }
    await prisma.peranIzin.create({data:{peranId:adminRole.id,izinId:izin.id}});
    if (nama === "lms.create" || nama === "lms.view") {
      for (const peranId of [studentRole.id,teacherRole.id]) await prisma.peranIzin.create({data:{peranId,izinId:izin.id}});
    }
  }
  const paket = await prisma.paket.create({data:{nama:`QA ${suffix}`,harga:0,durasi:365,status:"aktif"}});
  paketId = paket.id;
  for (const sekolahId of schoolIds) await prisma.langgananSekolah.create({data:{sekolahId,paketId,statusLangganan:"active",tanggalBerakhir:new Date(Date.now()+86400000)}});
  const password = "LocalApiQa123!";
  const kataSandi = await bcrypt.hash(password,4);
  async function user(label: string, peran: any, sekolahId: string) {
    const row = await prisma.pengguna.create({data:{namaPengguna:`qa_${label}_${suffix}`,email:`qa_${label}_${suffix}@example.test`,namaLengkap:`QA ${label}`,kataSandi,sekolahId,peranId:peran.id,status:"aktif"}});
    userIds.push(row.id);
    return row;
  }
  const admin = await user("Admin",adminRole,schoolA.id);
  const student = await user("Siswa",studentRole,schoolA.id);
  const teacher = await user("Guru",teacherRole,schoolA.id);
  const other = await user("Lain",otherRole,schoolB.id);
  const tokenFor = (row: any, peran: any) => generateAccessToken({userId:row.id,email:row.email,role:peran.nama,roleId:peran.id,sekolahId:row.sekolahId,izin:[],modulAktif:[]});
  const studentToken = tokenFor(student,studentRole);
  const teacherToken = tokenFor(teacher,teacherRole);
  let adminToken = tokenFor(admin,adminRole);
  async function request(endpoint: string, token: string | null = adminToken, method = "GET", body?: unknown) {
    return fetch(base+endpoint, {method,headers:{...(token && {Authorization:`Bearer ${token}`}),...(body !== undefined && {"Content-Type":"application/json"})},...(body !== undefined && {body:JSON.stringify(body)})});
  }
  async function json(endpoint: string, token: string | null = adminToken, method = "GET", body?: unknown) {
    const response = await request(endpoint,token,method,body);
    return {status:response.status,body:await response.json() as any};
  }
  const yearA = await prisma.tahunAjaran.create({data:{sekolahId:schoolA.id,tahunAjaran:"2026/2027",semester:"ganjil"}});
  const yearB = await prisma.tahunAjaran.create({data:{sekolahId:schoolB.id,tahunAjaran:"2026/2027",semester:"ganjil"}});
  const classA = await prisma.kelas.create({data:{sekolahId:schoolA.id,tahunAjaranId:yearA.id,nama:"QA A",tingkat:"10"}});
  const classB = await prisma.kelas.create({data:{sekolahId:schoolB.id,tahunAjaranId:yearB.id,nama:"QA B",tingkat:"10"}});
  const shift = await prisma.shiftKerja.create({data:{sekolahId:schoolA.id,nama:"QA Shift",jamMasuk:"00:00",jamKeluar:"23:59",toleransiTerlambatMenit:0}});
  const jalurA = await prisma.jalurPpdb.create({data:{sekolahId:schoolA.id,nama:"QA Reguler",kuota:100,status:"aktif"}});
  const jalurB = await prisma.jalurPpdb.create({data:{sekolahId:schoolB.id,nama:"QA Lain",kuota:100,status:"aktif"}});
  const registrationIds: string[] = [];
  for (const [index,status] of ["menunggu","menunggu","lulus","ditolak","menunggu","menunggu"].entries()) {
    const foreign = index === 5;
    const row = await prisma.pendaftaranPpdb.create({data:{sekolahId:foreign?schoolB.id:schoolA.id,jalurPpdbId:foreign?jalurB.id:jalurA.id,nomorPendaftaran:`QA-${suffix}-${index}`,nisn:`${Date.now()}${index}`,namaLengkap:`QA Pendaftar ${index}`,tempatLahir:"QA",tanggalLahir:new Date("2011-01-01T00:00:00Z"),jenisKelamin:"L",alamat:"Alamat QA",status,...(index===4 && {dihapusPada:new Date()}),...(index===2 && {dikonversiKePenggunaId:student.id})}});
    registrationIds.push(row.id);
  }
  await prisma.berkasPpdb.create({data:{pendaftaranPpdbId:registrationIds[2],namaBerkas:"KK",urlFile:"/uploads/qa-placeholder.pdf"}});
  await prisma.berkasPpdb.create({data:{pendaftaranPpdbId:registrationIds[2],namaBerkas:"AKTE",urlFile:"/uploads/qa-deleted.pdf",dihapusPada:new Date()}});
  const rows: any[] = [];
  async function attendance(pengguna: any, date: string, kelasId: string | null, sekolahId: string | null, status = "hadir", extra = {}) {
    const row = await prisma.absensi.create({data:{penggunaId:pengguna.id,tanggal:new Date(`${date}T00:00:00Z`),kelasId,sekolahId,status,metode:"manual",...extra}});
    rows.push(row);
    return row;
  }
  await attendance(student,"2026-09-14",classA.id,null);
  await attendance(student,"2026-09-15",classA.id,null,"izin");
  await attendance(teacher,"2026-09-15",classA.id,null,"sakit");
  await attendance(student,"2026-10-18",classA.id,schoolA.id);
  const late = await attendance(teacher,"2026-10-18",null,null,"hadir",{statusShift:"terlambat_dan_pulang_cepat",terlambatMenit:12,waktuMasuk:new Date("2026-10-18T01:12:00Z"),waktuKeluar:new Date("2026-10-18T06:00:00Z")});
  await attendance(teacher,"2026-10-17",null,schoolA.id);
  const foreign = await attendance(other,"2026-10-18",null,schoolB.id);
  const conflicting = await attendance(other,"2026-10-18",classA.id,schoolB.id);
  await attendance(student,"2026-10-18",classB.id,schoolB.id);
  await attendance(teacher,"2026-10-18",null,schoolB.id);

  await t.test("real admin login succeeds", async () => {
    const login = await json("/api/auth/login",null,"POST",{identifier:admin.email,kataSandi:password});
    assert.equal(login.status,200);
    assert.ok(login.body.token);
    adminToken = login.body.token;
  });
  await t.test("pendaftar list and statistics are paginated and scoped to the school", async () => {
    const result = await json("/api/ppdb/pendaftar?page=2&limit=2");
    assert.equal(result.status,200);
    assert.equal(result.body.data.length,2);
    assert.equal(result.body.meta.total,4);
    assert.equal(result.body.meta.totalPages,2);
    assert.deepEqual(result.body.statistik,{total:4,menunggu:2,lulus:1,ditolak:1});
    assert.ok(result.body.data.every((row:any)=>row.sekolahId===schoolA.id));
    const stats = await json("/api/ppdb/pendaftar/statistik");
    assert.equal(stats.status,200);
    assert.deepEqual(stats.body.data,result.body.statistik);
  });
  await t.test("pendaftar search and status/jalur filters use real data", async () => {
    const result = await json(`/api/ppdb/pendaftar?search=pendaftar%202&status=lulus&jalurPpdbId=${jalurA.id}`);
    assert.equal(result.status,200);
    assert.equal(result.body.meta.total,1);
    assert.equal(result.body.data[0].id,registrationIds[2]);
  });
  await t.test("pendaftar detail returns active documents without user credentials", async () => {
    const result = await json(`/api/ppdb/pendaftar/${registrationIds[2]}`);
    assert.equal(result.status,200);
    assert.equal(result.body.data.berkasPpdb.length,1);
    assert.equal(result.body.data.pengguna.id,student.id);
    assert.doesNotMatch(JSON.stringify(result.body),/kataSandi|pinHash|embeddingVector/);
  });
  await t.test("pendaftar authentication, permissions and tenant boundaries are enforced", async () => {
    assert.equal((await json("/api/ppdb/pendaftar",null)).status,401);
    assert.equal((await json("/api/ppdb/pendaftar",studentToken)).status,403);
    for (const index of [4,5]) assert.equal((await json(`/api/ppdb/pendaftar/${registrationIds[index]}`)).status,404);
    assert.equal((await json(`/api/ppdb/pendaftar?sekolahId=${schoolB.id}`)).status,403);
    assert.equal((await json(`/api/ppdb/pendaftar/statistik?sekolahId=${schoolB.id}`)).status,403);
  });
  await t.test("invalid pendaftar requests return 400", async () => {
    for (const suffix of ["?page=0","?limit=-1","?status=unknown","/invalid-id"]) assert.equal((await json(`/api/ppdb/pendaftar${suffix}`)).status,400);
  });
  await t.test("class attendance returns the exact September and October dates", async () => {
    for (const [date,count] of [["2026-09-14",1],["2026-09-15",2],["2026-10-18",1]] as const) {
      const result = await json(`/api/absensi/kelas/${classA.id}?tanggal=${date}`);
      assert.equal(result.status,200);
      assert.equal(result.body.data.length,count);
      assert.ok(result.body.data.every((row:any)=>row.tanggal.slice(0,10)===date));
    }
    assert.equal((await json(`/api/absensi/kelas/${classA.id}?tanggal=2026-10-25`)).body.data.length,0);
    assert.equal((await json(`/api/absensi/kelas/${classA.id}?tanggalMulai=2026-09-14&tanggalSelesai=2026-09-15`)).body.data.length,3);
  });
  await t.test("school attendance includes legacy and classless records with complete time fields", async () => {
    const result = await json("/api/absensi?limit=2");
    assert.equal(result.status,200);
    assert.equal(result.body.data.length,2);
    assert.equal(result.body.meta.total,6);
    assert.equal(result.body.meta.totalPages,3);
    assert.deepEqual(result.body.statistik,{total:6,hadir:4,terlambat:1,izin:1,sakit:1,alpha:0});
    const day = await json("/api/absensi?tanggal=2026-10-18");
    assert.equal(day.body.meta.total,2);
    const record = day.body.data.find((row:any)=>row.id===late.id);
    assert.equal(record.kelasId,null);
    assert.ok(record.waktuMasuk&&record.waktuKeluar);
    assert.equal(record.pengguna.peran.nama,"guru");
    assert.doesNotMatch(JSON.stringify(day.body),/kataSandi|pinHash|embeddingVector/);
  });
  await t.test("date ranges, role, search, class and late filters compose correctly", async () => {
    assert.equal((await json("/api/absensi?tanggalMulai=2026-09-14&tanggalSelesai=2026-09-15")).body.meta.total,3);
    const result = await json("/api/absensi?tanggal=2026-10-18&role=guru&search=qa%20guru&status=terlambat");
    assert.equal(result.body.meta.total,1);
    assert.equal(result.body.data[0].id,late.id);
    assert.equal((await json(`/api/absensi?tanggal=2026-10-18&kelasId=${classA.id}`)).body.meta.total,1);
  });
  await t.test("attendance tenant ownership cannot be overridden by user or class relations", async () => {
    assert.equal((await json("/api/absensi",null)).status,401);
    assert.equal((await json("/api/absensi",teacherToken)).status,403);
    assert.equal((await json(`/api/absensi?sekolahId=${schoolB.id}`)).status,403);
    assert.equal((await json(`/api/absensi?penggunaId=${other.id}`)).body.meta.total,0);
    assert.equal((await json(`/api/absensi/kelas/${classB.id}?tanggal=2026-10-18`)).status,403);
    assert.equal((await json(`/api/absensi/${conflicting.id}`,adminToken,"PATCH",{status:"izin"})).status,404);
  });
  await t.test("student history includes legacy records without leaking other schools", async () => {
    const result = await json(`/api/absensi/siswa/${student.id}`);
    assert.equal(result.status,200);
    assert.equal(result.body.meta.total,3);
    assert.equal((await json(`/api/absensi/siswa/${other.id}`)).status,404);
  });
  await t.test("teacher monitoring returns the selected calendar date and classless entry", async () => {
    const result = await json("/api/absensi/monitoring-guru?tanggal=2026-10-18");
    assert.equal(result.status,200);
    assert.deepEqual(result.body.data.map((row:any)=>row.id),[late.id]);
  });
  await t.test("Excel export includes the exact selected day and classless attendance", async () => {
    const response = await request("/api/absensi/export?tanggalMulai=2026-10-18&tanggalSelesai=2026-10-18");
    assert.equal(response.status,200);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(Buffer.from(await response.arrayBuffer()));
    const worksheet = workbook.worksheets[0];
    assert.equal(worksheet.rowCount,3);
    for (const index of [2,3]) assert.equal(worksheet.getRow(index).getCell(2).value.toISOString().slice(0,10),"2026-10-18");
  });
  await t.test("invalid and reversed attendance dates return 400 across all readers", async () => {
    for (const endpoint of ["/api/absensi?tanggal=2026-02-30",`/api/absensi/kelas/${classA.id}?tanggal=18-10-2026`,`/api/absensi/kelas/${classA.id}?tanggal=2026-10-18&tanggalMulai=2026-10-17`,"/api/absensi/monitoring-guru?tanggal=invalid","/api/absensi/export?tanggalMulai=2026-10-18&tanggalSelesai=2026-10-17","/api/absensi?tanggal=2026-10-18&tanggalMulai=2026-10-17","/api/absensi?page=0"]) assert.equal((await json(endpoint)).status,400);
  });
  await t.test("admin updates persist, retain early-departure flags and record the actor", async () => {
    const result = await json(`/api/absensi/${late.id}`,adminToken,"PATCH",{status:"hadir",keterangan:"Koreksi QA"});
    assert.equal(result.status,200);
    assert.equal(result.body.data.diperbaruiOleh,admin.id);
    assert.equal(result.body.data.statusShift,"pulang_cepat");
    assert.equal(result.body.data.terlambatMenit,0);
    const updated = await prisma.absensi.findUnique({where:{id:late.id}});
    assert.equal(updated.keterangan,"Koreksi QA");
    const corrected = await json(`/api/absensi/${late.id}`,adminToken,"PATCH",{status:"terlambat"});
    assert.equal(corrected.body.data.status,"hadir");
    assert.equal(corrected.body.data.statusShift,"terlambat_dan_pulang_cepat");
    assert.equal(corrected.body.data.keterangan,"Koreksi QA");
  });
  await t.test("admin updates reject forbidden roles, foreign records and mass assignment", async () => {
    assert.equal((await json(`/api/absensi/${late.id}`,teacherToken,"PATCH",{status:"izin"})).status,403);
    assert.equal((await json(`/api/absensi/${foreign.id}`,adminToken,"PATCH",{status:"izin"})).status,404);
    for (const body of [{},{status:"unknown"},{status:"hadir",sekolahId:schoolB.id},{penggunaId:other.id}]) assert.equal((await json(`/api/absensi/${late.id}`,adminToken,"PATCH",body)).status,400);
    assert.equal((await json(`/api/absensi/${late.id}?sekolahId=${schoolB.id}`,adminToken,"PATCH",{status:"izin"})).status,403);
  });
  await t.test("new class attendance stores today's calendar date, school and entry timestamp", async () => {
    const payload = {kelasId:classA.id,status:"hadir",metode:"manual"};
    const result = await json("/api/absensi",studentToken,"POST",payload);
    assert.equal(result.status,201);
    assert.equal(result.body.data.tanggal,todayDateOnly().toISOString());
    assert.equal(result.body.data.sekolahId,schoolA.id);
    assert.ok(result.body.data.waktuMasuk);
    assert.equal((await json("/api/absensi",studentToken,"POST",payload)).status,400);
    assert.equal((await json("/api/absensi",studentToken,"POST",{status:"hadir",metode:"manual"})).status,400);
  });
  await t.test("shift check-in/out use the application day and local clock", async () => {
    const result = await json("/api/absensi/check-in",teacherToken,"POST",{shiftKerjaId:shift.id,metode:"manual"});
    assert.equal(result.status,201);
    assert.equal(result.body.data.tanggal,todayDateOnly().toISOString());
    assert.equal(result.body.data.terlambatMenit,localClockMinutes(new Date(result.body.data.waktuMasuk)));
    assert.equal((await json("/api/absensi/check-in",teacherToken,"POST",{shiftKerjaId:shift.id,metode:"manual"})).status,400);
    const checkout = await json("/api/absensi/check-out",teacherToken,"POST",{metode:"manual"});
    assert.equal(checkout.status,200);
    assert.equal(checkout.body.data.id,result.body.data.id);
    assert.ok(checkout.body.data.waktuKeluar);
  });
});
