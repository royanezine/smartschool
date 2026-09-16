// ============================================
// DATA CMS (Artikel & Halaman Statis)
// ============================================

export const dummyArticles = [
  {
    id: 1,
    title: 'Pembukaan Tahun Ajaran Baru 2025/2026',
    slug: 'pembukaan-tahun-ajaran-baru-2025-2026',
    content: `<p>Kegiatan pembukaan tahun ajaran baru 2025/2026 akan dilaksanakan pada tanggal <strong>15 Juli 2025</strong>. Seluruh siswa diwajibkan hadir pukul 07.00 WIB di lapangan utama.</p>
    <h2>Agenda:</h2>
    <ul>
      <li>Sambutan Kepala Sekolah</li>
      <li>Pengenalan Guru dan Staf</li>
      <li>Pembagian Kelas</li>
      <li>Tour Sekolah</li>
    </ul>
    <p>Pastikan membawa perlengkapan sekolah lengkap.</p>`,
    status: 'published',
    category: 'Pengumuman',
    tags: 'tahun-ajaran, pembukaan',
    created_at: '2025-07-10T08:00:00Z',
    updated_at: '2025-07-10T08:00:00Z',
  },
  {
    id: 2,
    title: 'Siswa Berprestasi Juara Olimpiade Matematika',
    slug: 'siswa-berprestasi-juara-olimpiade-matematika',
    content: `<p>Selamat kepada <strong>Andi Pratama</strong> (Kelas XII IPA 1) yang berhasil meraih medali <strong>Emas</strong> dalam Olimpiade Matematika Tingkat Provinsi.</p>
    <img src="https://picsum.photos/seed/olympiad/600/400" alt="Juara Olimpiade" />
    <p>Prestasi ini akan menjadi kebanggaan sekolah. Semoga bisa menginspirasi siswa lainnya.</p>`,
    status: 'published',
    category: 'Prestasi',
    tags: 'prestasi, olimpiade, matematika',
    created_at: '2025-07-05T14:30:00Z',
    updated_at: '2025-07-06T09:15:00Z',
  },
  {
    id: 3,
    title: 'Pendaftaran Ekstrakurikuler Semester Ganjil',
    slug: 'pendaftaran-ekstrakurikuler-semester-ganjil',
    content: `<p>Pendaftaran ekstrakurikuler untuk semester ganjil tahun 2025/2026 dibuka mulai <strong>1 Agustus - 10 Agustus 2025</strong>.</p>
    <h3>Ekstrakurikuler yang tersedia:</h3>
    <ul>
      <li>Pramuka</li>
      <li>Paskibra</li>
      <li>Basket</li>
      <li>Futsal</li>
      <li>Paduan Suara</li>
      <li>Teater</li>
      <li>Robotik</li>
    </ul>
    <p>Pendaftaran melalui <a href="https://forms.gle/xxxxx">tautan ini</a>.</p>`,
    status: 'draft',
    category: 'Ekstrakurikuler',
    tags: 'eskul, pendaftaran',
    created_at: '2025-07-01T10:00:00Z',
    updated_at: '2025-07-02T11:20:00Z',
  },
  {
    id: 4,
    title: 'Libur Hari Kemerdekaan 17 Agustus',
    slug: 'libur-hari-kemerdekaan-17-agustus',
    content: `<p>Diberitahukan bahwa dalam rangka memperingati <strong>Hari Kemerdekaan RI ke-80</strong>, kegiatan belajar mengajar diliburkan pada tanggal <strong>17 Agustus 2025</strong>.</p>
    <p>Kegiatan akan diganti dengan upacara bendera dan lomba 17-an di sekolah.</p>`,
    status: 'published',
    category: 'Pengumuman',
    tags: 'libur, kemerdekaan',
    created_at: '2025-07-15T07:00:00Z',
    updated_at: '2025-07-15T07:00:00Z',
  },
  {
    id: 5,
    title: 'Rapat Orang Tua Siswa (Parent Meeting)',
    slug: 'rapat-orang-tua-siswa-parent-meeting',
    content: `<p>Rapat orang tua siswa akan dilaksanakan pada:</p>
    <ul>
      <li><strong>Hari:</strong> Sabtu, 20 Juli 2025</li>
      <li><strong>Jam:</strong> 08.00 - 11.00 WIB</li>
      <li><strong>Tempat:</strong> Aula Sekolah</li>
    </ul>
    <p>Agenda: Sosialisasi kurikulum, program unggulan, dan kerjasama orang tua-sekolah.</p>`,
    status: 'draft',
    category: 'Kegiatan',
    tags: 'rapat, orang-tua',
    created_at: '2025-07-12T09:00:00Z',
    updated_at: '2025-07-12T09:00:00Z',
  },
];

