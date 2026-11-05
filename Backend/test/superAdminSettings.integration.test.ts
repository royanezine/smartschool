import assert from "node:assert/strict";
import {once} from "node:events";
import {randomBytes,randomUUID} from "node:crypto";
import {readFileSync} from "node:fs";
import test from "node:test";
const url=process.env.TEST_DATABASE_URL;
test("super admin configuration encryption and template CRUD",{skip:!url},async t=>{
  assert.ok(["127.0.0.1","localhost","[::1]"].includes(new URL(url!).hostname));
  process.env.DATABASE_URL=url!;process.env.JWT_SECRET ||= "isolated-settings-tests";
  const previousKey=process.env.ENCRYPTION_KEY;const encryptionKey=randomBytes(32).toString("hex");process.env.ENCRYPTION_KEY=encryptionKey;
  const {prisma}=require("../src/config/db");const {encryptData,decryptData,isEncrypted}=require("../src/utils/encryption");
  const {generateAccessToken}=require("../src/utils/generateToken");const app=require("../src/app").default;
  const server=app.listen(0,"127.0.0.1");await once(server,"listening");const base=`http://127.0.0.1:${server.address().port}/api/super-admin`;
  const suffix=randomUUID().slice(0,8);const userIds:string[]=[],roleIds:string[]=[],keys:string[]=[],templateIds:string[]=[];
  const logs:unknown[]=[];const logger=t.mock.method(console,"error",(...args:unknown[])=>logs.push(args));
  t.after(async()=>{
    logger.mock.restore();server.closeAllConnections();await new Promise<void>(r=>server.close(()=>r()));
    await prisma.konfigurasiSistem.deleteMany({where:{kunci:{in:keys}}});await prisma.templateNotifikasi.deleteMany({where:{id:{in:templateIds}}});
    await prisma.pengguna.deleteMany({where:{id:{in:userIds}}});await prisma.peran.deleteMany({where:{id:{in:roleIds}}});await prisma.$disconnect();
    if(previousKey===undefined)delete process.env.ENCRYPTION_KEY;else process.env.ENCRYPTION_KEY=previousKey;
  });
  async function actor(role:string){const p=await prisma.peran.create({data:{nama:role,namaTampilan:role,status:"aktif"}});roleIds.push(p.id);
    const u=await prisma.pengguna.create({data:{namaPengguna:`settings_${role}_${suffix}`,email:`settings_${role}_${suffix}@example.test`,namaLengkap:role,kataSandi:"unused",peranId:p.id,status:"aktif"}});userIds.push(u.id);
    return generateAccessToken({userId:u.id,email:u.email,roleId:p.id,role,izin:[],modulAktif:[]});}
  const root=await actor("super_admin"),schoolAdmin=await actor("admin_sekolah");
  async function http(method:string,path:string,body?:unknown,token:string|null=root){const r=await fetch(base+path,{method,headers:{...(token?{Authorization:`Bearer ${token}`} : {}),"Content-Type":"application/json"},body:body===undefined?undefined:JSON.stringify(body)});return {status:r.status,body:await r.json() as any,cache:r.headers.get("cache-control")};}
  const settingKey=`midtrans.server_key_${suffix}`;keys.push(settingKey);const secret="private-test-value-DoNotExpose";
  await t.test("AES GCM rejects invalid keys, tampering and swapped setting context",async()=>{
    const encrypted=encryptData(secret,"key-a");assert.notEqual(encrypted,encryptData(secret,"key-a"));assert.equal(decryptData(encrypted,"key-a"),secret);assert.ok(isEncrypted(encrypted));
    assert.throws(()=>decryptData(encrypted,"key-b"));const parts=encrypted.split(":");parts[1]=Buffer.alloc(16).toString("base64");assert.throws(()=>decryptData(parts.join(":"),"key-a"));
    process.env.ENCRYPTION_KEY="g".repeat(64);assert.throws(()=>encryptData(secret));process.env.ENCRYPTION_KEY=encryptionKey;
  });
  await t.test("authentication and super-admin authorization protect reads and writes",async()=>{
    assert.equal((await http("GET","/konfigurasi",undefined,null)).status,401);
    for(const [method,path] of [["GET","/konfigurasi"],["PUT",`/konfigurasi/${settingKey}`],["DELETE",`/konfigurasi/${settingKey}`],["GET","/template-notifikasi"],["POST","/template-notifikasi"]])assert.equal((await http(method!,path!,method === "GET" ? undefined : {},schoolAdmin)).status,403);
  });
  await t.test("secret creation/update never returns plaintext or ciphertext and masks legacy flags",async()=>{
    let r=await http("PUT",`/konfigurasi/${settingKey}`,{kategori:"INTEGRASI",nilaiText:secret});assert.equal(r.status,201);assert.equal(r.body.data.isRahasia,true);assert.equal(r.body.data.nilaiText,"********");assert.equal(r.cache,"no-store");
    let row=await prisma.konfigurasiSistem.findUnique({where:{kunci:settingKey}});assert.notEqual(row.nilaiText,secret);assert.equal(decryptData(row.nilaiText,settingKey),secret);
    const before=row.nilaiText;r=await http("PUT",`/konfigurasi/${settingKey}`,{keterangan:"metadata only"});assert.equal(r.status,200);row=await prisma.konfigurasiSistem.findUnique({where:{kunci:settingKey}});assert.equal(row.nilaiText,before);
    assert.equal((await http("PUT",`/konfigurasi/${settingKey}`,{nilaiText:secret,isRahasia:false})).status,400);
    assert.equal((await http("PUT",`/konfigurasi/${settingKey}`,{nilaiText:"********"})).status,400);
    assert.equal((await http("PUT",`/konfigurasi/${settingKey}`,{kategori:"KEAMANAN",nilaiText:secret})).status,400);
    const forged=encryptData("client shaped value");r=await http("PUT",`/konfigurasi/${settingKey}`,{nilaiText:forged});assert.equal(r.status,200);
    row=await prisma.konfigurasiSistem.findUnique({where:{kunci:settingKey}});assert.notEqual(row.nilaiText,forged);assert.equal(decryptData(row.nilaiText,settingKey),forged);
    await prisma.konfigurasiSistem.update({where:{kunci:settingKey},data:{isRahasia:false,nilaiText:secret}});
    const detail=await http("GET",`/konfigurasi/${settingKey}`);assert.equal(detail.body.data.nilaiText,"********");
    const list=await http("GET",`/konfigurasi?search=${suffix}`);assert.doesNotMatch(JSON.stringify(list.body),new RegExp(secret));
    r=await http("PUT",`/konfigurasi/${settingKey}`,{nilaiText:secret});assert.equal(r.status,200);
    delete process.env.ENCRYPTION_KEY;r=await http("PUT",`/konfigurasi/${settingKey}`,{nilaiText:"new-private-value"});assert.equal(r.status,503);process.env.ENCRYPTION_KEY=encryptionKey;
    assert.equal(decryptData((await prisma.konfigurasiSistem.findUnique({where:{kunci:settingKey}})).nilaiText,settingKey),secret);
    assert.equal((await http("PUT",`/konfigurasi/${settingKey}`,{nilaiText:null})).body.data.credentialConfigured,false);
    assert.equal((await http("DELETE",`/konfigurasi/${settingKey}`)).status,200);assert.equal((await http("GET",`/konfigurasi/${settingKey}`)).status,404);
    assert.ok(!JSON.stringify(logs).includes(secret));assert.ok(!JSON.stringify(logs).includes(encryptionKey));
  });
  await t.test("typed values, security bounds and concurrent creation remain valid",async()=>{
    const key=`feature_${suffix}`;keys.push(key);let r=await http("PUT",`/konfigurasi/${key}`,{kategori:"NOTIFIKASI",nilaiBoolean:false});assert.equal(r.status,201);assert.equal(r.body.data.nilaiBoolean,false);
    assert.equal((await http("PUT",`/konfigurasi/${key}`,{nilaiBoolean:true,nilaiText:"conflict"})).status,400);
    const security="security.max_login_attempts";keys.push(security);
    assert.equal((await http("PUT",`/konfigurasi/${security}`,{kategori:"KEAMANAN",nilaiAngka:-1})).status,400);
    const responses=await Promise.all([http("PUT",`/konfigurasi/${security}`,{kategori:"KEAMANAN",nilaiAngka:5}),http("PUT",`/konfigurasi/${security}`,{kategori:"KEAMANAN",nilaiAngka:6})]);
    assert.deepEqual(responses.map(r=>r.status).sort(),[200,201]);assert.equal(await prisma.konfigurasiSistem.count({where:{kunci:security}}),1);
  });
  await t.test("template CRUD, filters, uniqueness and atomic toggles",async()=>{
    const body={eventTarget:`otp_${suffix}`,kanal:"email",subjek:"OTP",isiTemplate:"Halo {{nama}}",variabel:{nama:"Nama pengguna"}};
    let r=await http("POST","/template-notifikasi",body);assert.equal(r.status,201);const id=r.body.data.id;templateIds.push(id);
    assert.equal((await http("POST","/template-notifikasi",body)).status,409);
    assert.equal((await http("PUT",`/template-notifikasi/${id}`,{})).status,400);
    assert.equal((await http("PUT",`/template-notifikasi/${id}`,{subjek:null,isActive:false})).status,200);
    r=await http("GET","/template-notifikasi?isActive=false");assert.ok(r.body.data.some((v:any)=>v.id===id));
    assert.equal((await http("GET","/template-notifikasi?isActive=invalid")).status,400);
    await Promise.all([http("PATCH",`/template-notifikasi/${id}/toggle`),http("PATCH",`/template-notifikasi/${id}/toggle`)]);
    assert.equal((await http("GET",`/template-notifikasi/${id}`)).body.data.isActive,false);
    assert.equal((await http("DELETE",`/template-notifikasi/${id}`)).status,200);assert.equal((await http("GET",`/template-notifikasi/${id}`)).status,404);
  });
  await t.test("migration SQL creates constraints and RLS without touching existing business tables",async()=>{
    const {Client}=require("pg");const c=new Client({connectionString:url});await c.connect();const schema=`settings_${suffix}`;
    try{await c.query(`CREATE SCHEMA "${schema}"; SET search_path TO "${schema}"`);
      await c.query(readFileSync("prisma/migrations/20261105120000_pengaturan_super_admin/migration.sql","utf8"));
      const rows=(await c.query("SELECT relname,relrowsecurity FROM pg_class WHERE relnamespace=current_schema()::regnamespace AND relkind='r' ORDER BY relname")).rows;
      assert.equal(rows.length,2);assert.ok(rows.every((v:any)=>v.relrowsecurity));
      await assert.rejects(c.query("INSERT INTO konfigurasi_sistem(id,kategori,kunci,nilai_text,nilai_boolean,is_rahasia,diperbarui_pada) VALUES ('bad','INTEGRASI','smtp.password','plain',true,true,now())"));
    }finally{await c.query("ROLLBACK");await c.query(`SET search_path TO public; DROP SCHEMA "${schema}" CASCADE`);await c.end();}
  });
});
