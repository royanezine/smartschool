"use client";

import {
  Check,
  FileText,
  UserPlus,
  ShieldCheck,
} from "lucide-react";

const steps = [
  {
    id: 1,
    label: "Daftar",
    description: "Isi data",
    icon: UserPlus,
  },
  {
    id: 2,
    label: "Berkas",
    description: "Upload dokumen",
    icon: FileText,
  },
  {
    id: 3,
    label: "Verifikasi",
    description: "Pemeriksaan",
    icon: ShieldCheck,
  },
  {
    id: 4,
    label: "Selesai",
    description: "Hasil PPDB",
    icon: Check,
  },
];

export default function PpdbStepper({
  currentStep = 1,
}) {
  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
      <div className="flex items-start justify-between">

        {steps.map((step, index) => {
          const Icon = step.icon;

          const completed =
            currentStep > step.id;

          const active =
            currentStep === step.id;

          return (
            <div
              key={step.id}
              className="flex min-w-0 flex-1 items-start"
            >
              <div className="flex min-w-0 flex-col items-center">

                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition ${
                    completed
                      ? "border-blue-600 bg-blue-600 text-white"
                      : active
                      ? "border-blue-600 bg-blue-50 text-blue-600"
                      : "border-slate-200 bg-white text-slate-400"
                  }`}
                >
                  <Icon size={18} />
                </div>

                <p
                  className={`mt-2 text-xs font-semibold sm:text-sm ${
                    active ||
                    completed
                      ? "text-slate-900"
                      : "text-slate-400"
                  }`}
                >
                  {step.label}
                </p>

                <p className="mt-0.5 hidden text-center text-[11px] text-slate-400 sm:block">
                  {step.description}
                </p>
              </div>

              {index <
                steps.length - 1 && (
                <div
                  className={`mx-2 mt-5 h-0.5 flex-1 ${
                    currentStep >
                    step.id
                      ? "bg-blue-600"
                      : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}