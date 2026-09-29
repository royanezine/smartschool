"use client";

import {
  useState,
  useEffect,
  useMemo,
  useLayoutEffect,
  useRef,
} from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  Crown,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";

import { guruSidebarConfig } from "./sidebar/guruSidebar";
import { superadminSidebarConfig } from "./sidebar/superadmin";
import { yayasanSidebarConfig } from "./sidebar/yayasanSidebar";
import { adminSidebarConfig } from "./sidebar/adminSidebar";
import { siswaSidebarConfig } from "./sidebar/siswaSidebar";

import {
  getAuthRole,
  getPermissions,
  getActiveModules,
} from "../../lib/auth";

/* =========================================================
   CONFIG
========================================================= */

const configByRole = {
  guru: guruSidebarConfig,
  "super-admin": superadminSidebarConfig,
  yayasan: yayasanSidebarConfig,
  admin: adminSidebarConfig,
  siswa: siswaSidebarConfig,
};

const DEFAULT_ROLE = "super-admin";

const SIDEBAR_COLLAPSED_KEY = "sidebar-collapsed";
const SIDEBAR_SCROLL_KEY = "sidebar-scroll-top";

const SIDEBAR_EXPANDED_WIDTH = "w-64";
const SIDEBAR_COLLAPSED_WIDTH = "w-[72px]";

/* =========================================================
   ROLE HELPERS
========================================================= */

/**
 * Normalisasi role dari backend/frontend.
 *
 * Contoh:
 *
 * admin-sekolah -> admin_sekolah
 * Admin_Sekolah -> admin_sekolah
 * ADMIN_SEKOLAH -> admin_sekolah
 */
function normalizeRole(role) {
  if (!role) return "";

  return String(role)
    .trim()
    .toLowerCase()
    .replace(/-/g, "_");
}

/**
 * Mengubah role backend menjadi role yang dipakai
 * oleh konfigurasi Sidebar.
 *
 * PENTING:
 *
 * admin_sekolah TETAP menjadi admin.
 *
 * Sarpras, SPMB, dan CMS sekarang
 * merupakan bagian dari area Admin Sekolah.
 */
function getSidebarRole(role) {
  const normalized = normalizeRole(role);

  if (normalized === "super_admin") {
    return "super-admin";
  }

  if (
    normalized === "admin" ||
    normalized === "admin_sekolah"
  ) {
    return "admin";
  }

  if (normalized === "admin_yayasan") {
    return "yayasan";
  }

  if (normalized === "guru") {
    return "guru";
  }

  if (normalized === "siswa") {
    return "siswa";
  }

  return DEFAULT_ROLE;
}

/**
 * Menentukan role berdasarkan URL.
 *
 * Semua route /admin sekarang menggunakan
 * Admin School Sidebar.
 *
 * Contoh:
 *
 * /admin
 * /admin/sarpras
 * /admin/spmb
 * /admin/cms
 *
 * semuanya -> admin
 */
function resolveRole(pathname = "") {
  if (pathname.startsWith("/guru")) {
    return "guru";
  }

  if (pathname.startsWith("/yayasan")) {
    return "yayasan";
  }

  if (pathname.startsWith("/super-admin")) {
    return "super-admin";
  }

  if (pathname.startsWith("/siswa")) {
    return "siswa";
  }

  if (pathname.startsWith("/admin")) {
    return "admin";
  }

  return DEFAULT_ROLE;
}

/**
 * Mengecek apakah menu boleh diakses role tertentu.
 *
 * Bisa menerima:
 *
 * role: "admin"
 *
 * atau:
 *
 * role: ["admin", "admin_sekolah"]
 */
function isRoleAllowed(menuRole, currentRole) {
  if (!menuRole) {
    return true;
  }

  const current = getSidebarRole(currentRole);

  if (Array.isArray(menuRole)) {
    return menuRole.some(
      (role) =>
        getSidebarRole(role) === current
    );
  }

  return (
    getSidebarRole(menuRole) === current
  );
}

/* =========================================================
   PERMISSION / MODULE
========================================================= */

