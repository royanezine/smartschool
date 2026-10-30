"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import { getKelas } from "@/services/kelas.service";
import { getJadwalMengajar, deleteJadwalMengajar } from "@/services/jadwalMengajar.service";
import { Loader2 } from "lucide-react";

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


const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themePrimaryText =
  "text-[var(--color-primary)]";

const themePrimaryShadow =
  "shadow-[0_8px_20px_color-mix(in_srgb,var(--color-primary)_16%,transparent)]";

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeSmallShadow =
  "shadow-[0_2px_8px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

const themeSuccessSurface =
  "bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]";

const themeSuccessBorder =
  "border-[color-mix(in_srgb,var(--color-success)_24%,transparent)]";

const themeWarningSurface =
  "bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)]";

const themeWarningBorder =
  "border-[color-mix(in_srgb,var(--color-warning)_24%,transparent)]";

const themeDangerSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeDangerBorder =
  "border-[color-mix(in_srgb,var(--color-text)_18%,transparent)]";


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

function cellStyle(tipe) {
  switch (tipe) {
    case "istirahat":
      return `${themeNeutralSurface} theme-text-muted ${themeNeutralBorder}`;

    case "upacara":
      return `${themeWarningSurface} theme-warning ${themeWarningBorder}`;

    case "ekskul":
      return `${themePrimarySoft} ${themePrimaryText} ${themePrimarySoftBorder}`;

    default:
      return `${themePrimarySoft} theme-text ${themePrimarySoftBorder}`;
  }
}


