"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  PencilLine,
  Construction,
} from "lucide-react";

import Header from "../../../../../../components/Header";
import Sidebar from "../../../../../../components/Sidebar";

export default function MediaEditPage({ params }) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="theme-page flex min-h-screen w-full">
      {/* SIDEBAR */}
      <div className="shrink-0">
        <Sidebar
          active={"media"}
          setActive={() => {}}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />
      </div>

      {/* MAIN */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          user={{
            name: "CMS Admin",
            email: "cms@smartschool.com",
            avatar: "CA",
          }}
        />

        <main className="min-w-0 flex-1">
          <div className="w-full px-3 py-4 sm:px-5 sm:py-6 md:px-7 lg:px-8 xl:px-10">
            <div className="mx-auto w-full max-w-[1500px]">

              {/* BACK BUTTON */}
              <div className="mb-5 flex items-center">
                <button
                  type="button"
                  onClick={() =>
                    router.push("/cmsAdmin/media")
                  }
                  className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-xl
                    border
                    theme-border
                    theme-card
                    px-3.5
                    py-2.5
                    text-sm
                    font-semibold
                    theme-text-secondary
                    shadow-sm
                    transition-all
                    hover:-translate-x-0.5
                    theme-table-hover
                  "
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Kembali</span>
                </button>
              </div>

              {/* HERO */}
              <section
                className="
                  relative
                  mb-6
                  overflow-hidden
                  rounded-2xl
                  border
                  theme-border
                  theme-card
                  shadow-sm
                "
              >
                {/* Decorative background */}
                <div
                  className="
                    pointer-events-none
                    absolute
                    -right-20
                    -top-24
                    h-64
                    w-64
                    rounded-full
                    bg-[var(--color-primary)]
                    opacity-[0.08]
                    blur-3xl
                  "
                />

                <div className="relative p-5 sm:p-6 md:p-8">
                  <div className="flex items-start gap-4">

                    {/* ICON */}
                    <div
                      className="
                        flex
                        h-12
                        w-12
                        shrink-0
                        items-center
                        justify-center
                        rounded-2xl
                        theme-info
                        sm:h-14
                        sm:w-14
                      "
                    >
                      <PencilLine className="h-6 w-6 sm:h-7 sm:w-7" />
                    </div>

                    {/* TITLE */}
                    <div className="min-w-0">
                      <p
                        className="
                          mb-1
                          text-[10px]
                          font-semibold
                          uppercase
                          tracking-[0.18em]
                          theme-text-muted
                          sm:text-xs
                        "
                      >
                        CMS Management
                      </p>

                      <h1
                        className="
                          text-2xl
                          font-bold
                          tracking-tight
                          theme-text
                          sm:text-3xl
                          lg:text-4xl
                        "
                      >
                        Edit Media
                      </h1>

                      <p
                        className="
                          mt-1.5
                          max-w-2xl
                          text-xs
                          leading-relaxed
                          theme-text-secondary
                          sm:text-sm
                        "
                      >
                        Perbarui detail file media.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* DEVELOPMENT CARD */}
              <div
                className="
                  flex
                  flex-col
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  theme-border
                  theme-card
                  px-6
                  py-16
                  text-center
                  shadow-sm
                "
              >
                {/* ICON */}
                <div
                  className="
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-2xl
                    theme-warning
                  "
                >
                  <Construction className="h-6 w-6" />
                </div>

                {/* TITLE */}
                <h3
                  className="
                    mt-4
                    text-sm
                    font-bold
                    theme-text
                  "
                >
                  Halaman dalam pengembangan
                </h3>

                {/* DESCRIPTION */}
                <p
                  className="
                    mt-1
                    max-w-sm
                    text-sm
                    leading-relaxed
                    theme-text-muted
                  "
                >
                  Fitur edit media belum tersedia di sini.
                </p>

                {/* BACK */}
                <button
                  type="button"
                  onClick={() =>
                    router.push("/cmsAdmin/media")
                  }
                  className="
                    mt-5
                    inline-flex
                    items-center
                    gap-2
                    rounded-xl
                    theme-primary
                    px-4
                    py-2.5
                    text-xs
                    font-semibold
                    shadow-sm
                    transition
                    hover:shadow-md
                  "
                >
                  <ArrowLeft className="h-4 w-4" />
                  Kembali ke Media
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}