export const dummyPages = [
  {
    id: 1,
    title: 'Tentang Kami',
    slug: 'tentang-kami',
    content: `<p><strong>SMART SCHOOL</strong> adalah sekolah berbasis teknologi yang berfokus pada pengembangan karakter dan kompetensi abad 21.</p>
    <p>Visi: Menjadi sekolah unggulan yang mencetak generasi cerdas, berakhlak mulia, dan kompetitif.</p>
    <p>Misi:</p>
    <ul>
      <li>Menyelenggarakan pembelajaran berbasis teknologi</li>
      <li>Mengembangkan bakat dan minat siswa</li>
      <li>Membangun karakter siswa yang berintegritas</li>
    </ul>`,
    is_homepage: false,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-10T00:00:00Z',
  },
  {
    id: 2,
    title: 'Kontak',
    slug: 'kontak',
    content: `<p>Hubungi kami melalui informasi berikut:</p>
    <ul>
      <li><strong>Alamat:</strong> Jl. Pendidikan No. 1, Kota Smart</li>
      <li><strong>Telepon:</strong> (021) 1234-5678</li>
      <li><strong>Email:</strong> info@smartschool.ac.id</li>
      <li><strong>Jam Kerja:</strong> Senin - Jumat, 07.00 - 16.00 WIB</li>
    </ul>`,
    is_homepage: false,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 3,
    title: 'Beranda',
    slug: 'home',
    content: `<h1>Selamat Datang di SMART SCHOOL</h1>
    <p>Kami adalah sekolah yang siap mencetak generasi penerus bangsa dengan teknologi dan karakter.</p>
    <img src="https://picsum.photos/seed/school-banner/1200/400" alt="Banner Sekolah" />`,
    is_homepage: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-02-01T00:00:00Z',
  },
];

export const dummyStats = {
  totalArticles: dummyArticles.length,
  publishedArticles: dummyArticles.filter(a => a.status === 'published').length,
  totalPages: dummyPages.length,
  totalViews: 15234,
};

// ============================================
// DATA KATEGORI ARTIKEL
// ============================================

export const dummyCategories = [
  { id: 1, name: 'Pengumuman', slug: 'pengumuman', count: 2 },
  { id: 2, name: 'Prestasi', slug: 'prestasi', count: 1 },
  { id: 3, name: 'Ekstrakurikuler', slug: 'ekstrakurikuler', count: 1 },
  { id: 4, name: 'Kegiatan', slug: 'kegiatan', count: 1 },
  { id: 5, name: 'Berita', slug: 'berita', count: 0 },
];

// ============================================
// DATA MEDIA - DENGAN GAMBAR REAL
// ============================================

export const dummyMedia = [
  {
    id: 1,
    name: 'banner-sekolah.jpg',
    url: 'https://picsum.photos/seed/school-banner/800/500',
    type: 'image/jpeg',
    size: '2.4 MB',
    folder: 'banner',
    uploaded_at: '2025-07-01T08:00:00Z',
  },
  {
    id: 2,
    name: 'logo-smartschool.png',
    url: 'https://picsum.photos/seed/smart-logo/400/400',
    type: 'image/png',
    size: '156 KB',
    folder: 'logo',
    uploaded_at: '2025-06-15T10:30:00Z',
  },
  {
    id: 3,
    name: 'prestasi-siswa.jpg',
    url: 'https://picsum.photos/seed/student-achievement/800/600',
    type: 'image/jpeg',
    size: '3.1 MB',
    folder: 'galeri',
    uploaded_at: '2025-07-05T14:20:00Z',
  },
  {
    id: 4,
    name: 'video-profile.mp4',
    url: 'https://picsum.photos/seed/video-thumbnail/640/360',
    type: 'video/mp4',
    size: '45.8 MB',
    folder: 'video',
    uploaded_at: '2025-06-20T09:00:00Z',
  },
  {
    id: 5,
    name: 'banner-ppdb.jpg',
    url: 'https://picsum.photos/seed/ppdb-banner/800/500',
    type: 'image/jpeg',
    size: '1.8 MB',
    folder: 'banner',
    uploaded_at: '2025-07-12T11:45:00Z',
  },
];

export const dummyMediaFolders = [
  { id: 1, name: 'banner', count: 2 },
  { id: 2, name: 'logo', count: 1 },
  { id: 3, name: 'galeri', count: 1 },
  { id: 4, name: 'video', count: 1 },
];

// ============================================
// DATA BANNER & HERO - DENGAN GAMBAR REAL
// ============================================

