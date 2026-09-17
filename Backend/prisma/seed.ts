import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("⏳ Memulai seeder database...");

  // 1. PERAN (Role)
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
        data: { ...peran, sekolahId: null },
      });
    }
  }
  console.log("✅ Data Peran (Role) berhasil dibuat!");

  // Ambil semua peran untuk referensi
  const peranSuperAdmin = await prisma.peran.findFirst({
    where: { nama: "super_admin" },
  });
  const peranAdminSekolah = await prisma.peran.findFirst({
    where: { nama: "admin_sekolah" },
  });
  const peranGuru = await prisma.peran.findFirst({
    where: { nama: "guru" },
  });
  const peranSiswa = await prisma.peran.findFirst({
    where: { nama: "siswa" },
  });
  const peranAdminYayasan = await prisma.peran.findFirst({
    where: { nama: "admin_yayasan" },
  });

  if (!peranSuperAdmin) throw new Error("Peran super_admin tidak ditemukan");
  if (!peranAdminSekolah)
    throw new Error("Peran admin_sekolah tidak ditemukan");
  if (!peranGuru) throw new Error("Peran guru tidak ditemukan");
  if (!peranSiswa) throw new Error("Peran siswa tidak ditemukan");

  // 2. SUPER ADMIN
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
  console.log("✅ Akun Super Admin berhasil dibuat!");

  // 3. MODUL
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
      create: m,
    });
    createdModuls.push(mod);
  }
  console.log("✅ Data Modul berhasil dibuat!");

  const modulMap = Object.fromEntries(createdModuls.map((m) => [m.kode, m.id]));

  // 4. IZIN
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

  const createdIzin = [];
  for (const izin of izinData) {
    const i = await prisma.izin.upsert({
      where: { nama: izin.nama },
      update: {},
      create: izin,
    });
    createdIzin.push(i);
  }
  console.log("✅ Data Izin berhasil dibuat!");

  const izinMap = Object.fromEntries(createdIzin.map((i) => [i.nama, i.id]));

  // 5. PERAN IZIN
  await prisma.peranIzin.deleteMany({});
  console.log("🗑️ Data PeranIzin lama dihapus.");

  const peranIzinMapping = {
    super_admin: { modul: modulList.map((m) => m.kode), aksi: aksiList },
    admin_yayasan: {
      modul: ["yayasan", "manajemen_sekolah", "laporan"],
      aksi: aksiList,
    },
    admin_sekolah: { modul: modulList.filter(m => m.kode !== "paket" && m.kode !== "yayasan").map((m) => m.kode), 
      aksi: aksiList 
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
      console.warn(`⚠️ Peran "${peranNama}" tidak ditemukan, dilewati.`);
      continue;
    }
    for (const modKode of modulListPeran) {
      for (const aksi of aksiListPeran) {
        const izinNama = `${modKode}.${aksi}`;
        const izinId = izinMap[izinNama];
        if (!izinId) {
          console.warn(`⚠️ Izin "${izinNama}" tidak ditemukan, dilewati.`);
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

  await prisma.peranIzin.createMany({
    data: peranIzinEntries,
    skipDuplicates: true,
  });
  console.log(`✅ ${peranIzinEntries.length} data PeranIzin berhasil dibuat!`);

  // 6. PAKET
  const paketData = [
    {
      nama: "Basic",
      deskripsi: "Paket dasar untuk uji coba, durasi 2 minggu",
      harga: 500000,
      durasi: 14, // hari
      status: "aktif",
    },
    {
      nama: "Pro",
      deskripsi: "Paket profesional 6 bulan",
      harga: 2000000,
      durasi: 180,
      status: "aktif",
    },
    {
      nama: "Enterprise",
      deskripsi: "Paket enterprise 12 bulan dengan semua fitur",
      harga: 4000000,
      durasi: 365,
      status: "aktif",
    },
  ];

  const createdPaket = [];
  for (const p of paketData) {
    let paket = await prisma.paket.findFirst({
      where: { nama: p.nama },
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
  console.log("✅ Data Paket berhasil dibuat!");

  const paketMap = Object.fromEntries(createdPaket.map((p) => [p.nama, p.id]));

  // 7. PAKET MODUL
  await prisma.paketModul.deleteMany({});
  console.log("🗑️ Data PaketModul lama dihapus.");

  const paketModulMapping = {
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
  };

  const paketModulEntries = [];
  for (const [paketNama, modulKodes] of Object.entries(paketModulMapping)) {
    const paketId = paketMap[paketNama];
    if (!paketId) {
      console.warn(`⚠️ Paket "${paketNama}" tidak ditemukan, dilewati.`);
      continue;
    }
    for (const modKode of modulKodes) {
      const modulId = modulMap[modKode];
      if (!modulId) {
        console.warn(`⚠️ Modul "${modKode}" tidak ditemukan, dilewati.`);
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

  await prisma.paketModul.createMany({
    data: paketModulEntries,
    skipDuplicates: true,
  });
  console.log(
    `✅ ${paketModulEntries.length} data PaketModul berhasil dibuat!`,
  );

  // 8. DATA SEKOLAH DUMMY UNTUK TESTING
  console.log("⏳ Membuat data sekolah dummy...");

  // 8.1 Yayasan
  const yayasan = await prisma.yayasan.upsert({
    where: { npyp: "1234567890" },
    update: {},
    create: {
      nama: "Yayasan Pendidikan Smart",
      alamat: "Jl. Pendidikan No. 1, Jakarta",
      telepon: "021-1234567",
      email: "yayasan@smartschool.com",
      npyp: "1234567890",
      status: "aktif",
      dibuatOleh: superAdmin.id,
      diperbaruiOleh: superAdmin.id,
    },
  });
  console.log("✅ Yayasan dummy dibuat");

  // 8.2 Sekolah
  const sekolah = await prisma.sekolah.upsert({
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
  console.log("✅ Sekolah dummy dibuat");

  // 8.3 Tahun Ajaran
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
  console.log("✅ Tahun Ajaran dummy dibuat");

  // 8.4 Kelas
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
  console.log("✅ Kelas dummy dibuat");

  // 8.5 Mata Pelajaran
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
  console.log("✅ Mata Pelajaran dummy dibuat");

  // 8.6 Admin Sekolah
  const adminSekolah = await prisma.pengguna.upsert({
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
  console.log("✅ Admin Sekolah dummy dibuat");

  // 8.7 Guru
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
  console.log("✅ Guru dummy dibuat");

  // 8.8 Siswa
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
  console.log("✅ Siswa dummy dibuat");

  // 8.9 Kelas Mapel (guru mengajar mapel di kelas tertentu)
  const kelasMapelData = [];
  for (const [mapelNama, guru] of Object.entries(guruMap)) {
    const mapel = mapelMap[mapelNama];
    if (!mapel) continue;
    for (const [kelasNama, kelas] of Object.entries(kelasMap)) {
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
    await prisma.kelasMapel.createMany({
      data: kelasMapelData,
      skipDuplicates: true,
    });
  }
  console.log("✅ Kelas Mapel dummy dibuat");

  // 8.10 Siswa Kelas
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
      });
    }
  }

  if (siswaKelasData.length > 0) {
    await prisma.anggotaKelas.createMany({
      data: siswaKelasData,
      skipDuplicates: true,
    });
  }
  console.log("✅ Siswa Kelas dummy dibuat");

  // 8.11 PENGUNA KHUSUS UNTUK TESTING OTP
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
  console.log("✅ Pengguna testing OTP (divaalhenaputri@gmail.com) dibuat");

  // Tambahkan ke siswaKelas (XII IPA 1)
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
      console.log("✅ Pengguna OTP ditambahkan ke kelas XII IPA 1");
    }
  }

  console.log("✅ Data sekolah dummy selesai!");
  console.log("🚀 Seeder selesai dieksekusi!");
}

main()
  .catch((e) => {
    console.error(e);
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
