import assert from "node:assert/strict";
import { once } from "node:events";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { todayDateOnly, localClockMinutes } from "../src/utils/dateOnly";

const testDatabaseUrl = process.env.TEST_DATABASE_URL;

test("backend HTTP API regressions with PostgreSQL", { skip: !testDatabaseUrl }, async t => {
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
  const tenantRegistrationIds: string[] = [];
  let paketId: string | undefined;
  t.after(async () => {
    server.closeAllConnections();
    await new Promise<void>(resolve => server.close(() => resolve()));
    await prisma.absensi.deleteMany({where:{penggunaId:{in:userIds}}});
    await prisma.permohonanIzin.deleteMany({where:{sekolahId:{in:schoolIds}}});
    await prisma.menuKonfigurasi.deleteMany({where:{sekolahId:{in:schoolIds}}});
    await prisma.halamanCms.deleteMany({where:{sekolahId:{in:schoolIds}}});
    await prisma.artikelCms.deleteMany({where:{sekolahId:{in:schoolIds}}});
    await prisma.berkasPpdb.deleteMany({where:{pendaftaranPpdb:{sekolahId:{in:schoolIds}}}});
    await prisma.hasilSeleksiPpdb.deleteMany({where:{pendaftaranPpdb:{sekolahId:{in:schoolIds}}}});
    await prisma.pendaftaranPpdb.deleteMany({where:{sekolahId:{in:schoolIds}}});
    await prisma.gelombangPpdb.deleteMany({where:{sekolahId:{in:schoolIds}}});
    await prisma.jalurPpdb.deleteMany({where:{sekolahId:{in:schoolIds}}});
    await prisma.langgananSekolah.deleteMany({where:{sekolahId:{in:schoolIds}}});
    await prisma.kelas.deleteMany({where:{sekolahId:{in:schoolIds}}});
    await prisma.lantai.deleteMany({where:{gedung:{sekolahId:{in:schoolIds}}}});
    await prisma.gedung.deleteMany({where:{sekolahId:{in:schoolIds}}});
    await prisma.tahunAjaran.deleteMany({where:{sekolahId:{in:schoolIds}}});
    await prisma.pengguna.deleteMany({where:{id:{in:userIds}}});
    await prisma.kategoriJabatan.deleteMany({where:{sekolahId:{in:schoolIds}}});
    await prisma.shiftKerja.deleteMany({where:{sekolahId:{in:schoolIds}}});
    await prisma.peranIzin.deleteMany({where:{peranId:{in:roleIds}}});
    await prisma.peran.deleteMany({where:{id:{in:roleIds}}});
    await prisma.sekolah.deleteMany({where:{id:{in:schoolIds}}});
    await prisma.pendaftaranTenant.deleteMany({where:{id:{in:tenantRegistrationIds}}});
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
  for (const nama of ["ppdb.view","ppdb.create","ppdb.update","ppdb.delete","cms.create","cms.update","cms.view","cms.delete","manajemen_aset.view","manajemen_aset.create","manajemen_pengguna.view","lms.view","lms.update","lms.create","laporan.view","absensi.view"]) {
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
  const kategori = await prisma.kategoriJabatan.create({data:{sekolahId:schoolA.id,nama:"Guru Mapel",kode:`QA-${suffix}`,status:"aktif"}});
  await prisma.pengguna.update({where:{id:teacher.id},data:{jabatan:"Guru Mapel",golongan:"III/a",shiftKerja:"pagi",shiftKerjaId:shift.id,kategoriJabatanId:kategori.id}});
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

  await t.test("leave list includes applicant identity, job and role without credentials", async () => {
    for (const row of [teacher,student,other]) await prisma.permohonanIzin.create({data:{sekolahId:row.sekolahId,penggunaId:row.id,jenis:"izin",tanggalMulai:new Date("2026-10-29T00:00:00Z"),tanggalSelesai:new Date("2026-10-29T00:00:00Z"),alasan:"Keperluan pengujian QA"}});
    const result = await json("/api/permohonan-izin");
    assert.equal(result.status,200);
    assert.equal(result.body.meta.total,2);
    const izin = result.body.data.find((row:any)=>row.penggunaId===teacher.id);
    assert.equal(izin.pengguna.namaLengkap,teacher.namaLengkap);
    assert.equal(izin.pengguna.jabatan,"Guru Mapel");
    assert.equal(izin.pengguna.peran.id,teacherRole.id);
    assert.equal(izin.pengguna.peran.nama,"guru");
    assert.equal(izin.pengguna.peran.namaTampilan,"guru");
    assert.doesNotMatch(JSON.stringify(result.body),/kataSandi|pinHash|embeddingVector/);
    assert.equal((await json("/api/permohonan-izin",null)).status,401);
  });
  await t.test("students only receive their own leave requests", async () => {
    const result = await json("/api/permohonan-izin",studentToken);
    assert.equal(result.status,200);
    assert.equal(result.body.meta.total,1);
    assert.equal(result.body.data[0].penggunaId,student.id);
    assert.equal(result.body.data[0].pengguna.peran.nama,"siswa");
  });
  await t.test("user detail returns both shift representations and job category", async () => {
    const result = await json(`/api/users/${teacher.id}`);
    assert.equal(result.status,200);
    assert.equal(result.body.data.shiftKerja,"pagi");
    assert.equal(result.body.data.shiftKerjaId,shift.id);
    assert.equal(result.body.data.shiftKerjaMaster.id,shift.id);
    assert.equal(result.body.data.shiftKerjaMaster.jamMasuk,"00:00");
    assert.equal(result.body.data.jabatan,"Guru Mapel");
    assert.equal(result.body.data.golongan,"III/a");
    assert.equal(result.body.data.kategoriJabatanId,kategori.id);
    assert.equal(result.body.data.kategoriJabatan.nama,"Guru Mapel");
    assert.doesNotMatch(JSON.stringify(result.body),/kataSandi|pinHash/);
    assert.equal((await json(`/api/users/${other.id}`)).status,403);
    assert.equal((await json(`/api/users/${teacher.id}`,studentToken)).status,403);
  });
  await t.test("unassigned users have explicit null shift/category fields", async () => {
    const result = await json(`/api/users/${student.id}`);
    assert.equal(result.status,200);
    for (const key of ["shiftKerja","shiftKerjaId","shiftKerjaMaster","kategoriJabatanId","kategoriJabatan"]) {
      assert.ok(Object.hasOwn(result.body.data,key));
      assert.equal(result.body.data[key],null);
    }
  });

  const publicSlugs: string[] = [];
  const privateSlugs: string[] = [];
  for (const [index,status] of ["dipublikasikan","publikasi","aktif","draft","nonaktif","arsip","dipublikasikan"].entries()) {
    const slug=`qa-${suffix}-${index}`;
    await prisma.halamanCms.create({data:{sekolahId:schoolA.id,judul:`QA page ${index}`,slug,konten:"Konten QA",status,...(index===6&&{dihapusPada:new Date()})}});
    await prisma.artikelCms.create({data:{sekolahId:schoolA.id,judul:`QA article ${index}`,slug,konten:"Artikel QA",status,...(index===6&&{dihapusPada:new Date()})}});
    (index<3?publicSlugs:privateSlugs).push(slug);
  }
  const foreignSlug=`qa-foreign-${suffix}`;
  await prisma.halamanCms.create({data:{sekolahId:schoolB.id,judul:"QA foreign",slug:foreignSlug,status:"dipublikasikan"}});
  const publicBase=`/api/publik/${schoolA.subdomain}`;
  await t.test("public page list and profile use the same three published statuses", async () => {
    const list = await json(`${publicBase}/halaman`,null);
    const profile = await json(`${publicBase}/profil`,null);
    assert.equal(list.status,200);
    assert.equal(profile.status,200);
    assert.deepEqual(list.body.data.map((row:any)=>row.slug).sort(),[...publicSlugs].sort());
    assert.deepEqual(profile.body.data.daftarCms.map((row:any)=>row.slug).sort(),[...publicSlugs].sort());
    assert.deepEqual(profile.body.data.halamanCms,profile.body.data.daftarCms);
  });
  await t.test("published page details support canonical and legacy statuses", async () => {
    for (const slug of publicSlugs) {
      const detail = await json(`${publicBase}/halaman/${slug}`,null);
      assert.equal(detail.status,200);
      assert.equal(detail.body.data.slug,slug);
    }
  });
  await t.test("draft, inactive, archived, deleted and foreign pages are not public", async () => {
    for (const slug of [...privateSlugs,foreignSlug]) assert.equal((await json(`${publicBase}/halaman/${slug}`,null)).status,404);
  });
  await t.test("public articles share the same published-status policy", async () => {
    const result=await json(`${publicBase}/artikel`,null);
    assert.equal(result.status,200);
    assert.deepEqual(result.body.data.map((row:any)=>row.slug).sort(),[...publicSlugs].sort());
  });
  await t.test("public endpoints reject inactive and deleted schools", async () => {
    try {
      for (const data of [{status:"nonaktif"},{status:"aktif",dihapusPada:new Date()}]) {
        await prisma.sekolah.update({where:{id:schoolA.id},data});
        for (const endpoint of ["profil","tema","halaman",`halaman/${publicSlugs[0]}`,"artikel","konfigurasi"]) assert.equal((await json(`${publicBase}/${endpoint}`,null)).status,404);
      }
    } finally {
      await prisma.sekolah.update({where:{id:schoolA.id},data:{status:"aktif",dihapusPada:null}});
    }
  });
  await t.test("CMS create/update normalizes published aliases and keeps drafts private", async () => {
    for (const endpoint of ["halaman","artikel"]) {
      for (const status of ["dipublikasikan","publikasi","aktif"]) {
        const result=await json(`/api/cms/${endpoint}`,adminToken,"POST",{judul:`QA ${endpoint} ${status} ${suffix}`,status});
        assert.equal(result.status,201);
        assert.equal(result.body.data.status,"dipublikasikan");
        if (endpoint==="halaman") {
          const updated=await json(`/api/cms/halaman/${result.body.data.id}`,adminToken,"PUT",{judul:`QA draft ${status} ${suffix}`,status:"draft"});
          assert.equal(updated.status,200);
          assert.equal((await json(`${publicBase}/halaman/${updated.body.data.slug}`,null)).status,404);
        }
      }
    }
    assert.equal((await json("/api/cms/halaman",adminToken,"POST",{judul:"QA invalid status",status:"unknown"})).status,400);
  });

  await t.test("creating a building persists exactly one linked default floor", async () => {
    const result = await json("/api/infrastruktur/gedung",adminToken,"POST",{nama:"Gedung QA",kode:"QA"});
    assert.equal(result.status,201);
    const gedung = result.body.data;
    assert.equal(gedung.sekolahId,schoolA.id);
    assert.equal(gedung.lantai.length,1);
    assert.equal(gedung.lantai[0].nama,"Lantai 1");
    assert.equal(gedung.lantai[0].nomorLantai,1);
    assert.equal(gedung.lantai[0].status,"aktif");
    assert.equal(gedung.lantai[0].gedungId,gedung.id);
    assert.equal(await prisma.lantai.count({where:{gedungId:gedung.id}}),1);
    const listed = await json(`/api/infrastruktur/lantai/gedung/${gedung.id}`);
    assert.deepEqual(listed.body.data.map((row:any)=>row.id),[gedung.lantai[0].id]);
    assert.equal((await json("/api/infrastruktur/gedung",studentToken,"POST",{nama:"Forbidden"})).status,403);
  });

  const cmsPage=await prisma.halamanCms.findUnique({where:{slug:publicSlugs[0]}});
  const foreignPage=await prisma.halamanCms.findUnique({where:{slug:foreignSlug}});
  const menuPayload={halamanCmsId:cmsPage.id,section:"hero",judul:"Menu QA",konten:"Konten hero",urutan:2};
  let menuId="";
  await t.test("menu upsert uses the page ID and updates an existing section", async () => {
    const first=await json("/api/cms/menu-konfigurasi",adminToken,"POST",menuPayload);
    assert.equal(first.status,200);
    menuId=first.body.data.id;
    assert.equal(first.body.data.halamanCmsId,cmsPage.id);
    assert.equal(Object.hasOwn(first.body.data,"halaman"),false);
    const updated=await json("/api/cms/menu-konfigurasi",adminToken,"POST",{...menuPayload,judul:"Menu QA updated"});
    assert.equal(updated.status,200);
    assert.equal(updated.body.data.id,menuId);
    assert.equal(updated.body.data.judul,"Menu QA updated");
    assert.equal(await prisma.menuKonfigurasi.count({where:{halamanCmsId:cmsPage.id,section:"hero"}}),1);
    const list=await json("/api/cms/menu-konfigurasi");
    assert.equal(list.body.data[0].halamanCms.id,cmsPage.id);
  });
  await t.test("page GET responses include their ordered active menu sections", async () => {
    for (const endpoint of ["/api/cms/halaman",`${publicBase}/halaman`,`${publicBase}/profil`,`${publicBase}/halaman/${cmsPage.slug}`]) {
      const result=await json(endpoint,endpoint.startsWith("/api/cms")?adminToken:null);
      assert.equal(result.status,200);
      const page=Array.isArray(result.body.data)
        ? result.body.data.find((row:any)=>row.id===cmsPage.id)
        : result.body.data.halamanCms?.find((row:any)=>row.id===cmsPage.id) || result.body.data;
      assert.equal(page.menuKonfigurasi[0].id,menuId);
      assert.equal(page.menuKonfigurasi[0].halamanCmsId,cmsPage.id);
    }
    const config=await json(`${publicBase}/konfigurasi`,null);
    assert.equal(config.body.data[cmsPage.id].hero.id,menuId);
    assert.equal(config.body.data[cmsPage.id].hero.halamanCms.slug,cmsPage.slug);
    assert.doesNotMatch(JSON.stringify(config.body),/dibuatOleh|dihapusOleh/);
  });
  await t.test("menu validation rejects free text, malformed and foreign page IDs", async () => {
    for (const body of [
      {halaman:"beranda",section:"hero",judul:"Legacy"},
      {...menuPayload,halaman:"beranda"},
      {...menuPayload,halamanCmsId:"beranda"},
      {...menuPayload,section:" "},
      {...menuPayload,status:"draft"},
    ]) assert.equal((await json("/api/cms/menu-konfigurasi",adminToken,"POST",body)).status,400);
    for (const halamanCmsId of [foreignPage.id,randomUUID()]) {
      assert.equal((await json("/api/cms/menu-konfigurasi",adminToken,"POST",{...menuPayload,halamanCmsId})).status,404);
      assert.equal((await json(`/api/cms/menu-konfigurasi/${menuId}`,adminToken,"PUT",{...menuPayload,halamanCmsId})).status,404);
    }
    const foreignMenu=await prisma.menuKonfigurasi.create({data:{...menuPayload,sekolahId:schoolB.id,halamanCmsId:foreignPage.id}});
    assert.equal((await json(`/api/cms/menu-konfigurasi/${foreignMenu.id}`,adminToken,"PUT",menuPayload)).status,404);
    assert.equal((await json(`/api/cms/menu-konfigurasi/${foreignMenu.id}`,adminToken,"DELETE")).status,404);
    assert.equal((await prisma.menuKonfigurasi.findUnique({where:{id:foreignMenu.id}})).judul,menuPayload.judul);
    assert.equal((await json("/api/cms/menu-konfigurasi",studentToken,"POST",menuPayload)).status,403);
  });
  await t.test("menu edits, deactivation and restoration retain their page relation", async () => {
    const edited=await json(`/api/cms/menu-konfigurasi/${menuId}`,adminToken,"PUT",{...menuPayload,judul:"Edited",urutan:1});
    assert.equal(edited.status,200);
    assert.equal(edited.body.data.halamanCmsId,cmsPage.id);
    assert.equal((await json(`/api/cms/menu-konfigurasi/${menuId}`,adminToken,"DELETE")).status,200);
    assert.equal((await json(`${publicBase}/konfigurasi`,null)).body.data[cmsPage.id],undefined);
    const pages=await json("/api/cms/halaman");
    assert.deepEqual(pages.body.data.find((row:any)=>row.id===cmsPage.id).menuKonfigurasi,[]);
    const restored=await json("/api/cms/menu-konfigurasi",adminToken,"POST",menuPayload);
    assert.equal(restored.body.data.id,menuId);
    assert.equal(restored.body.data.dihapusOleh,null);
  });
  await t.test("draft pages cannot expose active menu content through public configuration", async () => {
    await prisma.halamanCms.update({where:{id:cmsPage.id},data:{status:"draft"}});
    assert.equal((await json(`${publicBase}/konfigurasi`,null)).body.data[cmsPage.id],undefined);
    await prisma.halamanCms.update({where:{id:cmsPage.id},data:{status:"dipublikasikan"}});
    assert.equal((await json(`${publicBase}/konfigurasi`,null)).body.data[cmsPage.id].hero.id,menuId);
  });
  await t.test("deleting a CMS page deactivates its menus and prevents reattachment", async () => {
    assert.equal((await json(`/api/cms/halaman/${cmsPage.id}`,adminToken,"DELETE")).status,200);
    const menu=await prisma.menuKonfigurasi.findUnique({where:{id:menuId}});
    assert.equal(menu.status,"nonaktif");
    assert.equal(menu.dihapusOleh,admin.id);
    assert.equal(menu.halamanCmsId,cmsPage.id);
    assert.equal((await json(`${publicBase}/konfigurasi`,null)).body.data[cmsPage.id],undefined);
    assert.equal((await json("/api/cms/menu-konfigurasi",adminToken,"POST",menuPayload)).status,404);
    assert.equal((await json(`/api/cms/menu-konfigurasi/${menuId}`,adminToken,"PUT",menuPayload)).status,404);
  });
  await t.test("default page seeding is tenant-scoped, repeatable and preserves edited content", async () => {
    const {seedDefaultHalamanCms}=require("../prisma/seedCms");
    for (const sekolahId of schoolIds) await prisma.$transaction((tx:any)=>seedDefaultHalamanCms(tx,sekolahId,admin.id));
    const defaults=await prisma.halamanCms.findMany({where:{sekolahId:schoolA.id,judul:{in:["Beranda","Tentang","Kontak"]}}});
    assert.equal(defaults.length,3);
    const beranda=defaults.find((row:any)=>row.judul==="Beranda");
    await prisma.halamanCms.update({where:{id:beranda.id},data:{konten:"Edited by admin",status:"dipublikasikan"}});
    for (const sekolahId of schoolIds) await prisma.$transaction((tx:any)=>seedDefaultHalamanCms(tx,sekolahId,admin.id));
    const saved=await prisma.halamanCms.findUnique({where:{id:beranda.id}});
    assert.equal(saved.konten,"Edited by admin");
    assert.equal(saved.status,"dipublikasikan");
    for (const sekolahId of schoolIds) {
      const rows=await prisma.halamanCms.findMany({where:{sekolahId,judul:{in:["Beranda","Tentang","Kontak"]}}});
      assert.equal(rows.length,3);
      assert.equal(new Set(rows.map((row:any)=>row.slug)).size,3);
    }
    assert.equal(await prisma.halamanCms.count({where:{judul:{in:["Beranda","Tentang","Kontak"]},sekolahId:{in:schoolIds}}}),6);
  });

  const foreignWave=await prisma.gelombangPpdb.create({data:{sekolahId:schoolB.id,jalurPpdbId:jalurB.id,nama:"Gelombang Sekolah B",tanggalMulai:new Date("2026-10-01T00:00:00Z"),tanggalSelesai:new Date("2026-11-01T00:00:00Z")}});
  const wavePayload={nama:"Gelombang QA 1",jalurPpdbId:jalurA.id,tanggalMulai:"2026-10-01",tanggalSelesai:"2026-11-01",kuota:0,status:"aktif"};
  let waveId="";
  await t.test("gelombang GET route returns a scoped JSON list instead of Cannot GET", async () => {
    const result=await json("/api/gelombang-ppdb");
    assert.equal(result.status,200);
    assert.equal(result.body.success,true);
    assert.deepEqual(result.body.data,[]);
  });
  await t.test("gelombang create/detail preserves calendar dates, zero quota and audit identity", async () => {
    const result=await json("/api/gelombang-ppdb",adminToken,"POST",wavePayload);
    assert.equal(result.status,201);
    waveId=result.body.data.id;
    assert.equal(result.body.data.sekolahId,schoolA.id);
    assert.equal(result.body.data.dibuatOleh,admin.id);
    assert.equal(result.body.data.kuota,0);
    assert.equal(result.body.data.tanggalMulai,"2026-10-01T00:00:00.000Z");
    assert.equal(result.body.data.tanggalSelesai,"2026-11-01T00:00:00.000Z");
    const detail=await json(`/api/gelombang-ppdb/${waveId}`);
    assert.equal(detail.status,200);
    assert.deepEqual(detail.body.data.jalurPpdb,{id:jalurA.id,nama:jalurA.nama});
  });
  await t.test("gelombang supports search, status and jalur filters", async () => {
    const result=await json(`/api/gelombang-ppdb?search=qa%201&status=aktif&jalurPpdbId=${jalurA.id}`);
    assert.equal(result.status,200);
    assert.deepEqual(result.body.data.map((row:any)=>row.id),[waveId]);
    assert.equal((await json("/api/gelombang-ppdb?status=nonaktif")).body.data.length,0);
  });
  await t.test("gelombang update clears optional relations/quota and persists nonaktif", async () => {
    const result=await json(`/api/gelombang-ppdb/${waveId}`,adminToken,"PUT",{...wavePayload,nama:"Gelombang QA 2",jalurPpdbId:null,kuota:null,status:"nonaktif"});
    assert.equal(result.status,200);
    assert.equal(result.body.data.jalurPpdb,null);
    assert.equal(result.body.data.kuota,null);
    assert.equal(result.body.data.status,"nonaktif");
    assert.equal(result.body.data.diperbaruiOleh,admin.id);
    const saved=await prisma.gelombangPpdb.findUnique({where:{id:waveId}});
    assert.equal(saved.nama,"Gelombang QA 2");
  });
  await t.test("gelombang validates dates, ranges, quotas, IDs and unexpected fields", async () => {
    for (const body of [
      {...wavePayload,tanggalMulai:"2026-02-30"},
      {...wavePayload,tanggalSelesai:"2026-09-30"},
      {...wavePayload,kuota:-1},{...wavePayload,kuota:0.5},
      {...wavePayload,status:"unknown"},{...wavePayload,sekolahId:schoolB.id},
    ]) assert.equal((await json("/api/gelombang-ppdb",adminToken,"POST",body)).status,400);
    assert.equal((await json("/api/gelombang-ppdb/not-a-uuid")).status,400);
    assert.equal((await json(`/api/gelombang-ppdb/${waveId}`,adminToken,"PUT",{...wavePayload,tanggalSelesai:"bad-date"})).status,400);
  });
  await t.test("gelombang cannot reference foreign or deleted jalur", async () => {
    assert.equal((await json("/api/gelombang-ppdb",adminToken,"POST",{...wavePayload,jalurPpdbId:jalurB.id})).status,404);
    assert.equal((await json(`/api/gelombang-ppdb/${waveId}`,adminToken,"PUT",{...wavePayload,jalurPpdbId:jalurB.id})).status,404);
    try {
      await prisma.jalurPpdb.update({where:{id:jalurA.id},data:{dihapusPada:new Date()}});
      assert.equal((await json("/api/gelombang-ppdb",adminToken,"POST",wavePayload)).status,404);
    } finally {await prisma.jalurPpdb.update({where:{id:jalurA.id},data:{dihapusPada:null}});}
  });
  await t.test("gelombang authorization and tenant boundaries protect all CRUD methods", async () => {
    assert.equal((await json("/api/gelombang-ppdb",null)).status,401);
    assert.equal((await json("/api/gelombang-ppdb",studentToken)).status,403);
    assert.equal((await json("/api/gelombang-ppdb",studentToken,"POST",wavePayload)).status,403);
    assert.equal((await json(`/api/gelombang-ppdb/${waveId}`,studentToken,"PUT",wavePayload)).status,403);
    assert.equal((await json(`/api/gelombang-ppdb/${waveId}`,studentToken,"DELETE")).status,403);
    assert.equal((await json(`/api/gelombang-ppdb?sekolahId=${schoolB.id}`)).status,403);
    assert.equal((await json(`/api/gelombang-ppdb/${foreignWave.id}`)).status,404);
    assert.equal((await json(`/api/gelombang-ppdb/${foreignWave.id}`,adminToken,"PUT",wavePayload)).status,404);
    assert.equal((await json(`/api/gelombang-ppdb/${foreignWave.id}`,adminToken,"DELETE")).status,404);
  });
  await t.test("gelombang can apply to all school jalur with an optional unlimited quota", async () => {
    const result=await json("/api/gelombang-ppdb",adminToken,"POST",{nama:"Gelombang Umum",tanggalMulai:"2026-10-29",tanggalSelesai:"2026-10-29"});
    assert.equal(result.status,201);
    assert.equal(result.body.data.status,"aktif");
    assert.equal(result.body.data.jalurPpdbId,null);
    assert.equal(result.body.data.kuota,null);
  });
  await t.test("gelombang deletion is soft and hides the record on subsequent reads", async () => {
    assert.equal((await json(`/api/gelombang-ppdb/${waveId}`,adminToken,"DELETE")).status,200);
    assert.equal((await json(`/api/gelombang-ppdb/${waveId}`)).status,404);
    assert.equal((await json(`/api/gelombang-ppdb/${waveId}`,adminToken,"DELETE")).status,404);
    assert.ok((await json("/api/gelombang-ppdb")).body.data.every((row:any)=>row.id!==waveId));
    const deleted=await prisma.gelombangPpdb.findUnique({where:{id:waveId}});
    assert.ok(deleted.dihapusPada);
    assert.equal(deleted.dihapusOleh,admin.id);
    assert.equal(deleted.status,"nonaktif");
    assert.equal((await prisma.gelombangPpdb.findUnique({where:{id:foreignWave.id}})).dihapusPada,null);
  });

  const tenantAdminRole = await prisma.peran.create({data:{nama:"admin_sekolah",namaTampilan:"Admin sekolah global",sekolahId:null,status:"aktif"}});
  roleIds.push(tenantAdminRole.id);
  const {konversiPendaftaranTenant}=require("../src/controllers/tenant.controller");
  async function tenantRegistration(label: string) {
    const row=await prisma.pendaftaranTenant.create({data:{
      jenisPendaftaran:"sekolah",namaPendaftar:`QA Tenant ${label}`,
      emailPendaftar:`qa_tenant_${label}_${suffix}@example.test`,kataSandiPendaftar:kataSandi,
      namaSekolah:`QA Tenant ${label}`,subdomain:`qa-tenant-${label}-${suffix}`,
      jenjangSekolah:"SMA",paketId:paket.id,kodeOtp:"123456",
      otpTimeout:new Date(Date.now()+300000),status:"menunggu_verifikasi",
    }});
    tenantRegistrationIds.push(row.id);
    return row;
  }
  function trackConvertedTenant(result: any) {
    schoolIds.push(result.sekolah.id);
    userIds.push(result.pengguna.id);
  }
  let approvedRegistrationId="";
  let approvedSchoolId="";
  await t.test("tenant conversion creates three published pages accessible on the public site", async () => {
    const registration=await tenantRegistration("paid");
    approvedRegistrationId=registration.id;
    const result=await prisma.$transaction((tx:any)=>konversiPendaftaranTenant(tx,registration.id,{isTrial:false}));
    trackConvertedTenant(result);
    approvedSchoolId=result.sekolah.id;
    const pages=await prisma.halamanCms.findMany({where:{sekolahId:approvedSchoolId},orderBy:{judul:"asc"}});
    assert.deepEqual(pages.map((page:any)=>page.judul),["Beranda","Kontak","Tentang"]);
    for (const page of pages) {
      assert.equal(page.status,"dipublikasikan");
      assert.equal(page.slug,`${page.judul.toLowerCase()}-${registration.subdomain}`);
      assert.equal(page.dibuatOleh,result.pengguna.id);
      assert.equal((await json(`/api/publik/${registration.subdomain}/halaman/${page.slug}`,null)).status,200);
    }
    const published=await json(`/api/publik/${registration.subdomain}/halaman`,null);
    assert.equal(published.status,200);
    assert.deepEqual(published.body.data.map((page:any)=>page.slug).sort(),pages.map((page:any)=>page.slug).sort());
  });
  await t.test("trial OTP verification also inserts three published default pages", async () => {
    const registration=await tenantRegistration("trial");
    const verified=await json("/api/tenant/verify",null,"POST",{email:registration.emailPendaftar,kodeOtp:"123456"});
    const saved=await prisma.pendaftaranTenant.findUnique({where:{id:registration.id}});
    if (saved.sekolahTerbuatId) schoolIds.push(saved.sekolahTerbuatId);
    if (saved.penggunaTerbuatId) userIds.push(saved.penggunaTerbuatId);
    assert.equal(verified.status,200);
    assert.equal(saved.status,"aktif");
    const pages=await prisma.halamanCms.findMany({where:{sekolahId:saved.sekolahTerbuatId}});
    assert.equal(pages.length,3);
    assert.ok(pages.every((page:any)=>page.status==="dipublikasikan"));
    assert.ok(pages.every((page:any)=>page.slug.endsWith(`-${registration.subdomain}`)));
  });
  await t.test("reprocessing an active tenant does not duplicate its default pages", async () => {
    const result=await prisma.$transaction((tx:any)=>konversiPendaftaranTenant(tx,approvedRegistrationId,{isTrial:false}));
    assert.equal(result.alreadyActive,true);
    assert.equal(result.sekolahTerbuatId,approvedSchoolId);
    assert.equal(await prisma.halamanCms.count({where:{sekolahId:approvedSchoolId}}),3);
  });
  await t.test("a failed default-page insert rolls back the school, user and tenant conversion", async () => {
    const registration=await tenantRegistration("collision");
    const collision=await prisma.halamanCms.create({data:{sekolahId:schoolA.id,judul:"Existing page",slug:`kontak-${registration.subdomain}`,status:"dipublikasikan"}});
    await assert.rejects(
      prisma.$transaction((tx:any)=>konversiPendaftaranTenant(tx,registration.id,{isTrial:false})),
      (error:any)=>error.code==="P2002",
    );
    assert.equal(await prisma.sekolah.count({where:{subdomain:registration.subdomain}}),0);
    assert.equal(await prisma.pengguna.count({where:{email:registration.emailPendaftar}}),0);
    assert.equal(await prisma.halamanCms.count({where:{slug:`beranda-${registration.subdomain}`}}),0);
    const saved=await prisma.pendaftaranTenant.findUnique({where:{id:registration.id}});
    assert.equal(saved.status,"menunggu_verifikasi");
    assert.equal(saved.sekolahTerbuatId,null);
    assert.equal(saved.penggunaTerbuatId,null);
    assert.equal((await prisma.halamanCms.findUnique({where:{id:collision.id}})).sekolahId,schoolA.id);
  });
  await t.test("a later transaction failure rolls back the newly inserted pages as well", async () => {
    const registration=await tenantRegistration("rollback");
    let createdSchoolId="";
    await assert.rejects(prisma.$transaction(async (tx:any)=>{
      const result=await konversiPendaftaranTenant(tx,registration.id,{isTrial:false});
      createdSchoolId=result.sekolah.id;
      throw new Error("QA forced transaction rollback");
    }),/QA forced transaction rollback/);
    assert.ok(createdSchoolId);
    assert.equal(await prisma.halamanCms.count({where:{sekolahId:createdSchoolId}}),0);
    assert.equal(await prisma.sekolah.count({where:{id:createdSchoolId}}),0);
    assert.equal(await prisma.langgananSekolah.count({where:{sekolahId:createdSchoolId}}),0);
    assert.equal(await prisma.pengguna.count({where:{email:registration.emailPendaftar}}),0);
    assert.equal((await prisma.pendaftaranTenant.findUnique({where:{id:registration.id}})).status,"menunggu_verifikasi");
  });
});