export const dummyBanners = [
  {
    id: 1,
    title: 'PPDB 2025/2026 Telah Dibuka!',
    image: 'https://picsum.photos/seed/ppdb/1200/400',
    link: '/ppdb',
    position: 'hero',
    status: 'active',
    order: 1,
    created_at: '2025-07-01T08:00:00Z',
  },
  {
    id: 2,
    title: 'Selamat Datang Tahun Ajaran Baru',
    image: 'https://picsum.photos/seed/new-school-year/1200/400',
    link: '/info',
    position: 'hero',
    status: 'active',
    order: 2,
    created_at: '2025-07-10T09:00:00Z',
  },
  {
    id: 3,
    title: 'Lomba 17 Agustus',
    image: 'https://picsum.photos/seed/independence-day/1200/400',
    link: '/event/17-agustus',
    position: 'promo',
    status: 'draft',
    order: 3,
    created_at: '2025-07-15T10:00:00Z',
  },
];

// ============================================
// DATA MENU WEBSITE
// ============================================

export const dummyMenus = {
  main: [
    {
      id: 1,
      label: 'Beranda',
      url: '/',
      order: 1,
      children: [],
    },
    {
      id: 2,
      label: 'Profil',
      url: '#',
      order: 2,
      children: [
        { id: 21, label: 'Tentang Kami', url: '/tentang-kami' },
        { id: 22, label: 'Visi Misi', url: '/visi-misi' },
        { id: 23, label: 'Sejarah', url: '/sejarah' },
      ],
    },
    {
      id: 3,
      label: 'Akademik',
      url: '#',
      order: 3,
      children: [
        { id: 31, label: 'Kurikulum', url: '/kurikulum' },
        { id: 32, label: 'Ekstrakurikuler', url: '/ekstrakurikuler' },
        { id: 33, label: 'Prestasi', url: '/prestasi' },
      ],
    },
    {
      id: 4,
      label: 'Berita',
      url: '/berita',
      order: 4,
      children: [],
    },
    {
      id: 5,
      label: 'Kontak',
      url: '/kontak',
      order: 5,
      children: [],
    },
  ],
  footer: [
    {
      id: 101,
      label: 'Tentang Kami',
      url: '/tentang-kami',
    },
    {
      id: 102,
      label: 'Kebijakan Privasi',
      url: '/privacy',
    },
    {
      id: 103,
      label: 'Syarat & Ketentuan',
      url: '/terms',
    },
    {
      id: 104,
      label: 'Hubungi Kami',
      url: '/kontak',
    },
  ],
};

// ============================================
// DATA PENGUMUMAN
// ============================================

export const dummyAnnouncements = [
  {
    id: 1,
    title: 'Pengumuman Libur Hari Kemerdekaan',
    content: 'Diberitahukan bahwa dalam rangka memperingati Hari Kemerdekaan RI ke-80, kegiatan belajar mengajar diliburkan pada tanggal 17 Agustus 2025.',
    type: 'penting',
    status: 'published',
    target: 'all',
    published_at: '2025-08-10T07:00:00Z',
    expires_at: '2025-08-18T23:59:00Z',
    created_at: '2025-08-09T10:00:00Z',
  },
  {
    id: 2,
    title: 'Pendaftaran Ekstrakurikuler Semester Ganjil',
    content: 'Pendaftaran ekstrakurikuler untuk semester ganjil tahun 2025/2026 dibuka mulai 1 Agustus - 10 Agustus 2025.',
    type: 'info',
    status: 'scheduled',
    target: 'students',
    published_at: '2025-08-01T00:00:00Z',
    expires_at: '2025-08-11T23:59:00Z',
    created_at: '2025-07-28T08:00:00Z',
  },
  {
    id: 3,
    title: 'Rapat Orang Tua Siswa',
    content: 'Rapat orang tua siswa akan dilaksanakan pada Sabtu, 20 Juli 2025 pukul 08.00 WIB di Aula Sekolah.',
    type: 'penting',
    status: 'published',
    target: 'parents',
    published_at: '2025-07-15T09:00:00Z',
    expires_at: null,
    created_at: '2025-07-14T14:00:00Z',
  },
  {
    id: 4,
    title: 'Jadwal Ujian Akhir Semester Genap',
    content: 'Jadwal ujian akhir semester genap akan segera diumumkan. Mohon persiapkan diri dengan baik.',
    type: 'info',
    status: 'draft',
    target: 'students',
    published_at: null,
    expires_at: null,
    created_at: '2025-07-20T08:00:00Z',
  },
];

export const announcementTypes = [
  { id: 'penting', label: 'Penting', color: 'red' },
  { id: 'info', label: 'Informasi', color: 'blue' },
  { id: 'pengumuman', label: 'Pengumuman', color: 'green' },
];

