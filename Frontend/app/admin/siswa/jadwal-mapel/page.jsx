"use client";

import { useState, useMemo, useRef } from "react";
import * as XLSX from "xlsx";
import Header from "../../../components/Header";
import Sidebar from "../../../components/Sidebar";
import {
  CalendarDays,
  Clock,
  BookOpen,
  Users,
  Download,
  Upload,
  School,
  AlertCircle,
  CheckCircle2,
  X,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";

/* =========================================================
   DATA DASAR
========================================================= */

const KELAS_LIST = [
  "7A",
  "7B",
  "7C",
  "8A",
  "8B",
  "9A",
];

const HARI_LIST = [
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];

const PERIOD_TIMES = [
  "07.00 - 07.40",
  "07.40 - 08.20",
  "08.20 - 09.00",
  "09.00 - 09.15",
  "09.15 - 09.55",
  "09.55 - 10.35",
  "10.35 - 11.15",
  "11.15 - 11.55",
];

const MAPEL_POOL = [
  {
    mapel: "Matematika",
    guru: "Andi Prasetyo, S.Pd",
  },
  {
    mapel: "Bahasa Indonesia",
    guru: "Siti Rahayu, S.Pd",
  },
  {
    mapel: "Bahasa Inggris",
    guru: "Budi Santoso, S.Pd",
  },
  {
    mapel: "IPA",
    guru: "Dewi Anggraini, S.Si",
  },
  {
    mapel: "IPS",
    guru: "Fajar Ramadhan, S.Pd",
  },
  {
    mapel: "PPKn",
    guru: "Yeni Kusnadi, S.Pd",
  },
  {
    mapel: "Pendidikan Agama Islam",
    guru: "Ahmad Fauzi, S.Pd.I",
  },
  {
    mapel: "Seni Budaya",
    guru: "Lina Marlina, S.Pd",
  },
  {
    mapel: "PJOK",
    guru: "Deni Iskandar, S.Pd",
  },
  {
    mapel: "Prakarya",
    guru: "Ira Susanti, S.Pd",
  },
  {
    mapel: "Bahasa Sunda",
    guru: "Wati Rohaeti, S.Pd",
  },
  {
    mapel: "Bimbingan Konseling",
    guru: "Sri Wulandari, S.Pd",
  },
];

/* =========================================================
   BUILD JADWAL AWAL
========================================================= */

function buildJadwalKelas(offset) {
  const jadwal = {};

  HARI_LIST.forEach((hari, hariIdx) => {
    const jumlahSlot =
      hari === "Sabtu" ? 6 : 8;

    const slots = [];

    for (
      let slotIdx = 0;
      slotIdx < jumlahSlot;
      slotIdx++
    ) {
      const jam = PERIOD_TIMES[slotIdx];

      if (slotIdx === 3) {
        slots.push({
          jam,
          mapel: "Istirahat",
          guru: "-",
          tipe: "istirahat",
        });

        continue;
      }

      if (
        hari === "Senin" &&
        slotIdx === 0
      ) {
        slots.push({
          jam,
          mapel: "Upacara Bendera",
          guru: "Seluruh Guru",
          tipe: "upacara",
        });

        continue;
      }

      if (
        hari === "Sabtu" &&
        slotIdx === jumlahSlot - 1
      ) {
        slots.push({
          jam,
          mapel: "Ekstrakurikuler",
          guru: "Pembina Ekskul",
          tipe: "ekskul",
        });

        continue;
      }

      const poolIndex =
        (offset +
          hariIdx * 3 +
          slotIdx * 5) %
        MAPEL_POOL.length;

      const item = MAPEL_POOL[poolIndex];

      slots.push({
        jam,
        mapel: item.mapel,
        guru: item.guru,
        tipe: "reguler",
      });
    }

    jadwal[hari] = slots;
  });

  return jadwal;
}

function buildInitialJadwal() {
  const data = {};

  KELAS_LIST.forEach((kelas, idx) => {
    data[kelas] = buildJadwalKelas(
      idx * 4
    );
  });

  return data;
}

/* =========================================================
   STYLE CELL
========================================================= */

function cellStyle(tipe) {
  switch (tipe) {
    case "istirahat":
      return "bg-slate-50 text-slate-400";

    case "upacara":
      return "bg-amber-50 text-amber-700 border border-amber-200";

    case "ekskul":
      return "bg-violet-50 text-violet-700 border border-violet-200";

    default:
      return "bg-[#f5f8ff] text-slate-800 border border-slate-100";
  }
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function JadwalPelajaranPage() {
  const [isCollapsed, setIsCollapsed] =
    useState(false);

  const [jadwalData, setJadwalData] =
    useState(buildInitialJadwal);

  const [kelasAktif, setKelasAktif] =
    useState(KELAS_LIST[0]);

  const [importMsg, setImportMsg] =
    useState(null);

  const [showModal, setShowModal] =
    useState(false);

  const [editingData, setEditingData] =
    useState(null);

  const fileInputRef = useRef(null);

  /* =======================================================
     FORM
  ======================================================= */

  const [form, setForm] = useState({
    mapel: "",
    guru: "",
    tipe: "reguler",
  });

  /* =======================================================
     SIDEBAR
  ======================================================= */

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  /* =======================================================
     DATA KELAS AKTIF
  ======================================================= */

  const jadwalKelasAktif =
    jadwalData[kelasAktif];

  /* =======================================================
     STATISTIK
  ======================================================= */

  const totalMapelUnik = useMemo(() => {
    const set = new Set();

    Object.values(jadwalData).forEach(
      (jadwal) => {
        Object.values(jadwal).forEach(
          (slots) => {
            slots.forEach((s) => {
              if (
                s.tipe === "reguler" &&
                s.mapel !== "-"
              ) {
                set.add(s.mapel);
              }
            });
          }
        );
      }
    );

    return set.size;
  }, [jadwalData]);

  const totalJamPerMinggu =
    useMemo(() => {
      let total = 0;

      HARI_LIST.forEach((hari) => {
        jadwalKelasAktif[hari].forEach(
          (s) => {
            if (
              s.tipe === "reguler"
            ) {
              total += 1;
            }
          }
        );
      });

      return total;
    }, [jadwalKelasAktif]);

  const guruPengampu = useMemo(() => {
    const set = new Set();

    HARI_LIST.forEach((hari) => {
      jadwalKelasAktif[hari].forEach(
        (s) => {
          if (
            s.tipe === "reguler" &&
            s.guru !== "-"
          ) {
            set.add(s.guru);
          }
        }
      );
    });

    return set.size;
  }, [jadwalKelasAktif]);

  /* =======================================================
     TAMBAH
  ======================================================= */

  function handleTambah(hari, slotIdx) {
    const slot =
      jadwalKelasAktif[hari][slotIdx];

    setEditingData({
      mode: "tambah",
      hari,
      slotIdx,
      jam: slot.jam,
    });

    setForm({
      mapel: "",
      guru: "",
      tipe: "reguler",
    });

    setShowModal(true);
  }

  /* =======================================================
     EDIT
  ======================================================= */

  function handleEdit(hari, slotIdx) {
    const slot =
      jadwalKelasAktif[hari][slotIdx];

    setEditingData({
      mode: "edit",
      hari,
      slotIdx,
      jam: slot.jam,
    });

    setForm({
      mapel:
        slot.mapel === "Istirahat" ||
        slot.mapel === "Upacara Bendera" ||
        slot.mapel === "Ekstrakurikuler"
          ? ""
          : slot.mapel,
      guru:
        slot.guru === "-"
          ? ""
          : slot.guru,
      tipe: slot.tipe,
    });

    setShowModal(true);
  }

  /* =======================================================
     HAPUS
  ======================================================= */

  function handleHapus(hari, slotIdx) {
    const slot =
      jadwalKelasAktif[hari][slotIdx];

    if (slot.tipe !== "reguler") {
      alert(
        "Jadwal khusus seperti Istirahat, Upacara, dan Ekstrakurikuler tidak dapat dihapus dari fitur ini."
      );

      return;
    }

    const yakin = window.confirm(
      `Hapus jadwal ${slot.mapel} pada ${hari} pukul ${slot.jam}?`
    );

    if (!yakin) return;

    setJadwalData((prev) => {
      const updated = {
        ...prev,
        [kelasAktif]: {
          ...prev[kelasAktif],
          [hari]: [
            ...prev[kelasAktif][hari],
          ],
        },
      };

      updated[kelasAktif][hari][
        slotIdx
      ] = {
        jam: slot.jam,
        mapel: "-",
        guru: "-",
        tipe: "reguler",
      };

      return updated;
    });
  }

  /* =======================================================
     SIMPAN FORM
  ======================================================= */

  function handleSave() {
    if (!editingData) return;

    const {
      hari,
      slotIdx,
      mode,
    } = editingData;

    if (
      form.tipe === "reguler" &&
      !form.mapel.trim()
    ) {
      alert(
        "Nama mata pelajaran wajib diisi."
      );

      return;
    }

    if (
      form.tipe === "reguler" &&
      !form.guru.trim()
    ) {
      alert(
        "Nama guru wajib diisi."
      );

      return;
    }

    let newSlot;

    if (form.tipe === "istirahat") {
      newSlot = {
        jam: PERIOD_TIMES[slotIdx],
        mapel: "Istirahat",
        guru: "-",
        tipe: "istirahat",
      };
    } else if (
      form.tipe === "upacara"
    ) {
      newSlot = {
        jam: PERIOD_TIMES[slotIdx],
        mapel: "Upacara Bendera",
        guru: "Seluruh Guru",
        tipe: "upacara",
      };
    } else if (
      form.tipe === "ekskul"
    ) {
      newSlot = {
        jam: PERIOD_TIMES[slotIdx],
        mapel: "Ekstrakurikuler",
        guru: "Pembina Ekskul",
        tipe: "ekskul",
      };
    } else {
      newSlot = {
        jam: PERIOD_TIMES[slotIdx],
        mapel: form.mapel.trim(),
        guru: form.guru.trim(),
        tipe: "reguler",
      };
    }

    setJadwalData((prev) => {
      const updated = {
        ...prev,
        [kelasAktif]: {
          ...prev[kelasAktif],
          [hari]: [
            ...prev[kelasAktif][hari],
          ],
        },
      };

      updated[kelasAktif][hari][
        slotIdx
      ] = newSlot;

      return updated;
    });

    setShowModal(false);
    setEditingData(null);

    setImportMsg({
      type: "sukses",
      text:
        mode === "edit"
          ? "Jadwal berhasil diperbarui."
          : "Jadwal berhasil ditambahkan.",
    });

    setTimeout(() => {
      setImportMsg(null);
    }, 3000);
  }

  /* =======================================================
     EXPORT EXCEL
  ======================================================= */

  function handleExportExcel() {
    const workbook =
      XLSX.utils.book_new();

    KELAS_LIST.forEach((kelas) => {
      const jadwal = jadwalData[kelas];

      const header = [
        "Jam",
        ...HARI_LIST,
      ];

      const rows = PERIOD_TIMES.map(
        (jam, rowIdx) => {
          const row = [jam];

          HARI_LIST.forEach(
            (hari) => {
              const slot =
                jadwal[hari][rowIdx];

              if (!slot) {
                row.push("-");
              } else if (
                slot.tipe ===
                "istirahat"
              ) {
                row.push("Istirahat");
              } else {
                row.push(
                  `${slot.mapel} — ${slot.guru}`
                );
              }
            }
          );

          return row;
        }
      );

      const worksheet =
        XLSX.utils.aoa_to_sheet([
          header,
          ...rows,
        ]);

      worksheet["!cols"] = [
        { wch: 14 },
        ...HARI_LIST.map(() => ({
          wch: 30,
        })),
      ];

      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        kelas
      );
    });

    const petunjuk =
      XLSX.utils.aoa_to_sheet([
        ["Petunjuk Import Jadwal"],
        [""],
        [
          "1. Satu sheet mewakili satu kelas.",
        ],
        [
          "2. Nama sheet harus sama dengan nama kelas.",
        ],
        [
          "3. Kolom A berisi jam pelajaran.",
        ],
        [
          "4. Format isi: Nama Mata Pelajaran — Nama Guru",
        ],
        [
          "5. Untuk istirahat tulis: Istirahat",
        ],
        [
          "6. Untuk upacara tulis: Upacara Bendera",
        ],
        [
          "7. Untuk ekstrakurikuler tulis: Ekstrakurikuler",
        ],
      ]);

    petunjuk["!cols"] = [
      { wch: 90 },
    ];

    XLSX.utils.book_append_sheet(
      workbook,
      petunjuk,
      "Petunjuk"
    );

    XLSX.writeFile(
      workbook,
      "jadwal-pelajaran-smartschool.xlsx"
    );
  }

  /* =======================================================
     IMPORT EXCEL
  ======================================================= */

  function handleImportExcel(e) {
    const file =
      e.target.files?.[0];

    if (!file) return;

    const reader =
      new FileReader();

    reader.onload = (evt) => {
      try {
        const workbook =
          XLSX.read(
            evt.target.result,
            {
              type: "array",
            }
          );

        const updated = {
          ...jadwalData,
        };

        let kelasDiimpor = 0;

        KELAS_LIST.forEach(
          (kelas) => {
            const sheet =
              workbook.Sheets[kelas];

            if (!sheet) return;

            const rows =
              XLSX.utils.sheet_to_json(
                sheet,
                {
                  header: 1,
                }
              );

            const dataRows =
              rows.slice(1);

            const jadwalBaru = {};

            HARI_LIST.forEach(
              (hari, hariIdx) => {
                const jumlahSlot =
                  hari === "Sabtu"
                    ? 6
                    : 8;

                const slots = [];

                for (
                  let slotIdx = 0;
                  slotIdx <
                  jumlahSlot;
                  slotIdx++
                ) {
                  const row =
                    dataRows[slotIdx];

                  const cell =
                    row
                      ? row[
                          hariIdx + 1
                        ]
                      : null;

                  const jam =
                    PERIOD_TIMES[
                      slotIdx
                    ];

                  if (
                    !cell ||
                    cell === "-"
                  ) {
                    slots.push({
                      jam,
                      mapel: "-",
                      guru: "-",
                      tipe: "reguler",
                    });
                  } else if (
                    String(cell)
                      .toLowerCase()
                      .includes(
                        "istirahat"
                      )
                  ) {
                    slots.push({
                      jam,
                      mapel: "Istirahat",
                      guru: "-",
                      tipe: "istirahat",
                    });
                  } else if (
                    String(cell)
                      .toLowerCase()
                      .includes(
                        "upacara"
                      )
                  ) {
                    slots.push({
                      jam,
                      mapel:
                        "Upacara Bendera",
                      guru:
                        "Seluruh Guru",
                      tipe: "upacara",
                    });
                  } else if (
                    String(cell)
                      .toLowerCase()
                      .includes(
                        "ekstrakurikuler"
                      )
                  ) {
                    slots.push({
                      jam,
                      mapel:
                        "Ekstrakurikuler",
                      guru:
                        "Pembina Ekskul",
                      tipe: "ekskul",
                    });
                  } else {
                    const [
                      mapel,
                      guru,
                    ] =
                      String(cell)
                        .split("—")
                        .map((s) =>
                          s.trim()
                        );

                    slots.push({
                      jam,
                      mapel:
                        mapel ||
                        String(cell),
                      guru:
                        guru || "-",
                      tipe: "reguler",
                    });
                  }
                }

                jadwalBaru[hari] =
                  slots;
              }
            );

            updated[kelas] =
              jadwalBaru;

            kelasDiimpor += 1;
          }
        );

        setJadwalData(updated);

        setImportMsg(
          kelasDiimpor > 0
            ? {
                type: "sukses",
                text: `Berhasil mengimpor jadwal untuk ${kelasDiimpor} kelas.`,
              }
            : {
                type: "gagal",
                text: "Tidak ada sheet yang cocok dengan nama kelas.",
              }
        );
      } catch (err) {
        console.error(err);

        setImportMsg({
          type: "gagal",
          text: "Gagal membaca file Excel.",
        });
      }
    };

    reader.readAsArrayBuffer(file);

    e.target.value = "";
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">

      {/* SIDEBAR */}

      <Sidebar
        active="jadwalPelajaran"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
        role="admin"
      />

      {/* CONTENT */}

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">

        {/* HEADER */}

        <Header
          toggleSidebar={toggleSidebar}
          notifications={[]}
          user={{
            name: "Admin Sekolah",
            email: "admin@smartschool.com",
            avatar: "AD",
          }}
        />

        {/* MAIN */}

        <main className="flex-1 overflow-y-auto">

          <div className="p-4 sm:p-6 lg:p-8 space-y-6">

            {/* PAGE HEADER */}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

              <div className="flex items-center gap-3">

                <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#155DFC] to-[#0d47c9] text-white shadow-lg shadow-slate-900/10">

                  <CalendarDays
                    size={20}
                  />

                </div>

                <div>

                  <h1 className="text-2xl font-bold text-slate-800">
                    Jadwal Mata Pelajaran
                  </h1>

                  <p className="text-sm text-slate-500">
                    Kelola jadwal mingguan
                    setiap kelas, Senin
                    sampai Sabtu.
                  </p>

                </div>

              </div>

              <div className="flex items-center gap-2 flex-wrap">

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={
                    handleImportExcel
                  }
                  accept=".xlsx,.xls"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  <Upload size={15} />
                  Import Excel
                </button>

                <button
                  type="button"
                  onClick={
                    handleExportExcel
                  }
                  className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-[#155DFC] to-[#0d47c9] text-white text-sm font-semibold hover:brightness-110 transition-all"
                >
                  <Download
                    size={15}
                  />
                  Export Excel
                </button>

              </div>

            </div>

            {/* MESSAGE */}

            {importMsg && (
              <div
                className={`flex items-center justify-between gap-2 px-4 py-3 rounded-xl text-sm font-medium ${
                  importMsg.type ===
                  "sukses"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-rose-50 text-rose-700 border border-rose-200"
                }`}
              >

                <div className="flex items-center gap-2">

                  {importMsg.type ===
                  "sukses" ? (
                    <CheckCircle2
                      size={15}
                    />
                  ) : (
                    <AlertCircle
                      size={15}
                    />
                  )}

                  {importMsg.text}

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setImportMsg(null)
                  }
                >
                  <X size={14} />
                </button>

              </div>
            )}

            {/* STATISTIK */}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

              <StatCard
                icon={School}
                title="Total Kelas"
                value={KELAS_LIST.length}
              />

              <StatCard
                icon={BookOpen}
                title="Mapel Diajarkan"
                value={totalMapelUnik}
              />

              <StatCard
                icon={Clock}
                title={`Jam/Minggu (${kelasAktif})`}
                value={totalJamPerMinggu}
              />

              <StatCard
                icon={Users}
                title={`Guru Pengampu (${kelasAktif})`}
                value={guruPengampu}
              />

            </div>

            {/* TAB KELAS */}

            <div className="flex flex-wrap items-center gap-2">

              {KELAS_LIST.map(
                (kelas) => (
                  <button
                    key={kelas}
                    type="button"
                    onClick={() =>
                      setKelasAktif(
                        kelas
                      )
                    }
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      kelasAktif ===
                      kelas
                        ? "bg-gradient-to-r from-[#155DFC] to-[#0d47c9] text-white shadow-sm"
                        : "bg-white text-slate-600 border border-slate-200 hover:bg-[#eaf1ff] hover:text-[#155DFC]"
                    }`}
                  >
                    Kelas {kelas}
                  </button>
                )
              )}

            </div>

            {/* INFO */}

            <div className="flex items-center justify-between gap-3">

              <div>

                <p className="text-sm font-semibold text-slate-700">
                  Jadwal Kelas{" "}
                  {kelasAktif}
                </p>

                <p className="text-xs text-slate-400 mt-1">
                  Klik tombol{" "}
                  <Plus
                    size={11}
                    className="inline"
                  />{" "}
                  untuk menambah jadwal.
                  Gunakan menu aksi untuk
                  edit atau hapus.
                </p>

              </div>

            </div>

            {/* JADWAL */}

            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">

              <div className="overflow-x-auto">

                <table className="w-full text-sm border-collapse min-w-[1100px]">

                  <thead>

                    <tr className="bg-gradient-to-r from-[#155DFC] to-[#0d47c9] text-white">

                      <th className="text-left font-semibold px-3 py-3 whitespace-nowrap w-28">
                        Jam
                      </th>

                      {HARI_LIST.map(
                        (hari) => (
                          <th
                            key={hari}
                            className="text-left font-semibold px-3 py-3 min-w-[175px]"
                          >
                            {hari}
                          </th>
                        )
                      )}

                    </tr>

                  </thead>

                  <tbody>

                    {PERIOD_TIMES.map(
                      (
                        jam,
                        rowIdx
                      ) => (

                        <tr
                          key={jam}
                          className="border-b border-slate-100 last:border-0"
                        >

                          {/* JAM */}

                          <td className="px-3 py-2.5 text-xs font-mono text-slate-500 whitespace-nowrap align-top">
                            {jam}
                          </td>

                          {/* HARI */}

                          {HARI_LIST.map(
                            (hari) => {

                              const slot =
                                jadwalKelasAktif[
                                  hari
                                ][
                                  rowIdx
                                ];

                              if (!slot) {
                                return (
                                  <td
                                    key={
                                      hari
                                    }
                                    className="px-2 py-2 align-top"
                                  >
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleTambah(
                                          hari,
                                          rowIdx
                                        )
                                      }
                                      className="w-full min-h-[72px] rounded-lg border border-dashed border-slate-200 text-slate-300 hover:border-[#155DFC] hover:text-[#155DFC] hover:bg-[#f7f9ff] transition-colors flex items-center justify-center"
                                    >
                                      <Plus
                                        size={
                                          17
                                        }
                                      />
                                    </button>
                                  </td>
                                );
                              }

                              const isEmpty =
                                slot.mapel ===
                                "-";

                              const isReguler =
                                slot.tipe ===
                                "reguler";

                              return (
                                <td
                                  key={
                                    hari
                                  }
                                  className="px-2 py-1.5 align-top"
                                >

                                  <div
                                    className={`group relative rounded-lg px-2.5 py-2 min-h-[70px] ${cellStyle(
                                      slot.tipe
                                    )}`}
                                  >

                                    {/* CONTENT */}

                                    <div className="pr-8">

                                      <p className="text-xs font-semibold leading-tight">

                                        {isEmpty
                                          ? "Belum ada jadwal"
                                          : slot.mapel}

                                      </p>

                                      {isReguler &&
                                        !isEmpty && (
                                          <p className="text-[10px] text-slate-500 mt-1 leading-tight">
                                            {
                                              slot.guru
                                            }
                                          </p>
                                        )}

                                    </div>

                                    {/* ACTION */}

                                    <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">

                                      {/* EDIT */}

                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleEdit(
                                            hari,
                                            rowIdx
                                          )
                                        }
                                        title="Edit jadwal"
                                        className="w-6 h-6 rounded-md bg-white border border-slate-200 text-[#155DFC] flex items-center justify-center hover:bg-[#eaf1ff] shadow-sm"
                                      >
                                        <Pencil
                                          size={
                                            11
                                          }
                                        />
                                      </button>

                                      {/* HAPUS */}

                                      {isReguler && (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleHapus(
                                              hari,
                                              rowIdx
                                            )
                                          }
                                          title="Hapus jadwal"
                                          className="w-6 h-6 rounded-md bg-white border border-slate-200 text-red-500 flex items-center justify-center hover:bg-red-50 shadow-sm"
                                        >
                                          <Trash2
                                            size={
                                              11
                                            }
                                          />
                                        </button>
                                      )}

                                    </div>

                                  </div>

                                </td>
                              );
                            }
                          )}

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            </div>

            {/* FOOTER INFO */}

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">

              <div className="flex items-center gap-2">

                <span className="w-3 h-3 rounded bg-[#f5f8ff] border border-slate-200" />

                Jadwal Pelajaran

              </div>

              <div className="flex items-center gap-2">

                <span className="w-3 h-3 rounded bg-amber-50 border border-amber-200" />

                Upacara

              </div>

              <div className="flex items-center gap-2">

                <span className="w-3 h-3 rounded bg-violet-50 border border-violet-200" />

                Ekstrakurikuler

              </div>

              <div className="flex items-center gap-2">

                <span className="w-3 h-3 rounded bg-slate-50 border border-slate-200" />

                Istirahat

              </div>

            </div>

          </div>

        </main>

      </div>

      {/* =====================================================
          MODAL TAMBAH / EDIT
      ===================================================== */}

      {showModal &&
        editingData && (

          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">

            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">

              {/* MODAL HEADER */}

              <div className="flex items-center justify-between p-5 border-b border-slate-200">

                <div>

                  <h2 className="text-lg font-bold text-slate-800">

                    {editingData.mode ===
                    "edit"
                      ? "Edit Jadwal"
                      : "Tambah Jadwal"}

                  </h2>

                  <p className="text-xs text-slate-500 mt-1">

                    Kelas {kelasAktif} •{" "}
                    {
                      editingData.hari
                    }{" "}
                    •{" "}
                    {
                      editingData.jam
                    }

                  </p>

                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowModal(
                      false
                    );
                    setEditingData(
                      null
                    );
                  }}
                  className="w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500"
                >
                  <X size={18} />
                </button>

              </div>

              {/* FORM */}

              <div className="p-5 space-y-4">

                {/* KELAS */}

                <div>

                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Kelas
                  </label>

                  <input
                    value={kelasAktif}
                    disabled
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-500"
                  />

                </div>

                {/* HARI */}

                <div>

                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Hari
                  </label>

                  <input
                    value={
                      editingData.hari
                    }
                    disabled
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-500"
                  />

                </div>

                {/* JAM */}

                <div>

                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Jam
                  </label>

                  <input
                    value={
                      editingData.jam
                    }
                    disabled
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-500"
                  />

                </div>

                {/* TIPE */}

                <div>

                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Tipe Jadwal
                  </label>

                  <select
                    value={form.tipe}
                    onChange={(e) =>
                      setForm(
                        (prev) => ({
                          ...prev,
                          tipe:
                            e.target
                              .value,
                        })
                      )
                    }
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#155DFC]/25 focus:border-[#155DFC]/50"
                  >

                    <option value="reguler">
                      Mata Pelajaran
                    </option>

                    <option value="istirahat">
                      Istirahat
                    </option>

                    <option value="upacara">
                      Upacara
                    </option>

                    <option value="ekskul">
                      Ekstrakurikuler
                    </option>

                  </select>

                </div>

                {/* MAPEL */}

                {form.tipe ===
                  "reguler" && (

                  <>

                    <div>

                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                        Mata Pelajaran
                      </label>

                      <input
                        type="text"
                        list="mapel-list"
                        value={
                          form.mapel
                        }
                        onChange={(e) =>
                          setForm(
                            (
                              prev
                            ) => ({
                              ...prev,
                              mapel:
                                e
                                  .target
                                  .value,
                            })
                          )
                        }
                        placeholder="Contoh: Matematika"
                        className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#155DFC]/25 focus:border-[#155DFC]/50"
                      />

                      <datalist id="mapel-list">

                        {MAPEL_POOL.map(
                          (
                            item,
                            idx
                          ) => (
                            <option
                              key={`${item.mapel}-${idx}`}
                              value={
                                item.mapel
                              }
                            />
                          )
                        )}

                      </datalist>

                    </div>

                    {/* GURU */}

                    <div>

                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                        Guru Pengampu
                      </label>

                      <input
                        type="text"
                        list="guru-list"
                        value={
                          form.guru
                        }
                        onChange={(e) =>
                          setForm(
                            (
                              prev
                            ) => ({
                              ...prev,
                              guru:
                                e
                                  .target
                                  .value,
                            })
                          )
                        }
                        placeholder="Contoh: Andi Prasetyo, S.Pd"
                        className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#155DFC]/25 focus:border-[#155DFC]/50"
                      />

                      <datalist id="guru-list">

                        {MAPEL_POOL.map(
                          (
                            item,
                            idx
                          ) => (
                            <option
                              key={`${item.guru}-${idx}`}
                              value={
                                item.guru
                              }
                            />
                          )
                        )}

                      </datalist>

                    </div>

                  </>

                )}

                {/* BUTTON */}

                <div className="flex items-center justify-end gap-2 pt-2">

                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(
                        false
                      );
                      setEditingData(
                        null
                      );
                    }}
                    className="px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50"
                  >
                    Batal
                  </button>

                  <button
                    type="button"
                    onClick={
                      handleSave
                    }
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#155DFC] to-[#0d47c9] text-white text-sm font-semibold hover:brightness-110"
                  >
                    <CheckCircle2
                      size={15}
                    />

                    {editingData.mode ===
                    "edit"
                      ? "Simpan Perubahan"
                      : "Tambah Jadwal"}

                  </button>

                </div>

              </div>

            </div>

          </div>

        )}

    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon: Icon,
  title,
  value,
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">

      <div className="flex items-center gap-2">

        <Icon
          size={14}
          className="text-[#155DFC]"
        />

        <p className="text-[11px] font-medium text-slate-500 tracking-wide">
          {title}
        </p>

      </div>

      <p className="text-2xl font-bold text-slate-900 mt-1.5">
        {value}
      </p>

    </div>
  );
}