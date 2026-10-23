// "use client";

// import { useCallback, useEffect, useState } from "react";
// import { useParams, useRouter } from "next/navigation";

// import Sidebar from "@/app/components/Sidebar";
// import Header from "@/app/components/Header";
// import { apiFetch } from "../../../../../../../lib/api";

// import {
//   ArrowLeft,
//   Save,
//   Loader2,
//   AlertCircle,
//   CheckCircle2,
//   Image as ImageIcon,
//   X,
// } from "lucide-react";

// const API_URL = "/api/cms/menu-konfigurasi";

// function unwrapData(result) {
//   let data = result?.data ?? result;
//   for (let i = 0; i < 3; i += 1) {
//     if (data && !Array.isArray(data) && typeof data === "object" && "data" in data) {
//       data = data.data;
//     } else break;
//   }
//   return data;
// }

// function getErrorMessage(error, fallback) {
//   return error?.message || fallback;
// }

// export default function CmsMenuEditPage() {
//   const params = useParams();
//   const router = useRouter();
//   const id = params?.id;

//   const [active, setActive] = useState("menu");
//   const [collapsed, setCollapsed] = useState(false);

//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");
//   const [notFound, setNotFound] = useState(false);

//   const [formData, setFormData] = useState({
//     halaman: "",
//     section: "",
//     judul: "",
//     subJudul: "",
//     konten: "",
//     gambarUrl: "",
//     ctaText: "",
//     ctaLink: "",
//     urutan: 1,
//     status: "aktif",
//   });

//   // ================= FETCH EXISTING =================
//   const fetchDetail = useCallback(async () => {
//     if (!id) return;
//     try {
//       setLoading(true);
//       setError("");
//       const result = await apiFetch(`${API_URL}/${id}`);
//       const data = unwrapData(result);
//       const item = Array.isArray(data) ? data[0] : data;

//       if (!item) {
//         setNotFound(true);
//         return;
//       }

//       setFormData({
//         halaman: item.halaman || "beranda",
//         section: item.section || "hero",
//         judul: item.judul || "",
//         subJudul: item.subJudul || "",
//         konten: item.konten || "",
//         gambarUrl: item.gambarUrl || "",
//         ctaText: item.ctaText || "",
//         ctaLink: item.ctaLink || "",
//         urutan: Number(item.urutan) || 1,
//         status: item.status || "aktif",
//       });
//     } catch (err) {
//       setError(getErrorMessage(err, "Gagal mengambil data konfigurasi."));
//     } finally {
//       setLoading(false);
//     }
//   }, [id]);

//   useEffect(() => {
//     fetchDetail();
//   }, [fetchDetail]);

//   const handleChange = (event) => {
//     const { name, value } = event.target;
//     setFormData((cur) => ({ ...cur, [name]: value }));
//   };

//   // ================= SUBMIT =================
//   const handleSubmit = async (event) => {
//     event.preventDefault();

//     const halaman = formData.halaman.trim();
//     const section = formData.section.trim();
//     const judul = formData.judul.trim();

//     if (!halaman) return setError("Nama halaman wajib diisi.");
//     if (!section) return setError("Section wajib diisi.");
//     if (!judul) return setError("Judul wajib diisi.");

//     const parsedUrutan = Number(formData.urutan);
//     if (!Number.isInteger(parsedUrutan) || parsedUrutan < 1) {
//       return setError("Urutan harus berupa angka bulat minimal 1.");
//     }

//     const payload = {
//       halaman,
//       section,
//       judul,
//       subJudul: formData.subJudul.trim() || null,
//       konten: formData.konten || null,
//       gambarUrl: formData.gambarUrl.trim() || null,
//       ctaText: formData.ctaText.trim() || null,
//       ctaLink: formData.ctaLink.trim() || null,
//       urutan: parsedUrutan,
//       status: formData.status,
//     };

//     try {
//       setSaving(true);
//       setError("");
//       setSuccess("");

//       await apiFetch(`${API_URL}/${id}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       setSuccess("Konfigurasi menu berhasil diperbarui.");
//       setTimeout(() => router.push(`/admin/cms/menu/${id}`), 800);
//     } catch (err) {
//       setError(getErrorMessage(err, "Gagal menyimpan perubahan."));
//     } finally {
//       setSaving(false);
//     }
//   };