export const announcementTargets = [
  { id: 'all', label: 'Semua' },
  { id: 'students', label: 'Siswa' },
  { id: 'teachers', label: 'Guru' },
  { id: 'parents', label: 'Orang Tua' },
  { id: 'staff', label: 'Staff' },
];

// ============================================
// DATA AGENDA / EVENT - DENGAN GAMBAR REAL
// ============================================

export const dummyEvents = [
  {
    id: 1,
    title: 'Upacara Hari Kemerdekaan RI ke-80',
    description: 'Upacara bendera dalam rangka memperingati Hari Kemerdekaan Republik Indonesia ke-80.',
    location: 'Lapangan Utama Sekolah',
    start_date: '2025-08-17T07:00:00Z',
    end_date: '2025-08-17T10:00:00Z',
    type: 'upacara',
    status: 'upcoming',
    image: 'https://picsum.photos/seed/independence-ceremony/800/400',
    created_at: '2025-08-01T08:00:00Z',
  },
  {
    id: 2,
    title: 'Rapat Orang Tua Siswa (Parent Meeting)',
    description: 'Rapat orang tua siswa untuk sosialisasi kurikulum dan program unggulan sekolah.',
    location: 'Aula Sekolah',
    start_date: '2025-07-20T08:00:00Z',
    end_date: '2025-07-20T11:00:00Z',
    type: 'rapat',
    status: 'passed',
    image: null,
    created_at: '2025-07-10T09:00:00Z',
  },
  {
    id: 3,
    title: 'Pendaftaran PPDB 2025/2026',
    description: 'Pendaftaran peserta didik baru tahun ajaran 2025/2026 dibuka.',
    location: 'Online',
    start_date: '2025-07-01T00:00:00Z',
    end_date: '2025-07-31T23:59:00Z',
    type: 'pendaftaran',
    status: 'ongoing',
    image: 'https://picsum.photos/seed/ppdb-registration/800/400',
    created_at: '2025-06-15T08:00:00Z',
  },
  {
    id: 4,
    title: 'Lomba 17 Agustus',
    description: 'Lomba-lomba dalam rangka memperingati Hari Kemerdekaan RI ke-80.',
    location: 'Lapangan Sekolah',
    start_date: '2025-08-17T10:30:00Z',
    end_date: '2025-08-17T15:00:00Z',
    type: 'lomba',
    status: 'upcoming',
    image: 'https://picsum.photos/seed/competition-day/800/400',
    created_at: '2025-08-05T08:00:00Z',
  },
  {
    id: 5,
    title: 'Kegiatan Bakti Sosial',
    description: 'Bakti sosial dalam rangka memperingati Hari Pendidikan Nasional.',
    location: 'Desa Binaan',
    start_date: '2025-05-02T07:00:00Z',
    end_date: '2025-05-02T13:00:00Z',
    type: 'sosial',
    status: 'passed',
    image: null,
    created_at: '2025-04-20T08:00:00Z',
  },
];

export const eventTypes = [
  { id: 'upacara', label: 'Upacara' },
  { id: 'rapat', label: 'Rapat' },
  { id: 'pendaftaran', label: 'Pendaftaran' },
  { id: 'lomba', label: 'Lomba' },
  { id: 'sosial', label: 'Sosial' },
  { id: 'lainnya', label: 'Lainnya' },
];

export const eventStatuses = [
  { id: 'upcoming', label: 'Mendatang', color: 'blue' },
  { id: 'ongoing', label: 'Sedang Berlangsung', color: 'green' },
  { id: 'passed', label: 'Selesai', color: 'gray' },
];

// ============================================
// DATA PENGATURAN CMS
// ============================================

export const dummySettings = {
  site: {
    name: 'SmartSchool',
    tagline: 'Sekolah Cerdas, Generasi Berprestasi',
    description: 'SmartSchool adalah sekolah berbasis teknologi yang berfokus pada pengembangan karakter dan kompetensi abad 21.',
    favicon: 'https://picsum.photos/seed/favicon/32/32',
    logo: 'https://picsum.photos/seed/logo-school/200/200',
    logo_dark: null,
  },
  contact: {
    address: 'Jl. Pendidikan No. 1, Kota Smart',
    phone: '(021) 1234-5678',
    email: 'info@smartschool.ac.id',
    whatsapp: '081234567890',
    maps_url: 'https://maps.google.com/?q=Jl.+Pendidikan+No.+1,+Kota+Smart',
  },
  seo: {
    meta_title: 'SmartSchool - Sekolah Cerdas, Generasi Berprestasi',
    meta_description: 'SmartSchool adalah sekolah berbasis teknologi yang berfokus pada pengembangan karakter dan kompetensi abad 21.',
    meta_keywords: 'sekolah, pendidikan, tecnologia, smart, school',
    og_image: 'https://picsum.photos/seed/og-image/1200/630',
    google_analytics: 'G-XXXXXXXXXX',
    google_verification: 'google-verification-code',
  },
  social: {
    facebook: 'https://facebook.com/smartschool',
    instagram: 'https://instagram.com/smartschool',
    youtube: 'https://youtube.com/smartschool',
    twitter: 'https://twitter.com/smartschool',
    tiktok: 'https://tiktok.com/@smartschool',
    linkedin: 'https://linkedin.com/company/smartschool',
  },
  appearance: {
    primary_color: '#2563EB',
    secondary_color: '#1A2332',
    font_family: 'Inter',
    layout: 'full_width',
    enable_animation: true,
  },
  features: {
    enable_comments: true,
    enable_share: true,
    enable_ai_writer: false,
    enable_newsletter: true,
    enable_maintenance_mode: false,
    maintenance_message: 'Website sedang dalam pemeliharaan. Harap kembali lagi nanti.',
  },
};

