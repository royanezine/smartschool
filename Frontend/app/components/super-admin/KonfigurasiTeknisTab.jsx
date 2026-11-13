"use client";

import { useCallback, useEffect, useState } from "react";
import {
  KeyRound,
  Lock,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Pencil,
  Save,
  X,
  AlertCircle,
  Check,
  ShieldCheck,
} from "lucide-react";
import {
  getKonfigurasiSistem,
  getKonfigurasiSistemByKunci,
  upsertKonfigurasiSistem,
  deleteKonfigurasiSistem,
} from "@/services/superAdmin.service";

const KATEGORI_OPTIONS = [
  { value: "", label: "Semua Kategori" },
  { value: "INTEGRASI", label: "INTEGRASI" },
  { value: "KEAMANAN", label: "KEAMANAN" },
  { value: "NOTIFIKASI", label: "NOTIFIKASI" },
];

function detectValueType(item) {
  if (item?.nilaiBoolean !== null && item?.nilaiBoolean !== undefined) return "boolean";
  if (item?.nilaiAngka !== null && item?.nilaiAngka !== undefined) return "number";
  return "text";
}

function formatDisplayValue(item) {
  if (!item) return "-";
  if (item.isRahasia) {
    return item.credentialConfigured ? "•••••••• (Tersimpan aman)" : "(Belum diatur)";
  }
  if (item.nilaiBoolean !== null && item.nilaiBoolean !== undefined) {
    return item.nilaiBoolean ? "Aktif (true)" : "Nonaktif (false)";
  }
  if (item.nilaiAngka !== null && item.nilaiAngka !== undefined) {
    return String(item.nilaiAngka);
  }
  return item.nilaiText || "-";
}

