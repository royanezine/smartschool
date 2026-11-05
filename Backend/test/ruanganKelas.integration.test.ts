import assert from "node:assert/strict";
import { once } from "node:events";
import { randomUUID } from "node:crypto";
import test from "node:test";

const databaseUrl = process.env.TEST_DATABASE_URL;
test("room/class hierarchy HTTP contracts and tenant isolation", {skip: !databaseUrl}, async t => {
  assert.ok(["127.0.0.1", "localhost", "[::1]"].includes(new URL(databaseUrl!).hostname));
  process.env.DATABASE_URL = databaseUrl!; process.env.JWT_SECRET ||= "local-room-tests";
  const {prisma} = require("../src/config/db"); const app = require("../src/app").default;
  const {generateAccessToken} = require("../src/utils/generateToken");
  const suffix = randomUUID().slice(0,8); const schools: string[] = [], users: string[] = [], roles: string[] = [], permissions: string[] = [];
  const server = app.listen(0,"127.0.0.1"); await once(server,"listening");
  const base = `http://127.0.0.1:${server.address().port}`;
  const pack = await prisma.paket.create({data:{nama:`Room ${suffix}`,harga:0,durasi:30,status:"aktif"}});
  t.after(async () => {
    server.closeAllConnections(); await new Promise<void>(r => server.close(() => r()));
    await prisma.kelas.deleteMany({where:{sekolahId:{in:schools}}});
    await prisma.ruangan.deleteMany({where:{sekolahId:{in:schools}}});
    await prisma.lantai.deleteMany({where:{gedung:{sekolahId:{in:schools}}}});
    await prisma.gedung.deleteMany({where:{sekolahId:{in:schools}}});
    await prisma.tahunAjaran.deleteMany({where:{sekolahId:{in:schools}}});
    await prisma.langgananSekolah.deleteMany({where:{sekolahId:{in:schools}}});
    await prisma.pengguna.deleteMany({where:{id:{in:users}}});
    await prisma.peranIzin.deleteMany({where:{peranId:{in:roles}}});
    await prisma.peran.deleteMany({where:{id:{in:roles}}});
    await prisma.izin.deleteMany({where:{id:{in:permissions}}});
    await prisma.sekolah.deleteMany({where:{id:{in:schools}}}); await prisma.paket.delete({where:{id:pack.id}}); await prisma.$disconnect();
  });
  async function tenant(label: string) {
    const s = await prisma.sekolah.create({data:{nama:label,kode:`${label}-${suffix}`,subdomain:`${label}-${suffix}`,status:"aktif",jenjang:"SMA"}}); schools.push(s.id);
    const r = await prisma.peran.create({data:{nama:"admin_sekolah",namaTampilan:"Admin",status:"aktif"}}); roles.push(r.id);
    for (const module of ["akademik", "manajemen_aset"]) for (const action of ["view", "create", "update", "delete"]) {
      const nama = `${module}.${action}`;
      let permission = await prisma.izin.findUnique({where:{nama}});
      if (!permission) {permission=await prisma.izin.create({data:{nama,modul:module,aksi:action,status:"aktif"}});permissions.push(permission.id);}
      await prisma.peranIzin.create({data:{peranId:r.id,izinId:permission.id}});
    }
    const u = await prisma.pengguna.create({data:{namaPengguna:`room-${label}-${suffix}`,email:`room-${label}-${suffix}@example.test`,namaLengkap:label,kataSandi:"unused",sekolahId:s.id,peranId:r.id,status:"aktif"}});users.push(u.id);
    await prisma.langgananSekolah.create({data:{sekolahId:s.id,paketId:pack.id,statusLangganan:"active",tanggalBerakhir:new Date(Date.now()+86400000)}});
    return {...s,token:generateAccessToken({userId:u.id,email:u.email,role:"admin_sekolah",roleId:r.id,sekolahId:s.id,izin:[],modulAktif:[]})};
  }
  const a=await tenant("room-a"), b=await tenant("room-b");
  const year=await prisma.tahunAjaran.create({data:{sekolahId:a.id,tahunAjaran:"2026/2027",semester:"Ganjil",status:"aktif"}});
  const building=await prisma.gedung.create({data:{nama:"A",sekolahId:a.id,lantai:{create:{nama:"Lantai 1"}}},include:{lantai:true}});
  const otherBuilding=await prisma.gedung.create({data:{nama:"B",sekolahId:a.id}});
  const foreignBuilding=await prisma.gedung.create({data:{nama:"Foreign",sekolahId:b.id,lantai:{create:{nama:"Foreign floor"}}},include:{lantai:true}});
  async function http(method:string,path:string,body?:unknown,actor=a) {
    const r=await fetch(base+path,{method,headers:{Authorization:`Bearer ${actor.token}`,"Content-Type":"application/json"},body:body===undefined?undefined:JSON.stringify(body)});
    return {status:r.status,body:await r.json() as any};
  }
  let roomId: string, classId: string;
  const classData={nama:"X A",tingkat:10,tahunAjaranId:year.id};
  await t.test("room CRUD resolves building from floor and rejects mismatches/cross-tenant links",async()=>{
    let r=await http("POST","/api/sarpras/ruangan",{nama:"R1",lantaiId:building.lantai[0].id});assert.equal(r.status,201);roomId=r.body.data.id;
    assert.equal(r.body.data.gedung.id,building.id);assert.equal(r.body.data.lantai.id,building.lantai[0].id);
    r=await http("POST","/api/sarpras/ruangan",{nama:"Bad",gedungId:otherBuilding.id,lantaiId:building.lantai[0].id});assert.equal(r.status,400);
    r=await http("POST","/api/sarpras/ruangan",{nama:"Foreign",lantaiId:foreignBuilding.lantai[0].id});assert.equal(r.status,400);
    r=await http("PUT",`/api/sarpras/ruangan/${roomId}`,{gedungId:otherBuilding.id});assert.equal(r.status,400);
    r=await http("PUT",`/api/sarpras/ruangan/${roomId}`,{nama:"Updated"});assert.equal(r.status,200);assert.equal(r.body.data.lantaiId,building.lantai[0].id);
    assert.equal((await http("PUT",`/api/infrastruktur/lantai/${building.lantai[0].id}`,{gedungId:otherBuilding.id})).status,409);
    assert.equal((await http("PUT",`/api/infrastruktur/lantai/${building.lantai[0].id}`,{gedungId:foreignBuilding.id})).status,400);
  });
  await t.test("class writes and reads use ruangan with nested building/floor",async()=>{
    let r=await http("POST","/api/kelas",{...classData,ruanganId:roomId});assert.equal(r.status,201);classId=r.body.data.id;
    assert.equal(r.body.data.ruangan.gedung.id,building.id);assert.equal(r.body.data.lantaiId,undefined);assert.equal(r.body.data.nomorRuangan,undefined);
    r=await http("GET",`/api/kelas/${classId}`);assert.equal(r.status,200);assert.equal(r.body.data.ruangan.lantai.id,building.lantai[0].id);
    r=await http("GET","/api/kelas");assert.equal(r.status,200);assert.equal(r.body.data[0].ruangan.id,roomId);
    r=await http("GET","/api/sarpras/ruangan");assert.equal(r.body.data[0]._count.kelas,1);
    r=await http("GET",`/api/infrastruktur/lantai/gedung/${building.id}`);assert.equal(r.status,200);assert.equal(r.body.data[0].ruangan[0].kelas[0].id,classId);
  });
  await t.test("class rejects foreign/deleted rooms and legacy location payloads",async()=>{
    const foreign=await prisma.ruangan.create({data:{sekolahId:b.id,nama:"Foreign room"}});
    const deleted=await prisma.ruangan.create({data:{sekolahId:a.id,nama:"Deleted",dihapusPada:new Date()}});
    for(const ruanganId of [foreign.id,deleted.id]) {
      assert.equal((await http("PUT",`/api/kelas/${classId}`,{ruanganId})).status,400);
      assert.equal((await http("POST","/api/kelas",{...classData,nama:`Bad ${ruanganId}`,ruanganId})).status,400);
    }
    for(const key of ["lantaiId","gedungId","nomorRuangan"]) assert.equal((await http("PUT",`/api/kelas/${classId}`,{[key]:roomId})).status,400);
    assert.equal((await http("GET",`/api/kelas/${classId}`,undefined,b)).status,404);
  });
  await t.test("deletion protects occupied rooms and infrastructure; null clears assignment",async()=>{
    assert.equal((await http("DELETE",`/api/sarpras/ruangan/${roomId}`)).status,409);
    assert.equal((await http("DELETE",`/api/infrastruktur/lantai/${building.lantai[0].id}`)).status,400);
    assert.equal((await http("DELETE",`/api/infrastruktur/gedung/${building.id}`)).status,400);
    let r=await http("PUT",`/api/kelas/${classId}`,{ruanganId:null});assert.equal(r.status,200);assert.equal(r.body.data.ruangan,null);
    r=await http("DELETE",`/api/sarpras/ruangan/${roomId}`);assert.equal(r.status,200);
    assert.equal((await http("PUT",`/api/kelas/${classId}`,{ruanganId:roomId})).status,400);
  });
});