function canViewMenu(
  item,
  permissions,
  modules
) {
  if (!item) {
    return false;
  }

  const permissionAllowed =
    !item.permission ||
    permissions.includes(item.permission);

  const moduleAllowed =
    !item.module ||
    modules.includes(item.module);

  return (
    permissionAllowed &&
    moduleAllowed
  );
}

/* =========================================================
   FILTER MENU
========================================================= */

function filterMenuItems(
  items,
  permissions,
  modules,
  currentRole
) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item) => {
      if (!item) {
        return null;
      }

      /* ================================================
         HEADER
      ================================================= */

      if (item.type === "header") {
        return {
          ...item,
          __header: true,
        };
      }

      /* ================================================
         ROLE
      ================================================= */

      if (
        !isRoleAllowed(
          item.role,
          currentRole
        )
      ) {
        return null;
      }

      /* ================================================
         CHILDREN
      ================================================= */

      if (Array.isArray(item.children)) {
        const filteredChildren =
          filterMenuItems(
            item.children,
            permissions,
            modules,
            currentRole
          );

        const parentAllowed =
          canViewMenu(
            item,
            permissions,
            modules
          );

        /*
         * Parent dan child sama-sama boleh
         */
        if (
          parentAllowed &&
          filteredChildren.length > 0
        ) {
          return {
            ...item,
            children:
              filteredChildren,
          };
        }

        /*
         * Parent tidak punya permission,
         * tetapi child boleh.
         */
        if (
          filteredChildren.length > 0
        ) {
          return {
            ...item,
            children:
              filteredChildren,
          };
        }

        /*
         * Parent boleh tetapi tidak
         * memiliki child yang visible.
         */
        if (parentAllowed) {
          return {
            ...item,
            children: [],
          };
        }

        return null;
      }

      /* ================================================
         NORMAL ITEM
      ================================================= */

      if (
        !canViewMenu(
          item,
          permissions,
          modules
        )
      ) {
        return null;
      }

      return item;
    })
    .filter(Boolean);
}

/* =========================================================
   REMOVE EMPTY HEADERS
========================================================= */

