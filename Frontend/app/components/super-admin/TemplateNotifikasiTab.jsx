"use client";

import { useCallback, useEffect, useState } from "react";
import {
  FileText,
  Plus,
  RefreshCw,
  Search,
  Pencil,
  Trash2,
  Power,
  Save,
  X,
  AlertCircle,
} from "lucide-react";
import {
  getTemplateNotifikasi,
  getTemplateNotifikasiById,
  createTemplateNotifikasi,
  updateTemplateNotifikasi,
  deleteTemplateNotifikasi,
  toggleTemplateNotifikasi,
} from "@/services/superAdmin.service";

const KANAL_OPTIONS = [
  { value: "", label: "Semua Kanal" },
  { value: "email", label: "Email" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "sms", label: "SMS" },
  { value: "push", label: "Push Notification" },
  { value: "in_app", label: "In-App" },
];

export default function TemplateNotifikasiTab({ onToast }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });

  const [kanalFilter, setKanalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState("");
  const [busyId, setBusyId] = useState("");

  const [formEventTarget, setFormEventTarget] = useState("");
  const [formKanal, setFormKanal] = useState("email");
  const [formSubjek, setFormSubjek] = useState("");
  const [formIsiTemplate, setFormIsiTemplate] = useState("");
  const [formVariabelJson, setFormVariabelJson] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);

  const loadTemplates = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getTemplateNotifikasi({
        kanal: kanalFilter,
        isActive:
          statusFilter === "true"
            ? true
            : statusFilter === "false"
            ? false
            : "",
        search: searchQuery,
        page,
        limit: 15,
      });

      const raw = res?.data;
      const list = Array.isArray(raw?.data)
        ? raw.data
        : Array.isArray(raw)
        ? raw
        : [];
      const pagination = res?.meta || raw?.meta || {};
      setTemplates(list);
      setMeta({
        page: Number(pagination.page || page),
        totalPages: Number(pagination.totalPages || 1),
        total: Number(pagination.total ?? list.length),
      });
    } catch (err) {
      setError(err?.message || "Gagal memuat template notifikasi.");
    } finally {
      setLoading(false);
    }
  }, [kanalFilter, statusFilter, searchQuery, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadTemplates();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadTemplates]);

  const openCreateModal = () => {
    setEditingId("");
    setModalError("");
    setFormEventTarget("");
    setFormKanal("email");
    setFormSubjek("");
    setFormIsiTemplate("");
    setFormVariabelJson("");
    setFormIsActive(true);
    setModalOpen(true);
  };

  const openEditModal = async (tpl) => {
    try {
      setModalError("");
      setEditingId(tpl.id);
      const detailRes = await getTemplateNotifikasiById(tpl.id).catch(() => ({
        data: tpl,
      }));
      const detail = detailRes?.data || tpl;
      setFormEventTarget(detail.eventTarget || "");
      setFormKanal(detail.kanal || "email");
      setFormSubjek(detail.subjek || "");
      setFormIsiTemplate(detail.isiTemplate || "");
      setFormVariabelJson(
        detail.variabel && typeof detail.variabel === "object"
          ? JSON.stringify(detail.variabel, null, 2)
          : ""
      );
      setFormIsActive(Boolean(detail.isActive));
      setModalOpen(true);
    } catch (err) {
      onToast?.(err?.message || "Gagal memuat detail template.", "error");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setModalError("");

    try {
      let parsedVariabel = null;
      if (formVariabelJson.trim()) {
        try {
          const obj = JSON.parse(formVariabelJson);
          if (!obj || typeof obj !== "object" || Array.isArray(obj)) {
            throw new Error("Variabel harus berupa JSON object key-value.");
          }
          parsedVariabel = obj;
        } catch (jsonErr) {
          throw new Error(jsonErr?.message || "Format JSON variabel tidak valid.");
        }
      }

      setSaving(true);
      if (editingId) {
        await updateTemplateNotifikasi(editingId, {
          subjek: formSubjek.trim() || null,
          isiTemplate: formIsiTemplate,
          variabel: parsedVariabel,
          isActive: formIsActive,
        });
        onToast?.("Template notifikasi berhasil diperbarui.", "success");
      } else {
        await createTemplateNotifikasi({
          eventTarget: formEventTarget,
          kanal: formKanal,
          subjek: formSubjek.trim() || null,
          isiTemplate: formIsiTemplate,
          variabel: parsedVariabel,
          isActive: formIsActive,
        });
        onToast?.("Template notifikasi berhasil dibuat.", "success");
      }

      setModalOpen(false);
      await loadTemplates();
    } catch (err) {
      setModalError(err?.message || "Gagal menyimpan template notifikasi.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (tpl) => {
    try {
      setBusyId(tpl.id);
      await toggleTemplateNotifikasi(tpl.id);
      onToast?.(
        `Template "${tpl.eventTarget}" (${tpl.kanal}) berhasil di${
          tpl.isActive ? "nonaktifkan" : "aktifkan"
        }.`,
        "success"
      );
      await loadTemplates();
    } catch (err) {
      onToast?.(err?.message || "Gagal mengubah status template.", "error");
    } finally {
      setBusyId("");
    }
  };

  const handleDelete = async (tpl) => {
    if (
      !window.confirm(
        `Hapus template "${tpl.eventTarget}" (${tpl.kanal})? Tindakan ini tidak dapat dibatalkan.`
      )
    ) {
      return;
    }
    try {
      setBusyId(tpl.id);
      await deleteTemplateNotifikasi(tpl.id);
      onToast?.("Template notifikasi berhasil dihapus.", "success");
      await loadTemplates();
    } catch (err) {
      onToast?.(err?.message || "Gagal menghapus template.", "error");
    } finally {
      setBusyId("");
    }
  };

  return (
    <div className="space-y-4">
      <div className="theme-card rounded-xl border theme-border p-4 flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-semibold theme-text flex items-center gap-2">
              <FileText size={16} className="text-[var(--color-primary)]" />
              Template Notifikasi Sistem
            </h3>
            <p className="text-xs theme-text-muted mt-0.5">
              Kelola template pesan multi-kanal (Email, WhatsApp, SMS, Push, In-App) untuk event platform.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_80%,#000))] text-white text-xs sm:text-sm font-medium hover:opacity-90 transition"
          >
            <Plus size={15} />
            Tambah Template
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
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
              placeholder="Cari event target, subjek, atau isi template..."
              className="theme-input w-full rounded-lg pl-9 pr-3 py-2 text-sm"
            />
          </div>

          <select
            value={kanalFilter}
            onChange={(e) => {
              setPage(1);
              setKanalFilter(e.target.value);
            }}
            className="theme-input rounded-lg px-3 py-2 text-sm sm:w-44"
          >
            {KANAL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setPage(1);
              setStatusFilter(e.target.value);
            }}
            className="theme-input rounded-lg px-3 py-2 text-sm sm:w-36"
          >
            <option value="">Semua Status</option>
            <option value="true">Aktif</option>
            <option value="false">Nonaktif</option>
          </select>

          <button
            type="submit"
            className="px-4 py-2 rounded-lg border theme-border text-xs font-medium theme-text-secondary hover:text-[var(--color-primary)] transition"
          >
            Cari
          </button>
        </form>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs sm:text-sm text-red-500 flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <div className="theme-card rounded-xl border theme-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse text-left">
            <thead>
              <tr className="border-b theme-border bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]">
                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider theme-text-muted">
                  Event Target
                </th>
                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider theme-text-muted">
                  Kanal
                </th>
                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider theme-text-muted">
                  Subjek / Pratinjau Isi
                </th>
                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider theme-text-muted">
                  Status
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
                    Memuat template notifikasi...
                  </td>
                </tr>
              ) : templates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-xs theme-text-muted">
                    Belum ada template notifikasi yang cocok.
                  </td>
                </tr>
              ) : (
                templates.map((tpl) => (
                  <tr key={tpl.id} className="hover:bg-[color-mix(in_srgb,var(--color-text)_2%,transparent)]">
                    <td className="px-4 py-3 font-mono text-xs font-semibold theme-text">
                      {tpl.eventTarget}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span className="inline-flex rounded-md border theme-border px-2 py-0.5 text-[11px] font-medium uppercase theme-text-secondary">
                        {tpl.kanal}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-[300px]">
                      <p className="text-xs font-semibold theme-text truncate">
                        {tpl.subjek || "(Tanpa subjek)"}
                      </p>
                      <p className="text-[11px] theme-text-muted truncate mt-0.5">
                        {tpl.isiTemplate}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          tpl.isActive
                            ? "bg-emerald-500/15 text-emerald-600"
                            : "bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)] theme-text-muted"
                        }`}
                      >
                        {tpl.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          disabled={busyId === tpl.id}
                          onClick={() => handleToggle(tpl)}
                          title={tpl.isActive ? "Nonaktifkan template" : "Aktifkan template"}
                          className="p-1.5 rounded-lg theme-text-secondary hover:text-[var(--color-primary)] transition disabled:opacity-40"
                        >
                          <Power size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(tpl)}
                          title="Edit template"
                          className="p-1.5 rounded-lg theme-text-secondary hover:text-[var(--color-primary)] transition"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          disabled={busyId === tpl.id}
                          onClick={() => handleDelete(tpl)}
                          title="Hapus template"
                          className="p-1.5 rounded-lg theme-text-secondary hover:text-red-500 transition disabled:opacity-40"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t theme-border text-xs">
            <span className="theme-text-muted">
              Halaman {meta.page} dari {meta.totalPages} ({meta.total} template)
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 rounded border theme-border theme-text-secondary disabled:opacity-40"
              >
                Sebelumnya
              </button>
              <button
                type="button"
                disabled={page >= meta.totalPages || loading}
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                className="px-3 py-1 rounded border theme-border theme-text-secondary disabled:opacity-40"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <form
            onSubmit={handleSave}
            className="w-full max-w-xl rounded-2xl border theme-border theme-card p-5 sm:p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b theme-border pb-3">
              <h3 className="text-base font-bold theme-text">
                {editingId ? "Edit Template Notifikasi" : "Tambah Template Notifikasi"}
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
                <label className="text-xs font-semibold theme-text">Event Target</label>
                <input
                  type="text"
                  required
                  disabled={Boolean(editingId)}
                  value={formEventTarget}
                  onChange={(e) => setFormEventTarget(e.target.value)}
                  placeholder="contoh: absensi.alpha_harian"
                  className="theme-input w-full rounded-lg px-3 py-2 text-xs font-mono disabled:opacity-60"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold theme-text">Kanal</label>
                <select
                  disabled={Boolean(editingId)}
                  value={formKanal}
                  onChange={(e) => setFormKanal(e.target.value)}
                  className="theme-input w-full rounded-lg px-3 py-2 text-xs disabled:opacity-60"
                >
                  <option value="email">email</option>
                  <option value="whatsapp">whatsapp</option>
                  <option value="sms">sms</option>
                  <option value="push">push</option>
                  <option value="in_app">in_app</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold theme-text">Subjek (Opsional)</label>
              <input
                type="text"
                value={formSubjek}
                onChange={(e) => setFormSubjek(e.target.value)}
                placeholder="Judul pesan / email subject..."
                className="theme-input w-full rounded-lg px-3 py-2 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold theme-text">Isi Template</label>
              <textarea
                rows={4}
                required
                value={formIsiTemplate}
                onChange={(e) => setFormIsiTemplate(e.target.value)}
                placeholder="Halo {{nama}}, berikut informasi terbaru..."
                className="theme-input w-full rounded-lg px-3 py-2 text-xs font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold theme-text">
                Definisi Variabel JSON (Opsional)
              </label>
              <textarea
                rows={2}
                value={formVariabelJson}
                onChange={(e) => setFormVariabelJson(e.target.value)}
                placeholder='{"nama": "Nama lengkap penerima"}'
                className="theme-input w-full rounded-lg px-3 py-2 text-xs font-mono"
              />
            </div>

            <label className="inline-flex items-center gap-2 text-xs theme-text">
              <input
                type="checkbox"
                checked={formIsActive}
                onChange={(e) => setFormIsActive(e.target.checked)}
              />
              Aktifkan template ini
            </label>

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
                {saving ? "Menyimpan..." : "Simpan Template"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
