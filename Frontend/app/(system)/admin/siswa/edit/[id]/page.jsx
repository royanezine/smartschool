"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  User,
  MapPin,
  Users,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Search,
  ChevronDown,
  X,
  GraduationCap,
  Sparkles,
} from "lucide-react";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import { getUserById, updateUser } from "@/services/user.service";
import { getKelas } from "@/services/kelas.service";

const INITIAL_FORM = {
  namaLengkap: "",
  nipd: "",
  nisn: "",
  status: "aktif",
  jenisKelamin: "",
  tempatLahir: "",
  tanggalLahir: "",
  email: "",
  noTelepon: "",
  alamat: "",
  provinsi: "",
  kota: "",
  kecamatan: "",
  kelurahan: "",
  namaOrangTua: "",
  noTeleponOrangTua: "",
};

function getResponseData(response) {
  const result = response?.data ?? response;

  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.items)) return result.items;
  if (Array.isArray(result?.kelas)) return result.kelas;

  return [];
}

function getErrorMessage(error, fallback) {
  return (
    error?.response?.data?.message ||
    error?.data?.message ||
    error?.message ||
    fallback
  );
}

function formatTanggal(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toISOString().slice(0, 10);
}

function getNamaKelas(kelas) {
  return (
    kelas?.namaKelas ||
    kelas?.nama ||
    kelas?.tingkat ||
    "Kelas tanpa nama"
  );
}

