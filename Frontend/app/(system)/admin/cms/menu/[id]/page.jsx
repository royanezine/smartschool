"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import { apiFetch } from "../../../../../../lib/api";

import {
  Menu,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Pencil,
  Trash2,
  X,
  CheckCircle2,
  Image as ImageIcon,
  ArrowUpDown,
  Layers,
  Link as LinkIcon,
  FileText,
  ExternalLink,
} from "lucide-react";

const API_URL = "/api/cms/menu-konfigurasi";

function unwrapData(result) {
  let data = result?.data ?? result;
  for (let i = 0; i < 3; i += 1) {
    if (data && !Array.isArray(data) && typeof data === "object" && "data" in data) {
      data = data.data;
    } else {
      break;
    }
  }
  return data;
}

function getErrorMessage(error, fallback) {
  return error?.message || fallback;
}

function getStatusLabel(status) {
  const value = String(status || "").toLowerCase();
  if (value === "aktif") return "Aktif";
  if (value === "nonaktif") return "Nonaktif";
  return status || "-";
}

function getStatusStyle(status) {
  const value = String(status || "").toLowerCase();
  if (value === "aktif") return "theme-success border";
  return "theme-card-soft theme-text-secondary border";
}

function formatLabel(value) {
  return String(value || "-")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDateTime(value) {
  if (!value) return "-";
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(value);
  }
}

function getRuntimeBase() {
  if (typeof window === "undefined") {
    return { hostname: "", protocol: "https", port: "" };
  }
  return {
    hostname: window.location.hostname || "",
    protocol: window.location.protocol
      ? window.location.protocol.replace(":", "")
      : "https",
    port: window.location.port || "",
  };
}

const ROOT_DOMAIN = "smartschool.citrasolusi.id";

function getBaseDomain(hostname, sekolahSlug = "") {
  const cleanHost = String(hostname || "")
    .trim()
    .toLowerCase()
    .replace(/\.$/, "");

  if (!cleanHost) return "";
  if (cleanHost === "localhost" || cleanHost.endsWith(".localhost")) {
    return "localhost";
  }
  if (/^\d+\.\d+\.\d+\.\d+$/.test(cleanHost)) return cleanHost;

  if (cleanHost === ROOT_DOMAIN || cleanHost.endsWith(`.${ROOT_DOMAIN}`)) {
    return ROOT_DOMAIN;
  }

  if (sekolahSlug && cleanHost.startsWith(`${sekolahSlug.toLowerCase()}.`)) {
    return cleanHost.slice(sekolahSlug.length + 1);
  }

  if (cleanHost.startsWith("www.")) {
    return cleanHost.slice(4);
  }

  return cleanHost;
}

function getSekolahSlug(item) {
  if (!item) return "";

  const sekolah = item?.halamanCms?.sekolah || item?.sekolah || {};

  return (
    sekolah?.slug ||
    sekolah?.subdomain ||
    sekolah?.sub_domain ||
    sekolah?.kode ||
    sekolah?.singkatan ||
    sekolah?.domain_slug ||
    item?.halamanCms?.sekolahSlug ||
    item?.halamanCms?.sekolah_slug ||
    item?.sekolahSlug ||
    item?.sekolah_slug ||
    ""
  );
}

function resolveCtaLink(link, item) {
  if (!link) return "";
  const trimmed = String(link).trim();
  if (!trimmed) return "";

  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  const normalizedPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  const { hostname, protocol, port } = getRuntimeBase();

  if (!hostname) return normalizedPath;

  const sekolahSlug = getSekolahSlug(item);
  const baseDomain = getBaseDomain(hostname, sekolahSlug);
  const portPart = port ? `:${port}` : "";

  console.group("[resolveCtaLink]");
  console.log("hostname:", hostname);
  console.log("protocol:", protocol);
  console.log("port:", port);
  console.log("baseDomain:", baseDomain);
  console.log("sekolahSlug:", sekolahSlug);
  console.log("halamanCms.sekolah:", item?.halamanCms?.sekolah);
  console.log("item.sekolah:", item?.sekolah);
  console.log("raw ctaLink:", link);
  console.log("normalizedPath:", normalizedPath);
  console.groupEnd();

  if (sekolahSlug && baseDomain) {
    const result = `${protocol}://${sekolahSlug}.${baseDomain}${portPart}${normalizedPath}`;
    console.log("[resolveCtaLink] → subdomain:", result);
    return result;
  }

  const fallback = `${protocol}://${hostname}${portPart}${normalizedPath}`;
  console.warn("[resolveCtaLink] → fallback (sekolahSlug kosong):", fallback);
  return fallback;
}

