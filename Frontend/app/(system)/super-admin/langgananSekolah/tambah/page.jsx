"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Building2,
  Package,
  CalendarDays,
  CreditCard,
  FileText,
} from "lucide-react";

import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";

export default function TambahLanggananPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [form, setForm] = useState({
    sekolah: "",
    paket: "",
    tanggalMulai: "",
    tanggalBerakhir: "",
    metodePembayaran: "",
    catatan: "",
  });

  const notifications = [
    {
      id: 1,
      title: "Pembaruan Sistem v2.0",
      desc: "Dikirim 2 jam lalu",
      read: false,
    },
    {
      id: 2,
      title: "Pengingat: Backup Data",
      desc: "Dikirim 1 hari lalu",
      read: false,
    },
  ];

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Data langganan:", form);

    alert("Langganan berhasil ditambahkan!");
  };

  return (
    <div className="flex min-h-screen w-full bg-slate-50">
      {/* SIDEBAR */}
      <div className="shrink-0 self-stretch">
        <Sidebar
          active="langganan"
          setActive={() => {}}
          collapsed={!sidebarOpen}
          setCollapsed={() => setSidebarOpen(!sidebarOpen)}
        />
      </div>

      {/* AREA KANAN */}
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        {/* HEADER */}
        <Header
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          notifications={notifications}
          user={{
            name: "Sarah",
            email: "sarah@smartschool.com",
            avatar: "SA",
          }}
        />

        {/* MAIN */}
        <main className="min-w-0 flex-1 overflow-x-hidden">
          <div className="w-full px-4 py-5 sm:px-6 lg:px-8">
            
            {/* CONTAINER */}
            <div className="mx-auto w-full max-w-5xl">
              
              {/* BACK */}
              <button
                type="button"
                onClick={() => router.back()}
                className="
                  mb-5
                  inline-flex
                  items-center
                  gap-2
                  border
                  border-slate-200
                  bg-white
                  px-4
                  rounded
                  py-2.5
                  text-sm
                  font-medium
                  text-slate-600
                  shadow-sm
                  transition
                  hover:bg-slate-50
                  hover:text-slate-900
                "
              >
                <ArrowLeft size={18} />
                Kembali
              </button>

              {/* TITLE */}
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800">
                  Tambah Langganan
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Tambahkan langganan baru untuk sekolah.
                </p>
              </div>

              {/* CARD */}
              <div className="w-full overflow-hidden border border-slate-200 bg-white shadow-sm">
                
                {/* CARD HEADER */}
                <div className="border-b border-slate-200 px-5 py-5 sm:px-7">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-blue-50 text-blue-600">
                      <CreditCard size={20} />
                    </div>

                    <div className="min-w-0">
                      <h2 className="text-base font-semibold text-slate-800">
                        Informasi Langganan
                      </h2>

                      <p className="text-sm text-slate-500">
                        Lengkapi informasi langganan di bawah ini.
                      </p>
                    </div>
                  </div>
                </div>

                {/* FORM */}
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 gap-5 p-5 sm:p-7 lg:grid-cols-2">

                    {/* SEKOLAH */}
                    <div className="min-w-0">
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Sekolah
                      </label>

                      <div className="relative">
                        <Building2
                          size={18}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <select
                          name="sekolah"
                          value={form.sekolah}
                          onChange={handleChange}
                          required
                          className="
                            box-border
                            w-full
                            min-w-0
                            appearance-none
                            border
                            border-slate-200
                            bg-white
                            py-3
                            pl-10
                            pr-4
                            text-sm
                            text-slate-700
                            outline-none
                            focus:border-blue-500
                            focus:ring-2
                            focus:ring-blue-100
                          "
                        >
                          <option value="">Pilih sekolah</option>
                          <option value="SMK Taruna Bhakti">
                            SMK Taruna Bhakti
                          </option>
                          <option value="SMA SmartSchool">
                            SMA SmartSchool
                          </option>
                          <option value="SMP SmartSchool">
                            SMP SmartSchool
                          </option>
                        </select>
                      </div>
                    </div>

                    {/* PAKET */}
                    <div className="min-w-0">
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Paket Langganan
                      </label>

                      <div className="relative">
                        <Package
                          size={18}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <select
                          name="paket"
                          value={form.paket}
                          onChange={handleChange}
                          required
                          className="
                            box-border
                            w-full
                            min-w-0
                            appearance-none
                            border
                            border-slate-200
                            bg-white
                            py-3
                            pl-10
                            pr-4
                            text-sm
                            text-slate-700
                            outline-none
                            focus:border-blue-500
                            focus:ring-2
                            focus:ring-blue-100
                          "
                        >
                          <option value="">Pilih paket</option>
                          <option value="Basic">Basic</option>
                          <option value="Professional">
                            Professional
                          </option>
                          <option value="Enterprise">
                            Enterprise
                          </option>
                        </select>
                      </div>
                    </div>

                    {/* TANGGAL MULAI */}
                    <div className="min-w-0">
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Tanggal Mulai
                      </label>

                      <div className="relative">
                        <CalendarDays
                          size={18}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                          type="date"
                          name="tanggalMulai"
                          value={form.tanggalMulai}
                          onChange={handleChange}
                          required
                          className="
                            box-border
                            w-full
                            min-w-0
                            border
                            border-slate-200
                            bg-white
                            py-3
                            pl-10
                            pr-4
                            text-sm
                            text-slate-700
                            outline-none
                            focus:border-blue-500
                            focus:ring-2
                            focus:ring-blue-100
                          "
                        />
                      </div>
                    </div>

                    {/* TANGGAL BERAKHIR */}
                    <div className="min-w-0">
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Tanggal Berakhir
                      </label>

                      <div className="relative">
                        <CalendarDays
                          size={18}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                          type="date"
                          name="tanggalBerakhir"
                          value={form.tanggalBerakhir}
                          onChange={handleChange}
                          required
                          className="
                            box-border
                            w-full
                            min-w-0
                            border
                            border-slate-200
                            bg-white
                            py-3
                            pl-10
                            pr-4
                            text-sm
                            text-slate-700
                            outline-none
                            focus:border-blue-500
                            focus:ring-2
                            focus:ring-blue-100
                          "
                        />
                      </div>
                    </div>

                    {/* METODE PEMBAYARAN */}
                    <div className="min-w-0 lg:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Metode Pembayaran
                      </label>

                      <div className="relative">
                        <CreditCard
                          size={18}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <select
                          name="metodePembayaran"
                          value={form.metodePembayaran}
                          onChange={handleChange}
                          required
                          className="
                            box-border
                            w-full
                            min-w-0
                            appearance-none
                            border
                            border-slate-200
                            bg-white
                            py-3
                            pl-10
                            pr-4
                            text-sm
                            text-slate-700
                            outline-none
                            focus:border-blue-500
                            focus:ring-2
                            focus:ring-blue-100
                          "
                        >
                          <option value="">
                            Pilih metode pembayaran
                          </option>

                          <option value="Transfer Bank">
                            Transfer Bank
                          </option>

                          <option value="Virtual Account">
                            Virtual Account
                          </option>

                          <option value="Cash">
                            Cash
                          </option>
                        </select>
                      </div>
                    </div>

                    {/* CATATAN */}
                    <div className="min-w-0 lg:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Catatan{" "}
                        <span className="font-normal text-slate-400">
                          (Opsional)
                        </span>
                      </label>

                      <div className="relative">
                        <FileText
                          size={18}
                          className="absolute left-3 top-3.5 text-slate-400"
                        />

                        <textarea
                          name="catatan"
                          value={form.catatan}
                          onChange={handleChange}
                          rows={4}
                          placeholder="Tambahkan catatan jika diperlukan..."
                          className="
                            box-border
                            w-full
                            min-w-0
                            resize-none
                            border
                            border-slate-200
                            bg-white
                            py-3
                            pl-10
                            pr-4
                            text-sm
                            text-slate-700
                            outline-none
                            placeholder:text-slate-400
                            focus:border-blue-500
                            focus:ring-2
                            focus:ring-blue-100
                          "
                        />
                      </div>
                    </div>
                  </div>

                  {/* FOOTER */}
                  <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-5 sm:flex-row sm:justify-end sm:px-7">

                    <button
                      type="button"
                      onClick={() => router.back()}
                      className="
                        w-full
                        border
                        border-slate-200
                        bg-white
                        px-5
                        rounded
                        py-2.5
                        text-sm
                        font-medium
                        text-slate-600
                        transition
                        hover:bg-slate-50
                        sm:w-auto
                      "
                    >
                      Batal
                    </button>

                    <button
                      type="submit"
                      className="
                        inline-flex
                        w-full
                        items-center
                        justify-center
                        gap-2
                        bg-blue-600
                        px-5
                        py-2.5
                        text-sm
                        font-semibold
                        text-white
                        transition
                        rounded
                        hover:bg-blue-700
                        sm:w-auto
                      "
                    >
                      <Save size={18} />
                      Simpan Langganan
                    </button>

                  </div>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}