export default function EditSiswaPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [form, setForm] = useState(INITIAL_FORM);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [kelasList, setKelasList] = useState([]);
  const [kelasId, setKelasId] = useState("");
  const [kelasSearch, setKelasSearch] = useState("");
  const [kelasDropdownOpen, setKelasDropdownOpen] = useState(false);
  const [loadingKelas, setLoadingKelas] = useState(false);
  const [kelasError, setKelasError] = useState("");

  const loadKelas = useCallback(async () => {
    try {
      setLoadingKelas(true);
      setKelasError("");

      const response = await getKelas({
        page: 1,
        limit: 100,
        sortBy: "nama",
        sortOrder: "asc",
      });

      setKelasList(getResponseData(response));
    } catch (err) {
      console.error("Gagal mengambil daftar kelas:", err);
      setKelasError(
        getErrorMessage(err, "Gagal mengambil daftar kelas.")
      );
    } finally {
      setLoadingKelas(false);
    }
  }, []);

  const loadSiswa = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError("");

      const response = await getUserById(id);
      const result = response?.data ?? response;
      const user = result?.data ?? result;

      if (!user) {
        throw new Error("Data siswa tidak ditemukan.");
      }

      setForm({
        namaLengkap: user.namaLengkap || user.name || "",
        nipd: user.nipd || user.nis || "",
        nisn: user.nisn || "",
        status: user.status || "aktif",
        jenisKelamin: user.jenisKelamin || "",
        tempatLahir: user.tempatLahir || "",
        tanggalLahir: formatTanggal(user.tanggalLahir),
        email: user.email || "",
        noTelepon: user.noTelepon || user.telepon || "",
        alamat: user.alamat || "",
        provinsi: user.provinsi || "",
        kota: user.kota || "",
        kecamatan: user.kecamatan || "",
        kelurahan: user.kelurahan || "",
        namaOrangTua: user.namaOrangTua || "",
        noTeleponOrangTua:
          user.noTeleponOrangTua || user.teleponOrangTua || "",
      });

      const kelasAwal =
        user.kelasId ||
        user.anggotaKelas?.[0]?.kelasId ||
        user.anggotaKelas?.[0]?.kelas?.id ||
        user.kelas?.id ||
        "";

      if (kelasAwal) {
        setKelasId(String(kelasAwal));
      }
    } catch (err) {
      console.error("Gagal mengambil data siswa:", err);
      setError(getErrorMessage(err, "Gagal mengambil data siswa."));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadSiswa();
    loadKelas();
  }, [loadSiswa, loadKelas]);

  const filteredKelas = useMemo(() => {
    const keyword = kelasSearch.trim().toLowerCase();

    if (!keyword) return kelasList;

    return kelasList.filter((kelas) => {
      const nama = getNamaKelas(kelas).toLowerCase();
      const tingkat = String(kelas?.tingkat || "").toLowerCase();
      const tahunAjaran = String(
        kelas?.tahunAjaran?.nama ||
          kelas?.tahunAjaran?.tahun ||
          kelas?.tahunAjaran?.namaTahunAjaran ||
          ""
      ).toLowerCase();
      const jurusan = String(
        kelas?.jurusan?.namaJurusan ||
          kelas?.jurusan?.nama ||
          ""
      ).toLowerCase();

      return (
        nama.includes(keyword) ||
        tingkat.includes(keyword) ||
        tahunAjaran.includes(keyword) ||
        jurusan.includes(keyword)
      );
    });
  }, [kelasList, kelasSearch]);

  const selectedKelas = useMemo(
    () => kelasList.find((kelas) => String(kelas.id) === String(kelasId)),
    [kelasList, kelasId]
  );

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSelectKelas = (kelas) => {
    setKelasId(String(kelas.id));
    setKelasSearch("");
    setKelasDropdownOpen(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        namaLengkap: form.namaLengkap,
        nipd: form.nipd,
        nisn: form.nisn,
        status: form.status,
        jenisKelamin: form.jenisKelamin,
        tempatLahir: form.tempatLahir,
        tanggalLahir: form.tanggalLahir || null,
        email: form.email,
        noTelepon: form.noTelepon,
        alamat: form.alamat,
        provinsi: form.provinsi,
        kota: form.kota,
        kecamatan: form.kecamatan,
        kelurahan: form.kelurahan,
        namaOrangTua: form.namaOrangTua,
        noTeleponOrangTua: form.noTeleponOrangTua,
      };

      await updateUser(id, payload);

      setSuccess(
        "Data siswa berhasil diperbarui. Pilihan kelas belum disimpan karena endpoint perubahan anggota kelas belum tersedia."
      );
    } catch (err) {
      console.error("Gagal memperbarui data siswa:", err);
      setError(getErrorMessage(err, "Gagal memperbarui data siswa."));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
            <span className="text-sm font-medium text-[var(--color-text-muted)]">
              Memuat data siswa...
            </span>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="w-full space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <button
              type="button"
              onClick={() => router.back()}
              className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-[var(--color-text-muted)] transition hover:text-[var(--color-primary)]"
            >
              <ArrowLeft size={17} />
              Kembali
            </button>

            <h1 className="text-2xl font-bold text-[var(--color-text)] sm:text-3xl">
              Edit Data Siswa
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-[var(--color-text-muted)]">
              Perbarui informasi identitas, kontak, dan penempatan kelas siswa.
            </p>
          </div>
        </div>

        {error && (
          <AlertBox type="error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </AlertBox>
        )}

        {success && (
          <AlertBox type="success">
            <CheckCircle2 size={18} />
            <span>{success}</span>
          </AlertBox>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_350px] 2xl:grid-cols-[minmax(0,1fr)_400px]">
            
            <div className="space-y-6">
              <FormSection
                title="Informasi Akademik"
                description="Informasi nomor induk dan penempatan kelas siswa."
                icon={<GraduationCap size={19} />}
              >
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <Field label="NIS" required>
                    <Input
                      name="nipd"
                      value={form.nipd}
                      onChange={handleChange}
                      placeholder="Masukkan NIS"
                      required
                    />
                  </Field>

                  <Field label="NISN">
                    <Input
                      name="nisn"
                      value={form.nisn}
                      onChange={handleChange}
                      placeholder="Masukkan NISN"
                    />
                  </Field>

                  <Field label="Kelas">
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setKelasDropdownOpen((previous) => !previous)
                        }
                        className="flex min-h-11 w-full items-center justify-between rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-left text-sm outline-none transition hover:border-[var(--color-primary)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                      >
                        <span
                          className={
                            selectedKelas
                              ? "font-medium text-[var(--color-text)]"
                              : "text-[var(--color-text-placeholder)]"
                          }
                        >
                          {selectedKelas
                            ? getNamaKelas(selectedKelas)
                            : "Pilih kelas"}
                        </span>

                        <ChevronDown
                          size={18}
                          className={`shrink-0 text-[var(--color-text-muted)] transition ${
                            kelasDropdownOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {kelasDropdownOpen && (
                        <div className="absolute left-0 right-0 z-30 mt-2 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-xl">
                          <div className="border-b border-[var(--color-border)] p-3">
                            <div className="relative">
                              <Search
                                size={17}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                              />

                              <input
                                type="text"
                                value={kelasSearch}
                                onChange={(event) =>
                                  setKelasSearch(event.target.value)
                                }
                                placeholder="Cari nama kelas..."
                                autoFocus
                                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] py-2.5 pl-9 pr-9 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                              />

                              {kelasSearch && (
                                <button
                                  type="button"
                                  onClick={() => setKelasSearch("")}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                                >
                                  <X size={15} />
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="max-h-60 overflow-y-auto p-1.5">
                            {loadingKelas ? (
                              <div className="flex items-center justify-center gap-2 px-3 py-6 text-sm text-[var(--color-text-muted)]">
                                <Loader2
                                  size={17}
                                  className="animate-spin"
                                />
                                Memuat daftar kelas...
                              </div>
                            ) : kelasError ? (
                              <div className="px-3 py-4 text-sm text-red-600">
                                <p>{kelasError}</p>
                                <button
                                  type="button"
                                  onClick={loadKelas}
                                  className="mt-2 font-semibold text-[var(--color-primary)] hover:underline"
                                >
                                  Coba lagi
                                </button>
                              </div>
                            ) : filteredKelas.length === 0 ? (
                              <div className="px-3 py-6 text-center text-sm text-[var(--color-text-muted)]">
                                {kelasList.length === 0
                                  ? "Belum ada data kelas."
                                  : "Kelas tidak ditemukan."}
                              </div>
                            ) : (
                              filteredKelas.map((kelas) => {
                                const isSelected =
                                  String(kelas.id) === String(kelasId);

                                return (
                                  <button
                                    key={kelas.id}
                                    type="button"
                                    onClick={() => handleSelectKelas(kelas)}
                                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition ${
                                      isSelected
                                        ? "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)]"
                                        : "text-[var(--color-text-secondary)] hover:bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]"
                                    }`}
                                  >
                                    <div className="min-w-0">
                                      <p className="truncate text-sm font-semibold">
                                        {getNamaKelas(kelas)}
                                      </p>
                                      <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                                        {[
                                          kelas.tingkat,
                                          kelas.jurusan?.namaJurusan ||
                                            kelas.jurusan?.nama,
                                          kelas.tahunAjaran?.nama ||
                                            kelas.tahunAjaran?.tahun,
                                        ]
                                          .filter(Boolean)
                                          .join(" • ") || "Informasi kelas"}
                                      </p>
                                    </div>

                                    {isSelected && (
                                      <CheckCircle2
                                        size={18}
                                        className="ml-3 shrink-0 text-[var(--color-primary)]"
                                      />
                                    )}
                                  </button>
                                );
                              })
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {selectedKelas && (
                      <div className="mt-2 flex items-center justify-between rounded-lg border border-[color-mix(in_srgb,var(--color-primary)_30%,transparent)] bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)] px-3 py-2">
                        <div className="flex min-w-0 items-center gap-2 text-sm text-[var(--color-primary)]">
                          <GraduationCap size={16} />
                          <span className="truncate font-medium">
                            {getNamaKelas(selectedKelas)}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => setKelasId("")}
                          className="ml-2 text-[var(--color-primary)] hover:text-red-600"
                          title="Hapus pilihan kelas"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}

                    <Hint>
                      Pilihan kelas saat ini belum tersimpan ke database karena
                      endpoint perubahan keanggotaan kelas belum tersedia.
                    </Hint>
                  </Field>

                  <Field label="Status Siswa">
                    <Select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                    >
                      <option value="aktif">Aktif</option>
                      <option value="nonaktif">Nonaktif</option>
                      <option value="lulus">Lulus</option>
                      <option value="keluar">Keluar</option>
                    </Select>
                  </Field>
                </div>
              </FormSection>

              <FormSection
                title="Identitas Siswa"
                description="Informasi pribadi dan identitas siswa."
                icon={<User size={19} />}
              >
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <Field label="Nama Lengkap" required>
                    <Input
                      name="namaLengkap"
                      value={form.namaLengkap}
                      onChange={handleChange}
                      placeholder="Masukkan nama lengkap"
                      required
                    />
                  </Field>

                  <Field label="Jenis Kelamin">
                    <Select
                      name="jenisKelamin"
                      value={form.jenisKelamin}
                      onChange={handleChange}
                    >
                      <option value="">Pilih jenis kelamin</option>
                      <option value="L">Laki-laki</option>
                      <option value="P">Perempuan</option>
                    </Select>
                  </Field>

                  <Field label="Tempat Lahir">
                    <Input
                      name="tempatLahir"
                      value={form.tempatLahir}
                      onChange={handleChange}
                      placeholder="Masukkan tempat lahir"
                    />
                  </Field>

                  <Field label="Tanggal Lahir">
                    <Input
                      type="date"
                      name="tanggalLahir"
                      value={form.tanggalLahir}
                      onChange={handleChange}
                    />
                  </Field>
                </div>
              </FormSection>

              <FormSection
                title="Informasi Kontak"
                description="Informasi email, nomor telepon, dan alamat siswa."
                icon={<MapPin size={19} />}
              >
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <Field label="Email">
                    <Input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="nama@email.com"
                    />
                  </Field>

                  <Field label="Nomor Telepon">
                    <Input
                      name="noTelepon"
                      value={form.noTelepon}
                      onChange={handleChange}
                      placeholder="Masukkan nomor telepon"
                    />
                  </Field>

                  <Field label="Provinsi">
                    <Input
                      name="provinsi"
                      value={form.provinsi}
                      onChange={handleChange}
                      placeholder="Masukkan provinsi"
                    />
                  </Field>

                  <Field label="Kota/Kabupaten">
                    <Input
                      name="kota"
                      value={form.kota}
                      onChange={handleChange}
                      placeholder="Masukkan kota/kabupaten"
                    />
                  </Field>

                  <Field label="Kecamatan">
                    <Input
                      name="kecamatan"
                      value={form.kecamatan}
                      onChange={handleChange}
                      placeholder="Masukkan kecamatan"
                    />
                  </Field>

                  <Field label="Kelurahan/Desa">
                    <Input
                      name="kelurahan"
                      value={form.kelurahan}
                      onChange={handleChange}
                      placeholder="Masukkan kelurahan/desa"
                    />
                  </Field>

                  <div className="md:col-span-2">
                    <Field label="Alamat Lengkap">
                      <Textarea
                        name="alamat"
                        value={form.alamat}
                        onChange={handleChange}
                        placeholder="Masukkan alamat lengkap"
                        rows={3}
                      />
                    </Field>
                  </div>
                </div>
              </FormSection>

              <FormSection
                title="Informasi Orang Tua/Wali"
                description="Informasi kontak orang tua atau wali siswa."
                icon={<Users size={19} />}
              >
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <Field label="Nama Orang Tua/Wali">
                    <Input
                      name="namaOrangTua"
                      value={form.namaOrangTua}
                      onChange={handleChange}
                      placeholder="Masukkan nama orang tua/wali"
                    />
                  </Field>

                  <Field label="Nomor Telepon Orang Tua/Wali">
                    <Input
                      name="noTeleponOrangTua"
                      value={form.noTeleponOrangTua}
                      onChange={handleChange}
                      placeholder="Masukkan nomor telepon"
                    />
                  </Field>
                </div>
              </FormSection>

              <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[var(--color-border)] pt-5">
                <button
                  type="button"
                  onClick={() => router.back()}
                  disabled={saving}
                  className="rounded-lg border border-[var(--color-border)] px-5 py-2.5 text-sm font-semibold text-[var(--color-text-secondary)] transition hover:bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)] disabled:opacity-50"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 size={17} className="animate-spin" />
                  ) : (
                    <Save size={17} />
                  )}
                  {saving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </div>

            <aside className="space-y-5">
              <section className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-sm">
                <div className="flex items-center gap-2 border-b border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-text)_2%,transparent)] px-5 py-4">
                  <Sparkles size={16} className="text-[var(--color-primary)]" />
                  <h2 className="text-sm font-bold text-[var(--color-text)]">Panduan Pengisian</h2>
                </div>
                <div className="space-y-4 p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)]">
                      <User size={15} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[var(--color-text)]">Nama & Identitas</p>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-[var(--color-text-muted)]">
                        Pastikan nama lengkap dan NIS diisi dengan benar sesuai data resmi sekolah.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                      <GraduationCap size={15} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[var(--color-text)]">Penempatan Kelas</p>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-[var(--color-text-muted)]">
                        Pilih kelas yang sesuai. Saat ini perubahan kelas belum dapat disimpan ke database.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                      <MapPin size={15} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[var(--color-text)]">Alamat & Kontak</p>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-[var(--color-text-muted)]">
                        Lengkapi alamat domisili dan nomor telepon yang aktif untuk memudahkan komunikasi.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <div className="rounded-xl border border-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] bg-[color-mix(in_srgb,var(--color-primary)_5%,transparent)] p-5 text-sm text-[var(--color-text)]">
                <div className="flex items-start gap-3">
                  <AlertCircle size={18} className="mt-0.5 shrink-0 text-[var(--color-primary)]" />
                  <div>
                    <h3 className="text-xs font-bold text-[var(--color-primary)]">Perhatian</h3>
                    <p className="mt-1 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
                      Perubahan data akan langsung mempengaruhi profil siswa di seluruh sistem. Harap periksa kembali sebelum menyimpan.
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </form>
      </div>
    </PageLayout>
  );
}

function PageLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden theme-page theme-text">
      <div className="shrink-0">
        <Sidebar />
      </div>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="shrink-0">
          <Header />
        </div>
        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="w-full px-4 py-5 sm:px-6 md:px-7 lg:px-8 xl:px-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function FormSection({ title, description, icon, children }) {
  return (
    <section className="overflow-visible rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-sm">
      <div className="flex items-start gap-3 border-b border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-text)_2%,transparent)] px-5 py-4">
        <div className="rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] p-2 text-[var(--color-primary)]">
          {icon}
        </div>
        <div>
          <h2 className="font-semibold text-[var(--color-text)]">{title}</h2>
          <p className="mt-0.5 text-sm text-[var(--color-text-muted)]">{description}</p>
        </div>
      </div>

      <div className="p-5">{children}</div>
    </section>
  );
}

function Field({ label, required, children }) {
  return (
    <div className="min-w-0 space-y-1.5">
      <label className="block text-sm font-medium text-[var(--color-text-secondary)]">
        {label}
        {required && <span className="ml-1 text-[var(--color-danger)]">*</span>}
      </label>
      {children}
    </div>
  );
}

function Input({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={`min-h-11 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-text-placeholder)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 disabled:bg-[var(--color-border)] ${className}`}
    />
  );
}

function Select({ className = "", children, ...props }) {
  return (
    <select
      {...props}
      className={`min-h-11 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 ${className}`}
    >
      {children}
    </select>
  );
}

function Textarea({ className = "", ...props }) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-text-placeholder)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 ${className}`}
    />
  );
}

function Hint({ children }) {
  return <p className="mt-1.5 text-xs leading-relaxed text-[var(--color-text-muted)]">{children}</p>;
}

function AlertBox({ type = "error", children }) {
  const styles =
    type === "success"
      ? "border-[color-mix(in_srgb,var(--color-success)_30%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] text-[var(--color-success)]"
      : "border-[color-mix(in_srgb,var(--color-danger)_30%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] text-[var(--color-danger)]";

  return (
    <div className={`flex items-start gap-2 rounded-lg border px-4 py-3 text-sm ${styles}`}>
      <span className="mt-0.5 shrink-0">{children?.props?.children?.[0]}</span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}