// ============================================
// DATA YAYASAN
// ============================================

export const yayasanData = [
  {
    id: 1,
    logo: '🏛️',
    nama: 'Yayasan Al-Azhar',
    npyp: 'YY-00112',
    ketua: 'Drs. H. Ahmad Fauzi, M.Pd',
    email: 'info@yayasanalazhar.or.id',
    telepon: '(021) 7654321',
    website: 'www.yayasanalazhar.or.id',
    alamat: 'Jl. Kelapa Gading No. 10, Jakarta Utara',
    provinsi: 'DKI Jakarta',
    kota: 'Jakarta Utara',
    kecamatan: 'Kelapa Gading',
    kelurahan: 'Kelapa Gading Barat',
    kodePos: '14240',
    status: 'Aktif',
    bergabung: '2023-01-10',
    jumlahSekolah: 3,
    totalGuru: 110,
    totalSiswa: 1680,
    totalAdmin: 6,
    sekolah: [
      'SMA Al-Azhar Kelapa Gading',
      'SMP Al-Azhar Kelapa Gading',
      'SD Al-Azhar Kelapa Gading',
    ],
  },
  {
    id: 2,
    logo: '🏛️',
    nama: 'Yayasan BPK Penabur',
    npyp: 'YY-00087',
    ketua: 'Dra. Lidya Santoso',
    email: 'sekretariat@bpkpenabur.or.id',
    telepon: '(021) 9876543',
    website: 'www.bpkpenabur.or.id',
    alamat: 'Jl. Kebon Jeruk No. 5, Jakarta Barat',
    provinsi: 'DKI Jakarta',
    kota: 'Jakarta Barat',
    kecamatan: 'Kebon Jeruk',
    kelurahan: 'Kebon Jeruk',
    kodePos: '11530',
    status: 'Nonaktif',
    bergabung: '2022-08-10',
    jumlahSekolah: 2,
    totalGuru: 54,
    totalSiswa: 720,
    totalAdmin: 3,
    sekolah: [
      'SMP BPK Penabur',
      'SD BPK Penabur',
    ],
  },
  {
    id: 3,
    logo: '🏛️',
    nama: 'Yayasan Pengembangan Pendidikan',
    npyp: 'YY-00203',
    ketua: 'Ir. Bambang Sutrisno',
    email: 'kontak@yayasanppn.or.id',
    telepon: '(021) 5555555',
    website: 'www.yayasanppn.or.id',
    alamat: 'Jl. Bintaro Raya No. 20, Tangerang Selatan',
    provinsi: 'Banten',
    kota: 'Tangerang Selatan',
    kecamatan: 'Bintaro',
    kelurahan: 'Bintaro',
    kodePos: '15224',
    status: 'Aktif',
    bergabung: '2024-06-01',
    jumlahSekolah: 1,
    totalGuru: 30,
    totalSiswa: 450,
    totalAdmin: 2,
    sekolah: [
      'SMA Taruna Nusantara',
    ],
  },
  {
    id: 4,
    logo: '🏛️',
    nama: 'Yayasan Bina Insani',
    npyp: 'YY-00155',
    ketua: 'H. Slamet Riyadi, S.E.',
    email: 'admin@binainsani.or.id',
    telepon: '(021) 3333333',
    website: 'www.binainsani.or.id',
    alamat: 'Jl. BSD Raya No. 8, Tangerang',
    provinsi: 'Banten',
    kota: 'Tangerang',
    kecamatan: 'BSD',
    kelurahan: 'BSD',
    kodePos: '15310',
    status: 'Aktif',
    bergabung: '2024-04-05',
    jumlahSekolah: 1,
    totalGuru: 52,
    totalSiswa: 850,
    totalAdmin: 4,
    sekolah: [
      'SMK Bina Insani',
    ],
  },
  {
    id: 5,
    logo: '🏛️',
    nama: 'Yayasan Al-Falah',
    npyp: 'YY-00241',
    ketua: 'Ust. Muhammad Iqbal, Lc',
    email: 'sekretariat@alfalah.or.id',
    telepon: '(021) 2222222',
    website: 'www.alfalah.or.id',
    alamat: 'Jl. Depok Raya No. 12, Depok',
    provinsi: 'Jawa Barat',
    kota: 'Depok',
    kecamatan: 'Depok',
    kelurahan: 'Depok',
    kodePos: '16411',
    status: 'Trial',
    bergabung: '2024-07-01',
    jumlahSekolah: 1,
    totalGuru: 25,
    totalSiswa: 340,
    totalAdmin: 2,
    sekolah: [
      'SMP Islam Terpadu Al-Falah',
    ],
  },
];

