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
    await prisma.asesmenMinatBakat.deleteMany({where:{sekolahId:inSchools}});
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
    if (foundationId) await prisma.yayasan.delete({where:{id:foundationId}});
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
    const row=r.body.data.find((u:any)=>u.id===student.id); assert.equal(row.pinSudahDiatur,false);
    for (const key of ["shiftKerjaId","shiftKerjaMaster","kategoriJabatanId","kategoriJabatan","terakhirLogin"]) assert.ok(Object.hasOwn(row,key),key);
    assert.equal(row.pinHash,undefined); assert.equal(row.kataSandi,undefined);
    assert.equal(row.biometrikWajah.status,"aktif"); assert.equal(row.biometrikWajah.embeddingVector,undefined);
  });
  await t.test("dashboard counts canonical and legacy attendance including classless teacher rows",async()=>{
    await prisma.absensi.createMany({data:[{penggunaId:student.id,sekolahId:a.id,kelasId:kelas.id,tanggal:todayDateOnly(),status:"hadir"},{penggunaId:teacher.id,sekolahId:a.id,tanggal:todayDateOnly(),status:"h"}]});
    const r=await http("GET","/api/dashboard"); assert.equal(r.status,200); assert.equal(r.body.data.cabang.rekapKehadiran.hadir,2); assert.equal(r.body.data.cabang.persentaseHadir,"100.0%");
  });
  let jurusanId="", assessmentId="";
  await t.test("jurusan CRUD validates data, paginates, and prevents cross-school access",async()=>{
    let r=await http("POST","/api/jurusan",admin,{kode:"IPA",nama:"Ilmu Pengetahuan Alam"}); assert.equal(r.status,201); jurusanId=r.body.data.id;
    assert.equal((await http("GET",`/api/jurusan/${jurusanId}`,outsider)).status,404);
    assert.equal((await http("POST","/api/jurusan",student,{kode:"X",nama:"Denied"})).status,403);
    assert.equal((await http("GET","/api/jurusan?page=0")).status,400);
    r=await http("PUT",`/api/jurusan/${jurusanId}`,admin,{nama:"IPA baru"}); assert.equal(r.status,200);
    r=await http("GET","/api/jurusan?limit=1"); assert.equal(r.body.meta.total,1);
  });
  await t.test("assessments persist real student relations and students see only completed own records",async()=>{
    let r=await http("POST","/api/bk/asesmen-minat-bakat",teacher,{siswaId:student.id,tanggal:"2026-10-30",jenis:"Minat",minat:"Sains",skor:88,status:"draft"}); assert.equal(r.status,201); assessmentId=r.body.data.id; assert.equal(r.body.data.siswa.namaLengkap,student.namaLengkap);
    assert.equal((await http("GET","/api/bk/asesmen-minat-bakat",student)).body.data.length,0);
    r=await http("PUT",`/api/bk/asesmen-minat-bakat/${assessmentId}`,teacher,{status:"selesai"}); assert.equal(r.status,200);
    assert.equal((await http("GET","/api/bk/asesmen-minat-bakat",student)).body.data.length,1);
    assert.equal((await http("GET",`/api/bk/asesmen-minat-bakat/${assessmentId}`,outsider)).status,404);
    assert.equal((await http("POST","/api/bk/asesmen-minat-bakat",teacher,{siswaId:outsider.id,tanggal:"2026-02-30",jenis:"Invalid"})).status,400);
  });
  await t.test("student create persists identity, parents, address and enrollment in one transaction",async()=>{
    const data={namaPengguna:`new_${suffix}`,email:`new_${suffix}@example.test`,kataSandi:password,namaLengkap:"New Student",nisn:`10${Date.now()}`,kelasId:kelas.id,alamat:"Alamat siswa",namaAyah:"Ayah dummy",namaIbu:"Ibu dummy",kotaKabupaten:"Jakarta",nik:"1234567890123456"};
    const r=await http("POST","/api/siswa",admin,data); assert.equal(r.status,201,JSON.stringify(r.body)); const row=r.body.data; users.push(row.id);
    assert.equal(row.namaAyah,data.namaAyah); assert.equal(row.alamat,data.alamat); assert.equal(row.kelasSiswa[0].kelasId,kelas.id); assert.equal(row.kataSandi,undefined);
    assert.equal((await http("GET",`/api/siswa/${row.id}`,outsider)).status,404);
    const bad=await http("POST","/api/siswa",admin,{...data,namaPengguna:`rollback_${suffix}`,email:`rollback_${suffix}@example.test`,nisn:`20${Date.now()}`,nik:null,kelasId:foreignClass.id}); assert.equal(bad.status,400);
    assert.equal(await prisma.pengguna.count({where:{email:`rollback_${suffix}@example.test`}}),0);
    assert.equal((await http("PUT",`/api/siswa/${teacher.id}`,admin,{namaLengkap:"Cannot modify teacher"})).status,404);
    const cleared=await http("PUT",`/api/siswa/${row.id}`,admin,{kelasId:null,tahunAjaranId:year.id,noHpAyah:"08123456"}); assert.equal(cleared.status,200); assert.equal(cleared.body.data.kelasSiswa.length,0);
    assert.equal(await prisma.anggotaKelas.count({where:{penggunaId:row.id,status:"nonaktif"}}),1);
    await prisma.pengguna.update({where:{id:row.id},data:{status:"nonaktif"}});
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
});
