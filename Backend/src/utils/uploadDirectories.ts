import fs from "node:fs";
import path from "node:path";

export function ensureUploadDirectories(root = process.cwd()) {
  for (const folder of ["materi", "absensi", "biometrik", "izin", "ppdb", "buku", "nilai", "siswa", "logo", "avatar"]) {
    fs.mkdirSync(path.join(root, "uploads", folder), { recursive: true });
  }
}
