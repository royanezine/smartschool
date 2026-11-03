import assert from "node:assert/strict";
import { once } from "node:events";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { todayDateOnly } from "../src/utils/dateOnly";

const databaseUrl = process.env.TEST_DATABASE_URL;
test("backend completion API contracts and tenant isolation", { skip: !databaseUrl }, async t => {
  assert.ok(["127.0.0.1", "localhost", "[::1]"].includes(new URL(databaseUrl!).hostname));
  process.env.DATABASE_URL = databaseUrl!;
  process.env.JWT_SECRET ||= "local-completion-tests-only";
  process.env.NODE_ENV = "test";
  const { prisma } = require("../src/config/db");
  const app = require("../src/app").default;
  const bcrypt = require("bcryptjs");
  const { generateAccessToken } = require("../src/utils/generateToken");
  const { assertActiveAttendanceDay, aggregateWeights } = require("../src/utils/schoolSettings");
  const server = app.listen(0, "127.0.0.1"); await once(server, "listening");
  const base = `http://127.0.0.1:${server.address().port}`;
  const suffix = randomUUID().slice(0,8);
  const schools: string[] = [], roles: string[] = [], users: string[] = [], permissions: string[] = [];
  let foundationId: string, packageId: string;
  const extraFoundations: string[] = [], registrations: string[] = [];
  const password = "Dummy-test-password1!";
  const hash = await bcrypt.hash(password, 10);
  const permissionNames = ["akademik.view","akademik.create","akademik.update","akademik.delete","ppdb.view","ppdb.create","ppdb.update","ppdb.delete","lms.view","lms.update","manajemen_pengguna.view","manajemen_pengguna.create","manajemen_pengguna.update","manajemen_aset.view","manajemen_aset.create","manajemen_aset.update","ujian.view","cms.view","cms.create","peminjaman_aset.view_own","peminjaman_aset.create_own"];
  t.after(async () => {
    server.closeAllConnections(); await new Promise<void>(r => server.close(() => r()));
    const inSchools = { in: schools };
    await prisma.nilaiAkhirMapel.deleteMany({where:{sekolahId:inSchools}});
    await prisma.nilai.deleteMany({where:{pengguna:{sekolahId:inSchools}}});
    await prisma.komponenNilai.deleteMany({where:{kelasMapel:{kelas:{sekolahId:inSchools}}}});
    await prisma.hasilAsesmen.deleteMany({where:{percobaanAsesmen:{pengguna:{sekolahId:inSchools}}}});
    await prisma.percobaanAsesmen.deleteMany({where:{pengguna:{sekolahId:inSchools}}});
    await prisma.asesmen.deleteMany({where:{kelasMapel:{kelas:{sekolahId:inSchools}}}});
    await prisma.kelasMapel.deleteMany({where:{kelas:{sekolahId:inSchools}}});
    await prisma.mataPelajaran.deleteMany({where:{sekolahId:inSchools}});
    await prisma.detailPeminjamanAset.deleteMany({where:{peminjaman:{sekolahId:inSchools}}});
    await prisma.peminjamanAset.deleteMany({where:{sekolahId:inSchools}});
    await prisma.aset.deleteMany({where:{sekolahId:inSchools}});
    await prisma.gudang.deleteMany({where:{sekolahId:inSchools}});
    await prisma.kategoriAset.deleteMany({where:{sekolahId:inSchools}});
    await prisma.pengumumanPpdb.deleteMany({where:{sekolahId:inSchools}});
    await prisma.absensi.deleteMany({where:{pengguna:{sekolahId:inSchools}}});
    await prisma.biometrikWajah.deleteMany({where:{pengguna:{sekolahId:inSchools}}});
    await prisma.anggotaKelas.deleteMany({where:{kelas:{sekolahId:inSchools}}});
    await prisma.kelas.deleteMany({where:{sekolahId:inSchools}});
    await prisma.jurusan.deleteMany({where:{sekolahId:inSchools}});
    await prisma.tahunAjaran.deleteMany({where:{sekolahId:inSchools}});
    await prisma.menuKonfigurasi.deleteMany({where:{sekolahId:inSchools}});
    await prisma.halamanCms.deleteMany({where:{sekolahId:inSchools}});
    await prisma.lantai.deleteMany({where:{gedung:{sekolahId:inSchools}}});
    await prisma.gedung.deleteMany({where:{sekolahId:inSchools}});
    await prisma.hasilSeleksiPpdb.deleteMany({where:{pendaftaranPpdb:{sekolahId:inSchools}}});
    await prisma.pendaftaranPpdb.deleteMany({where:{sekolahId:inSchools}});
    await prisma.gelombangPpdb.deleteMany({where:{sekolahId:inSchools}});
    await prisma.jalurPpdb.deleteMany({where:{sekolahId:inSchools}});
    await prisma.pengaturanSistem.deleteMany({where:{OR:[{sekolahId:inSchools},{dibuatOleh:{in:users}}]}});
    await prisma.langgananSekolah.deleteMany({where:{sekolahId:inSchools}});
    await prisma.pengguna.deleteMany({where:{OR:[{id:{in:users}},{sekolahId:inSchools}]}});
    await prisma.peranIzin.deleteMany({where:{peranId:{in:roles}}});
    await prisma.peran.deleteMany({where:{id:{in:roles}}});
    await prisma.sekolah.deleteMany({where:{id:inSchools}});
    await prisma.pendaftaranTenant.deleteMany({where:{id:{in:registrations}}});
    await prisma.yayasan.deleteMany({where:{id:{in:[foundationId,...extraFoundations].filter(Boolean)}}});
    if (packageId) await prisma.paket.delete({where:{id:packageId}});
    await prisma.izin.deleteMany({where:{id:{in:permissions}}});
    await prisma.$disconnect();
  });
  const permissionIds: Record<string,string> = {};
  for (const nama of permissionNames) {
    let row = await prisma.izin.findUnique({where:{nama}});
    if (!row) { row = await prisma.izin.create({data:{nama,modul:nama.split(".")[0],aksi:nama.split(".")[1],status:"aktif"}}); permissions.push(row.id); }
    permissionIds[nama] = row.id;
  }
  async function school(label: string) {
    const row = await prisma.sekolah.create({data:{nama:`Completion ${label}`,kode:`${label}-${suffix}`,subdomain:`completion-${label}-${suffix}`.toLowerCase(),status:"aktif",jenjang:"SMA"}});
    schools.push(row.id); return row;
  }
  const a = await school("A"), b = await school("B");
  const pack = await prisma.paket.create({data:{nama:`Completion ${suffix}`,harga:0,durasi:30,status:"aktif"}}); packageId = pack.id;
  for (const school of [a,b]) await prisma.langgananSekolah.create({data:{sekolahId:school.id,paketId:pack.id,statusLangganan:"active",tanggalMulai:new Date(Date.now()-86400000),tanggalBerakhir:new Date(Date.now()+86400000)}});
  const foundation = await prisma.yayasan.create({data:{nama:`Completion foundation ${suffix}`}}); foundationId=foundation.id;
  async function user(role: string, schoolId: string | null, grants: string[], label: string) {
    const peran = await prisma.peran.create({data:{nama:role,namaTampilan:role,sekolahId:schoolId}}); roles.push(peran.id);
    await prisma.peranIzin.createMany({data:grants.map(nama => ({peranId:peran.id,izinId:permissionIds[nama]}))});
    const row = await prisma.pengguna.create({data:{peranId:peran.id,sekolahId:schoolId,yayasanId:role==="admin_yayasan"?foundationId:null,namaPengguna:`completion_${label}_${suffix}`,email:`completion_${label}_${suffix}@example.test`,namaLengkap:`Completion ${label}`,kataSandi:hash,status:"aktif"}}); users.push(row.id);
    return {...row,role,token:generateAccessToken({userId:row.id,email:row.email,role,roleId:peran.id,sekolahId:schoolId??undefined,izin:grants,modulAktif:[]})};
  }
  const admin = await user("admin_sekolah",a.id,permissionNames,"admin");
  const teacher = await user("guru",a.id,["peminjaman_aset.view_own","peminjaman_aset.create_own","ujian.view"],"teacher");
  const student = await user("siswa",a.id,["ujian.view"],"student");
  const outsider = await user("admin_sekolah",b.id,permissionNames,"outsider");
  const root = await user("super_admin",null,[],"root");
  const yayasan = await user("admin_yayasan",null,[],"foundation");
  async function http(method: string, path: string, actor: any = admin, body?: any) {
    const response = await fetch(base+path,{method,headers:{...(actor?{Authorization:`Bearer ${actor.token}`} : {}),...(body!==undefined?{"Content-Type":"application/json"}:{})},body:body===undefined?undefined:JSON.stringify(body)});
    const data = await response.json(); return {status:response.status,body:data};
  }
  const year = await prisma.tahunAjaran.create({data:{sekolahId:a.id,tahunAjaran:"2026/2027",semester:"Ganjil",status:"aktif"}});
  const otherYear = await prisma.tahunAjaran.create({data:{sekolahId:b.id,tahunAjaran:"2026/2027",semester:"Ganjil",status:"aktif"}});
  const kelas = await prisma.kelas.create({data:{sekolahId:a.id,tahunAjaranId:year.id,nama:"X Test",tingkat:"10",status:"aktif",kapasitas:30}});
  const foreignClass = await prisma.kelas.create({data:{sekolahId:b.id,tahunAjaranId:otherYear.id,nama:"X Other",tingkat:"10"}});
  const mapel = await prisma.mataPelajaran.create({data:{sekolahId:a.id,nama:"Matematika",kode:`M-${suffix}`,status:"aktif"}});
  const km = await prisma.kelasMapel.create({data:{kelasId:kelas.id,mataPelajaranId:mapel.id,guruPengajarId:teacher.id,status:"aktif"}});

  await t.test("default role statuses allow login, but inactive/deleted roles never issue access or PIN tokens",async()=>{
    let r=await http("POST","/api/auth/login",null,{identifier:admin.email,kataSandi:password}); assert.equal(r.status,200); assert.ok(r.body.token);
    await prisma.peran.update({where:{id:admin.peranId},data:{status:"nonaktif"}});
    r=await http("POST","/api/auth/login",null,{identifier:admin.email,kataSandi:password}); assert.equal(r.status,403); assert.equal(r.body.token,undefined);
    await prisma.peran.update({where:{id:admin.peranId},data:{status:"aktif"}});
  });
  await t.test("foundation theme uses defaults without allowing foundation CMS writes",async()=>{
    assert.equal((await http("GET","/api/cms/tema",yayasan)).status,200);
    assert.equal((await http("POST","/api/cms/halaman",yayasan,{judul:"Forbidden"})).status,403);
  });
  await t.test("trial schools are accessible only while a valid trial subscription exists",async()=>{
    await prisma.sekolah.update({where:{id:b.id},data:{status:"uji coba"}});
    assert.equal((await http("GET",`/api/publik/${b.subdomain}/profil`,null)).status,200);
    assert.equal((await http("GET","/api/jurusan",outsider)).status,200);
    await prisma.langgananSekolah.updateMany({where:{sekolahId:b.id},data:{tanggalBerakhir:new Date(Date.now()-1000)}});
    assert.equal((await http("GET",`/api/publik/${b.subdomain}/profil`,null)).status,404);
    assert.equal((await http("GET","/api/jurusan",outsider)).status,403);
    await prisma.sekolah.update({where:{id:b.id},data:{status:"aktif"}});
    await prisma.langgananSekolah.updateMany({where:{sekolahId:b.id},data:{tanggalBerakhir:new Date(Date.now()+86400000)}});
  });
  await t.test("gedung accepts null optional fields and atomically creates its default floor",async()=>{
    const r=await http("POST","/api/infrastruktur/gedung",admin,{nama:"Gedung test",kode:null,fotoGedung:null}); assert.equal(r.status,201); assert.equal(r.body.data.lantai.length,1); assert.equal(r.body.data.lantai[0].nama,"Lantai 1");
  });
  await t.test("user lists expose safe shift/category/login/PIN projections",async()=>{
    await prisma.biometrikWajah.create({data:{penggunaId:student.id,status:"aktif",embeddingVector:[0.1,0.2]}});
    const r=await http("GET","/api/users?limit=100"); assert.equal(r.status,200);
    const row=r.body.data.find((u:any)=>u.id===student.id); assert.equal(row.pinConfigured,false);
    for (const key of ["shiftKerjaId","shiftKerjaMaster","kategoriJabatanId","kategoriJabatan","terakhirLogin"]) assert.ok(Object.hasOwn(row,key),key);
    assert.equal(row.pinHash,undefined); assert.equal(row.kataSandi,undefined);
    await prisma.pengguna.update({where:{id:student.id},data:{pinHash:await bcrypt.hash("123456",10)}});
    for (const path of [`/api/users/${student.id}`, `/api/siswa/${student.id}`]) {
      const detail=await http("GET",path); assert.equal(detail.status,200); assert.equal(detail.body.data.pinConfigured,true); assert.equal(detail.body.data.pinHash,undefined);
    }
    const me=await http("GET","/api/siswa/me",student); assert.equal(me.body.data.pinConfigured,true); assert.equal(me.body.data.pinHash,undefined);
    const profile=await http("GET","/api/users/profile",student); assert.equal(profile.body.data.pinConfigured,true); assert.equal(profile.body.data.pinHash,undefined);
    assert.equal(row.biometrikWajah.status,"aktif"); assert.equal(row.biometrikWajah.embeddingVector,undefined);
  });
  await t.test("dashboard counts canonical and legacy attendance including classless teacher rows",async()=>{
    await prisma.absensi.createMany({data:[{penggunaId:student.id,sekolahId:a.id,kelasId:kelas.id,tanggal:todayDateOnly(),status:"hadir"},{penggunaId:teacher.id,sekolahId:a.id,tanggal:todayDateOnly(),status:"h"}]});
    const r=await http("GET","/api/dashboard"); assert.equal(r.status,200); assert.equal(r.body.data.cabang.rekapKehadiran.hadir,2); assert.equal(r.body.data.cabang.persentaseHadir,"100.0%");
  });
  let jurusanId="";
  await t.test("jurusan CRUD validates data, paginates, and prevents cross-school access",async()=>{
    let r=await http("POST","/api/jurusan",admin,{kode:"IPA",nama:"Ilmu Pengetahuan Alam"}); assert.equal(r.status,201); jurusanId=r.body.data.id;
    assert.equal((await http("GET",`/api/jurusan/${jurusanId}`,outsider)).status,404);
    assert.equal((await http("POST","/api/jurusan",student,{kode:"X",nama:"Denied"})).status,403);
    assert.equal((await http("GET","/api/jurusan?page=0")).status,400);
    r=await http("PUT",`/api/jurusan/${jurusanId}`,admin,{nama:"IPA baru"}); assert.equal(r.status,200);
    r=await http("GET","/api/jurusan?limit=1"); assert.equal(r.body.meta.total,1);
  });
  await t.test("removed assessment endpoints return 404", async()=>{
    for (const method of ["GET", "POST", "PUT", "DELETE"]) {
      const response = await fetch(base+"/api/bk/asesmen-minat-bakat"+(method === "PUT" || method === "DELETE" ? "/"+randomUUID() : ""), {method,headers:{Authorization:`Bearer ${admin.token}`}});
      assert.equal(response.status,404);
    }
  });
  await t.test("student create persists identity, parents, address and enrollment in one transaction",async()=>{
    const parents={namaAyah:"Ayah dummy",nikAyah:"1234567890123456",pekerjaanAyah:"Guru",noHpAyah:"081234567890",namaIbu:"Ibu dummy",nikIbu:"6543210987654321",pekerjaanIbu:"Wiraswasta",noHpIbu:"089876543210"};
    const data={namaPengguna:`new_${suffix}`,email:`new_${suffix}@example.test`,kataSandi:password,namaLengkap:"New Student",nisn:`10${Date.now()}`,kelasId:kelas.id,alamat:"Alamat siswa",...parents,kotaKabupaten:"Jakarta",nik:"1234567890123456"};
    const r=await http("POST","/api/siswa",admin,data); assert.equal(r.status,201,JSON.stringify(r.body)); const row=r.body.data; users.push(row.id);
    assert.equal(row.namaAyah,data.namaAyah); assert.equal(row.alamat,data.alamat); assert.equal(row.kelasSiswa[0].kelasId,kelas.id); assert.equal(row.kataSandi,undefined);
    const stored=await prisma.pengguna.findUnique({where:{id:row.id}});
    for (const [key,value] of Object.entries(parents)) { assert.equal(row[key],value); assert.equal(stored[key],value); }
    const updatedParents={namaAyah:"Ayah diperbarui",nikAyah:"1111222233334444",pekerjaanAyah:"Pegawai",noHpAyah:"081111111111",namaIbu:"Ibu diperbarui",nikIbu:"4444333322221111",pekerjaanIbu:"Guru",noHpIbu:"082222222222"};
    const updated=await http("PUT",`/api/siswa/${row.id}`,admin,updatedParents); assert.equal(updated.status,200);
    const updatedDb=await prisma.pengguna.findUnique({where:{id:row.id}});
    for (const [key,value] of Object.entries(updatedParents)) { assert.equal(updated.body.data[key],value); assert.equal(updatedDb[key],value); }
    const invalid=await http("PUT",`/api/siswa/${row.id}`,admin,{namaAyah:"Tidak boleh tersimpan",noHpIbu:"0".repeat(21)}); assert.equal(invalid.status,400);
    assert.equal((await prisma.pengguna.findUnique({where:{id:row.id}})).namaAyah,updatedParents.namaAyah);
    const clearParent=await http("PUT",`/api/siswa/${row.id}`,admin,{nikAyah:null}); assert.equal(clearParent.status,200); assert.equal(clearParent.body.data.nikAyah,null); assert.equal(clearParent.body.data.namaIbu,updatedParents.namaIbu);
    assert.equal((await http("GET",`/api/siswa/${row.id}`,outsider)).status,404);
    const bad=await http("POST","/api/siswa",admin,{...data,namaPengguna:`rollback_${suffix}`,email:`rollback_${suffix}@example.test`,nisn:`20${Date.now()}`,nik:null,kelasId:foreignClass.id}); assert.equal(bad.status,400);
    assert.equal(await prisma.pengguna.count({where:{email:`rollback_${suffix}@example.test`}}),0);
    assert.equal((await http("PUT",`/api/siswa/${teacher.id}`,admin,{namaLengkap:"Cannot modify teacher"})).status,404);
    const cleared=await http("PUT",`/api/siswa/${row.id}`,admin,{kelasId:null,tahunAjaranId:year.id,noHpAyah:"08123456"}); assert.equal(cleared.status,200); assert.equal(cleared.body.data.kelasSiswa.length,0);
    assert.equal(await prisma.anggotaKelas.count({where:{penggunaId:row.id,status:"nonaktif"}}),1);
    await prisma.pengguna.update({where:{id:row.id},data:{status:"nonaktif"}});
  });
  await t.test("student creation permits omitted parent fields and validates schema column limits",async()=>{
    const baseData={namaPengguna:`no_parents_${suffix}`,email:`no_parents_${suffix}@example.test`,namaLengkap:"Siswa tanpa data orang tua",kataSandi:password,status:"nonaktif"};
    const result=await http("POST","/api/siswa",admin,baseData); assert.equal(result.status,201); users.push(result.body.data.id);
    for (const field of ["namaAyah","nikAyah","pekerjaanAyah","noHpAyah","namaIbu","nikIbu","pekerjaanIbu","noHpIbu"]) assert.equal(result.body.data[field],null);
    assert.equal(result.body.data.pinConfigured,false); assert.equal(result.body.data.pinHash,undefined);
    for (const [field,limit] of Object.entries({namaAyah:100,nikAyah:20,pekerjaanAyah:50,noHpAyah:20,namaIbu:100,nikIbu:20,pekerjaanIbu:50,noHpIbu:20})) {
      const rejected=await http("POST","/api/siswa",admin,{...baseData,namaPengguna:`invalid_${suffix}`,email:`invalid_${suffix}@example.test`,[field]:"x".repeat(limit+1)});
      assert.equal(rejected.status,400,field);
    }
    assert.equal(await prisma.pengguna.count({where:{email:`invalid_${suffix}@example.test`}}),0);
  });
  const aggregate={tahunAjaranId:year.id,mataPelajaran:[{mataPelajaranId:mapel.id,tugas:20,uts:20,uas:30,praktik:30,kkm:85}]};
  await t.test("typed settings validate active days and isolate school/global scope",async()=>{
    assert.equal((await http("PUT","/api/pengaturan/hari-aktif",admin,{hariAktif:[1,1]})).status,400);
    assert.equal((await http("PUT","/api/pengaturan/hari-aktif",admin,{hariAktif:[1,2,3,4,5]})).status,200);
    await assert.rejects(assertActiveAttendanceDay(a.id,new Date("2026-11-01T00:00:00Z")),/bukan hari aktif/);
    await assertActiveAttendanceDay(a.id,new Date("2026-10-30T00:00:00Z"));
    assert.equal((await http("GET","/api/pengaturan/global",admin)).status,403);
    assert.equal((await http("PUT","/api/pengaturan/global",root,{namaAplikasi:"School QA",emailDukungan:null,teleponDukungan:null,logoUrl:null})).status,200);
    assert.equal((await http("GET","/api/pengaturan/global",root)).body.data.namaAplikasi,"School QA");
    assert.equal((await http("POST","/api/pengaturan",admin,{kunci:"agregat_rapor:x",nilai:"{}",tipeData:"json"})).status,400);
  });
  await t.test("aggregate settings persist by year/mapel and refuse invalid weights or foreign references",async()=>{
    assert.equal((await http("PUT","/api/pengaturan/agregat-rapor",admin,aggregate)).status,200);
    assert.deepEqual((await http("GET",`/api/pengaturan/agregat-rapor?tahunAjaranId=${year.id}`)).body.data,aggregate);
    assert.equal((await http("PUT","/api/pengaturan/agregat-rapor",admin,{...aggregate,tahunAjaranId:otherYear.id})).status,404);
    assert.equal((await http("PUT","/api/pengaturan/agregat-rapor",admin,{...aggregate,mataPelajaran:[{...aggregate.mataPelajaran[0],tugas:90}]})).status,400);
  });
  await t.test("aggregate weights and KKM affect real finalization and freeze configuration after final grades",async()=>{
    await prisma.anggotaKelas.create({data:{penggunaId:student.id,kelasId:kelas.id,tahunAjaranId:year.id,status:"aktif"}});
    const groups=["tugas","uts","uas","praktik"], scores=[80,70,90,100];
    for (let i=0;i<4;i++) { const component=await prisma.komponenNilai.create({data:{kelasMapelId:km.id,nama:groups[i],jenis:groups[i],kelompok:groups[i],bobot:25,nilaiMaksimum:100,status:"aktif"}}); await prisma.nilai.create({data:{kelasMapelId:km.id,penggunaId:student.id,komponenNilaiId:component.id,nilai:scores[i]}}); }
    const r=await http("POST",`/api/nilai/finalisasi/${km.id}`,teacher,{}); assert.equal(r.status,200,JSON.stringify(r.body));
    const final=await prisma.nilaiAkhirMapel.findFirst({where:{kelasMapelId:km.id,penggunaId:student.id}}); assert.equal(Number(final.nilaiAkhir),87); assert.equal(final.kkm,85);
    assert.equal((await http("PUT","/api/pengaturan/agregat-rapor",admin,aggregate)).status,409);
    assert.throws(()=>aggregateWeights([{id:"x",jenis:"unknown",kelompok:"unknown",bobot:100}],aggregate.mataPelajaran[0]),/Kelompok komponen/);
  });
  let announcementId="";
  await t.test("PPDB announcements publish only when status and publication time allow it",async()=>{
    let r=await http("POST","/api/ppdb/pengumuman",admin,{judul:"SPMB dibuka",konten:"Informasi pendaftaran",status:"draft"}); assert.equal(r.status,201); announcementId=r.body.data.id;
    assert.equal((await http("GET",`/api/publik/${a.subdomain}/ppdb/pengumuman`,null)).body.data.length,0);
    r=await http("PUT",`/api/ppdb/pengumuman/${announcementId}`,admin,{status:"dipublikasikan"}); assert.equal(r.status,200);
    assert.equal((await http("GET",`/api/publik/${a.subdomain}/ppdb/pengumuman`,null)).body.data.length,1);
    assert.equal((await http("PUT",`/api/ppdb/pengumuman/${announcementId}`,outsider,{judul:"Hijack"})).status,404);
    await http("PUT",`/api/ppdb/pengumuman/${announcementId}`,admin,{dipublikasikanPada:new Date(Date.now()+86400000).toISOString()});
    assert.equal((await http("GET",`/api/publik/${a.subdomain}/ppdb/pengumuman`,null)).body.data.length,0);
  });
  await t.test("public PPDB options, exact NIK lookup, result projection and privacy",async()=>{
    const jalur=await prisma.jalurPpdb.create({data:{sekolahId:a.id,nama:"Reguler",kuota:10,status:"aktif"}});
    const pendaftar=await prisma.pendaftaranPpdb.create({data:{sekolahId:a.id,jalurPpdbId:jalur.id,nomorPendaftaran:`TEST-${suffix}`,namaLengkap:"Pendaftar dummy",nisn:`30${Date.now()}`,nik:"9999999999999999",tempatLahir:"Test",tanggalLahir:new Date("2011-01-01"),jenisKelamin:"L",alamat:"Alamat privat",status:"lulus"}});
    await prisma.hasilSeleksiPpdb.create({data:{pendaftaranPpdbId:pendaftar.id,statusKelulusan:"lulus"}});
    const path=`/api/publik/${a.subdomain}/ppdb/cek-pendaftaran`;
    let r=await http("POST",path,null,{nomorPendaftaran:pendaftar.nomorPendaftaran,nik:pendaftar.nik}); assert.equal(r.status,200); assert.equal(r.body.data.statusSeleksi,"lulus");
    for (const key of ["nik","alamat","email","telepon","berkasPpdb"]) assert.equal(r.body.data[key],undefined);
    assert.equal((await http("POST",path,null,{nomorPendaftaran:pendaftar.nomorPendaftaran,nik:"0000000000000000"})).status,404);
    assert.equal((await http("POST",`/api/publik/${b.subdomain}/ppdb/cek-pendaftaran`,null,{nomorPendaftaran:pendaftar.nomorPendaftaran,nik:pendaftar.nik})).status,404);
    r=await http("GET",`/api/publik/${a.subdomain}/ppdb`,null); assert.equal(r.status,200); assert.equal(r.body.data.jalur[0].id,jalur.id);
    r=await http("GET","/api/ppdb/pendaftar"); assert.equal(r.body.data.find((p:any)=>p.id===pendaftar.id).hasilSeleksiPpdb.statusKelulusan,"lulus");
  });
  await t.test("platform school/foundation directories require super admin and return actual records",async()=>{
    assert.equal((await http("GET","/api/platform/sekolah",admin)).status,403);
    let r=await http("GET",`/api/platform/sekolah/${a.id}`,root); assert.equal(r.status,200); assert.equal(r.body.data.nama,a.nama);
    r=await http("GET",`/api/platform/yayasan/${foundationId}`,root); assert.equal(r.status,200);
    r=await http("GET","/api/platform/ringkasan",root); assert.equal(r.status,200); assert.ok(r.body.data.totalSekolah>=2);
  });
  await t.test("quiz results are scoped to the teaching owner or student's own attempts",async()=>{
    const exam=await prisma.asesmen.create({data:{kelasMapelId:km.id,judul:"Quiz",tipe:"quiz",durasi:30,dipublikasikan:true}});
    await prisma.percobaanAsesmen.createMany({data:[{asesmenId:exam.id,siswaId:student.id,dimulaiPada:new Date(),nilai:90,status:"selesai"},{asesmenId:exam.id,siswaId:admin.id,dimulaiPada:new Date(),nilai:80,status:"selesai"}]});
    assert.equal((await http("GET",`/api/ujian/${exam.id}/hasil`,teacher)).body.data.length,2);
    const own=await http("GET",`/api/ujian/${exam.id}/hasil`,student); assert.equal(own.status,200); assert.equal(own.body.data.length,1); assert.equal(own.body.data[0].siswaId,student.id); assert.equal(own.body.data[0].tokenSesi,undefined);
    assert.equal((await http("GET",`/api/ujian/${exam.id}/hasil`,outsider)).status,404);
  });
  await t.test("teacher asset self-service reads own loans but cannot approve or mutate inventory",async()=>{
    const gudang=await prisma.gudang.create({data:{sekolahId:a.id,nama:"Gudang QA"}});
    const kategori=await prisma.kategoriAset.create({data:{sekolahId:a.id,nama:"Elektronik"}});
    const aset=await prisma.aset.create({data:{sekolahId:a.id,gudangId:gudang.id,kategoriAsetId:kategori.id,kondisi:"baik",stokMinimum:0,kode:`A-${suffix}`,nama:"Proyektor",jumlah:2,jumlahStok:2,status:"aktif"}});
    let r=await http("GET","/api/sarpras/aset",teacher); assert.equal(r.status,200); assert.equal(r.body.data[0].hargaBeli,undefined);
    r=await http("POST","/api/peminjaman-aset",teacher,{items:[{asetId:aset.id,jumlah:1}],keperluan:"Mengajar",tanggalKembaliRencana:new Date(Date.now()+86400000).toISOString().slice(0,10)}); assert.equal(r.status,201,JSON.stringify(r.body)); const loanId=r.body.data.id;
    await prisma.peminjamanAset.create({data:{sekolahId:a.id,peminjamId:admin.id,nomorPeminjaman:`OTHER-${suffix}`,keperluan:"Other",tanggalKembaliRencana:new Date(),status:"menunggu_persetujuan"}});
    r=await http("GET","/api/peminjaman-aset",teacher); assert.equal(r.status,200); assert.equal(r.body.data.length,1); assert.equal(r.body.data[0].peminjamId,teacher.id);
    assert.equal((await http("PATCH",`/api/peminjaman-aset/${loanId}/verifikasi`,teacher,{disetujui:true})).status,403);
    assert.equal((await http("POST","/api/sarpras/aset",teacher,{nama:"Forbidden"})).status,403);
  });
  await t.test("self-service password change verifies current password and saves only the actor's new hash",async()=>{
    assert.equal((await http("POST","/api/auth/ubah-kata-sandi",admin,{kataSandiLama:"wrong",kataSandiBaru:"Dummy-new-password1!"})).status,400);
    assert.equal((await http("POST","/api/auth/ubah-kata-sandi",admin,{kataSandiLama:password,kataSandiBaru:"Dummy-new-password1!"})).status,200);
    const changed=await prisma.pengguna.findUnique({where:{id:admin.id}}); assert.ok(await bcrypt.compare("Dummy-new-password1!",changed.kataSandi));
    const unchanged=await prisma.pengguna.findUnique({where:{id:teacher.id}}); assert.ok(await bcrypt.compare(password,unchanged.kataSandi));
  });
  await t.test("review ownership, validation and default moderation work for both administrator roles",async()=>{
    assert.equal((await http("POST","/api/users/review",null,{rating:5,komentar:"Test"})).status,401);
    assert.equal((await http("POST","/api/users/review",teacher,{rating:5,komentar:"Test"})).status,403);
    assert.equal((await http("POST","/api/users/review",root,{rating:5,komentar:"Test"})).status,403);
    for (const rating of [0,6,2.5,"5"]) assert.equal((await http("POST","/api/users/review",admin,{rating,komentar:"Test"})).status,400);
    assert.equal((await http("POST","/api/users/review",admin,{rating:5,komentar:"x".repeat(501)})).status,400);
    assert.equal((await http("POST","/api/users/review",admin,{rating:5,komentar:"   "})).status,400);
    assert.equal((await http("POST","/api/users/review",admin,{rating:5,komentar:"Test",status:"tampil"})).status,400);
    let result=await http("POST","/api/users/review",admin,{rating:5,komentar:"Sekolah terbantu"}); assert.equal(result.status,201); assert.equal(result.body.data.status,"menunggu");
    assert.equal((await http("POST","/api/users/review",admin,{rating:4,komentar:"Duplikat"})).status,409);
    result=await http("POST","/api/users/review",yayasan,{rating:4,komentar:"Yayasan terbantu"}); assert.equal(result.status,201);
    assert.equal((await http("GET","/api/users/review",yayasan)).body.data.penggunaId,yayasan.id);
    assert.equal((await http("PUT","/api/users/review",admin,{penggunaId:yayasan.id,komentar:"Hijack"})).status,400);
    assert.equal((await http("GET","/api/reviews",admin)).status,403);
  });
  await t.test("super admin moderation and public review projection protect private identity data",async()=>{
    const own=(await http("GET","/api/users/review",admin)).body.data;
    assert.equal((await http("GET","/api/publik/reviews",null)).body.data.length,0);
    assert.equal((await http("PUT",`/api/reviews/${own.id}`,root,{status:"tampil"})).status,200);
    let result=await http("GET","/api/publik/reviews?status=menunggu",null); assert.equal(result.status,200); assert.equal(result.body.data.length,1);
    const published=result.body.data[0]; assert.equal(published.pengguna.namaLengkap,admin.namaLengkap); assert.equal(published.pengguna.peran.nama,"admin_sekolah"); assert.ok(Object.hasOwn(published.pengguna,"jabatan"));
    assert.doesNotMatch(JSON.stringify(published),/pinHash|kataSandi|email|embeddingVector|penggunaId/);
    assert.equal((await http("GET","/api/reviews?status=tampil&rating=5",root)).body.meta.total,1);
    assert.equal((await http("PUT",`/api/reviews/${own.id}`,outsider,{status:"tampil"})).status,403);
    assert.equal((await http("PUT","/api/users/review",admin,{komentar:"Edit harus dimoderasi ulang"})).body.data.status,"menunggu");
    assert.equal((await http("GET","/api/publik/reviews",null)).body.data.length,0);
    assert.equal((await http("PUT",`/api/reviews/${own.id}`,root,{status:"tampil",diperbaruiPada:"2000-01-01T00:00:00.000Z"})).status,409);
    assert.equal((await http("PUT",`/api/reviews/${own.id}`,root,{status:"disembunyikan"})).status,200);
    result=await http("POST","/api/reviews",root,{penggunaId:outsider.id,rating:3,komentar:"Review admin",status:"tampil"}); assert.equal(result.status,201);
    assert.equal((await http("GET",`/api/reviews/${result.body.data.id}`,root)).status,200);
    assert.equal((await http("DELETE",`/api/reviews/${result.body.data.id}`,root)).status,200);
    assert.equal((await http("GET",`/api/reviews/${result.body.data.id}`,root)).status,404);
  });
  await t.test("foundation directory, CRUD, admin ownership and school hierarchy",async()=>{
    let r=await http("POST","/api/yayasan",root,{nama:"Foundation CRUD",npyp:`NP-${suffix}`}); assert.equal(r.status,201); const id=r.body.data.id; extraFoundations.push(id);
    assert.equal((await http("GET",`/api/yayasan/${id}`,yayasan)).status,403);
    assert.equal((await http("PUT",`/api/yayasan/${id}/sekolah/${a.id}`,root,{})).status,200);
    r=await http("GET","/api/platform/yayasan",root); assert.equal(r.status,200); assert.equal(r.body.data.find((f:any)=>f.id===id).sekolah[0].id,a.id);
    assert.equal((await http("PUT",`/api/yayasan/${foundationId}/sekolah/${a.id}`,root,{})).status,404);
    r=await http("POST",`/api/yayasan/${id}/admin`,root,{namaPengguna:`foundation_admin_${suffix}`,namaLengkap:"Foundation Admin",email:`foundation_admin_${suffix}@example.test`,kataSandi:password}); assert.equal(r.status,201); users.push(r.body.data.id); const adminId=r.body.data.id; assert.equal(r.body.data.kataSandi,undefined);
    assert.equal((await http("DELETE",`/api/yayasan/${id}/admin/${adminId}`,root)).status,409);
    assert.equal((await http("DELETE",`/api/yayasan/${id}`,root)).status,409);
    assert.equal((await http("DELETE",`/api/yayasan/${id}/sekolah/${a.id}`,root)).status,200);
    assert.equal((await http("PUT",`/api/yayasan/${id}`,root,{nama:"Updated foundation"})).status,200);
    r=await http("GET","/api/dashboard",root); assert.equal(r.body.data.scope,"platform"); assert.ok(r.body.data.platform.totalSekolah>=2);
  });
  await t.test("foundation paid webhook creates an admin atomically, supports retries and repairs missing historical admins",async()=>{
    const {createHash}=require("node:crypto");
    const {konversiPendaftaranTenant}=require("../src/controllers/tenant.controller");
    const {tenantOnboardingSchema}=require("../src/validations/tenant.validation");
    assert.equal(tenantOnboardingSchema.safeParse({jenisPendaftaran:"yayasan",nama:"Admin",email:"dummy@example.test",kataSandi:"Dummy12345",paketId:pack.id,namaYayasan:"Test yayasan",alamatYayasan:"Alamat panjang",teleponYayasan:"0812345678",emailYayasan:"yayasan@example.test",npypYayasan:"   "}).success,false);
    await prisma.paket.update({where:{id:pack.id},data:{tipe:"YAYASAN",harga:100}});
    process.env.MIDTRANS_SERVER_KEY="local-webhook-dummy-only";
    const email=`${"a".repeat(60)}_${suffix}@example.test`;
    const registration=await prisma.pendaftaranTenant.create({data:{jenisPendaftaran:"yayasan",namaPendaftar:"Admin yayasan",emailPendaftar:email,kataSandiPendaftar:hash,namaYayasan:"Yayasan paid",npypYayasan:`PAID-${suffix}`,paketId:pack.id,status:"menunggu_pembayaran",midtransOrderId:`REG-TEST-${suffix}`}}); registrations.push(registration.id);
    const payload={order_id:registration.midtransOrderId,status_code:"200",gross_amount:"100.00",transaction_status:"settlement",signature_key:createHash("sha512").update(registration.midtransOrderId+"200"+"100.00"+process.env.MIDTRANS_SERVER_KEY).digest("hex")};
    const results=await Promise.all([http("POST","/api/webhooks/midtrans",null,payload),http("POST","/api/webhooks/midtrans",null,payload)]); assert.deepEqual(results.map(r=>r.status),[200,200]);
    let approved=await prisma.pendaftaranTenant.findUnique({where:{id:registration.id}}); extraFoundations.push(approved.yayasanTerbuatId); users.push(approved.penggunaTerbuatId);
    const account=await prisma.pengguna.findUnique({where:{id:approved.penggunaTerbuatId},include:{peran:true}}); assert.equal(account.peran.nama,"admin_yayasan"); assert.equal(account.sekolahId,null); assert.equal(account.yayasanId,approved.yayasanTerbuatId); assert.ok(account.namaPengguna.length<=50); assert.equal(await prisma.pengguna.count({where:{email}}),1);
    assert.equal((await http("POST","/api/auth/login",null,{identifier:email,kataSandi:password})).status,200);
    await prisma.pendaftaranTenant.update({where:{id:registration.id},data:{penggunaTerbuatId:null}});
    assert.equal((await http("POST","/api/webhooks/midtrans",null,payload)).status,200);
    approved=await prisma.pendaftaranTenant.findUnique({where:{id:registration.id}}); assert.equal(approved.penggunaTerbuatId,account.id);
    await prisma.pendaftaranTenant.update({where:{id:registration.id},data:{penggunaTerbuatId:null}});
    await prisma.pengguna.delete({where:{id:account.id}});
    assert.equal((await http("POST","/api/webhooks/midtrans",null,payload)).status,200);
    approved=await prisma.pendaftaranTenant.findUnique({where:{id:registration.id}}); users.push(approved.penggunaTerbuatId); assert.notEqual(approved.penggunaTerbuatId,account.id);
    // Reproduce the old status endpoint's false success when an approved tenant
    // has no admin. The linked foundation must survive and the account returns.
    await prisma.pengguna.delete({where:{id:approved.penggunaTerbuatId}});
    const recovered=await http("GET",`/api/tenant/status-pembayaran/${registration.midtransOrderId}`,null); assert.equal(recovered.status,200);
    approved=await prisma.pendaftaranTenant.findUnique({where:{id:registration.id}}); users.push(approved.penggunaTerbuatId);
    assert.ok(await prisma.pengguna.findUnique({where:{id:approved.penggunaTerbuatId}}));
    const login=await http("POST","/api/auth/login",null,{identifier:email,kataSandi:password}); assert.equal(login.status,200);
    await http("PUT",`/api/yayasan/${approved.yayasanTerbuatId}/sekolah/${a.id}`,root,{});
    const dashboard=await http("GET","/api/dashboard",{token:login.body.token}); assert.equal(dashboard.status,200); assert.equal(dashboard.body.data.scope,"yayasan"); assert.equal(dashboard.body.data.sekolah,null); assert.equal(dashboard.body.data.yayasan.sekolah[0].id,a.id);
    const duplicate=await prisma.pendaftaranTenant.create({data:{jenisPendaftaran:"yayasan",namaPendaftar:"Duplicate",emailPendaftar:`duplicate_${suffix}@example.test`,kataSandiPendaftar:hash,npypYayasan:registration.npypYayasan,paketId:pack.id}}); registrations.push(duplicate.id);
    await assert.rejects(prisma.$transaction((tx:any)=>konversiPendaftaranTenant(tx,duplicate.id,{isTrial:false})),/NPYP Yayasan sudah terdaftar/);
    assert.equal(await prisma.pengguna.count({where:{email:duplicate.emailPendaftar}}),0);
  });
  await t.test("payment polling executes foundation conversion, surfaces role failures and rolls back completely",async()=>{
    const httpServer=require("node:http"); const oldApi=process.env.MIDTRANS_API_URL;
    let order="";
    const provider=httpServer.createServer((_req:any,res:any)=>{res.writeHead(200,{"Content-Type":"application/json"});res.end(JSON.stringify({order_id:order,transaction_status:"settlement",gross_amount:"100.00"}));});
    provider.listen(0,"127.0.0.1"); await once(provider,"listening"); process.env.MIDTRANS_API_URL=`http://127.0.0.1:${provider.address().port}`;
    const registration=await prisma.pendaftaranTenant.create({data:{jenisPendaftaran:"yayasan",namaPendaftar:"Polling admin",emailPendaftar:`polling_${suffix}@example.test`,kataSandiPendaftar:hash,namaYayasan:"Polling yayasan",npypYayasan:`POLL-${suffix}`,paketId:pack.id,status:"menunggu_pembayaran",midtransOrderId:`REG-POLL-${suffix}`}}); registrations.push(registration.id); order=registration.midtransOrderId;
    try {
      await prisma.peran.update({where:{id:yayasan.peranId},data:{status:"nonaktif"}});
      let result=await http("GET",`/api/tenant/status-pembayaran/${order}`,null); assert.equal(result.status,409); assert.equal(result.body.errorCode,"TENANT_ADMIN_ROLE_UNAVAILABLE");
      assert.equal(await prisma.yayasan.count({where:{npyp:registration.npypYayasan}}),0); assert.equal(await prisma.pengguna.count({where:{email:registration.emailPendaftar}}),0);
      assert.equal((await prisma.pendaftaranTenant.findUnique({where:{id:registration.id}})).status,"menunggu_pembayaran");
      await prisma.peran.update({where:{id:yayasan.peranId},data:{status:"aktif"}});
      result=await http("GET",`/api/tenant/status-pembayaran/${order}`,null); assert.equal(result.status,200);
      const row=await prisma.pendaftaranTenant.findUnique({where:{id:registration.id}}); extraFoundations.push(row.yayasanTerbuatId); users.push(row.penggunaTerbuatId);
      const account=await prisma.pengguna.findUnique({where:{id:row.penggunaTerbuatId}}); assert.equal(account.yayasanId,row.yayasanTerbuatId); assert.equal(account.peranId,yayasan.peranId); assert.equal(account.sekolahId,null);
      const {konversiPendaftaranTenant}=require("../src/controllers/tenant.controller");
      const rollback=await prisma.pendaftaranTenant.create({data:{jenisPendaftaran:"yayasan",namaPendaftar:"Rollback admin",emailPendaftar:`yy_rollback_${suffix}@example.test`,kataSandiPendaftar:hash,namaYayasan:"Rollback yayasan",npypYayasan:`YY-ROLL-${suffix}`,paketId:pack.id,status:"menunggu_pembayaran"}}); registrations.push(rollback.id);
      await assert.rejects(prisma.$transaction(async(tx:any)=>{await konversiPendaftaranTenant(tx,rollback.id,{isTrial:false});throw new Error("Simulated transaction failure after admin insert");}),/Simulated transaction failure/);
      assert.equal(await prisma.yayasan.count({where:{npyp:rollback.npypYayasan}}),0);assert.equal(await prisma.pengguna.count({where:{email:rollback.emailPendaftar}}),0);
      await prisma.pendaftaranTenant.update({where:{id:registration.id},data:{penggunaTerbuatId:admin.id}});
      assert.equal((await http("GET",`/api/tenant/status-pembayaran/${order}`,null)).status,409);
      await prisma.pendaftaranTenant.update({where:{id:registration.id},data:{penggunaTerbuatId:account.id}});
    } finally { await prisma.peran.update({where:{id:yayasan.peranId},data:{status:"aktif"}});if(oldApi===undefined)delete process.env.MIDTRANS_API_URL;else process.env.MIDTRANS_API_URL=oldApi;await new Promise<void>(r=>provider.close(()=>r())); }
  });
});
