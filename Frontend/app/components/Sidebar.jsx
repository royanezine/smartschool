"use client";

import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  Crown,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

import { guruSidebarConfig } from "./sidebar/guruSidebar";
import { superadminSidebarConfig } from "./sidebar/superadmin";
import { yayasanSidebarConfig } from "./sidebar/yayasanSidebar";
import { adminSidebarConfig } from "./sidebar/adminSidebar";
import { cmsSidebarConfig } from "./sidebar/cmsSidebar";
import { siswaSidebarConfig } from "./sidebar/siswaSidebar";
import { adminSarprasSidebarConfig } from "./sidebar/adminsarprasSidebar";
import { adminPPDBSidebarConfig } from "./sidebar/adminppdbSidebar";

/* =========================================================
   CONFIG
========================================================= */

const configByRole = {
  guru: guruSidebarConfig,
  "super-admin": superadminSidebarConfig,
  yayasan: yayasanSidebarConfig,
  admin: adminSidebarConfig,
  cms: cmsSidebarConfig,
  siswa: siswaSidebarConfig,
  adminSarpras: adminSarprasSidebarConfig,
  adminPPDB: adminPPDBSidebarConfig,
};

const DEFAULT_ROLE = "super-admin";

const SIDEBAR_COLLAPSED_KEY = "sidebar-collapsed";

/*
 * Menyimpan posisi scroll sidebar.
 *
 * sessionStorage dipakai supaya posisi scroll tetap bertahan
 * ketika pindah halaman dalam satu sesi browser.
 */
const SIDEBAR_SCROLL_KEY = "sidebar-scroll-top";

const SIDEBAR_EXPANDED_WIDTH = "w-64";
const SIDEBAR_COLLAPSED_WIDTH = "w-[72px]";

/* =========================================================
   ROLE
========================================================= */

function resolveRole(pathname) {
  if (pathname?.startsWith("/guru")) return "guru";
  if (pathname?.startsWith("/yayasan")) return "yayasan";
  if (pathname?.startsWith("/super-admin")) return "super-admin";
  if (pathname?.startsWith("/cmsAdmin")) return "cms";
  if (pathname?.startsWith("/adminSarpras")) return "adminSarpras";
  if (pathname?.startsWith("/adminPPDB")) return "adminPPDB";
  if (pathname?.startsWith("/admin")) return "admin";
  if (pathname?.startsWith("/siswa")) return "siswa";

  return DEFAULT_ROLE;
}

/* =========================================================
   COMPONENT
========================================================= */

