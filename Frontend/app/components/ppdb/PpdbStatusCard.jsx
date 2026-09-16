import {
  CheckCircle2,
  Clock3,
  XCircle,
  FileText,
} from "lucide-react";

const statusConfig = {
  menunggu: {
    label: "Menunggu Verifikasi",
    description:
      "Pendaftaran kamu sudah diterima dan sedang menunggu pemeriksaan.",
    icon: Clock3,
    className:
      "bg-amber-50 text-amber-700 border-amber-200",
  },

  lulus: {
    label: "Lulus",
    description:
      "Selamat! Pendaftaran kamu dinyatakan lulus.",
    icon: CheckCircle2,
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200",
  },

  ditolak: {
    label: "Ditolak",
    description:
      "Pendaftaran kamu belum dapat diterima.",
    icon: XCircle,
    className:
      "bg-red-50 text-red-700 border-red-200",
  },
};

export default function PpdbStatusCard({
  status = "menunggu",
  nomorPendaftaran,
  namaLengkap,
  kelasId,
}) {
  const config =
    statusConfig[
      String(status).toLowerCase()
    ] || statusConfig.menunggu;

  const Icon = config.icon;

  return (
    <div
      className={`rounded-2xl border p-5 ${config.className}`}
    >
      <div className="flex items-start gap-4">

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/80">
          <Icon size={22} />
        </div>

        <div className="min-w-0 flex-1">

          <p className="text-xs font-semibold uppercase tracking-wide opacity-70">
            Status PPDB
          </p>

          <h3 className="mt-1 text-lg font-bold">
            {config.label}
          </h3>

          <p className="mt-1 text-sm leading-6 opacity-80">
            {config.description}
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">

            {nomorPendaftaran && (
              <div className="rounded-xl bg-white/70 p-3">
                <p className="text-[11px] font-medium opacity-60">
                  Nomor Pendaftaran
                </p>

                <p className="mt-1 break-all text-sm font-bold">
                  {nomorPendaftaran}
                </p>
              </div>
            )}

            {namaLengkap && (
              <div className="rounded-xl bg-white/70 p-3">
                <p className="text-[11px] font-medium opacity-60">
                  Nama Pendaftar
                </p>

                <p className="mt-1 text-sm font-bold">
                  {namaLengkap}
                </p>
              </div>
            )}

            {kelasId && (
              <div className="rounded-xl bg-white/70 p-3">
                <p className="text-[11px] font-medium opacity-60">
                  Kelas
                </p>

                <p className="mt-1 text-sm font-bold">
                  {kelasId}
                </p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}