export default function DetailMenuKonfigurasiPage() {
  const router = useRouter();
  const params = useParams();
  const itemId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [active, setActive] = useState("menu");
  const [collapsed, setCollapsed] = useState(false);

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchItem = useCallback(async () => {
    if (!itemId) {
      setError("ID konfigurasi tidak ditemukan pada URL.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const result = await apiFetch(API_URL);
      const data = unwrapData(result);

      if (!Array.isArray(data)) {
        throw new Error("Format data konfigurasi menu dari server tidak valid.");
      }

      const found = data.find((row) => String(row?.id) === String(itemId));

      if (!found) {
        throw new Error("Konfigurasi menu tidak ditemukan.");
      }

      setItem(found);
    } catch (err) {
      console.error("Gagal mengambil detail konfigurasi menu:", err);
      setError(getErrorMessage(err, "Gagal mengambil detail konfigurasi menu."));
    } finally {
      setLoading(false);
    }
  }, [itemId]);

  useEffect(() => {
    fetchItem();
  }, [fetchItem]);

  const handleDelete = async () => {
    if (!item?.id || deleting) return;
    try {
      setDeleting(true);
      setError("");
      setSuccess("");

      await apiFetch(`${API_URL}/${encodeURIComponent(item.id)}`, {
        method: "DELETE",
      });

      router.push("/admin/cms/menu?success=deleted");
    } catch (err) {
      console.error("Gagal menonaktifkan konfigurasi menu:", err);
      setError(getErrorMessage(err, "Gagal menonaktifkan konfigurasi menu."));
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="theme-page flex h-screen w-full overflow-hidden">
        <Sidebar active={active} setActive={setActive} collapsed={collapsed} setCollapsed={setCollapsed} />
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="shrink-0">
            <Header
              title="Detail Konfigurasi Menu"
              user={{ name: "CMS Admin", email: "cms@smartschool.com", avatar: "CA" }}
            />
          </div>
          <main className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto">
            <div className="text-center">
              <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-[var(--color-primary)]" />
              <p className="theme-text text-sm font-semibold">Memuat detail konfigurasi...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const resolvedCtaLink = item ? resolveCtaLink(item.ctaLink, item) : "";

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar active={active} setActive={setActive} collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="shrink-0">
          <Header
            title="Detail Konfigurasi Menu"
            user={{ name: "CMS Admin", email: "cms@smartschool.com", avatar: "CA" }}
          />
        </div>

        <main className="theme-page flex min-h-0 flex-1 flex-col overflow-y-auto">
          <div className="w-full flex-1 px-3 py-5 sm:px-6 lg:px-9">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => router.push("/admin/cms/menu")}
                  className="theme-card theme-border theme-text-secondary inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-sm font-semibold"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Kembali
                </button>
                <div className="bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border">
                  <Menu className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="theme-text text-2xl font-bold">Detail Konfigurasi Menu</h1>
                  <p className="theme-text-secondary mt-1 text-sm">
                    Lihat informasi lengkap konfigurasi menu yang dipilih.
                  </p>
                </div>
              </div>

              {item && (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/admin/cms/menu/${encodeURIComponent(String(item.id))}/edit`
                      )
                    }
                    className="theme-primary inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit Konfigurasi
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteOpen(true)}
                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-[var(--color-danger)] px-4 text-sm font-semibold text-white"
                  >
                    <Trash2 className="h-4 w-4" />
                    Nonaktifkan
                  </button>
                </div>
              )}
            </div>

            {error && (
              <div className="theme-danger mb-4 flex items-start gap-3 rounded-xl border p-4">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <div className="min-w-0 flex-1 text-sm">{error}</div>
                <button type="button" onClick={() => setError("")}>
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {success && (
              <div className="theme-success mb-4 flex items-start gap-3 rounded-xl border p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                <div className="min-w-0 flex-1 text-sm">{success}</div>
                <button type="button" onClick={() => setSuccess("")}>
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {!item ? (
              <section className="theme-card theme-border rounded-2xl border p-10 text-center">
                <Menu className="theme-text-muted mx-auto mb-3 h-10 w-10" />
                <h2 className="theme-text text-base font-bold">
                  Konfigurasi tidak ditemukan
                </h2>
                <p className="theme-text-secondary mx-auto mt-2 max-w-md text-sm leading-6">
                  Data konfigurasi menu tidak tersedia. Mungkin sudah dihapus atau
                  ID tidak valid.
                </p>
                <button
                  type="button"
                  onClick={() => router.push("/admin/cms/menu")}
                  className="theme-primary mt-4 inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Kembali ke Daftar
                </button>
              </section>
            ) : (
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                <div className="space-y-4 xl:col-span-2">
                  <section className="theme-card theme-border overflow-hidden rounded-2xl border">
                    {item.gambarUrl ? (
                      <div className="theme-card-soft max-h-[420px] w-full overflow-hidden border-b">
                        <img
                          src={item.gambarUrl}
                          alt={item.judul || "Gambar konfigurasi"}
                          className="h-full max-h-[420px] w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="theme-card-soft flex h-48 w-full items-center justify-center border-b">
                        <div className="text-center">
                          <ImageIcon className="theme-text-muted mx-auto mb-2 h-8 w-8" />
                          <p className="theme-text-muted text-xs">Tidak ada gambar</p>
                        </div>
                      </div>
                    )}

                    <div className="space-y-5 p-5 sm:p-6">
                      <div>
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span className="bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold">
                            <Layers className="h-3.5 w-3.5" />
                            {formatLabel(item.section)}
                          </span>
                          <span
                            className={`inline-flex rounded-lg border px-2.5 py-1 text-xs font-semibold ${getStatusStyle(
                              item.status
                            )}`}
                          >
                            {getStatusLabel(item.status)}
                          </span>
                          <span className="theme-card-soft theme-text-secondary inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold">
                            <ArrowUpDown className="h-3.5 w-3.5" />
                            Urutan {item.urutan ?? 1}
                          </span>
                        </div>

                        <h2 className="theme-text text-2xl font-bold leading-tight sm:text-3xl">
                          {item.judul || "Tanpa Judul"}
                        </h2>

                        {item.subJudul && (
                          <p className="theme-text-secondary mt-2 text-sm leading-6">
                            {item.subJudul}
                          </p>
                        )}
                      </div>

                      <div>
                        <h3 className="theme-text mb-2 flex items-center gap-2 text-sm font-bold">
                          <FileText className="h-4 w-4" />
                          Konten
                        </h3>
                        <div className="theme-card-soft theme-border rounded-xl border p-4">
                          <p className="theme-text-secondary whitespace-pre-wrap break-words text-sm leading-7">
                            {item.konten || "Belum ada konten."}
                          </p>
                        </div>
                      </div>

                      {(item.ctaText || item.ctaLink) && (
                        <div>
                          <h3 className="theme-text mb-2 flex items-center gap-2 text-sm font-bold">
                            <LinkIcon className="h-4 w-4" />
                            Call to Action
                          </h3>
                          <div className="theme-card-soft theme-border flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0">
                              <p className="theme-text text-sm font-semibold">
                                {item.ctaText || "Tanpa teks tombol"}
                              </p>
                              <p className="theme-text-secondary mt-1 break-all text-xs">
                                {resolvedCtaLink || "Tanpa link"}
                              </p>
                            </div>
                            {resolvedCtaLink && (
                              <a
                                href={resolvedCtaLink}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </section>
                </div>

                <div className="space-y-4">
                  <section className="theme-card theme-border rounded-2xl border p-5">
                    <h3 className="theme-text mb-4 text-sm font-bold">Informasi Halaman</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="theme-text-muted text-xs">Judul Halaman</p>
                        <p className="theme-text mt-1 text-sm font-semibold">
                          {item?.halamanCms?.judul || "-"}
                        </p>
                      </div>
                      <div>
                        <p className="theme-text-muted text-xs">Slug</p>
                        <p className="theme-text mt-1 break-all text-sm font-mono">
                          {item?.halamanCms?.slug ? `/${item.halamanCms.slug}` : "-"}
                        </p>
                      </div>
                      <div>
                        <p className="theme-text-muted text-xs">Halaman CMS ID</p>
                        <p className="theme-text mt-1 break-all text-sm font-mono">
                          {item?.halamanCmsId ?? item?.halamanCms?.id ?? "-"}
                        </p>
                      </div>
                    </div>
                  </section>

                  <section className="theme-card theme-border rounded-2xl border p-5">
                    <h3 className="theme-text mb-4 text-sm font-bold">Metadata</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="theme-text-muted text-xs">ID Konfigurasi</p>
                        <p className="theme-text mt-1 break-all text-sm font-mono">
                          {item.id ?? "-"}
                        </p>
                      </div>
                      <div>
                        <p className="theme-text-muted text-xs">Section</p>
                        <p className="theme-text mt-1 text-sm font-semibold">
                          {formatLabel(item.section)}
                        </p>
                      </div>
                      <div>
                        <p className="theme-text-muted text-xs">Urutan</p>
                        <p className="theme-text mt-1 text-sm font-semibold">
                          {item.urutan ?? 1}
                        </p>
                      </div>
                      <div>
                        <p className="theme-text-muted text-xs">Status</p>
                        <span
                          className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                            item.status
                          )}`}
                        >
                          {getStatusLabel(item.status)}
                        </span>
                      </div>
                    </div>
                  </section>

                  {(item.createdAt || item.updatedAt) && (
                    <section className="theme-card theme-border rounded-2xl border p-5">
                      <h3 className="theme-text mb-4 text-sm font-bold">Riwayat</h3>
                      <div className="space-y-4">
                        {item.createdAt && (
                          <div>
                            <p className="theme-text-muted text-xs">Dibuat</p>
                            <p className="theme-text mt-1 text-sm">
                              {formatDateTime(item.createdAt)}
                            </p>
                          </div>
                        )}
                        {item.updatedAt && (
                          <div>
                            <p className="theme-text-muted text-xs">Terakhir diperbarui</p>
                            <p className="theme-text mt-1 text-sm">
                              {formatDateTime(item.updatedAt)}
                            </p>
                          </div>
                        )}
                      </div>
                    </section>
                  )}
                </div>
              </div>
            )}

            <footer className="py-7 text-center">
              <p className="theme-text-muted text-xs">© 2026 SmartSchool • CMS Management</p>
            </footer>
          </div>
        </main>
      </div>

      {deleteOpen && item && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="theme-card theme-border w-full max-w-md rounded-2xl border shadow-2xl">
            <div className="p-6">
              <div className="theme-danger flex h-11 w-11 items-center justify-center rounded-xl">
                <Trash2 className="h-5 w-5" />
              </div>
              <h3 className="theme-text mt-4 text-lg font-bold">
                Nonaktifkan konfigurasi?
              </h3>
              <p className="theme-text-secondary mt-2 text-sm leading-6">
                Konfigurasi{" "}
                <strong className="theme-text">
                  &quot;{item.judul || "Tanpa Judul"}&quot;
                </strong>{" "}
                akan dinonaktifkan melalui endpoint backend.
              </p>
            </div>
            <div className="theme-card-soft theme-border flex flex-col-reverse gap-2 border-t p-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteOpen(false)}
                className="theme-card theme-border theme-text-secondary rounded-xl border px-4 py-2.5 text-sm font-semibold disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-danger)] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Ya, Nonaktifkan
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}