export default function Sidebar({
  active,
  setActive,
  collapsed: collapsedProp,
  setCollapsed: setCollapsedProp,
  role: roleProp,
}) {
  const router = useRouter();
  const pathname = usePathname();

  /* =======================================================
     ROLE & MENU
  ======================================================= */

  const role = roleProp || resolveRole(pathname);

  const config =
    configByRole[role] ??
    configByRole[DEFAULT_ROLE];

  const menuSections = config.menuSections;

  /* =======================================================
     SIDEBAR STATE
  ======================================================= */

  const [collapsed, setCollapsedInternal] = useState(
    () => collapsedProp ?? false
  );

  const [isMobile, setIsMobile] = useState(false);
  const [allowTransition, setAllowTransition] = useState(false);

  /* =======================================================
     SET COLLAPSED
  ======================================================= */

  const setCollapsed = (value) => {
    setCollapsedInternal((prev) => {
      const next =
        typeof value === "function"
          ? value(prev)
          : value;

      try {
        localStorage.setItem(
          SIDEBAR_COLLAPSED_KEY,
          String(next)
        );
      } catch (error) {
        // Ignore localStorage errors.
      }

      return next;
    });
  };

  /* =======================================================
     SYNC WITH PARENT
  ======================================================= */

  useEffect(() => {
    setCollapsedProp?.(collapsed);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collapsed]);

  /* =======================================================
     INITIAL RESPONSIVE MODE
  ======================================================= */

  useLayoutEffect(() => {
    const mediaQuery = window.matchMedia(
      "(max-width: 1023px)"
    );

    let stored = null;

    try {
      stored = localStorage.getItem(
        SIDEBAR_COLLAPSED_KEY
      );
    } catch (error) {
      stored = null;
    }

    const applyInitialMode = (mobile) => {
      setIsMobile(mobile);

      if (stored !== null) {
        setCollapsedInternal(
          stored === "true"
        );
      } else if (mobile) {
        setCollapsedInternal(true);

        try {
          localStorage.setItem(
            SIDEBAR_COLLAPSED_KEY,
            "true"
          );
        } catch (error) {
          // Ignore localStorage errors.
        }
      }
    };

    applyInitialMode(mediaQuery.matches);

    const raf = requestAnimationFrame(() => {
      setAllowTransition(true);
    });

    const handleMediaChange = (event) => {
      setIsMobile(event.matches);
    };

    mediaQuery.addEventListener(
      "change",
      handleMediaChange
    );

    return () => {
      mediaQuery.removeEventListener(
        "change",
        handleMediaChange
      );

      cancelAnimationFrame(raf);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* =======================================================
     RESTORE SIDEBAR SCROLL POSITION
  ======================================================= */

  useLayoutEffect(() => {
    const nav = sidebarNavRef.current;

    if (!nav) return;

    let savedScrollTop = 0;

    try {
      const saved =
        sessionStorage.getItem(
          SIDEBAR_SCROLL_KEY
        );

      if (saved !== null) {
        savedScrollTop = Number(saved) || 0;
      }
    } catch (error) {
      savedScrollTop = 0;
    }

    /*
     * Restore setelah DOM selesai melakukan layout.
     * requestAnimationFrame membantu mencegah posisi
     * kembali ke 0 setelah render submenu.
     */
    const restoreScroll = () => {
      if (!sidebarNavRef.current) return;

      sidebarNavRef.current.scrollTop =
        savedScrollTop;
    };

    restoreScroll();

    const raf1 =
      requestAnimationFrame(restoreScroll);

    const raf2 =
      requestAnimationFrame(() => {
        requestAnimationFrame(restoreScroll);
      });

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [pathname, role]);

  /* =======================================================
     SAVE SIDEBAR SCROLL POSITION
  ======================================================= */

  useEffect(() => {
    const nav = sidebarNavRef.current;

    if (!nav) return;

    const handleSidebarScroll = () => {
      try {
        sessionStorage.setItem(
          SIDEBAR_SCROLL_KEY,
          String(nav.scrollTop)
        );
      } catch (error) {
        // Ignore sessionStorage errors.
      }
    };

    nav.addEventListener(
      "scroll",
      handleSidebarScroll,
      { passive: true }
    );

    /*
     * Simpan posisi awal juga.
     */
    handleSidebarScroll();

    return () => {
      nav.removeEventListener(
        "scroll",
        handleSidebarScroll
      );
    };
  }, [pathname, role]);

  /* =======================================================
     LOCK BODY SCROLL WHEN MOBILE DRAWER OPEN
  ======================================================= */

  useEffect(() => {
    if (isMobile && !collapsed) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobile, collapsed]);

  /* =======================================================
     SUBMENU STATE
  ======================================================= */

  const [openMenus, setOpenMenus] = useState(() => {
    const initial = {};

    menuSections.forEach((item) => {
      if (item.children) {
        initial[item.key] = true;
      }
    });

    return initial;
  });

  useEffect(() => {
    const next = {};

    menuSections.forEach((item) => {
      if (item.children) {
        next[item.key] = true;
      }
    });

    setOpenMenus((prev) => ({
      ...next,
      ...prev,
    }));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  /* =======================================================
     FLYOUT SUBMENU
  ======================================================= */

  const [flyoutState, setFlyoutState] =
    useState(null);

  const [mounted, setMounted] =
    useState(false);

  const sidebarNavRef = useRef(null);
  const flyoutPanelRef = useRef(null);
  const closeTimeoutRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const clearCloseTimeout = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const openFlyoutFor = (
    item,
    triggerElement
  ) => {
    clearCloseTimeout();

    if (!triggerElement) return;

    const rect =
      triggerElement.getBoundingClientRect();

    setFlyoutState({
      key: item.key,
      item,
      top: rect.top,
      left: rect.right + 12,
    });
  };

  const scheduleCloseFlyout = () => {
    clearCloseTimeout();

    closeTimeoutRef.current =
      setTimeout(() => {
        setFlyoutState(null);
      }, 150);
  };

  const toggleFlyoutByClick = (
    item,
    triggerElement
  ) => {
    setFlyoutState((prev) => {
      if (
        prev &&
        prev.key === item.key
      ) {
        return null;
      }

      const rect =
        triggerElement.getBoundingClientRect();

      return {
        key: item.key,
        item,
        top: rect.top,
        left: rect.right + 12,
      };
    });
  };

  /* =======================================================
     CLOSE FLYOUT OUTSIDE
  ======================================================= */

  useEffect(() => {
    if (!flyoutState) return;

    const handleOutsideClick = (event) => {
      const clickedInsideNav =
        sidebarNavRef.current?.contains(
          event.target
        );

      const clickedInsidePanel =
        flyoutPanelRef.current?.contains(
          event.target
        );

      if (
        !clickedInsideNav &&
        !clickedInsidePanel
      ) {
        setFlyoutState(null);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, [flyoutState]);

  /* =======================================================
     CLOSE FLYOUT ON RESIZE / SCROLL
  ======================================================= */

  useEffect(() => {
    if (!flyoutState) return;

    const close = () => {
      setFlyoutState(null);
    };

    window.addEventListener(
      "resize",
      close
    );

    sidebarNavRef.current?.addEventListener(
      "scroll",
      close
    );

    return () => {
      window.removeEventListener(
        "resize",
        close
      );

      sidebarNavRef.current?.removeEventListener(
        "scroll",
        close
      );
    };
  }, [flyoutState]);

  useEffect(() => {
    if (!collapsed) {
      setFlyoutState(null);
    }
  }, [collapsed]);

  /* =======================================================
     LOGO TOOLTIP
  ======================================================= */

  const [logoTooltip, setLogoTooltip] =
    useState(null);

  const logoWrapRef = useRef(null);
  const logoTooltipTimeoutRef =
    useRef(null);

  const clearLogoTooltipTimeout = () => {
    if (logoTooltipTimeoutRef.current) {
      clearTimeout(
        logoTooltipTimeoutRef.current
      );

      logoTooltipTimeoutRef.current = null;
    }
  };

  const showLogoTooltip = () => {
    clearLogoTooltipTimeout();

    if (!logoWrapRef.current) return;

    const rect =
      logoWrapRef.current.getBoundingClientRect();

    setLogoTooltip({
      top: rect.top + rect.height / 2,
      left: rect.right + 12,
    });
  };

  const hideLogoTooltip = () => {
    clearLogoTooltipTimeout();

    logoTooltipTimeoutRef.current =
      setTimeout(() => {
        setLogoTooltip(null);
      }, 100);
  };

  useEffect(() => {
    if (!logoTooltip) return;

    const close = () => {
      setLogoTooltip(null);
    };

    window.addEventListener(
      "resize",
      close
    );

    window.addEventListener(
      "scroll",
      close,
      true
    );

    return () => {
      window.removeEventListener(
        "resize",
        close
      );

      window.removeEventListener(
        "scroll",
        close,
        true
      );
    };
  }, [logoTooltip]);

  /* =======================================================
     MENU ITEM TOOLTIP
  ======================================================= */

  const [itemTooltip, setItemTooltip] =
    useState(null);

  const itemTooltipTimeoutRef =
    useRef(null);

  const clearItemTooltipTimeout = () => {
    if (itemTooltipTimeoutRef.current) {
      clearTimeout(
        itemTooltipTimeoutRef.current
      );

      itemTooltipTimeoutRef.current = null;
    }
  };

  const showItemTooltip = (
    item,
    triggerElement
  ) => {
    clearItemTooltipTimeout();

    if (!triggerElement) return;

    const rect =
      triggerElement.getBoundingClientRect();

    setItemTooltip({
      key: item.key,
      label: item.label,
      top: rect.top + rect.height / 2,
      left: rect.right + 12,
    });
  };

  const hideItemTooltip = () => {
    clearItemTooltipTimeout();

    itemTooltipTimeoutRef.current =
      setTimeout(() => {
        setItemTooltip(null);
      }, 100);
  };

  useEffect(() => {
    if (!itemTooltip) return;

    const close = () => {
      setItemTooltip(null);
    };

    window.addEventListener(
      "resize",
      close
    );

    window.addEventListener(
      "scroll",
      close,
      true
    );

    sidebarNavRef.current?.addEventListener(
      "scroll",
      close
    );

    return () => {
      window.removeEventListener(
        "resize",
        close
      );

      window.removeEventListener(
        "scroll",
        close,
        true
      );

      sidebarNavRef.current?.removeEventListener(
        "scroll",
        close
      );
    };
  }, [itemTooltip]);

  useEffect(() => {
    if (!collapsed) {
      setItemTooltip(null);
    }
  }, [collapsed]);

  useEffect(() => {
    if (flyoutState) {
      setItemTooltip(null);
    }
  }, [flyoutState]);

  /* =======================================================
     SIDEBAR ACTIONS
  ======================================================= */

  const toggleSidebar = () => {
    setCollapsed((prev) => !prev);
  };

  const toggleSubmenu = (key) => {
    setOpenMenus((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleMenuClick = (
    item,
    collapsedIconMode,
    triggerElement
  ) => {
    if (
      collapsedIconMode &&
      item.children
    ) {
      /*
       * Mobile collapsed:
       * Jangan tampilkan flyout.
       */
      if (isMobile) {
        if (item.path) {
          setActive?.(item.key);
          router.push(item.path);
        }

        return;
      }

      toggleFlyoutByClick(
        item,
        triggerElement
      );

      return;
    }

    setItemTooltip(null);

    const alreadyOnThisPage =
      pathname === item.path;

    setActive?.(item.key);

    if (
      item.children &&
      alreadyOnThisPage
    ) {
      toggleSubmenu(item.key);
      return;
    }

    if (item.path) {
      router.push(item.path);
    }
  };

  const handleSubItemClick = (
    parentKey,
    child
  ) => {
    /*
     * Simpan posisi scroll tepat sebelum
     * melakukan navigasi.
     */
    if (sidebarNavRef.current) {
      try {
        sessionStorage.setItem(
          SIDEBAR_SCROLL_KEY,
          String(
            sidebarNavRef.current.scrollTop
          )
        );
      } catch (error) {
        // Ignore sessionStorage errors.
      }
    }

    setActive?.(child.key);

    router.push(child.path);

    setFlyoutState(null);
  };

  const showLabels = !collapsed;

  const transitionClass =
    allowTransition
      ? "transition-[width,transform] duration-300 ease-in-out"
      : "transition-none";

  /* =======================================================
     SIDEBAR WIDTH
  ======================================================= */

  const desktopWidth =
    collapsed
      ? SIDEBAR_COLLAPSED_WIDTH
      : SIDEBAR_EXPANDED_WIDTH;

  const wrapperClasses = isMobile
    ? `
        relative
        shrink-0
        h-screen
        w-[72px]
        z-50
        overflow-visible
      `
    : `
        relative
        shrink-0
        h-screen
        ${desktopWidth}
        z-40
        overflow-visible
        sticky
        top-0
        ${transitionClass}
      `;

  const asideClasses = isMobile
    ? `
        fixed
        inset-y-0
        left-0
        z-50
        ${collapsed ? SIDEBAR_COLLAPSED_WIDTH : "w-64 max-w-[85vw]"}
        bg-[#0f1729]
        flex
        flex-col
        border-r
        border-white/10
        overflow-visible
        ${transitionClass}
      `
    : `
        relative
        ${desktopWidth}
        h-screen
        bg-[#0f1729]
        flex
        flex-col
        flex-shrink-0
        border-r
        border-white/10
        overflow-visible
        ${transitionClass}
      `;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <>
      {/* ===================================================
          MOBILE BACKDROP
      =================================================== */}

      {isMobile && !collapsed && (
        <div
          onClick={() => setCollapsed(true)}
          className="
            fixed
            inset-0
            z-40
            bg-slate-900/60
            backdrop-blur-sm
            transition-opacity
            duration-300
          "
          aria-hidden="true"
        />
      )}

      {/* ===================================================
          SIDEBAR WRAPPER
      =================================================== */}

      <div className={wrapperClasses}>
        <aside className={asideClasses}>
          {/* =================================================
              INTERNAL SIDEBAR
          ================================================= */}

          <div
            className="
              relative
              z-10
              flex
              flex-col
              h-full
              min-h-0
              overflow-hidden
            "
          >
            {/* =================================================
                TOP ACCENT
            ================================================= */}

            <div
              className="
                h-[3px]
                w-full
                bg-[#155DFC]
                shrink-0
              "
            />

            {/* =================================================
                LOGO HEADER
            ================================================= */}

            <div
              className="
                flex
                items-center
                h-20
                px-4
                shrink-0
                border-b
                border-white/10
                bg-[#1c2a4a]
              "
            >
              <div
                ref={logoWrapRef}
                onMouseEnter={showLogoTooltip}
                onMouseLeave={hideLogoTooltip}
                className={`
                  flex
                  items-center
                  gap-3
                  min-w-0
                  ${
                    collapsed
                      ? "w-full justify-center"
                      : ""
                  }
                `}
              >
                {/* LOGO */}

                <div
                  className="
                    relative
                    w-11
                    h-11
                    shrink-0
                    rounded-lg
                    bg-white/90
                    p-1.5
                    shadow-sm
                  "
                >
                  <Image
                    src="/logo/logoSS.png"
                    alt="Logo SmartSchool"
                    fill
                    sizes="44px"
                    className="
                      object-contain
                      p-1
                    "
                    priority
                  />
                </div>

                {/* BRAND */}

                {showLabels && (
                  <div
                    className="
                      flex
                      flex-col
                      min-w-0
                      leading-tight
                      text-left
                    "
                  >
                    <span
                      className="
                        text-xl
                        font-bold
                        tracking-tight
                        text-white
                        truncate
                      "
                    >
                      Smart
                      <span className="text-blue-400">
                        School
                      </span>
                    </span>

                    <div
                      className="
                        flex
                        items-center
                        gap-1.5
                      "
                    >
                      <Crown
                        size={10}
                        className="
                          shrink-0
                          text-yellow-500
                        "
                      />

                      <span
                        className="
                          text-[10px]
                          font-medium
                          uppercase
                          tracking-wider
                          text-slate-400
                          truncate
                        "
                      >
                        {config.brandName}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* =================================================
                NAVIGATION
            ================================================= */}

            <nav
              ref={sidebarNavRef}
              className="
                flex-1
                min-h-0
                overflow-y-auto
                overflow-x-hidden
                px-3
                py-4
                mt-2
                space-y-0.5
                pb-6
                scrollbar-thin
                scrollbar-thumb-slate-700
                scrollbar-track-transparent
              "
            >
              {menuSections.map(
                (item, index) => {
                  /* =========================================
                     SECTION HEADER
                  ========================================= */

                  if (
                    item.type === "header"
                  ) {
                    if (!showLabels) {
                      return null;
                    }

                    return (
                      <div
                        key={`header-${index}`}
                        className="
                          px-2
                          pt-5
                          pb-2
                        "
                      >
                        <div
                          className="
                            flex
                            items-center
                            gap-2
                          "
                        >
                          <div
                            className="
                              flex-1
                              h-px
                              bg-white/10
                            "
                          />

                          <span
                            className="
                              text-[9px]
                              font-semibold
                              uppercase
                              tracking-[0.2em]
                              text-blue-300/70
                              whitespace-nowrap
                            "
                          >
                            {item.label}
                          </span>

                          <div
                            className="
                              flex-1
                              h-px
                              bg-white/10
                            "
                          />
                        </div>
                      </div>
                    );
                  }

                  /* =========================================
                     MENU INFORMATION
                  ========================================= */

                  const hasChildren =
                    !!item.children;

                  const isChildActive =
                    hasChildren &&
                    item.children.some(
                      (child) =>
                        pathname === child.path
                    );

                  const isActive =
                    pathname === item.path ||
                    isChildActive;

                  const isOpen =
                    !!openMenus[item.key];

                  const collapsedIconMode =
                    collapsed;

                  const isFlyoutActive =
                    flyoutState?.key ===
                    item.key;

                  /* =========================================
                     MENU ITEM
                  ========================================= */

                  return (
                    <div
                      key={item.key}
                      className="
                        relative
                      "
                    >
                      <div
                        onClick={(event) =>
                          handleMenuClick(
                            item,
                            collapsedIconMode,
                            event.currentTarget
                          )
                        }
                        onMouseEnter={(event) => {
                          if (isMobile) {
                            return;
                          }

                          if (
                            collapsedIconMode &&
                            hasChildren
                          ) {
                            openFlyoutFor(
                              item,
                              event.currentTarget
                            );
                          }

                          if (
                            collapsedIconMode &&
                            !hasChildren
                          ) {
                            showItemTooltip(
                              item,
                              event.currentTarget
                            );
                          }
                        }}
                        onMouseLeave={() => {
                          if (isMobile) {
                            return;
                          }

                          if (
                            collapsedIconMode &&
                            hasChildren
                          ) {
                            scheduleCloseFlyout();
                          }

                          if (
                            collapsedIconMode &&
                            !hasChildren
                          ) {
                            hideItemTooltip();
                          }
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(event) => {
                          if (
                            event.key ===
                              "Enter" ||
                            event.key === " "
                          ) {
                            event.preventDefault();

                            handleMenuClick(
                              item,
                              collapsedIconMode,
                              event.currentTarget
                            );
                          }
                        }}
                        className={`
                          group
                          relative
                          flex
                          items-center
                          w-full
                          gap-3
                          px-3
                          py-2.5
                          rounded-xl
                          cursor-pointer
                          select-none
                          text-sm
                          font-medium
                          transition-all
                          duration-200
                          ease-out
                          ${
                            isActive
                              ? "text-white bg-white/10 border border-blue-500/30"
                              : "text-slate-300 hover:text-white hover:bg-white/10"
                          }
                          ${
                            collapsedIconMode
                              ? "justify-center px-2"
                              : ""
                          }
                        `}
                      >
                        {/* ACTIVE INDICATOR */}

                        {isActive && (
                          <div
                            className="
                              absolute
                              left-0
                              top-1/2
                              -translate-y-1/2
                              w-1
                              h-8
                              rounded-r-full
                              bg-gradient-to-b
                              from-blue-500
                              to-indigo-500
                            "
                          />
                        )}

                        {/* ICON */}

                        <div
                          className={`
                            relative
                            flex
                            items-center
                            justify-center
                            shrink-0
                            transition-all
                            duration-200
                            ${
                              isActive
                                ? "text-blue-400"
                                : "text-blue-400/70 group-hover:text-blue-300"
                            }
                            ${
                              collapsedIconMode
                                ? "w-10 h-10"
                                : ""
                            }
                          `}
                        >
                          <item.icon
                            size={20}
                            className={`
                              transition-all
                              duration-200
                              ${
                                isActive
                                  ? "scale-110"
                                  : ""
                              }
                              group-hover:scale-110
                            `}
                          />
                        </div>

                        {/* LABEL */}

                        {showLabels && (
                          <span
                            className="
                              flex-1
                              min-w-0
                              text-left
                              text-xs
                              tracking-wide
                              truncate
                            "
                          >
                            {item.label}
                          </span>
                        )}

                        {/* SUBMENU TOGGLE */}

                        {showLabels &&
                          hasChildren && (
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();

                                toggleSubmenu(
                                  item.key
                                );
                              }}
                              className="
                                shrink-0
                                p-1
                                -m-1
                                rounded-md
                                hover:bg-white/10
                                transition-colors
                                duration-150
                              "
                              title={
                                isOpen
                                  ? "Tutup submenu"
                                  : "Buka submenu"
                              }
                            >
                              <ChevronDown
                                size={14}
                                className={`
                                  text-slate-400
                                  transition-transform
                                  duration-200
                                  ${
                                    isOpen
                                      ? "rotate-180"
                                      : ""
                                  }
                                `}
                              />
                            </button>
                          )}

                        {/* ACTIVE DOT */}

                        {showLabels &&
                          !hasChildren &&
                          isActive && (
                            <div
                              className="
                                w-1.5
                                h-1.5
                                shrink-0
                                rounded-full
                                bg-blue-500
                              "
                            />
                          )}
                      </div>

                      {/* =====================================
                          DESKTOP SUBMENU
                      ===================================== */}

                      {hasChildren &&
                        showLabels && (
                          <div
                            className={`
                              overflow-hidden
                              transition-all
                              duration-200
                              ease-out
                              ${
                                isOpen
                                  ? "max-h-[600px] opacity-100 mt-0.5"
                                  : "max-h-0 opacity-0"
                              }
                            `}
                          >
                            <div
                              className="
                                ml-4
                                pl-3
                                py-1
                                space-y-0.5
                                border-l
                                border-white/10
                              "
                            >
                              {item.children.map(
                                (child) => {
                                  const isChildItemActive =
                                    pathname ===
                                    child.path;

                                  return (
                                    <button
                                      key={
                                        child.key
                                      }
                                      type="button"
                                      onClick={() =>
                                        handleSubItemClick(
                                          item.key,
                                          child
                                        )
                                      }
                                      className={`
                                        flex
                                        items-center
                                        w-full
                                        gap-2.5
                                        px-3
                                        py-2
                                        rounded-lg
                                        text-xs
                                        font-medium
                                        transition-all
                                        duration-200
                                        ${
                                          isChildItemActive
                                            ? "text-white bg-white/10 border border-blue-500/30"
                                            : "text-slate-400 hover:text-white hover:bg-white/10"
                                        }
                                      `}
                                    >
                                      <child.icon
                                        size={15}
                                        className={
                                          isChildItemActive
                                            ? "text-blue-400 shrink-0"
                                            : "text-slate-500 shrink-0"
                                        }
                                      />

                                      <span
                                        className="
                                          flex-1
                                          min-w-0
                                          text-left
                                          tracking-wide
                                          truncate
                                        "
                                      >
                                        {
                                          child.label
                                        }
                                      </span>

                                      {isChildItemActive && (
                                        <div
                                          className="
                                            w-1
                                            h-1
                                            shrink-0
                                            rounded-full
                                            bg-blue-500
                                          "
                                        />
                                      )}
                                    </button>
                                  );
                                }
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  );
                }
              )}
            </nav>
          </div>

          {/* =================================================
              SIDEBAR TOGGLE
          ================================================= */}

          <button
            type="button"
            onClick={toggleSidebar}
            title={
              collapsed
                ? "Buka Sidebar"
                : "Ciutkan Sidebar"
            }
            aria-label={
              collapsed
                ? "Buka Sidebar"
                : "Ciutkan Sidebar"
            }
            aria-expanded={!collapsed}
            className="
              absolute
              z-[100]
              top-8
              -right-3
              w-7
              h-7
              rounded-full
              bg-white
              border
              border-blue-200
              flex
              items-center
              justify-center
              text-blue-500
              shadow-md
              shadow-blue-100
              hover:bg-blue-50
              hover:text-blue-600
              hover:border-blue-300
              hover:scale-110
              active:scale-95
              transition-all
              duration-200
              ease-in-out
            "
          >
            <ChevronRight
              size={14}
              className={`
                transition-transform
                duration-300
                ease-in-out
                ${
                  collapsed
                    ? ""
                    : "rotate-180"
                }
              `}
            />
          </button>
        </aside>

        {/* ===================================================
            FLYOUT SUBMENU
            DESKTOP ONLY
        =================================================== */}

        {mounted &&
          flyoutState &&
          !isMobile &&
          createPortal(
            <div
              ref={flyoutPanelRef}
              onMouseEnter={
                clearCloseTimeout
              }
              onMouseLeave={
                scheduleCloseFlyout
              }
              style={{
                position: "fixed",
                top: flyoutState.top,
                left: flyoutState.left,
                zIndex: 9999,
              }}
              className="
                min-w-[230px]
                max-w-[320px]
                bg-[#0f1729]
                rounded-xl
                shadow-xl
                border
                border-white/10
                p-2
              "
            >
              {/* ARROW */}

              <div
                className="
                  absolute
                  -left-1.5
                  top-5
                  w-3
                  h-3
                  bg-[#0f1729]
                  border-l
                  border-b
                  border-white/10
                  rotate-45
                "
              />

              {/* TITLE */}

              <div
                className="
                  px-2
                  pt-1
                  pb-2
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-wider
                  text-slate-400
                  truncate
                "
              >
                {flyoutState.item.label}
              </div>

              {/* CHILDREN */}

              <div className="space-y-0.5">
                {flyoutState.item.children.map(
                  (child) => {
                    const isChildItemActive =
                      pathname ===
                      child.path;

                    return (
                      <button
                        key={child.key}
                        type="button"
                        onClick={() =>
                          handleSubItemClick(
                            flyoutState.item.key,
                            child
                          )
                        }
                        className={`
                          flex
                          items-center
                          w-full
                          gap-2.5
                          px-3
                          py-2
                          rounded-lg
                          text-xs
                          font-medium
                          text-left
                          transition-all
                          duration-200
                          ${
                            isChildItemActive
                              ? "text-white bg-blue-500/20 border border-blue-500/30"
                              : "text-slate-300 hover:text-white hover:bg-white/10"
                          }
                        `}
                      >
                        <child.icon
                          size={15}
                          className={
                            isChildItemActive
                              ? "text-blue-400 shrink-0"
                              : "text-slate-500 shrink-0"
                          }
                        />

                        <span
                          className="
                            flex-1
                            min-w-0
                            truncate
                          "
                        >
                          {child.label}
                        </span>

                        {isChildItemActive && (
                          <div
                            className="
                              w-1
                              h-1
                              shrink-0
                              rounded-full
                              bg-blue-500
                            "
                          />
                        )}
                      </button>
                    );
                  }
                )}
              </div>
            </div>,
            document.body
          )}

        {/* ===================================================
            LOGO TOOLTIP
        =================================================== */}

        {mounted &&
          logoTooltip &&
          createPortal(
            <div
              style={{
                position: "fixed",
                top: logoTooltip.top,
                left: logoTooltip.left,
                transform:
                  "translateY(-50%)",
                zIndex: 9999,
              }}
              className="
                px-3
                py-1.5
                rounded-lg
                bg-slate-800
                text-white
                text-[10px]
                font-bold
                whitespace-nowrap
                shadow-lg
                pointer-events-none
              "
            >
              {config.brandName}

              <div
                className="
                  absolute
                  -left-1.5
                  top-1/2
                  -translate-y-1/2
                  w-3
                  h-3
                  bg-slate-800
                  rotate-45
                "
              />
            </div>,
            document.body
          )}

        {/* ===================================================
            MENU ITEM TOOLTIP
        =================================================== */}

        {mounted &&
          itemTooltip &&
          createPortal(
            <div
              style={{
                position: "fixed",
                top: itemTooltip.top,
                left: itemTooltip.left,
                transform:
                  "translateY(-50%)",
                zIndex: 9999,
              }}
              className="
                px-3
                py-1.5
                rounded-lg
                bg-slate-800
                text-white
                text-[10px]
                font-bold
                whitespace-nowrap
                shadow-lg
                pointer-events-none
              "
            >
              {itemTooltip.label}

              <div
                className="
                  absolute
                  -left-1.5
                  top-1/2
                  -translate-y-1/2
                  w-3
                  h-3
                  bg-slate-800
                  rotate-45
                "
              />
            </div>,
            document.body
          )}
      </div>
    </>
  );
}