function removeEmptyHeaders(
  sections
) {
  if (!Array.isArray(sections)) {
    return [];
  }

  const result = [];

  for (
    let i = 0;
    i < sections.length;
    i++
  ) {
    const current =
      sections[i];

    if (!current) {
      continue;
    }

    if (
      current.type !== "header"
    ) {
      result.push(current);
      continue;
    }

    let hasItemAfterHeader =
      false;

    for (
      let j = i + 1;
      j < sections.length;
      j++
    ) {
      const next =
        sections[j];

      if (!next) {
        continue;
      }

      if (
        next.type === "header"
      ) {
        break;
      }

      hasItemAfterHeader = true;
      break;
    }

    if (hasItemAfterHeader) {
      result.push(current);
    }
  }

  return result;
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
  onClose,
}) {
  const router = useRouter();
  const pathname = usePathname();

  /* =======================================================
     STATE
  ======================================================= */

  const [
    collapsed,
    setCollapsedInternal,
  ] = useState(
    () => collapsedProp ?? false
  );

  const [isMobile, setIsMobile] =
    useState(false);

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const [
    allowTransition,
    setAllowTransition,
  ] = useState(false);

  const [mounted, setMounted] =
    useState(false);

  const [
    permissions,
    setPermissions,
  ] = useState([]);

  const [
    modules,
    setModules,
  ] = useState([]);

  /* =======================================================
     REFS
  ======================================================= */

  const sidebarNavRef =
    useRef(null);

  const flyoutPanelRef =
    useRef(null);

  const closeTimeoutRef =
    useRef(null);

  const logoWrapRef =
    useRef(null);

  const logoTooltipTimeoutRef =
    useRef(null);

  const itemTooltipTimeoutRef =
    useRef(null);

  /* =======================================================
     FLYOUT / TOOLTIP STATE
  ======================================================= */

  const [
    flyoutState,
    setFlyoutState,
  ] = useState(null);

  const [
    logoTooltip,
    setLogoTooltip,
  ] = useState(null);

  const [
    itemTooltip,
    setItemTooltip,
  ] = useState(null);

  /* =======================================================
     MOUNT
  ======================================================= */

  useEffect(() => {
    setMounted(true);
  }, []);

  /* =======================================================
     SET COLLAPSED
  ======================================================= */

  const setCollapsed = (
    value
  ) => {
    setCollapsedInternal(
      (prev) => {
        const next =
          typeof value ===
          "function"
            ? value(prev)
            : value;

        try {
          localStorage.setItem(
            SIDEBAR_COLLAPSED_KEY,
            String(next)
          );
        } catch (e) {
          /* ignore */
        }

        return next;
      }
    );
  };

  /* =======================================================
     SYNC WITH PARENT
  ======================================================= */

  useEffect(() => {
    setCollapsedProp?.(
      collapsed
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collapsed]);

  /* =======================================================
     LOAD PERMISSIONS
  ======================================================= */

  useEffect(() => {
    if (!mounted) {
      return;
    }

    const loadAuthData = () => {
      try {
        const userPermissions =
          getPermissions();

        const activeModules =
          getActiveModules();

        setPermissions(
          Array.isArray(
            userPermissions
          )
            ? userPermissions
            : []
        );

        setModules(
          Array.isArray(
            activeModules
          )
            ? activeModules
            : []
        );
      } catch (error) {
        console.error(
          "[SIDEBAR] Gagal membaca permission:",
          error
        );

        setPermissions([]);
        setModules([]);
      }
    };

    loadAuthData();

    const handleStorage = (
      event
    ) => {
      if (
        event.key ===
        "token"
      ) {
        loadAuthData();
      }
    };

    window.addEventListener(
      "storage",
      handleStorage
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorage
      );
    };
  }, [mounted]);

  /* =======================================================
     ROLE
  ======================================================= */

  const role = useMemo(() => {
    /*
     * =====================================================
     * ROLE DARI PROP
     * =====================================================
     */

    if (roleProp) {
      return getSidebarRole(
        roleProp
      );
    }

    /*
     * =====================================================
     * ROLE DARI TOKEN
     * =====================================================
     */

    const tokenRole =
      getAuthRole();

    if (tokenRole) {
      return getSidebarRole(
        tokenRole
      );
    }

    /*
     * =====================================================
     * FALLBACK BERDASARKAN URL
     * =====================================================
     */

    return resolveRole(
      pathname
    );
  }, [
    roleProp,
    pathname,
  ]);

  /* =======================================================
     CONFIG
  ======================================================= */

  const config =
    configByRole[role] ??
    configByRole[
      DEFAULT_ROLE
    ];

  /* =======================================================
     MENU
  ======================================================= */

  const menuSections =
    useMemo(() => {
      if (
        !config?.menuSections
      ) {
        return [];
      }

      const filtered =
        filterMenuItems(
          config.menuSections,
          permissions,
          modules,
          role
        );

      return removeEmptyHeaders(
        filtered
      );
    }, [
      config,
      permissions,
      modules,
      role,
    ]);

  /* =======================================================
     INITIAL RESPONSIVE MODE
  ======================================================= */

  useLayoutEffect(() => {
    const mediaQuery =
      window.matchMedia(
        "(max-width: 1023px)"
      );

    let stored = null;

    try {
      stored =
        localStorage.getItem(
          SIDEBAR_COLLAPSED_KEY
        );
    } catch (e) {
      stored = null;
    }

    const applyInitialMode = (
      mobile
    ) => {
      setIsMobile(
        mobile
      );

      if (stored !== null) {
        setCollapsedInternal(
          stored === "true"
        );
      } else if (mobile) {
        setCollapsedInternal(
          true
        );

        try {
          localStorage.setItem(
            SIDEBAR_COLLAPSED_KEY,
            "true"
          );
        } catch (e) {
          /* ignore */
        }
      }
    };

    applyInitialMode(
      mediaQuery.matches
    );

    const raf =
      requestAnimationFrame(
        () => {
          setAllowTransition(
            true
          );
        }
      );

    const handleMediaChange =
      (event) => {
        setIsMobile(
          event.matches
        );

        if (
          event.matches
        ) {
          setMobileOpen(
            false
          );
        }
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

      cancelAnimationFrame(
        raf
      );
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* =======================================================
     RESTORE SIDEBAR SCROLL
  ======================================================= */

  useLayoutEffect(() => {
    const nav =
      sidebarNavRef.current;

    if (!nav) {
      return;
    }

    let savedScrollTop = 0;

    try {
      const saved =
        sessionStorage.getItem(
          SIDEBAR_SCROLL_KEY
        );

      if (saved !== null) {
        savedScrollTop =
          Number(saved) || 0;
      }
    } catch (e) {
      savedScrollTop = 0;
    }

    const restoreScroll =
      () => {
        if (
          !sidebarNavRef.current
        ) {
          return;
        }

        sidebarNavRef.current.scrollTop =
          savedScrollTop;
      };

    restoreScroll();

    const raf1 =
      requestAnimationFrame(
        restoreScroll
      );

    const raf2 =
      requestAnimationFrame(
        () => {
          requestAnimationFrame(
            restoreScroll
          );
        }
      );

    return () => {
      cancelAnimationFrame(
        raf1
      );

      cancelAnimationFrame(
        raf2
      );
    };
  }, [
    pathname,
    role,
  ]);

  /* =======================================================
     SAVE SCROLL
  ======================================================= */

  useEffect(() => {
    const nav =
      sidebarNavRef.current;

    if (!nav) {
      return;
    }

    const handleSidebarScroll =
      () => {
        try {
          sessionStorage.setItem(
            SIDEBAR_SCROLL_KEY,
            String(
              nav.scrollTop
            )
          );
        } catch (e) {
          /* ignore */
        }
      };

    nav.addEventListener(
      "scroll",
      handleSidebarScroll,
      {
        passive: true,
      }
    );

    handleSidebarScroll();

    return () => {
      nav.removeEventListener(
        "scroll",
        handleSidebarScroll
      );
    };
  }, [
    pathname,
    role,
  ]);

  /* =======================================================
     LOCK BODY SCROLL MOBILE
  ======================================================= */

  useEffect(() => {
    if (
      isMobile &&
      !collapsed
    ) {
      document.body.style.overflow =
        "hidden";
    } else {
      document.body.style.overflow =
        "";
    }

    return () => {
      document.body.style.overflow =
        "";
    };
  }, [
    isMobile,
    collapsed,
  ]);

  /* =======================================================
     SUBMENU STATE
  ======================================================= */

  const [
    openMenus,
    setOpenMenus,
  ] = useState(() => {
    const initial = {};

    menuSections.forEach(
      (item) => {
        if (item.children) {
          initial[item.key] =
            true;
        }
      }
    );

    return initial;
  });

  useEffect(() => {
    const next = {};

    menuSections.forEach(
      (item) => {
        if (item.children) {
          next[item.key] =
            true;
        }
      }
    );

    setOpenMenus(
      (prev) => ({
        ...next,
        ...prev,
      })
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  /* =======================================================
     FLYOUT HELPERS
  ======================================================= */

  const clearCloseTimeout =
    () => {
      if (
        closeTimeoutRef.current
      ) {
        clearTimeout(
          closeTimeoutRef.current
        );

        closeTimeoutRef.current =
          null;
      }
    };

  const openFlyoutFor = (
    item,
    triggerElement
  ) => {
    clearCloseTimeout();

    if (!triggerElement) {
      return;
    }

    const rect =
      triggerElement.getBoundingClientRect();

    setFlyoutState({
      key: item.key,
      item,
      top: rect.top,
      left: rect.right + 12,
    });
  };

  const scheduleCloseFlyout =
    () => {
      clearCloseTimeout();

      closeTimeoutRef.current =
        setTimeout(() => {
          setFlyoutState(
            null
          );
        }, 150);
    };

  const toggleFlyoutByClick = (
    item,
    triggerElement
  ) => {
    setFlyoutState(
      (prev) => {
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
      }
    );
  };

  /* =======================================================
     CLOSE FLYOUT
  ======================================================= */

  useEffect(() => {
    if (!flyoutState) {
      return;
    }

    const handleOutsideClick =
      (event) => {
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
          setFlyoutState(
            null
          );
        }
      };

    const close = () =>
      setFlyoutState(null);

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    window.addEventListener(
      "resize",
      close
    );

    sidebarNavRef.current?.addEventListener(
      "scroll",
      close
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );

      window.removeEventListener(
        "resize",
        close
      );

      sidebarNavRef.current?.removeEventListener(
        "scroll",
        close
      );
    };
  }, [
    flyoutState,
  ]);

  useEffect(() => {
    if (!collapsed) {
      setFlyoutState(
        null
      );
    }
  }, [
    collapsed,
  ]);

  /* =======================================================
     LOGO TOOLTIP
  ======================================================= */

  const clearLogoTooltipTimeout =
    () => {
      if (
        logoTooltipTimeoutRef.current
      ) {
        clearTimeout(
          logoTooltipTimeoutRef.current
        );

        logoTooltipTimeoutRef.current =
          null;
      }
    };

  const showLogoTooltip =
    () => {
      clearLogoTooltipTimeout();

      if (
        !logoWrapRef.current
      ) {
        return;
      }

      const rect =
        logoWrapRef.current.getBoundingClientRect();

      setLogoTooltip({
        top:
          rect.top +
          rect.height / 2,
        left:
          rect.right + 12,
      });
    };

  const hideLogoTooltip =
    () => {
      clearLogoTooltipTimeout();

      logoTooltipTimeoutRef.current =
        setTimeout(() => {
          setLogoTooltip(
            null
          );
        }, 100);
    };

  useEffect(() => {
    if (!logoTooltip) {
      return;
    }

    const close = () =>
      setLogoTooltip(null);

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
  }, [
    logoTooltip,
  ]);

  /* =======================================================
     ITEM TOOLTIP
  ======================================================= */

  const clearItemTooltipTimeout =
    () => {
      if (
        itemTooltipTimeoutRef.current
      ) {
        clearTimeout(
          itemTooltipTimeoutRef.current
        );

        itemTooltipTimeoutRef.current =
          null;
      }
    };

  const showItemTooltip = (
    item,
    triggerElement
  ) => {
    clearItemTooltipTimeout();

    if (!triggerElement) {
      return;
    }

    const rect =
      triggerElement.getBoundingClientRect();

    setItemTooltip({
      key: item.key,
      label: item.label,
      top:
        rect.top +
        rect.height / 2,
      left:
        rect.right + 12,
    });
  };

  const hideItemTooltip =
    () => {
      clearItemTooltipTimeout();

      itemTooltipTimeoutRef.current =
        setTimeout(() => {
          setItemTooltip(
            null
          );
        }, 100);
    };

  useEffect(() => {
    if (!itemTooltip) {
      return;
    }

    const close = () =>
      setItemTooltip(null);

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
  }, [
    itemTooltip,
  ]);

  useEffect(() => {
    if (!collapsed) {
      setItemTooltip(
        null
      );
    }
  }, [
    collapsed,
  ]);

  useEffect(() => {
    if (flyoutState) {
      setItemTooltip(
        null
      );
    }
  }, [
    flyoutState,
  ]);

  /* =======================================================
     ACTIONS
  ======================================================= */

  const toggleSidebar =
    () =>
      setCollapsed(
        (prev) => !prev
      );

  const toggleSubmenu = (
    key
  ) => {
    setOpenMenus(
      (prev) => ({
        ...prev,
        [key]:
          !prev[key],
      })
    );
  };

  const handleMenuClick = (
    item,
    collapsedIconMode,
    triggerElement
  ) => {
    /*
     * =====================================================
     * COLLAPSED + ADA CHILDREN
     * =====================================================
     */

    if (
      collapsedIconMode &&
      item.children
    ) {
      if (isMobile) {
        if (item.path) {
          setActive?.(
            item.key
          );

          router.push(
            item.path
          );
        }

        return;
      }

      toggleFlyoutByClick(
        item,
        triggerElement
      );

      return;
    }

    setItemTooltip(
      null
    );

    const alreadyOnThisPage =
      pathname === item.path;

    setActive?.(
      item.key
    );

    /*
     * =====================================================
     * SUBMENU
     * =====================================================
     */

    if (
      item.children &&
      alreadyOnThisPage
    ) {
      toggleSubmenu(
        item.key
      );

      return;
    }

    /*
     * =====================================================
     * NAVIGATE
     * =====================================================
     */

    if (item.path) {
      router.push(
        item.path
      );
    }
  };

  const handleSubItemClick =
    (
      parentKey,
      child
    ) => {
      if (
        sidebarNavRef.current
      ) {
        try {
          sessionStorage.setItem(
            SIDEBAR_SCROLL_KEY,
            String(
              sidebarNavRef.current
                .scrollTop
            )
          );
        } catch (e) {
          /* ignore */
        }
      }

      setActive?.(
        child.key
      );

      router.push(
        child.path
      );

      setFlyoutState(
        null
      );

      setMobileOpen(
        false
      );

      if (onClose) {
        onClose();
      }
    };

  const handleLogout =
    () => {
      try {
        localStorage.removeItem(
          "token"
        );

        localStorage.removeItem(
          SIDEBAR_COLLAPSED_KEY
        );

        sessionStorage.removeItem(
          SIDEBAR_SCROLL_KEY
        );
      } catch (e) {
        console.error(
          "[SIDEBAR] Logout error:",
          e
        );
      }

      router.push(
        "/login"
      );
    };

  /* =======================================================
     DERIVED
  ======================================================= */

  const showLabels =
    !collapsed;

  const transitionClass =
    allowTransition
      ? "transition-[width,transform] duration-300 ease-in-out"
      : "transition-none";

  const desktopWidth =
    collapsed
      ? SIDEBAR_COLLAPSED_WIDTH
      : SIDEBAR_EXPANDED_WIDTH;

  /* =======================================================
     WRAPPER
  ======================================================= */

  const wrapperClasses =
    isMobile
      ? "relative shrink-0 h-screen w-[72px] z-50 overflow-visible"
      : `relative shrink-0 h-screen ${desktopWidth} z-40 overflow-visible sticky top-0 ${transitionClass}`;

  const isDrawerOpen =
    isMobile
      ? mobileOpen
      : !collapsed;

  /* =======================================================
     ASIDE
  ======================================================= */

  const asideClasses =
    isMobile
      ? `
        fixed
        inset-y-0
        left-0
        z-50
        ${
          collapsed
            ? SIDEBAR_COLLAPSED_WIDTH
            : "w-64 max-w-[85vw]"
        }
        bg-[#0f1729]
        flex
        flex-col
        border-r
        border-white/10
        overflow-visible
        ${transitionClass}
        ${
          isDrawerOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }
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

      {isMobile &&
        mobileOpen && (
          <div
            onClick={() =>
              setMobileOpen(
                false
              )
            }
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
          MOBILE TOGGLE
      =================================================== */}

      {isMobile &&
        !mobileOpen && (
          <button
            type="button"
            onClick={() =>
              setMobileOpen(
                true
              )
            }
            aria-label="Buka sidebar"
            className="
              fixed
              left-4
              top-4
              z-30
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-lg
              border
              border-white/10
              bg-[#0f1729]
              text-white
              shadow-lg
              hover:bg-[#1c2a4a]
              transition-all
              duration-200
              lg:hidden
            "
          >
            <Menu size={20} />
          </button>
        )}

      {/* ===================================================
          SIDEBAR WRAPPER
      =================================================== */}

      <div
        className={
          wrapperClasses
        }
      >
        <aside
          className={
            asideClasses
          }
        >
          <div className="relative z-10 flex flex-col h-full min-h-0 overflow-hidden">

            {/* =================================================
                TOP ACCENT
            ================================================= */}

            <div className="h-[3px] w-full bg-[#155DFC] shrink-0" />

            {/* =================================================
                LOGO HEADER
            ================================================= */}

            <div className="flex items-center h-20 px-4 shrink-0 border-b border-white/10 bg-[#1c2a4a]">
              <div
                ref={
                  logoWrapRef
                }
                onMouseEnter={
                  showLogoTooltip
                }
                onMouseLeave={
                  hideLogoTooltip
                }
                className={`flex items-center gap-3 min-w-0 ${
                  collapsed
                    ? "w-full justify-center"
                    : ""
                }`}
              >
                <div className="relative w-11 h-11 shrink-0 rounded-lg bg-white p-1.5 shadow-sm">
                  <Image
                    src="/logo/logoSS.png"
                    alt="Logo SmartSchool"
                    fill
                    sizes="44px"
                    className="object-contain p-1"
                    priority
                  />
                </div>

                {showLabels && (
                  <div className="flex flex-col min-w-0 leading-tight text-left">
                    <span className="text-xl font-bold tracking-tight text-white truncate">
                      Smart
                      <span className="text-blue-400">
                        School
                      </span>
                    </span>

                    
                  </div>
                )}
              </div>

              {/* =================================================
                  MOBILE CLOSE
              ================================================= */}

              {isMobile &&
                mobileOpen && (
                  <button
                    type="button"
                    onClick={() =>
                      setMobileOpen(
                        false
                      )
                    }
                    aria-label="Tutup sidebar"
                    className="
                      ml-auto
                      rounded-lg
                      p-1.5
                      text-slate-400
                      hover:bg-white/10
                      hover:text-white
                      transition
                    "
                  >
                    <X size={18} />
                  </button>
                )}
            </div>

            {/* =================================================
                NAVIGATION
            ================================================= */}

            <nav
              ref={
                sidebarNavRef
              }
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
              {menuSections.length >
              0 ? (
                menuSections.map(
                  (
                    item,
                    index
                  ) => {
                    /* =========================================
                       SECTION HEADER
                    ========================================= */

                    if (
                      item.type ===
                      "header"
                    ) {
                      if (
                        !showLabels
                      ) {
                        return null;
                      }

                      return (
                        <div
                          key={`header-${index}`}
                          className="px-2 pt-5 pb-2"
                        >
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-px bg-white/10" />

                            <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-blue-300/70 whitespace-nowrap">
                              {
                                item.label
                              }
                            </span>

                            <div className="flex-1 h-px bg-white/10" />
                          </div>
                        </div>
                      );
                    }

                    /* =========================================
                       MENU DATA
                    ========================================= */

                    const hasChildren =
                      !!item.children;

                    const isChildActive =
                      hasChildren &&
                      item.children.some(
                        (c) =>
                          pathname ===
                          c.path
                      );

                    const isActive =
                      pathname ===
                        item.path ||
                      isChildActive;

                    const isOpen =
                      !!openMenus[
                        item.key
                      ];

                    const collapsedIconMode =
                      collapsed;

                    const isFlyoutActive =
                      flyoutState?.key ===
                      item.key;

                    return (
                      <div
                        key={
                          item.key
                        }
                        className="relative"
                      >
                        <div
                          onClick={(
                            event
                          ) =>
                            handleMenuClick(
                              item,
                              collapsedIconMode,
                              event.currentTarget
                            )
                          }
                          onMouseEnter={(
                            event
                          ) => {
                            if (
                              isMobile
                            ) {
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
                            if (
                              isMobile
                            ) {
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
                          onKeyDown={(
                            event
                          ) => {
                            if (
                              event.key ===
                                "Enter" ||
                              event.key ===
                                " "
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
                          {/* =================================
                              ACTIVE INDICATOR
                          ================================= */}

                          {isActive && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-gradient-to-b from-blue-500 to-indigo-500" />
                          )}

                          {/* =================================
                              ICON
                          ================================= */}

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
                            {item.icon && (
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
                            )}
                          </div>

                          {/* =================================
                              LABEL
                          ================================= */}

                          {showLabels && (
                            <span className="flex-1 min-w-0 text-left text-xs tracking-wide truncate">
                              {
                                item.label
                              }
                            </span>
                          )}

                          {/* =================================
                              SUBMENU TOGGLE
                          ================================= */}

                          {showLabels &&
                            hasChildren && (
                              <button
                                type="button"
                                onClick={(
                                  event
                                ) => {
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
                                  size={
                                    14
                                  }
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

                          {/* =================================
                              ACTIVE DOT
                          ================================= */}

                          {showLabels &&
                            !hasChildren &&
                            isActive && (
                              <div className="w-1.5 h-1.5 shrink-0 rounded-full bg-blue-500" />
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
                              <div className="ml-4 pl-3 py-1 space-y-0.5 border-l border-white/10">
                                {item.children.map(
                                  (
                                    child
                                  ) => {
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
                                        {child.icon && (
                                          <child.icon
                                            size={
                                              15
                                            }
                                            className={
                                              isChildItemActive
                                                ? "text-blue-400 shrink-0"
                                                : "text-slate-500 shrink-0"
                                            }
                                          />
                                        )}

                                        <span className="flex-1 min-w-0 text-left tracking-wide truncate">
                                          {
                                            child.label
                                          }
                                        </span>

                                        {isChildItemActive && (
                                          <div className="w-1 h-1 shrink-0 rounded-full bg-blue-500" />
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
                )
              ) : (
                <div
                  className={`
                    mt-6
                    text-center
                    text-xs
                    text-slate-400
                    ${
                      collapsed
                        ? "px-1"
                        : "px-4"
                    }
                  `}
                >
                  {!collapsed &&
                    "Tidak ada menu yang tersedia"}
                </div>
              )}
            </nav>
          </div>

          {/* =================================================
              SIDEBAR TOGGLE DESKTOP
          ================================================= */}

          {!isMobile && (
            <button
              type="button"
              onClick={
                toggleSidebar
              }
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
              aria-expanded={
                !collapsed
              }
              className="
                absolute
                z-[100]
                top-24
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
          )}
        </aside>

        {/* ===================================================
            FLYOUT SUBMENU
        =================================================== */}

        {mounted &&
          flyoutState &&
          !isMobile &&
          createPortal(
            <div
              ref={
                flyoutPanelRef
              }
              onMouseEnter={
                clearCloseTimeout
              }
              onMouseLeave={
                scheduleCloseFlyout
              }
              style={{
                position:
                  "fixed",
                top:
                  flyoutState.top,
                left:
                  flyoutState.left,
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
              <div className="absolute -left-1.5 top-5 w-3 h-3 bg-[#0f1729] border-l border-b border-white/10 rotate-45" />

              <div className="px-2 pt-1 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">
                {
                  flyoutState
                    .item
                    .label
                }
              </div>

              <div className="space-y-0.5">
                {flyoutState.item.children.map(
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
                            flyoutState
                              .item
                              .key,
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
                        {child.icon && (
                          <child.icon
                            size={15}
                            className={
                              isChildItemActive
                                ? "text-blue-400 shrink-0"
                                : "text-slate-500 shrink-0"
                            }
                          />
                        )}

                        <span className="flex-1 min-w-0 truncate">
                          {
                            child.label
                          }
                        </span>

                        {isChildItemActive && (
                          <div className="w-1 h-1 shrink-0 rounded-full bg-blue-500" />
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
                position:
                  "fixed",
                top:
                  logoTooltip.top,
                left:
                  logoTooltip.left,
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
              {
                config.brandName
              }

              <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-slate-800 rotate-45" />
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
                position:
                  "fixed",
                top:
                  itemTooltip.top,
                left:
                  itemTooltip.left,
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
              {
                itemTooltip.label
              }

              <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-slate-800 rotate-45" />
            </div>,
            document.body
          )}
      </div>
    </>
  );
}