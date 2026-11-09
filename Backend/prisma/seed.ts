import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, TipePaket } from "@prisma/client";
import bcrypt from "bcryptjs";
import { seedDefaultHalamanCms } from "./seedCms";
import { provisionSchoolModules } from "../src/utils/provisionSchoolModules";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Memulai seeder database...");

  const daftarPeran = [
    {
      nama: "super_admin",
      namaTampilan: "Super Admin",
      deskripsi: "Administrator tertinggi platform global",
    },
    {
      nama: "admin_yayasan",
      namaTampilan: "Admin Yayasan",
      deskripsi: "Administrator tingkat yayasan",
    },
    {
      nama: "admin_sekolah",
      namaTampilan: "Admin Sekolah",
      deskripsi: "Administrator untuk satu tenant sekolah",
    },
    { nama: "guru", namaTampilan: "Guru", deskripsi: "Guru pengajar" },
    { nama: "siswa", namaTampilan: "Siswa", deskripsi: "Peserta didik" },
  ];

  for (const peran of daftarPeran) {
    const existing = await prisma.peran.findFirst({
      where: { nama: peran.nama, sekolahId: null },
    });
    if (!existing) {
      await prisma.peran.create({
        data: { ...peran, sekolahId: null, status: "aktif" },
      });
    }
  }
  await prisma.peran.updateMany({ where: { status: null, dihapusPada: null }, data: { status: "aktif" } });
  console.log("Data Peran (Role) berhasil dibuat");

  const peranSuperAdmin = await prisma.peran.findFirst({
    where: { nama: "super_admin", sekolahId: null, dihapusPada: null },
  });
  const peranAdminSekolah = await prisma.peran.findFirst({
    where: { nama: "admin_sekolah", sekolahId: null, dihapusPada: null },
  });
  const peranGuru = await prisma.peran.findFirst({
    where: { nama: "guru", sekolahId: null, dihapusPada: null },
  });
  const peranSiswa = await prisma.peran.findFirst({
    where: { nama: "siswa", sekolahId: null, dihapusPada: null },
  });
  const peranAdminYayasan = await prisma.peran.findFirst({
    where: { nama: "admin_yayasan", sekolahId: null, dihapusPada: null },
  });

  if (!peranSuperAdmin) throw new Error("Peran super_admin tidak ditemukan");
  if (!peranAdminSekolah)
    throw new Error("Peran admin_sekolah tidak ditemukan");
  if (!peranAdminYayasan)
    throw new Error("Peran admin_yayasan tidak ditemukan");
  if (!peranGuru) throw new Error("Peran guru tidak ditemukan");
  if (!peranSiswa) throw new Error("Peran siswa tidak ditemukan");

  const hashedPasswordSuper = await bcrypt.hash("SuperAdmin123!", 10);
  const superAdmin = await prisma.pengguna.upsert({
    where: { email: "superadmin@smartschool.com" },
    update: {},
    create: {
      namaPengguna: "superadmin",
      email: "superadmin@smartschool.com",
      kataSandi: hashedPasswordSuper,
      namaLengkap: "Super Administrator",
      peranId: peranSuperAdmin.id,
      status: "aktif",
    },
  });
  console.log("Akun Super Admin berhasil dibuat");

  const modulList = [
    {
      kode: "manajemen_pengguna",
      nama: "Manajemen Pengguna",
      deskripsi: "Modul manajemen pengguna",
      sistem: false,
    },
    {
      kode: "manajemen_sekolah",
      nama: "Manajemen Sekolah",
      deskripsi: "Modul manajemen sekolah",
      sistem: false,
    },
    {
      kode: "paket",
      nama: "Paket",
      deskripsi: "Manajemen Paket Berlangganan",
      sistem: true,
    },
    {
      kode: "langganan",
      nama: "Langganan",
      deskripsi: "Manajemen Langganan Sekolah",
      sistem: true,
    },
    {
      kode: "yayasan",
      nama: "Yayasan",
      deskripsi: "Manajemen Yayasan",
      sistem: true,
    },
    {
      kode: "akademik",
      nama: "Akademik",
      deskripsi: "Modul akademik",
      sistem: false,
    },
    { kode: "tugas", nama: "Tugas", deskripsi: "Modul tugas", sistem: false },
    { kode: "ujian", nama: "Ujian", deskripsi: "Modul ujian", sistem: false },
    {
      kode: "manajemen_aset",
      nama: "Manajemen Aset",
      deskripsi: "Modul manajemen aset",
      sistem: false,
    },
    {
      kode: "cms",
      nama: "CMS",
      deskripsi: "Modul CMS (Halaman & Artikel)",
      sistem: false,
    },
    { kode: "ppdb", nama: "PPDB", deskripsi: "Modul PPDB", sistem: false },
    {
      kode: "lms",
      nama: "LMS",
      deskripsi: "Modul Learning Management System",
      sistem: false,
    },
    {
      kode: "laporan",
      nama: "Laporan",
      deskripsi: "Modul laporan",
      sistem: false,
    },
  ];

  const createdModuls = [];
  for (const m of modulList) {
    const mod = await prisma.modul.upsert({
      where: { kode: m.kode },
      update: {},
      create: { ...m, status: "aktif" },
    });
    createdModuls.push(mod);
  }
  await prisma.modul.updateMany({ where: { status: null, dihapusPada: null }, data: { status: "aktif" } });
  console.log("Data Modul berhasil dibuat");

  const modulMap = Object.fromEntries(createdModuls.map((m) => [m.kode, m.id]));

  const aksiList = ["view", "create", "update", "delete"];
  const izinData = [];
  for (const mod of modulList) {
    for (const aksi of aksiList) {
      izinData.push({
        nama: `${mod.kode}.${aksi}`,
        modul: mod.kode,
        aksi: aksi,
        status: "aktif",
      });
    }
  }

    izinData.push(
    { nama: "peminjaman_aset.view_own", modul: "manajemen_aset", aksi: "view_own", status: "aktif" },
    { nama: "peminjaman_aset.create_own", modul: "manajemen_aset", aksi: "create_own", status: "aktif" },
    { nama: "ujian.submit", modul: "ujian", aksi: "submit", status: "aktif" },
    { nama: "ujian.grade", modul: "ujian", aksi: "grade", status: "aktif" },
    { nama: "tugas.submit", modul: "tugas", aksi: "submit", status: "aktif" },
    { nama: "tugas.grade", modul: "tugas", aksi: "grade", status: "aktif" }
  );
  const createdIzin = [];
  for (const izin of izinData) {
    const i = await prisma.izin.upsert({
      where: { nama: izin.nama },
      update: {},
      create: izin,
    });
    createdIzin.push(i);
  }
  console.log("Data Izin berhasil dibuat");

  const izinMap = Object.fromEntries(createdIzin.map((i) => [i.nama, i.id]));



  const peranIzinMapping = {
    super_admin: { modul: modulList.map((m) => m.kode), aksi: aksiList },
    admin_yayasan: {
      modul: ["yayasan", "manajemen_sekolah", "laporan"],
      aksi: aksiList,
    },
    admin_sekolah: {
      modul: modulList
        .filter((m) => m.kode !== "paket" && m.kode !== "yayasan")
        .map((m) => m.kode),
      aksi: aksiList,
    },
    guru: {
      modul: ["akademik", "tugas", "ujian", "lms", "laporan"],
      aksi: ["view", "create", "update"],
    },
    siswa: {
      modul: ["akademik", "tugas", "ujian", "lms", "laporan"],
      aksi: ["view"],
    },
  };

  const peranMap: Record<string, string> = {
    super_admin: peranSuperAdmin.id,
    admin_yayasan: peranAdminYayasan.id,
    admin_sekolah: peranAdminSekolah.id,
    guru: peranGuru.id,
    siswa: peranSiswa.id,
  };

  const peranIzinEntries: {
    peranId: string;
    izinId: string;
    dibuatOleh: string;
    diperbaruiOleh: string;
  }[] = [];

  for (const [
    peranNama,
    { modul: modulListPeran, aksi: aksiListPeran },
  ] of Object.entries(peranIzinMapping)) {
    const peranId = peranMap[peranNama];
    if (!peranId) {
      console.warn(`Peran "${peranNama}" tidak ditemukan, dilewati.`);
      continue;
    }
    for (const modKode of modulListPeran) {
      for (const aksi of aksiListPeran) {
        const izinNama = `${modKode}.${aksi}`;
        const izinId = izinMap[izinNama];
        if (!izinId) {
          console.warn(`Izin "${izinNama}" tidak ditemukan, dilewati.`);
          continue;
        }
        peranIzinEntries.push({
          peranId,
          izinId,
          dibuatOleh: superAdmin.id,
          diperbaruiOleh: superAdmin.id,
        });
      }
    }
  }

    // Tambahkan izin peminjaman untuk guru
  for (const nama of ["peminjaman_aset.view_own", "peminjaman_aset.create_own"]) {
    peranIzinEntries.push({ peranId: peranGuru.id, izinId: izinMap[nama]!, dibuatOleh: superAdmin.id, diperbaruiOleh: superAdmin.id });
  }

  // Tambahkan izin ujian & tugas untuk guru dan siswa
  const izinUjianTugas = ["ujian.submit", "ujian.grade", "tugas.submit", "tugas.grade"];
  for (const nama of izinUjianTugas) {
    // Untuk Guru
    peranIzinEntries.push({ peranId: peranGuru.id, izinId: izinMap[nama]!, dibuatOleh: superAdmin.id, diperbaruiOleh: superAdmin.id });
    // Untuk Siswa
    peranIzinEntries.push({ peranId: peranSiswa.id, izinId: izinMap[nama]!, dibuatOleh: superAdmin.id, diperbaruiOleh: superAdmin.id });
  }
  const existingPermissions = new Set((await prisma.peranIzin.findMany({ select: { peranId: true, izinId: true } })).map(p => `${p.peranId}:${p.izinId}`));
  await prisma.peranIzin.createMany({
    data: peranIzinEntries.filter(p => !existingPermissions.has(`${p.peranId}:${p.izinId}`)),
    skipDuplicates: true,
  });
  console.log(`${peranIzinEntries.length} data PeranIzin berhasil dibuat`);

  const paketData = [
    {
      nama: "Basic",
      deskripsi: "Paket dasar untuk uji coba, durasi 2 minggu",
      harga: 500000,
      durasi: 14,
      tipe: TipePaket.SEKOLAH,
      status: "aktif",
    },
    {
      nama: "Pro",
      deskripsi: "Paket profesional 6 bulan",
      harga: 2000000,
      durasi: 180,
      tipe: TipePaket.SEKOLAH,
      status: "aktif",
    },
    {
      nama: "Enterprise",
      deskripsi: "Paket enterprise 12 bulan dengan semua fitur",
      harga: 4000000,
      durasi: 365,
      tipe: TipePaket.SEKOLAH,
      status: "aktif",
    },
    {
      nama: "Paket Yayasan Standar",
      deskripsi: "Paket yayasan 12 bulan untuk mengelola banyak cabang sekolah",
      harga: 5000000,
      durasi: 365,
      tipe: TipePaket.YAYASAN,
      status: "aktif",
    },
  ];

  const createdPaket = [];
  for (const p of paketData) {
    let paket = await prisma.paket.findFirst({
      where: { nama: p.nama, tipe: p.tipe, dihapusPada: null },
    });
    if (!paket) {
      paket = await prisma.paket.create({
        data: p,
      });
    } else {
      paket = await prisma.paket.update({
        where: { id: paket.id },
        data: p,
      });
    }
    createdPaket.push(paket);
  }
  console.log("Data Paket berhasil dibuat");

  const paketMap = Object.fromEntries(createdPaket.map((p) => [p.nama, p.id]));


  console.log("Melengkapi relasi PaketModul tanpa menghapus data lama");

  const paketModulMapping: Record<string, string[]> = {
    Basic: ["akademik", "tugas", "ujian", "lms", "laporan"],
    Pro: [
      "manajemen_pengguna",
      "akademik",
      "tugas",
      "ujian",
      "manajemen_aset",
      "cms",
      "lms",
      "laporan",
    ],
    Enterprise: modulList.map((m) => m.kode),
    "Paket Yayasan Standar": ["yayasan", "manajemen_sekolah", "laporan"],
  };

  const paketModulEntries = [];
  for (const [paketNama, modulKodes] of Object.entries(paketModulMapping)) {
    const paketId = paketMap[paketNama];
    if (!paketId) {
      console.warn(`Paket "${paketNama}" tidak ditemukan, dilewati.`);
      continue;
    }
    for (const modKode of modulKodes) {
      const modulId = modulMap[modKode];
      if (!modulId) {
        console.warn(`Modul "${modKode}" tidak ditemukan, dilewati.`);
        continue;
      }
      paketModulEntries.push({
        paketId,
        modulId,
        dibuatOleh: superAdmin.id,
        diperbaruiOleh: superAdmin.id,
        status: "aktif",
      });
    }
  }

  const existingPackageModules = new Set((await prisma.paketModul.findMany({ select: { paketId: true, modulId: true } })).map(p => `${p.paketId}:${p.modulId}`));
  await prisma.paketModul.createMany({
    data: paketModulEntries.filter(p => !existingPackageModules.has(`${p.paketId}:${p.modulId}`)),
    skipDuplicates: true,
  });
  console.log(`${paketModulEntries.length} data PaketModul berhasil dibuat`);

  console.log("Membuat data sekolah dummy...");

  // TipePaket.YAYASAN is the existing package category; no schema change is needed.
  const paketYayasan = createdPaket.find(p => p.tipe === TipePaket.YAYASAN);
  const paketEnterprise = createdPaket.find(p => p.nama === "Enterprise" && p.tipe === TipePaket.SEKOLAH);
  if (!paketYayasan || !paketEnterprise) throw new Error("Paket tenant dummy belum tersedia");
  const mulaiYayasan = new Date();
  const berakhirYayasan = new Date(mulaiYayasan.getTime() + paketYayasan.durasi * 86400000);
  const adminYayasanPassword = await bcrypt.hash("Yayasan123!", 10);

  const yayasan = await prisma.$transaction(async tx => {
    const yayasan = await tx.yayasan.upsert({
      where: { npyp: "1234567890" }, update: {},
      create: {
        nama: "Yayasan Pendidikan Smart", alamat: "Jl. Pendidikan No. 1, Jakarta",
        telepon: "021-1234567", email: "yayasan@smartschool.com", npyp: "1234567890",
        status: "aktif", dibuatOleh: superAdmin.id, diperbaruiOleh: superAdmin.id,
        paketId: paketYayasan.id, statusLangganan: "active",
        tanggalMulaiLangganan: mulaiYayasan, tanggalBerakhirLangganan: berakhirYayasan,
      },
    });
    // Attach a missing subscription once; never renew/reactivate it on each seed.
    if (!yayasan.paketId && !yayasan.statusLangganan) {
      await tx.yayasan.update({where: {id: yayasan.id}, data: {
        paketId: paketYayasan.id, statusLangganan: "active",
        tanggalMulaiLangganan: mulaiYayasan, tanggalBerakhirLangganan: berakhirYayasan,
      }});
    }
    const existingAdmin = await tx.pengguna.findUnique({where: {email: "admin@yayasan.smartschool.com"}});
    if (existingAdmin && (existingAdmin.yayasanId !== yayasan.id || existingAdmin.sekolahId)) {
      throw new Error("Email admin yayasan dummy sudah digunakan tenant lain; akun tidak diubah");
    }
    await tx.pengguna.upsert({
      where: {email: "admin@yayasan.smartschool.com"},
      update: {peranId: peranAdminYayasan.id},
      create: {
        namaPengguna: "adminyayasan", email: "admin@yayasan.smartschool.com",
        kataSandi: adminYayasanPassword, namaLengkap: "Admin Yayasan",
        peranId: peranAdminYayasan.id, yayasanId: yayasan.id, sekolahId: null,
        status: "aktif", dibuatOleh: superAdmin.id, diperbaruiOleh: superAdmin.id,
      },
    });
    return yayasan;
  });
  console.log("Yayasan, paket langganan, dan admin dummy selesai diproses");

  const sekolah = await prisma.$transaction(async (tx) => {
    const sekolah = await tx.sekolah.upsert({
      where: { subdomain: "smart" },
      update: {},
      create: {
        nama: "SMA Smart School",
        subdomain: "smart",
        kode: "SMART",
        jenjang: "SMA",
        alamat: "Jl. Pendidikan No. 1, Jakarta",
        telepon: "021-1234567",
        email: "info@smartschool.com",
        status: "aktif",
        yayasanId: yayasan.id,
        dibuatOleh: superAdmin.id,
        diperbaruiOleh: superAdmin.id,
      },
    });
    await seedDefaultHalamanCms(tx, sekolah.id, superAdmin.id);
    return sekolah;
  });
  console.log("Sekolah dummy dibuat");

  if (!sekolah.langgananAktifId) {
    await prisma.$transaction(async tx => {
      // Reuse existing history instead of inserting a duplicate subscription.
      let langganan = await tx.langgananSekolah.findFirst({
        where: {sekolahId: sekolah.id},
        orderBy: [{dibuatPada: "desc"}, {id: "desc"}],
      });
      if (!langganan) {
        const mulai = new Date();
        langganan = await tx.langgananSekolah.create({data: {
          sekolahId: sekolah.id, paketId: paketEnterprise.id,
          statusPembayaran: "success", statusLangganan: "active",
          tanggalMulai: mulai, tanggalBerakhir: new Date(mulai.getTime() + paketEnterprise.durasi * 86400000),
          hargaSaatBerlangganan: paketEnterprise.harga, siklusPenagihan: "annual",
          dibuatOleh: superAdmin.id,
        }});
      }
      await tx.sekolah.update({where: {id: sekolah.id}, data: {langgananAktifId: langganan.id}});
    });
    console.log("Relasi paket langganan sekolah dummy selesai diproses");
  }

  const schoolSubscription = await prisma.langgananSekolah.findFirst({ where: { sekolahId: sekolah.id }, orderBy: { dibuatPada: "desc" } });
  if (schoolSubscription) await prisma.$transaction(tx => provisionSchoolModules(tx, sekolah.id, schoolSubscription.paketId, superAdmin.id, schoolSubscription.tanggalBerakhir));

  let tahunAjaran = await prisma.tahunAjaran.findFirst({
    where: {
      sekolahId: sekolah.id,
      tahunAjaran: "2025/2026",
      semester: "Ganjil",
    },
  });
  if (!tahunAjaran) {
    tahunAjaran = await prisma.tahunAjaran.create({
      data: {
        sekolahId: sekolah.id,
        tahunAjaran: "2025/2026",
        semester: "Ganjil",
        status: "aktif",
      },
    });
  }
  console.log("Tahun Ajaran dummy dibuat");

  const daftarKelas = [
    { nama: "XII IPA 1", tingkat: 12 },
    { nama: "XII IPS 1", tingkat: 12 },
    { nama: "XI IPA 1", tingkat: 11 },
    { nama: "XI IPS 1", tingkat: 11 },
    { nama: "X IPA 1", tingkat: 10 },
    { nama: "X IPS 1", tingkat: 10 },
  ];

  const kelasMap: Record<string, any> = {};
  for (const k of daftarKelas) {
    let kelas = await prisma.kelas.findFirst({
      where: {
        sekolahId: sekolah.id,
        tahunAjaranId: tahunAjaran.id,
        nama: k.nama,
      },
    });
    if (!kelas) {
      kelas = await prisma.kelas.create({
        data: {
          sekolahId: sekolah.id,
          tahunAjaranId: tahunAjaran.id,
          nama: k.nama,
          tingkat: String(k.tingkat),
        },
      });
    }
    kelasMap[k.nama] = kelas;
  }
  console.log("Kelas dummy dibuat");

  const daftarMapel = [
    "Matematika",
    "Fisika",
    "Kimia",
    "Biologi",
    "Ekonomi",
    "Geografi",
    "Sosiologi",
    "Bahasa Indonesia",
    "Bahasa Inggris",
    "Sejarah",
    "Pendidikan Agama",
    "Pendidikan Pancasila",
  ];

  const mapelMap: Record<string, any> = {};
  for (const nama of daftarMapel) {
    const kode = nama.substring(0, 3).toUpperCase();
    let mapel = await prisma.mataPelajaran.findFirst({
      where: { kode: kode, sekolahId: sekolah.id },
    });
    if (!mapel) {
      mapel = await prisma.mataPelajaran.create({
        data: {
          sekolahId: sekolah.id,
          nama: nama,
          kode: kode,
          status: "aktif",
          dibuatOleh: superAdmin.id,
          diperbaruiOleh: superAdmin.id,
        },
      });
    }
    mapelMap[nama] = mapel;
  }
  console.log("Mata Pelajaran dummy dibuat");

  await prisma.pengguna.upsert({
    where: { email: "admin@smartschool.com" },
    update: {},
    create: {
      namaPengguna: "adminsekolah",
      email: "admin@smartschool.com",
      kataSandi: await bcrypt.hash("Admin123!", 10),
      namaLengkap: "Admin Sekolah",
      peranId: peranAdminSekolah.id,
      sekolahId: sekolah.id,
      status: "aktif",
      dibuatOleh: superAdmin.id,
      diperbaruiOleh: superAdmin.id,
    },
  });
  console.log("Admin Sekolah dummy dibuat");

  const daftarGuru = [
    {
      nama: "Budi Santoso",
      nip: "198001011",
      nuptk: "1234567890",
      mapel: "Matematika",
    },
    {
      nama: "Siti Rahayu",
      nip: "198002022",
      nuptk: "1234567891",
      mapel: "Fisika",
    },
    {
      nama: "Ahmad Hidayat",
      nip: "198003033",
      nuptk: "1234567892",
      mapel: "Kimia",
    },
    {
      nama: "Dewi Lestari",
      nip: "198004044",
      nuptk: "1234567893",
      mapel: "Biologi",
    },
    {
      nama: "Rina Marlina",
      nip: "198005055",
      nuptk: "1234567894",
      mapel: "Ekonomi",
    },
  ];

  const guruMap: Record<string, any> = {};
  for (const g of daftarGuru) {
    const email = `${g.nama.toLowerCase().replace(/ /g, ".")}@smartschool.com`;
    let guru = await prisma.pengguna.findFirst({
      where: { email: email },
    });
    if (!guru) {
      guru = await prisma.pengguna.create({
        data: {
          namaPengguna: g.nama.toLowerCase().replace(/ /g, "."),
          email: email,
          kataSandi: await bcrypt.hash("Guru123!", 10),
          namaLengkap: g.nama,
          nip: g.nip,
          nuptk: g.nuptk,
          peranId: peranGuru.id,
          sekolahId: sekolah.id,
          status: "aktif",
          dibuatOleh: superAdmin.id,
          diperbaruiOleh: superAdmin.id,
        },
      });
    }
    guruMap[g.mapel] = guru;
  }
  console.log("Guru dummy dibuat");

  const daftarSiswa = [
    { nama: "Andi Wijaya", nisn: "1234567890", kelas: "XII IPA 1" },
    { nama: "Budi Pratama", nisn: "1234567891", kelas: "XII IPA 1" },
    { nama: "Cindy Kusuma", nisn: "1234567892", kelas: "XII IPS 1" },
    { nama: "Dian Sari", nisn: "1234567893", kelas: "XII IPS 1" },
    { nama: "Eko Santoso", nisn: "1234567894", kelas: "XI IPA 1" },
    { nama: "Fitri Anisa", nisn: "1234567895", kelas: "XI IPA 1" },
    { nama: "Gilang Ramadhan", nisn: "1234567896", kelas: "XI IPS 1" },
    { nama: "Hana Rahma", nisn: "1234567897", kelas: "XI IPS 1" },
    { nama: "Indra Gunawan", nisn: "1234567898", kelas: "X IPA 1" },
    { nama: "Jihan Aulia", nisn: "1234567899", kelas: "X IPA 1" },
  ];

  const siswaList = [];
  for (const s of daftarSiswa) {
    const email = `${s.nama.toLowerCase().replace(/ /g, ".")}@smartschool.com`;
    let siswa = await prisma.pengguna.findFirst({
      where: { email: email },
    });
    if (!siswa) {
      siswa = await prisma.pengguna.create({
        data: {
          namaPengguna: s.nama.toLowerCase().replace(/ /g, "."),
          email: email,
          kataSandi: await bcrypt.hash("Siswa123!", 10),
          namaLengkap: s.nama,
          nisn: s.nisn,
          peranId: peranSiswa.id,
          sekolahId: sekolah.id,
          status: "aktif",
          dibuatOleh: superAdmin.id,
          diperbaruiOleh: superAdmin.id,
        },
      });
    }
    siswaList.push({ siswa, kelasNama: s.kelas });
  }
  console.log("Siswa dummy dibuat");

  const kelasMapelData = [];
  for (const [mapelNama, guru] of Object.entries(guruMap)) {
    const mapel = mapelMap[mapelNama];
    if (!mapel) continue;
    for (const [, kelas] of Object.entries(kelasMap)) {
      const existing = await prisma.kelasMapel.findFirst({
        where: {
          kelasId: kelas.id,
          mataPelajaranId: mapel.id,
        },
      });
      if (!existing) {
        kelasMapelData.push({
          kelasId: kelas.id,
          mataPelajaranId: mapel.id,
          guruPengajarId: guru.id,
          status: "aktif",
          dibuatOleh: superAdmin.id,
          diperbaruiOleh: superAdmin.id,
        });
      }
    }
  }

  if (kelasMapelData.length > 0) {
    const existingKelasMapel = new Set((await prisma.kelasMapel.findMany({ where: { kelasId: { in: kelasMapelData.map(m => m.kelasId) } }, select: { kelasId: true, mataPelajaranId: true } })).map(m => `${m.kelasId}:${m.mataPelajaranId}`));
    await prisma.kelasMapel.createMany({
      data: kelasMapelData.filter(m => !existingKelasMapel.has(`${m.kelasId}:${m.mataPelajaranId}`)),
      skipDuplicates: true,
    });
  }
  console.log("Kelas Mapel dummy dibuat");

  const siswaKelasData = [];
  for (const item of siswaList) {
    const kelas = kelasMap[item.kelasNama];
    if (!kelas) continue;
    const existing = await prisma.anggotaKelas.findFirst({
      where: {
        kelasId: kelas.id,
        penggunaId: item.siswa.id,
      },
    });
    if (!existing) {
      siswaKelasData.push({
        kelasId: kelas.id,
        penggunaId: item.siswa.id,
        tahunAjaranId: kelas.tahunAjaranId,
        status: "aktif",
      });
    }
  }

  if (siswaKelasData.length > 0) {
    await prisma.anggotaKelas.createMany({
      data: siswaKelasData,
      skipDuplicates: true,
    });
  }
  console.log("Siswa Kelas dummy dibuat");

  const otpTestUser = await prisma.pengguna.upsert({
    where: { email: "divaalhenaputri@gmail.com" },
    update: {},
    create: {
      namaPengguna: "divaalhenaputri",
      email: "divaalhenaputri@gmail.com",
      kataSandi: await bcrypt.hash("Test123!", 10),
      namaLengkap: "Diva Alhena Putri",
      peranId: peranSiswa.id,
      sekolahId: sekolah.id,
      status: "aktif",
      dibuatOleh: superAdmin.id,
      diperbaruiOleh: superAdmin.id,
    },
  });
  console.log("Pengguna testing OTP (divaalhenaputri@gmail.com) dibuat");

  const kelasXIIIPA1 = kelasMap["XII IPA 1"];
  if (kelasXIIIPA1) {
    const existingSiswaKelas = await prisma.anggotaKelas.findFirst({
      where: {
        kelasId: kelasXIIIPA1.id,
        penggunaId: otpTestUser.id,
      },
    });
    if (!existingSiswaKelas) {
      await prisma.anggotaKelas.create({
        data: {
          kelasId: kelasXIIIPA1.id,
          penggunaId: otpTestUser.id,
          tahunAjaranId: kelasXIIIPA1.tahunAjaranId,
        },
      });
      console.log("Pengguna OTP ditambahkan ke kelas XII IPA 1");
    }
  }

  // Keep lookups and awaited writes inside main(): this seed runs as CJS.
  const reviewDummy = [
    {
      role: "admin_yayasan", email: "admin@yayasan.smartschool.com",
      rating: 5, status: "tampil",
      komentar: "SmartSchool membuat administrasi yayasan lebih efisien dan membantu kami memantau seluruh sekolah dalam satu sistem.",
    },
    {
      role: "admin_sekolah", email: "admin@smartschool.com",
      rating: 5, status: "tampil",
      komentar: "Pengelolaan data sekolah menjadi lebih mudah, rapi, dan cepat. Informasi yang dibutuhkan dapat ditemukan dengan praktis.",
    },
    {
      role: "guru", email: null,
      rating: 4, status: "menunggu",
      komentar: "Saya lebih mudah memantau kehadiran dan perkembangan siswa sehingga pendampingan belajar dapat dilakukan dengan lebih terarah.",
    },
  ];

  for (const review of reviewDummy) {
    const pengguna = await prisma.pengguna.findFirst({
      where: {
        ...(review.email ? { email: review.email } : { sekolahId: sekolah.id }),
        status: "aktif", dihapusPada: null,
        peran: { nama: review.role, status: "aktif", dihapusPada: null },
      },
      select: { id: true },
      orderBy: { id: "asc" },
    });
    if (!pengguna) {
      console.warn(`Review dummy dilewati: akun ${review.role} tidak ditemukan.`);
      continue;
    }
    await prisma.reviewPengguna.upsert({
      where: { penggunaId: pengguna.id },
      update: {}, // Preserve existing reviews and moderation on repeated seeds.
      create: {
        penggunaId: pengguna.id, rating: review.rating,
        komentar: review.komentar, status: review.status,
      },
    });
  }
  console.log("Review pengguna dummy selesai diproses");

  // Seeder Jabatan & Hak Akses Menu Baku (RBAC Jabatan)
  const pustakawanAksesMenu = [
    { menu: "absen saya", permissions: ["view", "create"] },
    { menu: "perpustakaan", permissions: ["view", "create", "update", "delete"] },
  ];

  const jabatanPustakawan = await prisma.jabatan.upsert({
    where: { namaJabatan: "Pustakawan" },
    update: {
      deskripsi: "Petugas pengelola dan pelayanan perpustakaan sekolah",
      aksesMenu: pustakawanAksesMenu,
    },
    create: {
      namaJabatan: "Pustakawan",
      deskripsi: "Petugas pengelola dan pelayanan perpustakaan sekolah",
      aksesMenu: pustakawanAksesMenu,
    },
  });
  console.log("Jabatan Pustakawan berhasil di-seed:", jabatanPustakawan.namaJabatan);

  // Kaitkan contoh jabatan Pustakawan ke akun guru Budi Santoso (jika ada)
  const guruBudi = await prisma.pengguna.findFirst({
    where: { email: "budi.santoso@smartschool.com" },
  });
  if (guruBudi && !guruBudi.jabatanId) {
    await prisma.pengguna.update({
      where: { id: guruBudi.id },
      data: {
        jabatanId: jabatanPustakawan.id,
        jabatan: "Pustakawan",
      },
    });
    console.log("Jabatan Pustakawan berhasil dikaitkan ke pengguna Budi Santoso");
  }

  console.log("Data sekolah dummy selesai");
  console.log("Seeder selesai dieksekusi");
}

main()
  .catch((e) => {
    console.error(e);
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