//   // ================= LOADING =================
//   if (loading) {
//     return (
//       <div className="theme-page flex min-h-screen w-full">
//         <Sidebar active={active} setActive={setActive} collapsed={collapsed} setCollapsed={setCollapsed} />
//         <div className="flex min-w-0 flex-1 flex-col">
//           <Header title="Edit Konfigurasi Menu" user={{ name: "CMS Admin", email: "cms@smartschool.com", avatar: "CA" }} />
//           <main className="flex flex-1 items-center justify-center">
//             <div className="text-center">
//               <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-[var(--color-primary)]" />
//               <p className="theme-text text-sm font-semibold">Memuat data...</p>
//             </div>
//           </main>
//         </div>
//       </div>
//     );
//   }

//   // ================= NOT FOUND =================
//   if (notFound) {
//     return (
//       <div className="theme-page flex min-h-screen w-full">
//         <Sidebar active={active} setActive={setActive} collapsed={collapsed} setCollapsed={setCollapsed} />
//         <div className="flex min-w-0 flex-1 flex-col">
//           <Header title="Edit Konfigurasi Menu" user={{ name: "CMS Admin", email: "cms@smartschool.com", avatar: "CA" }} />
//           <main className="flex flex-1 items-center justify-center p-6">
//             <div className="theme-card theme-border w-full max-w-md rounded-2xl border p-6 text-center">
//               <AlertCircle className="theme-text-muted mx-auto h-10 w-10" />
//               <h2 className="theme-text mt-4 text-lg font-bold">Data tidak ditemukan</h2>
//               <button type="button" onClick={() => router.push("/admin/cms/menu")}
//                 className="theme-primary mt-5 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold">
//                 <ArrowLeft className="h-4 w-4" /> Kembali ke Daftar
//               </button>
//             </div>
//           </main>
//         </div>
//       </div>
//     );
//   }

//   // ================= MAIN =================
//   return (
//     <div className="theme-page flex min-h-screen w-full">
//       <Sidebar active={active} setActive={setActive} collapsed={collapsed} setCollapsed={setCollapsed} />
//       <div className="flex min-w-0 flex-1 flex-col">
//         <Header title="Edit Konfigurasi Menu" user={{ name: "CMS Admin", email: "cms@smartschool.com", avatar: "CA" }} />

//         <main className="theme-page min-w-0 flex-1 overflow-y-auto">
//           <div className="mx-auto w-full max-w-4xl px-3 py-5 sm:px-6 lg:px-9">

//             <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//               <div className="flex items-center gap-3">
//                 <button type="button" onClick={() => router.push(`/admin/cms/menu/${id}`)}
//                   className="theme-card theme-border theme-text-secondary inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-sm font-semibold">
//                   <ArrowLeft className="h-4 w-4" /> Kembali
//                 </button>
//                 <div>
//                   <h1 className="theme-text text-2xl font-bold">Edit Konfigurasi</h1>
//                   <p className="theme-text-secondary mt-1 text-sm">Perbarui data konfigurasi menu website.</p>
//                 </div>
//               </div>
//             </div>

//             {error && (
//               <div className="theme-danger mb-4 flex items-start gap-3 rounded-xl border p-4">
//                 <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
//                 <div className="min-w-0 flex-1 text-sm">{error}</div>
//                 <button type="button" onClick={() => setError("")}><X className="h-4 w-4" /></button>
//               </div>
//             )}

//             {success && (
//               <div className="theme-success mb-4 flex items-start gap-3 rounded-xl border p-4">
//                 <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
//                 <div className="min-w-0 flex-1 text-sm">{success}</div>
//               </div>
//             )}

//             <form onSubmit={handleSubmit} className="theme-card theme-border rounded-2xl border">
//               <div className="space-y-5 p-5 sm:p-6">

//                 <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
//                   <div>
//                     <label className="theme-text mb-2 block text-sm font-semibold">
//                       Halaman <span className="text-red-500">*</span>
//                     </label>
//                     <input required name="halaman" value={formData.halaman} onChange={handleChange}
//                       className="theme-input w-full rounded-xl border px-3 py-3 text-sm outline-none focus:border-[var(--color-primary)]" />
//                   </div>
//                   <div>
//                     <label className="theme-text mb-2 block text-sm font-semibold">
//                       Section <span className="text-red-500">*</span>
//                     </label>
//                     <input required name="section" value={formData.section} onChange={handleChange}
//                       className="theme-input w-full rounded-xl border px-3 py-3 text-sm outline-none focus:border-[var(--color-primary)]" />
//                   </div>
//                 </div>

//                 <div>
//                   <label className="theme-text mb-2 block text-sm font-semibold">
//                     Judul <span className="text-red-500">*</span>
//                   </label>
//                   <input required name="judul" value={formData.judul} onChange={handleChange}
//                     className="theme-input w-full rounded-xl border px-3 py-3 text-sm outline-none focus:border-[var(--color-primary)]" />
//                 </div>

