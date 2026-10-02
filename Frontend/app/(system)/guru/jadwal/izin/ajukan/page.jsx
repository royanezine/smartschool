"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  ArrowLeft,
  X,
  Upload,
  Loader2,
  Paperclip,
  CheckCircle2,
  CalendarDays,
  Send,
} from "lucide-react";

import Sidebar from "../../../../../components/Sidebar";
import Header from "../../../../../components/Header";

import { ajukanIzin } from "../../../../../../services/izin.service";

const JENIS_IZIN = [
  {
    value: "sakit",
    label: "Sakit",
  },
  {
    value: "izin",
    label: "Izin",
  },
];

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "application/pdf",
];

export default function AjukanIzinPage() {
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    jenis: "",
    tanggalMulai: "",
    tanggalSelesai: "",
    alasan: "",
    bukti: null,
  });

  const [notifications] = useState([]);

  /* ============================================================
     THEME
  ============================================================ */

  const themePrimary =
    "bg-[var(--color-primary)] text-white hover:opacity-90";

  const themePrimarySoft =
    "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)]";

  const themeCard =
    "bg-[var(--color-card)] border border-[var(--color-border)]";

  const themeText =
    "text-[var(--color-text)]";

  const themeTextSecondary =
    "text-[var(--color-text-secondary)]";

  const themeTextMuted =
    "text-[var(--color-text-muted)]";

  const themeInput =
    "border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_15%,transparent)]";

  /* ============================================================
     HANDLE CHANGE
  ============================================================ */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setSubmitError("");
  };

  /* ============================================================
     HANDLE FILE
  ============================================================ */

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    setErrors((prev) => ({
      ...prev,
      bukti: "",
    }));

    setSubmitError("");

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        bukti: "Format file harus JPG, PNG, atau PDF.",
      }));

      e.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setErrors((prev) => ({
        ...prev,
        bukti: "Ukuran file maksimal 5 MB.",
      }));

      e.target.value = "";
      return;
    }

    setForm((prev) => ({
      ...prev,
      bukti: file,
    }));
  };

  /* ============================================================
     REMOVE FILE
  ============================================================ */

  const handleRemoveFile = () => {
    setForm((prev) => ({
      ...prev,
      bukti: null,
    }));

    setErrors((prev) => ({
      ...prev,
      bukti: "",
    }));
  };

  /* ============================================================
     VALIDATION
  ============================================================ */

  const validate = () => {
    const newErrors = {};

    if (!form.jenis) {
      newErrors.jenis = "Jenis izin wajib dipilih.";
    }

    if (!form.tanggalMulai) {
      newErrors.tanggalMulai = "Tanggal mulai wajib diisi.";
    }

    if (!form.tanggalSelesai) {
      newErrors.tanggalSelesai = "Tanggal selesai wajib diisi.";
    }

    if (
      form.tanggalMulai &&
      form.tanggalSelesai &&
      form.tanggalSelesai < form.tanggalMulai
    ) {
      newErrors.tanggalSelesai =
        "Tanggal selesai tidak boleh lebih awal dari tanggal mulai.";
    }

    if (!form.alasan.trim()) {
      newErrors.alasan = "Alasan izin wajib diisi.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  /* ============================================================
     SUBMIT
  ============================================================ */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitError("");
    setSuccess(false);

    if (!validate()) {
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        jenis: form.jenis,
        tanggalMulai: form.tanggalMulai,
        tanggalSelesai: form.tanggalSelesai,
        alasan: form.alasan.trim(),
        bukti: form.bukti,
      };

      await ajukanIzin(payload);

      setSuccess(true);

      setTimeout(() => {
        router.push("/guru/jadwal/izin");
      }, 1200);
    } catch (error) {
      console.error("Gagal mengajukan izin:", error);

      setSubmitError(
        error?.message ||
          "Pengajuan izin gagal dilakukan. Silakan coba lagi."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* ============================================================
     FORMAT FILE SIZE
  ============================================================ */

  const formatFileSize = (bytes) => {
    if (!bytes) {
      return "0 KB";
    }

    if (bytes < 1024 * 1024) {
      return `${Math.ceil(bytes / 1024)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-background)]">
      {/* ========================================================
          SIDEBAR
      ======================================================== */}

      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        role="guru"
      />

      {/* ========================================================
          CONTENT AREA
      ======================================================== */}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* ======================================================
            HEADER
        ====================================================== */}

        <Header
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          notifications={notifications}
          user={{
            name: "Bu Sari",
            role: "Guru",
          }}
        />

        {/* ======================================================
            MAIN
        ====================================================== */}

        <main className="flex-1 overflow-y-auto bg-[var(--color-background)]">
          <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">

            {/* ==================================================
                HEADER PAGE
            ================================================== */}

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => router.push("/guru/jadwal/izin")}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition ${themeCard} ${themeTextSecondary} hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]`}
                  title="Kembali"
                >
                  <ArrowLeft size={19} />
                </button>

                <div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${themePrimarySoft}`}
                    >
                      <FileText size={20} />
                    </div>

                    <div>
                      <h1
                        className={`text-xl font-bold sm:text-2xl ${themeText}`}
                      >
                        Ajukan Izin
                      </h1>

                      <p
                        className={`mt-1 text-sm ${themeTextMuted}`}
                      >
                        Ajukan permohonan izin atau sakit untuk keperluan
                        ketidakhadiran.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ==================================================
                SUCCESS
            ================================================== */}

            {success && (
              <div className="mb-5 flex items-start gap-3 rounded-xl border border-[color-mix(in_srgb,var(--color-success)_30%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] p-4">
                <CheckCircle2
                  className="mt-0.5 shrink-0 text-[var(--color-success)]"
                  size={21}
                />

                <div>
                  <p className="font-semibold text-[var(--color-success)]">
                    Pengajuan berhasil
                  </p>

                  <p
                    className={`mt-1 text-sm ${themeTextSecondary}`}
                  >
                    Pengajuan izin berhasil dikirim. Mengarahkan ke halaman
                    riwayat izin...
                  </p>
                </div>
              </div>
            )}

            {/* ==================================================
                ERROR
            ================================================== */}

            {submitError && (
              <div className="mb-5 flex items-start gap-3 rounded-xl border border-[color-mix(in_srgb,var(--color-danger)_30%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_8%,transparent)] p-4">
                <X
                  className="mt-0.5 shrink-0 text-[var(--color-danger)]"
                  size={21}
                />

                <div>
                  <p className="font-semibold text-[var(--color-danger)]">
                    Pengajuan gagal
                  </p>

                  <p
                    className={`mt-1 text-sm ${themeTextSecondary}`}
                  >
                    {submitError}
                  </p>
                </div>
              </div>
            )}

            {/* ==================================================
                FORM CARD
            ================================================== */}

            <form onSubmit={handleSubmit}>
              <div className={`overflow-hidden rounded-2xl shadow-sm ${themeCard}`}>

                {/* ==================================================
                    CARD HEADER
                ================================================== */}

                <div className="border-b border-[var(--color-border)] px-5 py-5 sm:px-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${themePrimarySoft}`}
                    >
                      <FileText size={20} />
                    </div>

                    <div>
                      <h2
                        className={`font-semibold ${themeText}`}
                      >
                        Form Pengajuan Izin
                      </h2>

                      <p
                        className={`mt-0.5 text-sm ${themeTextMuted}`}
                      >
                        Lengkapi data berikut sebelum mengirim pengajuan.
                      </p>
                    </div>
                  </div>
                </div>

                {/* ==================================================
                    FORM BODY
                ================================================== */}

                <div className="space-y-6 px-5 py-6 sm:px-6">

                  {/* ==================================================
                      JENIS IZIN
                  ================================================== */}

                  <div>
                    <label
                      htmlFor="jenis"
                      className={`mb-2 block text-sm font-medium ${themeText}`}
                    >
                      Jenis Izin
                      <span className="ml-1 text-[var(--color-danger)]">
                        *
                      </span>
                    </label>

                    <select
                      id="jenis"
                      name="jenis"
                      value={form.jenis}
                      onChange={handleChange}
                      className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${themeInput}`}
                    >
                      <option value="">Pilih jenis izin</option>

                      {JENIS_IZIN.map((item) => (
                        <option
                          key={item.value}
                          value={item.value}
                        >
                          {item.label}
                        </option>
                      ))}
                    </select>

                    {errors.jenis && (
                      <p className="mt-1.5 text-sm text-[var(--color-danger)]">
                        {errors.jenis}
                      </p>
                    )}
                  </div>

                  {/* ==================================================
                      DATE
                  ================================================== */}

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                    {/* TANGGAL MULAI */}

                    <div>
                      <label
                        htmlFor="tanggalMulai"
                        className={`mb-2 block text-sm font-medium ${themeText}`}
                      >
                        Tanggal Mulai
                        <span className="ml-1 text-[var(--color-danger)]">
                          *
                        </span>
                      </label>

                      <div className="relative">
                        <CalendarDays
                          size={18}
                          className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 ${themeTextMuted}`}
                        />

                        <input
                          id="tanggalMulai"
                          name="tanggalMulai"
                          type="date"
                          value={form.tanggalMulai}
                          onChange={handleChange}
                          className={`w-full rounded-xl border py-3 pl-10 pr-4 text-sm outline-none transition ${themeInput}`}
                        />
                      </div>

                      {errors.tanggalMulai && (
                        <p className="mt-1.5 text-sm text-[var(--color-danger)]">
                          {errors.tanggalMulai}
                        </p>
                      )}
                    </div>

                    {/* TANGGAL SELESAI */}

                    <div>
                      <label
                        htmlFor="tanggalSelesai"
                        className={`mb-2 block text-sm font-medium ${themeText}`}
                      >
                        Tanggal Selesai
                        <span className="ml-1 text-[var(--color-danger)]">
                          *
                        </span>
                      </label>

                      <div className="relative">
                        <CalendarDays
                          size={18}
                          className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 ${themeTextMuted}`}
                        />

                        <input
                          id="tanggalSelesai"
                          name="tanggalSelesai"
                          type="date"
                          value={form.tanggalSelesai}
                          onChange={handleChange}
                          className={`w-full rounded-xl border py-3 pl-10 pr-4 text-sm outline-none transition ${themeInput}`}
                        />
                      </div>

                      {errors.tanggalSelesai && (
                        <p className="mt-1.5 text-sm text-[var(--color-danger)]">
                          {errors.tanggalSelesai}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* ==================================================
                      ALASAN
                  ================================================== */}

                  <div>
                    <label
                      htmlFor="alasan"
                      className={`mb-2 block text-sm font-medium ${themeText}`}
                    >
                      Alasan
                      <span className="ml-1 text-[var(--color-danger)]">
                        *
                      </span>
                    </label>

                    <textarea
                      id="alasan"
                      name="alasan"
                      value={form.alasan}
                      onChange={handleChange}
                      rows={5}
                      placeholder="Tuliskan alasan pengajuan izin..."
                      className={`w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none transition ${themeInput}`}
                    />

                    <div className="mt-1.5 flex items-center justify-between">
                      {errors.alasan ? (
                        <p className="text-sm text-[var(--color-danger)]">
                          {errors.alasan}
                        </p>
                      ) : (
                        <span />
                      )}

                      <span
                        className={`text-xs ${themeTextMuted}`}
                      >
                        {form.alasan.length} karakter
                      </span>
                    </div>
                  </div>

                  {/* ==================================================
                      BUKTI
                  ================================================== */}

                  <div>
                    <label
                      className={`mb-2 block text-sm font-medium ${themeText}`}
                    >
                      Bukti Pendukung
                      <span
                        className={`ml-2 text-xs font-normal ${themeTextMuted}`}
                      >
                        (Opsional)
                      </span>
                    </label>

                    {!form.bukti ? (
                      <label
                        htmlFor="bukti"
                        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-5 py-8 text-center transition hover:border-[var(--color-primary)] hover:bg-[color-mix(in_srgb,var(--color-primary)_3%,transparent)] ${
                          errors.bukti
                            ? "border-[var(--color-danger)]"
                            : "border-[var(--color-border)]"
                        }`}
                      >
                        <div
                          className={`mb-3 flex h-12 w-12 items-center justify-center rounded-xl ${themePrimarySoft}`}
                        >
                          <Upload size={21} />
                        </div>

                        <p
                          className={`text-sm font-medium ${themeText}`}
                        >
                          Klik untuk upload bukti
                        </p>

                        <p
                          className={`mt-1 text-xs ${themeTextMuted}`}
                        >
                          JPG, PNG, atau PDF · Maksimal 5 MB
                        </p>

                        <input
                          id="bukti"
                          type="file"
                          accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    ) : (
                      <div className={`flex items-center justify-between gap-3 rounded-xl border p-4 ${themeCard}`}>
                        <div className="flex min-w-0 items-center gap-3">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${themePrimarySoft}`}
                          >
                            <Paperclip size={18} />
                          </div>

                          <div className="min-w-0">
                            <p
                              className={`truncate text-sm font-medium ${themeText}`}
                            >
                              {form.bukti.name}
                            </p>

                            <p
                              className={`mt-0.5 text-xs ${themeTextMuted}`}
                            >
                              {formatFileSize(form.bukti.size)}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--color-danger)] transition hover:bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)]"
                          title="Hapus file"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    )}

                    {errors.bukti && (
                      <p className="mt-1.5 text-sm text-[var(--color-danger)]">
                        {errors.bukti}
                      </p>
                    )}
                  </div>

                  {/* ==================================================
                      INFO
                  ================================================== */}

                  <div
                    className={`rounded-xl border p-4 ${themePrimarySoft} border-[color-mix(in_srgb,var(--color-primary)_18%,var(--color-border))]`}
                  >
                    <div className="flex gap-3">
                      <FileText
                        size={18}
                        className="mt-0.5 shrink-0"
                      />

                      <div>
                        <p
                          className={`text-sm font-semibold ${themeText}`}
                        >
                          Informasi Pengajuan
                        </p>

                        <p
                          className={`mt-1 text-sm leading-6 ${themeTextSecondary}`}
                        >
                          Pastikan data yang kamu masukkan sudah benar.
                          Pengajuan akan diteruskan untuk proses verifikasi
                          oleh pihak sekolah.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ==================================================
                    FOOTER BUTTON
                ================================================== */}

                <div className="flex flex-col-reverse gap-3 border-t border-[var(--color-border)] px-5 py-5 sm:flex-row sm:justify-end sm:px-6">
                  <button
                    type="button"
                    onClick={() => router.push("/guru/jadwal/izin")}
                    disabled={submitting}
                    className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${themeCard} ${themeTextSecondary} hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]`}
                  >
                    <ArrowLeft size={17} />
                    Batal
                  </button>

                  <button
                    type="submit"
                    disabled={submitting || success}
                    className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${themePrimary}`}
                  >
                    {submitting ? (
                      <>
                        <Loader2
                          size={17}
                          className="animate-spin"
                        />
                        Mengirim...
                      </>
                    ) : (
                      <>
                        <Send size={17} />
                        Ajukan Izin
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}