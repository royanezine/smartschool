import { Response } from "express";
import ExcelJS from "exceljs";

import { prisma } from "../config/db";
import { AuthRequest } from "../middlewares/auth.middleware";
import { successResponse } from "../utils/responseFormatter";

export const exportRekapNilai = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const sekolahId = req.user?.sekolahId;

        if (!sekolahId) {
            return res.status(403).json({
                success: false,
                message: "Akses ditolak",
            });
        }

        const { kelasId, kelasMapelId } = req.query;

        const nilaiWhere: any = {
            pengguna: {
                sekolahId,
            },
            dihapusOleh: null,
        };

        if (kelasId) {
            nilaiWhere.kelasMapel = {
                kelasId: String(kelasId),
            };
        }

        if (kelasMapelId) {
            nilaiWhere.kelasMapelId = String(kelasMapelId);
        }

        const nilai = await prisma.nilai.findMany({
            where: nilaiWhere,
            include: {
                pengguna: {
                    select: {
                        namaLengkap: true,
                        nisn: true,
                        nis: true,
                    },
                },
                kelasMapel: {
                    include: {
                        kelas: {
                            select: {
                                nama: true,
                            },
                        },
                        mataPelajaran: {
                            select: {
                                nama: true,
                            },
                        },
                    },
                },
                komponenNilai: {
                    select: {
                        nama: true,
                        jenis: true,
                        kelompok: true,
                    },
                },
            },
            orderBy: {
                pengguna: {
                    namaLengkap: "asc",
                },
            },
        });


        const hasilAsesmen = await prisma.hasilAsesmen.findMany({
            where: {
                dihapusOleh: null,
                percobaanAsesmen: {
                    pengguna: {
                        sekolahId,
                    },
                    asesmen: {
                        kelasMapel: {
                            ...(kelasMapelId
                                ? {
                                    id: String(kelasMapelId),
                                }
                                : {}),
                            ...(kelasId
                                ? {
                                    kelasId: String(kelasId),
                                }
                                : {}),
                        },
                    },
                },
            },
            include: {
                percobaanAsesmen: {
                    include: {
                        pengguna: {
                            select: {
                                namaLengkap: true,
                                nisn: true,
                                nis: true,
                            },
                        },
                        asesmen: {
                            include: {
                                kelasMapel: {
                                    include: {
                                        kelas: {
                                            select: {
                                                nama: true,
                                            },
                                        },
                                        mataPelajaran: {
                                            select: {
                                                nama: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: {
                percobaanAsesmen: {
                    pengguna: {
                        namaLengkap: "asc",
                    },
                },
            },
        });

        const workbook = new ExcelJS.Workbook();
        const worksheetUjian = workbook.addWorksheet("Hasil Asesmen");

        worksheetUjian.columns = [
            { header: "No", key: "no", width: 8 },
            { header: "Nama Siswa", key: "nama", width: 30 },
            { header: "NISN", key: "nisn", width: 20 },
            { header: "NIS", key: "nis", width: 20 },
            { header: "Kelas", key: "kelas", width: 20 },
            { header: "Mata Pelajaran", key: "mapel", width: 25 },
            { header: "Asesmen", key: "asesmen", width: 30 },
            { header: "Nilai", key: "nilai", width: 15 },
        ];

        hasilAsesmen.forEach((item, index) => {
            worksheetUjian.addRow({
                no: index + 1,
                nama: item.percobaanAsesmen.pengguna.namaLengkap,
                nisn: item.percobaanAsesmen.pengguna.nisn ?? "",
                nis: item.percobaanAsesmen.pengguna.nis ?? "",
                kelas: item.percobaanAsesmen.asesmen.kelasMapel.kelas.nama,
                mapel:
                    item.percobaanAsesmen.asesmen.kelasMapel.mataPelajaran.nama,
                asesmen: item.percobaanAsesmen.asesmen.judul,
                nilai: Number(item.totalNilai),
            });
        });

        worksheetUjian.getRow(1).font = {
            bold: true,
        };


        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        res.setHeader(
            "Content-Disposition",
            'attachment; filename="rekap-nilai.xlsx"'
        );

        await workbook.xlsx.write(res);

        res.end();
    } catch (error) {
        console.error("Error export rekap nilai:", error);

        return res.status(500).json({
            success: false,
            message: "Gagal mengekspor rekap nilai",
        });
    }
};