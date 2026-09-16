
interface HasilValidasiUmur {
  valid: boolean;
  message: string;
  umur: number;
  batas: number;
}

const BATAS_UMUR_MAKSIMAL: Record<string, number> = {
  SD: 12,
  MI: 12,
  SMP: 15,
  MTS: 15,
  SMA: 18,
  MA: 18,
  SMK: 18,
};

const BATAS_UMUR_MINIMAL: Record<string, number> = {
  SD: 6,
  MI: 6,
  SMP: 12,
  MTS: 12,
  SMA: 15,
  MA: 15,
  SMK: 15,
};

function hitungUmurPadaTanggalReferensi(
  tanggalLahir: Date,
  tanggalReferensi: Date
): number {
  let umur = tanggalReferensi.getFullYear() - tanggalLahir.getFullYear();
  const belumUlangTahun =
    tanggalReferensi.getMonth() < tanggalLahir.getMonth() ||
    (tanggalReferensi.getMonth() === tanggalLahir.getMonth() &&
      tanggalReferensi.getDate() < tanggalLahir.getDate());
  if (belumUlangTahun) umur -= 1;
  return umur;
}

export function validasiUmurPpdb(
  jenjang: string,
  tanggalLahir: Date
): HasilValidasiUmur {
  const jenjangKey = jenjang.toUpperCase().trim();

  const batasMaks = BATAS_UMUR_MAKSIMAL[jenjangKey];
  const batasMin = BATAS_UMUR_MINIMAL[jenjangKey];

  if (batasMaks === undefined) {
    return {
      valid: false,
      message: `Jenjang "${jenjang}" tidak dikenali untuk validasi umur PPDB`,
      umur: 0,
      batas: 0,
    };
  }

  const sekarang = new Date();
  const tanggalReferensi = new Date(sekarang.getFullYear(), 6, 1); // bulan 6 = Juli (0-indexed)

  const umur = hitungUmurPadaTanggalReferensi(tanggalLahir, tanggalReferensi);

  if (umur > batasMaks) {
    return {
      valid: false,
      message: `Umur calon siswa (${umur} tahun) melebihi batas maksimal ${batasMaks} tahun untuk jenjang ${jenjang}`,
      umur,
      batas: batasMaks,
    };
  }

  if (batasMin !== undefined && umur < batasMin) {
    return {
      valid: false,
      message: `Umur calon siswa (${umur} tahun) di bawah batas minimal ${batasMin} tahun untuk jenjang ${jenjang}`,
      umur,
      batas: batasMin,
    };
  }

  return {
    valid: true,
    message: "Umur memenuhi syarat",
    umur,
    batas: batasMaks,
  };
}


export function generateNomorPendaftaran(): string {
  const tahun = new Date().getFullYear();
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(100 + Math.random() * 900); // 3 digit random
  return `PPDB-${tahun}-${timestamp}${random}`;
}