export default function JadwalPelajaranPage() {
  const [isCollapsed, setIsCollapsed] =
    useState(false);

  const [kelasList, setKelasList] = useState([]);
  const [rawJadwal, setRawJadwal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [kelasAktif, setKelasAktif] = useState("");

  const activeKelasList = useMemo(() => {
    return kelasList.map((k) => (typeof k === "string" ? k : k?.nama || "")).filter(Boolean);
  }, [kelasList]);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const [kelasRes, jadwalRes] = await Promise.allSettled([
          getKelas({ limit: 100 }),
          getJadwalMengajar(),
        ]);
        if (!active) return;
        let kList = [];
        if (kelasRes.status === "fulfilled") {
          const val = kelasRes.value;
          kList = Array.isArray(val?.data)
            ? val.data
            : Array.isArray(val)
            ? val
            : [];
          setKelasList(kList);
          if (kList.length > 0) {
            const first = typeof kList[0] === "string" ? kList[0] : kList[0]?.nama || "";
            setKelasAktif((prev) => prev || first);
          }
        }
        if (jadwalRes.status === "fulfilled") {
          const val = jadwalRes.value;
          const jList = Array.isArray(val?.data)
            ? val.data
            : Array.isArray(val)
            ? val
            : [];
          setRawJadwal(jList);
        }
      } catch {
        // Fallback
      } finally {
        if (active) setLoading(false);
      }
    }, 0);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, []);

  const jadwalKelasAktif = useMemo(() => {
    const jadwal = {};
    const normalizedKelas = (kelasAktif || "").trim().toLowerCase();

    HARI_LIST.forEach((hari) => {
      const jumlahSlot = hari === "Sabtu" ? 6 : 8;
      const slots = [];
      const hariSlots = rawJadwal.filter(
        (j) =>
          (j.hari || "").trim().toLowerCase() === hari.toLowerCase() &&
          (j.kelasMapel?.kelas?.nama || "").trim().toLowerCase() === normalizedKelas
      );

      for (let slotIdx = 0; slotIdx < jumlahSlot; slotIdx++) {
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

        if (hari === "Senin" && slotIdx === 0) {
          slots.push({
            jam,
            mapel: "Upacara Bendera",
            guru: "Seluruh Guru",
            tipe: "upacara",
          });
          continue;
        }

        if (hari === "Sabtu" && slotIdx === jumlahSlot - 1) {
          slots.push({
            jam,
            mapel: "Ekstrakurikuler",
            guru: "Pembina Ekskul",
            tipe: "ekskul",
          });
          continue;
        }

        const matched = hariSlots[slotIdx] || null;
        if (matched) {
          slots.push({
            id: matched.id,
            jam: matched.jamMulai && matched.jamSelesai
              ? `${matched.jamMulai} - ${matched.jamSelesai}`
              : jam,
            mapel: matched.kelasMapel?.mataPelajaran?.nama || "-",
            guru: matched.kelasMapel?.guruPengajar?.namaLengkap || "-",
            tipe: "reguler",
          });
        } else {
          slots.push({
            jam,
            mapel: "-",
            guru: "-",
            tipe: "reguler",
          });
        }
      }
      jadwal[hari] = slots;
    });

    return jadwal;
  }, [rawJadwal, kelasAktif]);

  const [importMsg, setImportMsg] =
    useState(null);

  const [showModal, setShowModal] =
    useState(false);

  const [editingData, setEditingData] =
    useState(null);

  const fileInputRef = useRef(null);


  const [form, setForm] = useState({
    mapel: "",
    guru: "",
    tipe: "reguler",
  });


  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };





  const totalMapelUnik = useMemo(() => {
    const set = new Set();
    rawJadwal.forEach((j) => {
      const nama = j.kelasMapel?.mataPelajaran?.nama;
      if (nama && nama !== "-") set.add(nama);
    });
    return set.size;
  }, [rawJadwal]);

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


  function handleTambah(hari, slotIdx) {
    router.push("/admin/guru/jadwal-mengajar/tambah");
  }


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

    if (slot.id) {
      deleteJadwalMengajar(slot.id).catch((err) => {
        console.error("Gagal menghapus jadwal:", err);
      });
      setRawJadwal((prev) => prev.filter((j) => j.id !== slot.id));
    }
  }


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


  function handleExportExcel() {
    const workbook =
      XLSX.utils.book_new();

    activeKelasList.forEach((kelas) => {
      const jadwal = jadwalKelasAktif;

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

        activeKelasList.forEach(
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


  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">


      <Sidebar
        active="jadwalPelajaran"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
        role="admin"
      />


      <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">


        <Header
          toggleSidebar={toggleSidebar}
          notifications={[]}
          user={{
            name: "Admin Sekolah",
            email: "admin@smartschool.com",
            avatar: "AD",
          }}
        />


        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto">

          <div className="space-y-6 p-4 sm:p-6 lg:p-8">


            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-3">

                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl theme-primary text-[var(--color-card)] ${themePrimaryShadow}`}
                >
                  <CalendarDays size={20} />
                </div>

                <div className="min-w-0">

                  <h1 className="theme-text text-2xl font-bold">
                    Jadwal Mata Pelajaran
                  </h1>

                  <p className="theme-text-secondary text-sm">
                    Kelola jadwal mingguan
                    setiap kelas, Senin
                    sampai Sabtu.
                  </p>

                </div>

              </div>

              <div className="flex flex-wrap items-center gap-2">

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
                  className={`inline-flex items-center gap-2 rounded-xl border ${themeNeutralBorder} theme-card px-3.5 py-2.5 text-sm font-medium theme-text-secondary transition-colors hover:${themePrimarySoft}`}
                >
                  <Upload size={15} />
                  Import Excel
                </button>

                <button
                  type="button"
                  onClick={
                    handleExportExcel
                  }
                  className="theme-primary inline-flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[var(--color-card)] transition-all hover:brightness-110"
                >
                  <Download size={15} />
                  Export Excel
                </button>

              </div>

            </div>


            {importMsg && (
              <div
                className={`flex items-center justify-between gap-2 rounded-xl border px-4 py-3 text-sm font-medium ${
                  importMsg.type === "sukses"
                    ? `${themeSuccessSurface} ${themeSuccessBorder} theme-success`
                    : `${themeDangerSurface} ${themeDangerBorder} theme-danger`
                }`}
              >

                <div className="flex items-center gap-2">

                  {importMsg.type === "sukses" ? (
                    <CheckCircle2 size={15} />
                  ) : (
                    <AlertCircle size={15} />
                  )}

                  {importMsg.text}

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setImportMsg(null)
                  }
                  className="rounded-md p-1 transition hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]"
                >
                  <X size={14} />
                </button>

              </div>
            )}


            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

              <StatCard
                icon={School}
                title="Total Kelas"
                value={activeKelasList.length}
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


            <div className="flex flex-wrap items-center gap-2">

              {activeKelasList.map(
                (kelas) => (
                  <button
                    key={kelas}
                    type="button"
                    onClick={() =>
                      setKelasAktif(
                        kelas
                      )
                    }
                    className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                      kelasAktif === kelas
                        ? "theme-primary text-[var(--color-card)] shadow-sm"
                        : `theme-card ${themeNeutralBorder} theme-text-secondary hover:${themePrimarySoft} hover:text-[var(--color-primary)]`
                    }`}
                  >
                    Kelas {kelas}
                  </button>
                )
              )}

            </div>


            <div className="flex items-center justify-between gap-3">

              <div>

                <p className="theme-text text-sm font-semibold">
                  Jadwal Kelas {kelasAktif}
                </p>

                <p className="theme-text-muted mt-1 text-xs">
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


            <div
              className={`theme-card overflow-hidden rounded-xl border ${themeNeutralBorder} ${themeCardShadow}`}
            >

              <div className="overflow-x-auto">

                <table className="w-full min-w-[1100px] border-collapse text-sm">

                  <thead>

                    <tr className="theme-primary text-[var(--color-card)]">

                      <th className="w-28 whitespace-nowrap px-3 py-3 text-left font-semibold">
                        Jam
                      </th>

                      {HARI_LIST.map(
                        (hari) => (
                          <th
                            key={hari}
                            className="min-w-[175px] px-3 py-3 text-left font-semibold"
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
                          className={`border-b ${themeDivider} last:border-0`}
                        >


                          <td className="theme-text-muted whitespace-nowrap px-3 py-2.5 align-top font-mono text-xs">
                            {jam}
                          </td>


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
                                    key={hari}
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
                                      className={`flex min-h-[72px] w-full items-center justify-center rounded-lg border border-dashed ${themeNeutralBorder} theme-text-placeholder transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] ${themePrimarySoft}`}
                                    >
                                      <Plus size={17} />
                                    </button>
                                  </td>
                                );
                              }

                              const isEmpty =
                                slot.mapel === "-";

                              const isReguler =
                                slot.tipe === "reguler";

                              return (
                                <td
                                  key={hari}
                                  className="px-2 py-1.5 align-top"
                                >

                                  <div
                                    className={`group relative min-h-[70px] rounded-lg px-2.5 py-2 ${cellStyle(
                                      slot.tipe
                                    )}`}
                                  >


                                    <div className="pr-8">

                                      <p className="theme-text text-xs font-semibold leading-tight">

                                        {isEmpty
                                          ? "Belum ada jadwal"
                                          : slot.mapel}

                                      </p>

                                      {isReguler &&
                                        !isEmpty && (
                                          <p className="theme-text-muted mt-1 text-[10px] leading-tight">
                                            {slot.guru}
                                          </p>
                                        )}

                                    </div>


                                    <div className="absolute right-1.5 top-1.5 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">


                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleEdit(
                                            hari,
                                            rowIdx
                                          )
                                        }
                                        title="Edit jadwal"
                                        className={`flex h-6 w-6 items-center justify-center rounded-md theme-card ${themeNeutralBorder} ${themePrimaryText} ${themeSmallShadow} transition hover:${themePrimarySoft}`}
                                      >
                                        <Pencil size={11} />
                                      </button>


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
                                          className={`theme-danger flex h-6 w-6 items-center justify-center rounded-md theme-card ${themeNeutralBorder} ${themeSmallShadow} transition hover:${themeDangerSurface}`}
                                        >
                                          <Trash2 size={11} />
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


            <div className="flex flex-wrap items-center gap-4 theme-text-muted text-xs">

              <LegendItem
                className={`${themePrimarySoft} ${themePrimarySoftBorder}`}
                label="Jadwal Pelajaran"
              />

              <LegendItem
                className={`${themeWarningSurface} ${themeWarningBorder}`}
                label="Upacara"
              />

              <LegendItem
                className={`${themePrimarySoft} ${themePrimarySoftBorder}`}
                label="Ekstrakurikuler"
              />

              <LegendItem
                className={`${themeNeutralSurface} ${themeNeutralBorder}`}
                label="Istirahat"
              />

            </div>

          </div>

        </main>

      </div>


    </div>
  );
}


function LegendItem({
  className,
  label,
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`h-3 w-3 rounded border ${className}`}
      />
      {label}
    </div>
  );
}