// ============================================
// DATA SEKOLAH
// ============================================

export const sekolahData = [
  {
    id: 1,
    nama: 'SMA Al-Azhar Kelapa Gading',
    npsn: '20101620',
    jenjang: 'SMA',
    status: 'Aktif',
    yayasan: 'Yayasan Al-Azhar',
    yayasanId: 1,
    kepalaSekolah: 'Drs. Ahmad Fauzi, M.Pd',
    email: 'info@smaalazhar.sch.id',
    telepon: '(021) 7654321',
    alamat: 'Jl. Kelapa Gading No. 10, Jakarta Utara',
    provinsi: 'DKI Jakarta',
    kota: 'Jakarta Utara',
    kecamatan: 'Kelapa Gading',
    kelurahan: 'Kelapa Gading Barat',
    kodePos: '14240',
    jumlahGuru: 45,
    jumlahSiswa: 720,
    jumlahKelas: 24,
  },
  {
    id: 2,
    nama: 'SMP Al-Azhar Kelapa Gading',
    npsn: '20101621',
    jenjang: 'SMP',
    status: 'Aktif',
    yayasan: 'Yayasan Al-Azhar',
    yayasanId: 1,
    kepalaSekolah: 'H. Budi Santoso, M.Pd',
    email: 'info@smpalazhar.sch.id',
    telepon: '(021) 7654322',
    alamat: 'Jl. Kelapa Gading No. 11, Jakarta Utara',
    provinsi: 'DKI Jakarta',
    kota: 'Jakarta Utara',
    kecamatan: 'Kelapa Gading',
    kelurahan: 'Kelapa Gading Barat',
    kodePos: '14240',
    jumlahGuru: 38,
    jumlahSiswa: 540,
    jumlahKelas: 18,
  },
  {
    id: 3,
    nama: 'SD Al-Azhar Kelapa Gading',
    npsn: '20101622',
    jenjang: 'SD',
    status: 'Aktif',
    yayasan: 'Yayasan Al-Azhar',
    yayasanId: 1,
    kepalaSekolah: 'Dra. Siti Aminah',
    email: 'info@sdalazhar.sch.id',
    telepon: '(021) 7654323',
    alamat: 'Jl. Kelapa Gading No. 12, Jakarta Utara',
    provinsi: 'DKI Jakarta',
    kota: 'Jakarta Utara',
    kecamatan: 'Kelapa Gading',
    kelurahan: 'Kelapa Gading Barat',
    kodePos: '14240',
    jumlahGuru: 32,
    jumlahSiswa: 420,
    jumlahKelas: 18,
  },
  {
    id: 4,
    nama: 'SMP BPK Penabur',
    npsn: '20102001',
    jenjang: 'SMP',
    status: 'Aktif',
    yayasan: 'Yayasan BPK Penabur',
    yayasanId: 2,
    kepalaSekolah: 'Dra. Lidya Santoso',
    email: 'info@smpbpkpenabur.sch.id',
    telepon: '(021) 9876543',
    alamat: 'Jl. Kebon Jeruk No. 5, Jakarta Barat',
    provinsi: 'DKI Jakarta',
    kota: 'Jakarta Barat',
    kecamatan: 'Kebon Jeruk',
    kelurahan: 'Kebon Jeruk',
    kodePos: '11530',
    jumlahGuru: 30,
    jumlahSiswa: 380,
    jumlahKelas: 12,
  },
  {
    id: 5,
    nama: 'SD BPK Penabur',
    npsn: '20102002',
    jenjang: 'SD',
    status: 'Aktif',
    yayasan: 'Yayasan BPK Penabur',
    yayasanId: 2,
    kepalaSekolah: 'Dra. Maria Wijaya',
    email: 'info@sdbpkpenabur.sch.id',
    telepon: '(021) 9876544',
    alamat: 'Jl. Kebon Jeruk No. 6, Jakarta Barat',
    provinsi: 'DKI Jakarta',
    kota: 'Jakarta Barat',
    kecamatan: 'Kebon Jeruk',
    kelurahan: 'Kebon Jeruk',
    kodePos: '11530',
    jumlahGuru: 24,
    jumlahSiswa: 340,
    jumlahKelas: 12,
  },
  {
    id: 6,
    nama: 'SMA Taruna Nusantara',
    npsn: '20203001',
    jenjang: 'SMA',
    status: 'Aktif',
    yayasan: 'Yayasan Pengembangan Pendidikan',
    yayasanId: 3,
    kepalaSekolah: 'Ir. Bambang Sutrisno',
    email: 'info@smataruna.sch.id',
    telepon: '(021) 5555555',
    alamat: 'Jl. Bintaro Raya No. 20, Tangerang Selatan',
    provinsi: 'Banten',
    kota: 'Tangerang Selatan',
    kecamatan: 'Bintaro',
    kelurahan: 'Bintaro',
    kodePos: '15224',
    jumlahGuru: 30,
    jumlahSiswa: 450,
    jumlahKelas: 15,
  },
  {
    id: 7,
    nama: 'SMK Bina Insani',
    npsn: '20204001',
    jenjang: 'SMK',
    status: 'Aktif',
    yayasan: 'Yayasan Bina Insani',
    yayasanId: 4,
    kepalaSekolah: 'H. Slamet Riyadi, S.E.',
    email: 'info@smkbinainsani.sch.id',
    telepon: '(021) 3333333',
    alamat: 'Jl. BSD Raya No. 8, Tangerang',
    provinsi: 'Banten',
    kota: 'Tangerang',
    kecamatan: 'BSD',
    kelurahan: 'BSD',
    kodePos: '15310',
    jumlahGuru: 52,
    jumlahSiswa: 850,
    jumlahKelas: 24,
  },
  {
    id: 8,
    nama: 'SMP Islam Terpadu Al-Falah',
    npsn: '20205001',
    jenjang: 'SMP',
    status: 'Trial',
    yayasan: 'Yayasan Al-Falah',
    yayasanId: 5,
    kepalaSekolah: 'Ust. Muhammad Iqbal, Lc',
    email: 'info@smpalfalah.sch.id',
    telepon: '(021) 2222222',
    alamat: 'Jl. Depok Raya No. 12, Depok',
    provinsi: 'Jawa Barat',
    kota: 'Depok',
    kecamatan: 'Depok',
    kelurahan: 'Depok',
    kodePos: '16411',
    jumlahGuru: 25,
    jumlahSiswa: 340,
    jumlahKelas: 12,
  },
];

