"use client";

import { useParams } from "next/navigation";
import JalurFormPage from "@/app/components/spmb/JalurFormPage";

export default function EditJalurPage() {
  const params = useParams();

  const jalurId = Array.isArray(params?.id)
    ? params.id[0]
    : params?.id;

  return <JalurFormPage jalurId={jalurId} />;
}
