import FormData from "form-data";
import axios from "axios";
import fs from "fs";
import type { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { AppError } from "../utils/appError";
import { successResponse } from "../utils/responseFormatter";
import { prisma } from "../config/db";

export const registerFaceIdByAdmin = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const { targetUserId } = req.body;
    const file = req.file;

    if (!file) throw new AppError("Foto wajah wajib diunggah", 400);

    const formData = new FormData();
    formData.append("image", fs.createReadStream(file.path));

    const aiServiceUrl = process.env.AI_SERVICE_URL || "http://localhost:8000";

    // 1. Ekstrak Embedding dari AI Server Python
    const aiResponse = await axios.post(
      `${aiServiceUrl}/extract-embedding`,
      formData,
      {
        headers: formData.getHeaders(),
      },
    );

    if (!aiResponse.data.success) {
      throw new AppError(
        "Gagal mendeteksi wajah atau mengekstrak embedding",
        400,
      );
    }

    // 2. Simpan path gambar dan raw embedding ke Database
    const biometrik = await prisma.biometrikWajah.upsert({
      where: { penggunaId: targetUserId },
      update: {
        urlFotoReferensi: `/uploads/biometrik/${file.filename}`,
        embeddingVector: aiResponse.data.embedding, // Disimpan sebagai JSON
        perangkat: "Didaftarkan Admin",
        status: "aktif",
        diperbaruiOleh: req.user?.userId,
      },
      create: {
        penggunaId: targetUserId,
        urlFotoReferensi: `/uploads/biometrik/${file.filename}`,
        embeddingVector: aiResponse.data.embedding,
        perangkat: "Didaftarkan Admin",
        status: "aktif",
        dibuatOleh: req.user?.userId,
      },
    });

    return successResponse(res, "Face ID berhasil didaftarkan", biometrik, 201);
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    console.error("Register Face ID Error:", error);
    throw new AppError("Gagal mendaftarkan Face ID", 500);
  }
};
