"use client";

import { useParams } from "next/navigation";
import { getGelombangPpdbById, updateGelombangPpdb } from "@/services/gelombangPpdb.service";
import GelombangFormPage from "@/app/components/spmb/GelombangFormPage";

export default function EditGelombangPage() {
  const params = useParams();

  const gelombangId = Array.isArray(params?.id)
    ? params.id[0]
    : params?.id;

  return <GelombangFormPage gelombangId={gelombangId} />;
}
