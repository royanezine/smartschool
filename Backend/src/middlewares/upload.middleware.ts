import multer from "multer";
import path from "path";
import fs from "fs";
import { fileTypeFromFile } from "file-type";

const allowedImageMime = ["image/jpeg", "image/png"];
const allowedPdfMime = ["application/pdf"];
const allowedExcelMime = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

const validateMagicByte = async (
  filePath: string,
  allowedMimes: string[],
  errorMessage: string,
) => {
  const type = await fileTypeFromFile(filePath);
  if (!type || !allowedMimes.includes(type.mime)) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    throw new Error(errorMessage);
  }
};

// --- KONFIGURASI IZIN ---
const storageIzin = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(process.cwd(), "uploads/izin");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `bukti-izin-${uniqueSuffix}${ext}`);
  },
});

export const uploadBuktiIzin = multer({
  storage: storageIzin,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = [".png", ".jpg", ".jpeg", ".pdf"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Format file tidak didukung. Hanya JPG, PNG, atau PDF."));
    }
  },
});

// --- KONFIGURASI BIOMETRIK ---
const storageBiometrik = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(process.cwd(), "uploads/biometrik");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `face-${uniqueSuffix}${ext}`);
  },
});

export const uploadBiometrik = multer({
  storage: storageBiometrik,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = [".png", ".jpg", ".jpeg"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Format gambar tidak didukung. Hanya JPG/PNG."));
    }
  },
});

// --- KONFIGURASI SISWA ---
const storageSiswa = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join(process.cwd(), "uploads/siswa");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `siswa-${uniqueSuffix}${path.extname(file.originalname).toLowerCase()}`);
  },
});

export const uploadSiswa = multer({
  storage: storageSiswa,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (path.extname(file.originalname).toLowerCase() === ".xlsx") {
      cb(null, true);
    } else {
      cb(new Error("Format file tidak didukung. Hanya gunakan file .xlsx."));
    }
  },
});

// --- KONFIGURASI NILAI EXCEL ---
const storageNilaiExcel = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join(process.cwd(), "uploads/nilai-temp");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, _file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `nilai-${uniqueSuffix}.xlsx`);
  },
});

export const uploadNilaiExcel = multer({
  storage: storageNilaiExcel,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== ".xlsx") return cb(null, false);
    cb(null, true);
  },
});

// --- KONFIGURASI BUKU ---
const storageBuku = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(process.cwd(), "uploads/buku");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

export const uploadBuku = multer({
  storage: storageBuku,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = [".png", ".jpg", ".jpeg", ".pdf"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Format file tidak didukung. Cover harus JPG/PNG, dan Ebook harus PDF."));
    }
  },
});

// --- EXPORT MIDDLEWARE VALIDASI MAGIC BYTE (UNTUK DIPASANG DI ROUTES) ---
export const verifyMagicByteIzin = async (req: any, res: any, next: any) => {
  if (!req.file) return next();
  try {
    await validateMagicByte(req.file.path, [...allowedImageMime, ...allowedPdfMime], "File terdeteksi palsu atau berbahaya. Harus JPG, PNG, atau PDF asli.");
    next();
  } catch (error: any) {
    next(error);
  }
};

export const verifyMagicByteSiswa = async (req: any, res: any, next: any) => {
  if (!req.file) return next();
  try {
    await validateMagicByte(req.file.path, allowedExcelMime, "File terdeteksi palsu atau berbahaya. Harus file Excel (.xlsx) asli.");
    next();
  } catch (error: any) {
    next(error);
  }
};

export const verifyMagicByteBuku = async (req: any, res: any, next: any) => {
  if (!req.files) return next();
  try {
    const files = req.files as any;
    const listFiles = Object.values(files).flat() as any[];
    for (const f of listFiles) {
      if (f.fieldname === "coverUrl") {
        await validateMagicByte(f.path, allowedImageMime, "Cover terdeteksi palsu. Harus JPG/PNG asli.");
      } else if (f.fieldname === "urlEbook") {
        await validateMagicByte(f.path, allowedPdfMime, "E-book terdeteksi palsu. Harus PDF asli.");
      }
    }
    next();
  } catch (error: any) {
    next(error);
  }
};