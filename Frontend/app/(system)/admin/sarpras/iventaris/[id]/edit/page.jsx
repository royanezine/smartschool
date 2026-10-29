"use client";

import { useParams } from "next/navigation";
import { getAsetById, updateAset } from "@/services/sarpras.service";
import InventarisForm from "../../InventarisForm";

export default function EditInventarisPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  return <InventarisForm mode="edit" id={id || ""} />;
}