export default function KonfigurasiTeknisTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(null);

  const [kategoriFilter, setKategoriFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState("");
  const [deletingKey, setDeletingKey] = useState("");

  const [formKunci, setFormKunci] = useState("");
  const [formKategori, setFormKategori] = useState("INTEGRASI");
  const [formType, setFormType] = useState("text");
  const [formNilaiText, setFormNilaiText] = useState("");
  const [formNilaiBoolean, setFormNilaiBoolean] = useState(false);
  const [formNilaiAngka, setFormNilaiAngka] = useState("");
  const [formIsRahasia, setFormIsRahasia] = useState(false);
  const [formPreserveSecret, setFormPreserveSecret] = useState(false);
  const [formKeterangan, setFormKeterangan] = useState("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getKonfigurasiSistem({
        kategori: kategoriFilter,
        search: searchQuery,
      });
      const list = Array.isArray(res?.data) ? res.data : [];
      setItems(list);
    } catch (err) {
      setError(err?.message || "Gagal memuat konfigurasi teknis.");
    } finally {
      setLoading(false);
    }
  }, [kategoriFilter, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  const openCreateModal = () => {
    setIsEditing(false);
    setModalError("");
    setFormKunci("");
    setFormKategori("INTEGRASI");
    setFormType("text");
    setFormNilaiText("");
    setFormNilaiBoolean(false);
    setFormNilaiAngka("");
    setFormIsRahasia(false);
    setFormPreserveSecret(false);
    setFormKeterangan("");
    setModalOpen(true);
  };

  const openEditModal = async (item) => {
    try {
      setModalError("");
      setIsEditing(true);
      const detailRes = await getKonfigurasiSistemByKunci(item.kunci).catch(() => ({
        data: item,
      }));
      const detail = detailRes?.data || item;
      const detectedType = detail.isRahasia ? "text" : detectValueType(detail);

      setFormKunci(detail.kunci || "");
      setFormKategori(detail.kategori || "INTEGRASI");
      setFormType(detectedType);
      setFormIsRahasia(Boolean(detail.isRahasia));
      setFormPreserveSecret(Boolean(detail.isRahasia && detail.credentialConfigured));
      setFormNilaiText(
        detail.isRahasia || /^\*{3,}$/.test(String(detail.nilaiText || ""))
          ? ""
          : detail.nilaiText || ""
      );
      setFormNilaiBoolean(Boolean(detail.nilaiBoolean));
      setFormNilaiAngka(
        detail.nilaiAngka !== null && detail.nilaiAngka !== undefined
          ? String(detail.nilaiAngka)
          : ""
      );
      setFormKeterangan(detail.keterangan || "");
      setModalOpen(true);
    } catch (err) {
      setNotice({ type: "error", message: err?.message || "Gagal membuka detail konfigurasi." });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setModalError("");

    try {
      setSaving(true);
      const payload = {
        keterangan: formKeterangan.trim() || null,
      };

      if (!isEditing) {
        payload.kategori = formKategori;
      }

      if (!isEditing || formIsRahasia) {
        if (formIsRahasia) payload.isRahasia = true;
      }

      if (formIsRahasia) {
        if (!isEditing || !formPreserveSecret) {
          payload.nilaiText = formNilaiText.trim() || null;
        }
      } else if (formType === "boolean") {
        payload.nilaiBoolean = Boolean(formNilaiBoolean);
      } else if (formType === "number") {
        if (formNilaiAngka === "") {
          payload.nilaiAngka = null;
        } else {
          const parsed = Number(formNilaiAngka);
          if (!Number.isFinite(parsed)) {
            throw new Error("Nilai angka harus berupa bilangan valid.");
          }
          payload.nilaiAngka = parsed;
        }
      } else {
        payload.nilaiText = formNilaiText.trim() || null;
      }

      await upsertKonfigurasiSistem(formKunci, payload);
      setModalOpen(false);
      setNotice({
        type: "success",
        message: `Konfigurasi "${formKunci}" berhasil disimpan.`,
      });
      await loadData();
    } catch (err) {
      setModalError(err?.message || "Gagal menyimpan konfigurasi.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!item?.kunci) return;
    if (!window.confirm(`Hapus konfigurasi "${item.kunci}"?`)) return;

    try {
      setDeletingKey(item.kunci);
      await deleteKonfigurasiSistem(item.kunci);
      setNotice({
        type: "success",
        message: `Konfigurasi "${item.kunci}" berhasil dihapus.`,
      });
      await loadData();
    } catch (err) {
      setNotice({
        type: "error",
        message: err?.message || "Gagal menghapus konfigurasi.",
      });
    } finally {
      setDeletingKey("");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold theme-text flex items-center gap-2">
            <ShieldCheck size={18} className="text-[var(--color-primary)]" />
            Konfigurasi Teknis Platform
          </h2>
          <p className="text-xs theme-text-secondary mt-0.5">
            Parameter key-value terenkripsi untuk integrasi, keamanan autentikasi, dan gateway notifikasi.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_80%,#000))] text-white text-xs sm:text-sm font-medium hover:opacity-90 transition"
        >
          <Plus size={15} />
          Tambah Kunci Konfigurasi
        </button>
      </div>

      {notice && (
        <div
          className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-xs sm:text-sm ${
            notice.type === "error"
              ? "border-red-500/30 bg-red-500/10 text-red-500"
              : "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
          }`}
        >
          <span className="flex items-center gap-2">
            {notice.type === "error" ? <AlertCircle size={16} /> : <Check size={16} />}
            {notice.message}
          </span>
          <button type="button" onClick={() => setNotice(null)} className="p-1">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Filter bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSearchQuery(searchInput.trim());
        }}
        className="flex flex-col sm:flex-row gap-2.5"
      >
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-muted"
          />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Cari kunci atau keterangan..."
            className="theme-input w-full rounded-lg pl-9 pr-3 py-2 text-sm"
          />
        </div>

        <select
          value={kategoriFilter}
          onChange={(e) => setKategoriFilter(e.target.value)}
          className="theme-input rounded-lg px-3 py-2 text-sm sm:w-48"
        >
          {KATEGORI_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="px-4 py-2 rounded-lg border theme-border text-xs sm:text-sm font-medium theme-text-secondary hover:text-[var(--color-primary)] transition"
        >
          Cari
        </button>

        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className="px-3 py-2 rounded-lg border theme-border text-xs theme-text-secondary hover:text-[var(--color-primary)] transition inline-flex items-center justify-center gap-1.5"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </form>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs sm:text-sm text-red-500 flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border theme-border">
        <table className="w-full min-w-[680px] border-collapse text-left">
          <thead>
            <tr className="border-b theme-border bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]">
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider theme-text-muted">
                Kunci
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider theme-text-muted">
                Kategori
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider theme-text-muted">
                Nilai
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider theme-text-muted">
                Keterangan
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider theme-text-muted text-right">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[color-mix(in_srgb,var(--color-text)_7%,transparent)]">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-xs theme-text-muted">
                  <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-[var(--color-primary)]" />
                  Memuat konfigurasi sistem...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-xs theme-text-muted">
                  Belum ada konfigurasi teknis yang sesuai filter.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.kunci} className="hover:bg-[color-mix(in_srgb,var(--color-text)_2%,transparent)]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 font-mono text-xs font-semibold theme-text">
                      <KeyRound size={13} className="text-[var(--color-primary)] shrink-0" />
                      {item.kunci}
                      {item.isRahasia && (
                        <span
                          title="Kredensial terenkripsi"
                          className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-sans bg-amber-500/15 text-amber-600"
                        >
                          <Lock size={10} />
                          Rahasia
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <span className="inline-flex rounded-md border theme-border px-2 py-0.5 text-[11px] font-semibold theme-text-secondary">
                      {item.kategori}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs font-mono theme-text-secondary max-w-[220px] truncate">
                    {formatDisplayValue(item)}
                  </td>
                  <td className="px-4 py-3 text-xs theme-text-muted max-w-[260px] truncate">
                    {item.keterangan || "-"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditModal(item)}
                        title="Edit konfigurasi"
                        className="p-1.5 rounded-lg theme-text-secondary hover:text-[var(--color-primary)] transition"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        disabled={deletingKey === item.kunci}
                        onClick={() => handleDelete(item)}
                        title="Hapus konfigurasi"
                        className="p-1.5 rounded-lg theme-text-secondary hover:text-red-500 transition disabled:opacity-40"
                      >
                        {deletingKey === item.kunci ? (
                          <RefreshCw size={14} className="animate-spin" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <form
            onSubmit={handleSave}
            className="w-full max-w-lg rounded-2xl border theme-border theme-card p-5 sm:p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b theme-border pb-3">
              <h3 className="text-base font-bold theme-text">
                {isEditing ? `Edit Konfigurasi: ${formKunci}` : "Tambah Kunci Konfigurasi"}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 theme-text-muted hover:theme-text"
              >
                <X size={18} />
              </button>
            </div>

            {modalError && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-500 flex items-start gap-2">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span>{modalError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold theme-text">Kunci</label>
                <input
                  type="text"
                  required
                  disabled={isEditing}
                  value={formKunci}
                  onChange={(e) => setFormKunci(e.target.value)}
                  placeholder="contoh: smtp.host"
                  className="theme-input w-full rounded-lg px-3 py-2 text-xs font-mono disabled:opacity-60"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold theme-text">Kategori</label>
                <select
                  disabled={isEditing}
                  value={formKategori}
                  onChange={(e) => setFormKategori(e.target.value)}
                  className="theme-input w-full rounded-lg px-3 py-2 text-xs disabled:opacity-60"
                >
                  <option value="INTEGRASI">INTEGRASI</option>
                  <option value="KEAMANAN">KEAMANAN</option>
                  <option value="NOTIFIKASI">NOTIFIKASI</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <label className="inline-flex items-center gap-2 text-xs theme-text">
                <input
                  type="checkbox"
                  checked={formIsRahasia}
                  disabled={isEditing && formIsRahasia}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setFormIsRahasia(checked);
                    if (checked) setFormType("text");
                  }}
                />
                Tandai sebagai rahasia / kredensial terenkripsi
              </label>

              {isEditing && formIsRahasia && (
                <label className="inline-flex items-center gap-2 text-xs theme-text-secondary">
                  <input
                    type="checkbox"
                    checked={formPreserveSecret}
                    onChange={(e) => setFormPreserveSecret(e.target.checked)}
                  />
                  Pertahankan nilai rahasia saat ini
                </label>
              )}
            </div>

            {!formIsRahasia && (
              <div className="space-y-1">
                <label className="text-xs font-semibold theme-text">Tipe Nilai</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  className="theme-input w-full rounded-lg px-3 py-2 text-xs"
                >
                  <option value="text">Teks (nilaiText)</option>
                  <option value="number">Angka (nilaiAngka)</option>
                  <option value="boolean">Boolean (nilaiBoolean)</option>
                </select>
              </div>
            )}

            {(!formIsRahasia || !formPreserveSecret) && (
              <div className="space-y-1">
                <label className="text-xs font-semibold theme-text">
                  {formIsRahasia ? "Nilai Rahasia Baru" : "Nilai"}
                </label>
                {formType === "boolean" && !formIsRahasia ? (
                  <label className="inline-flex items-center gap-2 text-xs theme-text pt-1">
                    <input
                      type="checkbox"
                      checked={formNilaiBoolean}
                      onChange={(e) => setFormNilaiBoolean(e.target.checked)}
                    />
                    Aktif (true)
                  </label>
                ) : formType === "number" && !formIsRahasia ? (
                  <input
                    type="number"
                    step="any"
                    value={formNilaiAngka}
                    onChange={(e) => setFormNilaiAngka(e.target.value)}
                    placeholder="Contoh: 587"
                    className="theme-input w-full rounded-lg px-3 py-2 text-xs font-mono"
                  />
                ) : (
                  <input
                    type={formIsRahasia ? "password" : "text"}
                    value={formNilaiText}
                    onChange={(e) => setFormNilaiText(e.target.value)}
                    placeholder={formIsRahasia ? "Masukkan kredensial baru..." : "Masukkan nilai teks..."}
                    className="theme-input w-full rounded-lg px-3 py-2 text-xs font-mono"
                  />
                )}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold theme-text">Keterangan (Opsional)</label>
              <textarea
                rows={2}
                value={formKeterangan}
                onChange={(e) => setFormKeterangan(e.target.value)}
                placeholder="Deskripsi fungsi konfigurasi..."
                className="theme-input w-full rounded-lg px-3 py-2 text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t theme-border">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-lg border theme-border text-xs font-medium theme-text-secondary"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_80%,#000))] text-white text-xs font-semibold disabled:opacity-60"
              >
                {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                {saving ? "Menyimpan..." : "Simpan Konfigurasi"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
