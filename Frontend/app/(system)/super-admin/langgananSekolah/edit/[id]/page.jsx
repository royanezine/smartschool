"use client";

import { useParams } from "next/navigation";
import LanggananForm from "@/app/components/LanggananForm";
import { dummyLangganan } from "../../../../../../lib/data";

export default function EditLanggananPage() {
  const params = useParams();
  const id = params.id;

  const initialData = dummyLangganan.find(
    (item) => item.id === id
  );

  if (!initialData) {
    return (
      <div className="theme-page theme-text min-h-full">
        <div className="flex min-h-[60vh] items-center justify-center px-4">
          <div className="theme-card theme-border w-full max-w-md rounded-2xl border p-8 text-center shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]">
              <span className="text-2xl">!</span>
            </div>

            <h2 className="text-lg font-bold theme-text">
              Data tidak ditemukan
            </h2>

            <p className="mt-2 text-sm theme-text-muted">
              Data langganan yang ingin diedit tidak tersedia.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="theme-page theme-text min-h-full">
      <div className="w-full px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <div className="mx-auto w-full max-w-[1400px]">
          <LanggananForm
            initialData={initialData}
            isEdit={true}
          />
        </div>
      </div>
    </div>
  );
}