// ============================================
// DATA LANGANAN / SUBSCRIPTION
// ============================================

export const dummyLangganan = [
  {
    id: 1,
    kode: 'SUB-0001',
    sekolah: 'SMA Al-Azhar Kelapa Gading',
    yayasan: 'Yayasan Al-Azhar',
    paket: 'Professional',
    periode: 'Tahunan',
    harga: 15000000,
    tanggalMulai: '2026-08-11',
    tanggalBerakhir: '2027-08-11',
    status: 'Aktif',
    pembayaran: 'Lunas',
  },
  {
    id: 2,
    kode: 'SUB-0002',
    sekolah: 'SMP BPK Penabur',
    yayasan: 'Yayasan BPK Penabur',
    paket: 'Basic',
    periode: '6 Bulan',
    harga: 7500000,
    tanggalMulai: '2026-07-01',
    tanggalBerakhir: '2027-01-01',
    status: 'Aktif',
    pembayaran: 'Lunas',
  },
  {
    id: 3,
    kode: 'SUB-0003',
    sekolah: 'SMK Bina Insani',
    yayasan: 'Yayasan Bina Insani',
    paket: 'Enterprise',
    periode: 'Tahunan',
    harga: 25000000,
    tanggalMulai: '2026-06-15',
    tanggalBerakhir: '2027-06-15',
    status: 'Akan Berakhir',
    pembayaran: 'Lunas',
  },
  {
    id: 4,
    kode: 'SUB-0004',
    sekolah: 'SMP Islam Terpadu Al-Falah',
    yayasan: 'Yayasan Al-Falah',
    paket: 'Basic',
    periode: 'Bulanan',
    harga: 1500000,
    tanggalMulai: '2026-08-01',
    tanggalBerakhir: '2026-09-01',
    status: 'Trial',
    pembayaran: 'Pending',
  },
];

// ============================================
// DATA ROLES
// ============================================