//                 <div>
//                   <label className="theme-text mb-2 block text-sm font-semibold">Subjudul</label>
//                   <input name="subJudul" value={formData.subJudul} onChange={handleChange}
//                     className="theme-input w-full rounded-xl border px-3 py-3 text-sm outline-none focus:border-[var(--color-primary)]" />
//                 </div>

//                 <div>
//                   <label className="theme-text mb-2 block text-sm font-semibold">Konten</label>
//                   <textarea rows={6} name="konten" value={formData.konten} onChange={handleChange}
//                     className="theme-input w-full rounded-xl border px-3 py-3 text-sm leading-6 outline-none focus:border-[var(--color-primary)]" />
//                 </div>

//                 <div>
//                   <label className="theme-text mb-2 block text-sm font-semibold">URL Gambar</label>
//                   <input name="gambarUrl" type="url" value={formData.gambarUrl} onChange={handleChange}
//                     placeholder="https://contoh.com/gambar.jpg"
//                     className="theme-input w-full rounded-xl border px-3 py-3 text-sm outline-none focus:border-[var(--color-primary)]" />
//                   {formData.gambarUrl && (
//                     <div className="theme-card-soft mt-3 overflow-hidden rounded-xl border p-2">
//                       <img src={formData.gambarUrl} alt="Preview"
//                         className="max-h-56 w-full rounded-lg object-contain"
//                         onError={(e) => { e.currentTarget.style.display = "none"; }} />
//                     </div>
//                   )}
//                   {!formData.gambarUrl && (
//                     <div className="theme-card-soft mt-3 flex items-center gap-2 rounded-xl border p-3">
//                       <ImageIcon className="theme-text-muted h-4 w-4" />
//                       <span className="theme-text-muted text-xs">Belum ada gambar</span>
//                     </div>
//                   )}
//                 </div>

//                 <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
//                   <div>
//                     <label className="theme-text mb-2 block text-sm font-semibold">Teks tombol CTA</label>
//                     <input name="ctaText" value={formData.ctaText} onChange={handleChange}
//                       className="theme-input w-full rounded-xl border px-3 py-3 text-sm outline-none focus:border-[var(--color-primary)]" />
//                   </div>
//                   <div>
//                     <label className="theme-text mb-2 block text-sm font-semibold">Link tombol CTA</label>
//                     <input name="ctaLink" value={formData.ctaLink} onChange={handleChange}
//                       className="theme-input w-full rounded-xl border px-3 py-3 text-sm outline-none focus:border-[var(--color-primary)]" />
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
//                   <div>
//                     <label className="theme-text mb-2 block text-sm font-semibold">Urutan</label>
//                     <input required type="number" min="1" step="1" name="urutan"
//                       value={formData.urutan} onChange={handleChange}
//                       className="theme-input w-full rounded-xl border px-3 py-3 text-sm outline-none focus:border-[var(--color-primary)]" />
//                   </div>
//                   <div>
//                     <label className="theme-text mb-2 block text-sm font-semibold">Status</label>
//                     <select name="status" value={formData.status} onChange={handleChange}
//                       className="theme-input w-full rounded-xl border px-3 py-3 text-sm outline-none focus:border-[var(--color-primary)]">
//                       <option value="aktif">Aktif</option>
//                       <option value="nonaktif">Nonaktif</option>
//                       <option value="draft">Draft</option>
//                     </select>
//                   </div>
//                 </div>
//               </div>

//               <div className="theme-card-soft theme-border flex flex-col-reverse gap-2 border-t p-4 sm:flex-row sm:justify-end">
//                 <button type="button" disabled={saving} onClick={() => router.push(`/admin/cms/menu/${id}`)}
//                   className="theme-card theme-border theme-text-secondary rounded-xl border px-4 py-2.5 text-sm font-semibold disabled:opacity-50">
//                   Batal
//                 </button>
//                 <button type="submit" disabled={saving}
//                   className="theme-primary inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60">
//                   {saving ? (
//                     <><Loader2 className="h-4 w-4 animate-spin" /> Menyimpan...</>
//                   ) : (
//                     <><Save className="h-4 w-4" /> Simpan Perubahan</>
//                   )}
//                 </button>
//               </div>
//             </form>

//             <footer className="py-7 text-center">
//               <p className="theme-text-muted text-xs">© 2026 SmartSchool • CMS Management</p>
//             </footer>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }