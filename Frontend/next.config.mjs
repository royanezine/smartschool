const nextConfig = {
  async redirects() {
    return [
      {
        source: "/super-admin/pengumuman",
        destination: "/super-admin/notifikasiPengumuman",
        permanent: true,
      },
      {
        source: "/super-admin/pengumuman/tambah",
        destination: "/super-admin/notifikasiPengumuman/tambah",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