export const dummyRoles = [
  {
    id: 'role-001',
    nama: 'Super Admin',
    namaTampilan: 'Super Admin',
    deskripsi: 'Akses penuh ke seluruh modul dan pengaturan sistem SmartSchool.',
    status: 'aktif',
    izin: 8,
    pengguna: 3,
    ikon: 'Shield',
  },
  {
    id: 'role-002',
    nama: 'Admin Sekolah',
    namaTampilan: 'Admin Sekolah',
    deskripsi: 'Mengelola data sekolah, guru, siswa, dan kelas pada satu sekolah.',
    status: 'aktif',
    izin: 4,
    pengguna: 125,
    ikon: 'ShieldCheck',
  },
  {
    id: 'role-003',
    nama: 'Guru',
    namaTampilan: 'Guru',
    deskripsi: 'Mengelola nilai, presensi, dan materi ajar untuk kelas yang diampu.',
    status: 'aktif',
    izin: 2,
    pengguna: 842,
    ikon: 'BookOpen',
  },
  {
    id: 'role-004',
    nama: 'Wali Kelas',
    namaTampilan: 'Wali Kelas',
    deskripsi: 'Memantau perkembangan siswa dan mengelola data satu kelas.',
    status: 'aktif',
    izin: 1,
    pengguna: 210,
    ikon: 'UserCheck',
  },
  {
    id: 'role-005',
    nama: 'Bendahara',
    namaTampilan: 'Bendahara',
    deskripsi: 'Mengelola pembayaran, tagihan, dan laporan keuangan sekolah.',
    status: 'nonaktif',
    izin: 2,
    pengguna: 18,
    ikon: 'DollarSign',
  },
];

// ============================================
// DATA PERMISSIONS
// ============================================

export const dummyPermissions = [
  { id: 'perm-001', modul: 'Akademik', aksi: 'view', nama: 'Lihat Akademik' },
  { id: 'perm-002', modul: 'Akademik', aksi: 'create', nama: 'Tambah Akademik' },
  { id: 'perm-003', modul: 'Akademik', aksi: 'edit', nama: 'Edit Akademik' },
  { id: 'perm-004', modul: 'Akademik', aksi: 'delete', nama: 'Hapus Akademik' },
  { id: 'perm-005', modul: 'Presensi', aksi: 'view', nama: 'Lihat Presensi' },
  { id: 'perm-006', modul: 'Presensi', aksi: 'create', nama: 'Tambah Presensi' },
  { id: 'perm-007', modul: 'Presensi', aksi: 'edit', nama: 'Edit Presensi' },
  { id: 'perm-008', modul: 'Presensi', aksi: 'delete', nama: 'Hapus Presensi' },
  { id: 'perm-009', modul: 'Keuangan', aksi: 'view', nama: 'Lihat Keuangan' },
  { id: 'perm-010', modul: 'Keuangan', aksi: 'create', nama: 'Tambah Keuangan' },
  { id: 'perm-011', modul: 'Keuangan', aksi: 'edit', nama: 'Edit Keuangan' },
  { id: 'perm-012', modul: 'Keuangan', aksi: 'delete', nama: 'Hapus Keuangan' },
  { id: 'perm-013', modul: 'Perpustakaan', aksi: 'view', nama: 'Lihat Perpustakaan' },
  { id: 'perm-014', modul: 'Perpustakaan', aksi: 'create', nama: 'Tambah Perpustakaan' },
  { id: 'perm-015', modul: 'Perpustakaan', aksi: 'edit', nama: 'Edit Perpustakaan' },
  { id: 'perm-016', modul: 'Perpustakaan', aksi: 'delete', nama: 'Hapus Perpustakaan' },
  { id: 'perm-017', modul: 'Kepegawaian', aksi: 'view', nama: 'Lihat Kepegawaian' },
  { id: 'perm-018', modul: 'Kepegawaian', aksi: 'create', nama: 'Tambah Kepegawaian' },
  { id: 'perm-019', modul: 'Kepegawaian', aksi: 'edit', nama: 'Edit Kepegawaian' },
  { id: 'perm-020', modul: 'Kepegawaian', aksi: 'delete', nama: 'Hapus Kepegawaian' },
  { id: 'perm-021', modul: 'Komunikasi', aksi: 'view', nama: 'Lihat Komunikasi' },
  { id: 'perm-022', modul: 'Komunikasi', aksi: 'create', nama: 'Tambah Komunikasi' },
  { id: 'perm-023', modul: 'Komunikasi', aksi: 'edit', nama: 'Edit Komunikasi' },
  { id: 'perm-024', modul: 'Komunikasi', aksi: 'delete', nama: 'Hapus Komunikasi' },
];