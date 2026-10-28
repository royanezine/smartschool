
import Link from "next/link";
import { notFound } from "next/navigation";
import { publikService } from "@/services/publik.service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function unwrapResponse(response) {
  let result = response;

  for (let i = 0; i < 8; i++) {
    if (
      !result ||
      typeof result !== "object" ||
      Array.isArray(result) ||
      !Object.prototype.hasOwnProperty.call(result, "data")
    ) {
      break;
    }

    result = result.data;
  }

  return result;
}

export default async function HalamanCmsPublik({ params }) {
  const { tenant, slug } = await params;

  let halaman;

  try {
    const response = await publikService.getHalamanBySlug(
      tenant,
      slug
    );

    halaman = unwrapResponse(response);

    if (
      halaman &&
      typeof halaman === "object" &&
      halaman.halaman &&
      typeof halaman.halaman === "object"
    ) {
      halaman = halaman.halaman;
    }
  } catch (error) {
    const status = error?.status ?? error?.response?.status;

    console.error("[HALAMAN CMS PUBLIK]", {
      tenant,
      slug,
      status,
      message: error?.message,
    });

    if (status === 404) {
      notFound();
    }

    return (
      <main className="min-h-screen bg-slate-50 px-5 py-20">
        <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">
            Halaman belum dapat dimuat
          </h1>
          <p className="mt-3 leading-7 text-slate-600">
            Silakan coba beberapa saat lagi. Jika masalah berlanjut,
            periksa koneksi ke server.
          </p>
          <Link
            href={`/${tenant}`}
            className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </main>
    );
  }

  if (
    !halaman ||
    typeof halaman !== "object" ||
    Array.isArray(halaman) ||
    !halaman.slug ||
    String(halaman.slug).toLowerCase() !==
      String(slug).toLowerCase()
  ) {
    notFound();
  }

  const judul = halaman.judul ?? halaman.title ?? "Halaman Sekolah";
  const konten = halaman.konten ?? halaman.content ?? "";
  const gambarUrl = halaman.gambarUrl ?? halaman.gambar ?? "";
  const subJudul = halaman.subJudul ?? halaman.ringkasan ?? "";

  const tanggal = halaman.diperbaruiPada
    ? new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(halaman.diperbaruiPada))
    : null;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800">
      {/* Hero halaman */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-blue-700">
        <div
          aria-hidden="true"
          className="absolute -right-20 -top-24 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-cyan-300/10 blur-3xl"
        />

        <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-10 sm:px-8 sm:pb-20 sm:pt-14">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-2 text-sm text-blue-100"
          >
            <Link
              href={`/${tenant}`}
              className="transition hover:text-white hover:underline"
            >
              Beranda
            </Link>
            <span aria-hidden="true">/</span>
            <span className="font-medium text-white">{judul}</span>
          </nav>

          <div className="mt-10 max-w-4xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-blue-50">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
              Informasi Sekolah
            </span>

            <h1 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
              {judul}
            </h1>

            {subJudul && (
              <p className="mt-5 max-w-3xl text-base leading-8 text-blue-100 sm:text-lg">
                {subJudul}
              </p>
            )}

            {tanggal && (
              <p className="mt-5 text-sm text-blue-200">
                Terakhir diperbarui {tanggal}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Konten halaman */}
      <section className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-10">
          <article className="min-w-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            {gambarUrl && (
              <div className="border-b border-slate-100 bg-slate-100">
                <img
                  src={gambarUrl}
                  alt={judul}
                  className="max-h-[460px] w-full object-cover"
                />
              </div>
            )}

            <div className="px-5 py-7 sm:px-8 sm:py-10">
              {konten ? (
                <div
                  className={[
                    "cms-content",
                    "break-words text-base leading-8 text-slate-700",
                    "[&_h1]:mb-5 [&_h1]:mt-8 [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:leading-tight [&_h1]:text-slate-900",
                    "[&_h2]:mb-4 [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:leading-snug [&_h2]:text-slate-900",
                    "[&_h3]:mb-3 [&_h3]:mt-7 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-slate-900",
                    "[&_p]:mb-5 [&_p]:leading-8",
                    "[&_ul]:mb-6 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6",
                    "[&_ol]:mb-6 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6",
                    "[&_li]:ps-1",
                    "[&_a]:font-medium [&_a]:text-blue-700 [&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-blue-900",
                    "[&_blockquote]:my-6 [&_blockquote]:border-l-4 [&_blockquote]:border-blue-500 [&_blockquote]:bg-blue-50 [&_blockquote]:px-5 [&_blockquote]:py-4 [&_blockquote]:text-slate-700",
                    "[&_img]:my-6 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-xl",
                    "[&_table]:my-6 [&_table]:w-full [&_table]:border-collapse",
                    "[&_th]:border [&_th]:border-slate-200 [&_th]:bg-slate-50 [&_th]:px-4 [&_th]:py-3 [&_th]:text-left [&_th]:font-semibold",
                    "[&_td]:border [&_td]:border-slate-200 [&_td]:px-4 [&_td]:py-3",
                    "[&_hr]:my-8 [&_hr]:border-slate-200",
                    "[&_strong]:font-bold [&_b]:font-bold",
                  ].join(" ")}
                  dangerouslySetInnerHTML={{ __html: konten }}
                />
              ) : (
                <p className="text-slate-500">
                  Belum ada konten yang ditambahkan untuk halaman ini.
                </p>
              )}
            </div>

            <div className="border-t border-slate-100 px-5 py-5 sm:px-8">
              <Link
                href={`/${tenant}`}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              >
                <span aria-hidden="true">←</span>
                Kembali ke Beranda
              </Link>
            </div>
          </article>

          {/* Sidebar informasi */}
          <aside className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl text-blue-700">
                <span aria-hidden="true">i</span>
              </div>

              <h2 className="mt-4 text-lg font-bold text-slate-900">
                Informasi Sekolah
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Temukan informasi mengenai profil, program, dan berbagai
                informasi resmi sekolah melalui website ini.
              </p>

              <Link
                href={`/${tenant}`}
                className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Kunjungi Beranda
              </Link>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-6">
              <p className="text-sm font-semibold text-blue-900">
                Website Resmi Sekolah
              </p>
              <p className="mt-2 text-sm leading-6 text-blue-800/80">
                Informasi pada halaman ini ditampilkan berdasarkan konten
                yang dikelola melalui CMS sekolah.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-6 text-sm text-slate-500 sm:px-8 md:flex-row md:items-center md:justify-between">
          <p>Website Sekolah · SmartSchool</p>
          <Link
            href={`/${tenant}`}
            className="font-medium text-blue-700 hover:underline"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </footer>
    </main>
  );
}
