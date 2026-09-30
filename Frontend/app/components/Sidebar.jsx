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
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
} from "lucide-react";

/* =========================================================
   NAVIGATION CONFIG
========================================================= */

import { guruSidebarConfig } from "../../configs/navigation/guru";
import { superadminSidebarConfig } from "../../configs/navigation/superAdmin";
import { yayasanSidebarConfig } from "../../configs/navigation/yayasan";
import { adminSidebarConfig } from "../../configs/navigation/admin";
import { siswaSidebarConfig } from "../../configs/navigation/siswa";

import {
  getAuthRole,
  getPermissions,
  getActiveModules,
} from "../../lib/auth";

/* =========================================================
   CONFIG BY ROLE
========================================================= */

const configByRole = {
  guru: guruSidebarConfig,
  "super-admin": superadminSidebarConfig,
  yayasan: yayasanSidebarConfig,
  admin: adminSidebarConfig,
  siswa: siswaSidebarConfig,
};

const DEFAULT_ROLE = "admin";

/* =========================================================
   CONSTANTS
========================================================= */

const SIDEBAR_COLLAPSED_KEY = "sidebar-collapsed";
const SIDEBAR_SCROLL_KEY = "sidebar-scroll-top";

const SIDEBAR_EXPANDED_WIDTH = "w-64";
const SIDEBAR_COLLAPSED_WIDTH = "w-[72px]";

/* =========================================================
   ACTIVE STYLE
========================================================= */

/*
 * LIGHT:
 * biru terang + teks putih
 *
 * DARK:
 * biru gelap + teks biru terang
 */

const ACTIVE_SOLID = `
  bg-[#2474e8]
  text-white
  shadow-md
  shadow-blue-300/40

  dark:bg-blue-900/70
  dark:text-blue-100
  dark:border
  dark:border-blue-700/60
  dark:shadow-none
`;

/* =========================================================
   ROLE HELPERS
========================================================= */

function normalizeRole(role) {
  if (!role) {
    return "";
  }

  return String(role)
    .trim()
    .toLowerCase()
    .replace(/-/g, "_");
}

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

  if (
    normalized === "admin_yayasan" ||
    normalized === "yayasan"
  ) {
    return "yayasan";
  }

  if (normalized === "guru") {
    return "guru";
  }

  if (normalized === "siswa") {
    return "siswa";
  }

  return "";
}

/* =========================================================
   RESOLVE ROLE FROM URL
========================================================= */

function resolveRole(pathname = "") {
  const path = String(pathname || "")
    .trim()
    .toLowerCase();

  if (
    path === "/super-admin" ||
    path.startsWith("/super-admin/")
  ) {
    return "super-admin";
  }

  if (
    path === "/yayasan" ||
    path.startsWith("/yayasan/")
  ) {
    return "yayasan";
  }

  if (
    path === "/guru" ||
    path.startsWith("/guru/")
  ) {
    return "guru";
  }

  if (
    path === "/siswa" ||
    path.startsWith("/siswa/")
  ) {
    return "siswa";
  }

  if (
    path === "/adminperpustakaan" ||
    path.startsWith("/adminperpustakaan/")
  ) {
    return "admin";
  }

  if (
    path === "/admin" ||
    path.startsWith("/admin/")
  ) {
    return "admin";
  }

  return "";
}

/* =========================================================
   ROLE ACCESS
========================================================= */

function isRoleAllowed(menuRole, currentRole) {
  if (!menuRole) {
    return true;
  }

  const current = getSidebarRole(currentRole);

  if (Array.isArray(menuRole)) {
    return menuRole.some(
      (role) => getSidebarRole(role) === current
    );
  }

  return getSidebarRole(menuRole) === current;
}

/* =========================================================
   PERMISSION / MODULE
========================================================= */

function canViewMenu(item, permissions, modules) {
  if (!item) {
    return false;
  }

  const permissionAllowed =
    !item.permission ||
    permissions.includes(item.permission);

  const moduleAllowed =
    !item.module ||
    modules.includes(item.module);

  return permissionAllowed && moduleAllowed;
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

      /* HEADER */

      if (item.type === "header") {
        return {
          ...item,
          __header: true,
        };
      }

      /* ROLE */

      if (!isRoleAllowed(item.role, currentRole)) {
        return null;
      }

      /* CHILDREN */

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

        if (
          parentAllowed &&
          filteredChildren.length > 0
        ) {
          return {
            ...item,
            children: filteredChildren,
          };
        }

        if (filteredChildren.length > 0) {
          return {
            ...item,
            children: filteredChildren,
          };
        }

        if (parentAllowed) {
          return {
            ...item,
            children: [],
          };
        }

        return null;
      }

      /* NORMAL ITEM */

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

function removeEmptyHeaders(sections) {
  if (!Array.isArray(sections)) {
    return [];
  }

  const result = [];

  for (let i = 0; i < sections.length; i++) {
    const current = sections[i];

    if (!current) {
      continue;
    }

    if (current.type !== "header") {
      result.push(current);
      continue;
    }

    let hasItemAfterHeader = false;

    for (
      let j = i + 1;
      j < sections.length;
      j++
    ) {
      const next = sections[j];

      if (!next) {
        continue;
      }

      if (next.type === "header") {
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

  const [permissions, setPermissions] =
    useState([]);

  const [modules, setModules] =
    useState([]);

  /* =======================================================
     REFS
  ======================================================= */

  const sidebarNavRef = useRef(null);
  const flyoutPanelRef = useRef(null);

  const closeTimeoutRef =
    useRef(null);

  const logoWrapRef =
    useRef(null);

  const logoTooltipTimeoutRef =
    useRef(null);

  const itemTooltipTimeoutRef =
    useRef(null);

  /* =======================================================
     FLYOUT / TOOLTIP
  ======================================================= */

  const [flyoutState, setFlyoutState] =
    useState(null);

  const [logoTooltip, setLogoTooltip] =
    useState(null);

  const [itemTooltip, setItemTooltip] =
    useState(null);

  /* =======================================================
     MOUNT
  ======================================================= */

  useEffect(() => {
    setMounted(true);
  }, []);

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
      } catch (e) {
        /* ignore */
      }

      return next;
    });
  };

  /* =======================================================
     SYNC PARENT
  ======================================================= */

  useEffect(() => {
    setCollapsedProp?.(collapsed);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collapsed]);

  /* =======================================================
     LOAD AUTH DATA
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
          Array.isArray(userPermissions)
            ? userPermissions
            : []
        );

        setModules(
          Array.isArray(activeModules)
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

    const handleStorage = (event) => {
      if (event.key === "token") {
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
    const pathnameRole =
      resolveRole(pathname);

    /* URL */

    if (pathnameRole) {
      return pathnameRole;
    }

    /* PROP */

    if (roleProp) {
      const propRole =
        getSidebarRole(roleProp);

      if (propRole) {
        return propRole;
      }
    }

    /* TOKEN */

    const tokenRole =
      getAuthRole();

    if (tokenRole) {
      const normalizedTokenRole =
        getSidebarRole(tokenRole);

      if (normalizedTokenRole) {
        return normalizedTokenRole;
      }
    }

    return DEFAULT_ROLE;
  }, [pathname, roleProp]);

  /* =======================================================
     CONFIG
  ======================================================= */

  const config =
    configByRole[role] ??
    configByRole[DEFAULT_ROLE];

  /* =======================================================
     MENU
  ======================================================= */

  const menuSections =
    useMemo(() => {
      if (
        !config ||
        !Array.isArray(
          config.menuSections
        )
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
     RESPONSIVE
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
        } catch (e) {
          /* ignore */
        }
      }
    };

    applyInitialMode(
      mediaQuery.matches
    );

    const raf =
      requestAnimationFrame(() => {
        setAllowTransition(true);
      });

    const handleMediaChange =
      (event) => {
        setIsMobile(
          event.matches
        );

        if (event.matches) {
          setMobileOpen(false);
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

      cancelAnimationFrame(raf);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* =======================================================
     RESTORE SCROLL
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

    const restoreScroll = () => {
      if (!sidebarNavRef.current) {
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
      requestAnimationFrame(() => {
        requestAnimationFrame(
          restoreScroll
        );
      });

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [pathname, role]);

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
            String(nav.scrollTop)
          );
        } catch (e) {
          /* ignore */
        }
      };

    nav.addEventListener(
      "scroll",
      handleSidebarScroll,
      { passive: true }
    );

    handleSidebarScroll();

    return () => {
      nav.removeEventListener(
        "scroll",
        handleSidebarScroll
      );
    };
  }, [pathname, role]);

  /* =======================================================
     BODY LOCK MOBILE
  ======================================================= */

  useEffect(() => {
    if (
      isMobile &&
      mobileOpen
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
  }, [isMobile, mobileOpen]);

  /* =======================================================
     SUBMENU STATE
  ======================================================= */

  const [openMenus, setOpenMenus] =
    useState(() => {
      const initial = {};

      menuSections.forEach(
        (item) => {
          if (
            Array.isArray(
              item.children
            )
          ) {
            initial[item.key] = true;
          }
        }
      );

      return initial;
    });

  useEffect(() => {
    const next = {};

    menuSections.forEach(
      (item) => {
        if (
          Array.isArray(
            item.children
          )
        ) {
          next[item.key] = true;
        }
      }
    );

    setOpenMenus((prev) => ({
      ...next,
      ...prev,
    }));
  }, [menuSections, role]);

  /* =======================================================
     FLYOUT
  ======================================================= */

  const clearCloseTimeout = () => {
    if (closeTimeoutRef.current) {
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
    if (!triggerElement) {
      return;
    }

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
          setFlyoutState(null);
        }
      };

    const close = () =>
      setFlyoutState(null);

    const nav =
      sidebarNavRef.current;

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    window.addEventListener(
      "resize",
      close
    );

    nav?.addEventListener(
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

      nav?.removeEventListener(
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

  const showLogoTooltip = () => {
    clearLogoTooltipTimeout();

    if (!logoWrapRef.current) {
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

  const hideLogoTooltip = () => {
    clearLogoTooltipTimeout();

    logoTooltipTimeoutRef.current =
      setTimeout(() => {
        setLogoTooltip(null);
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
  }, [logoTooltip]);

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

  const hideItemTooltip = () => {
    clearItemTooltipTimeout();

    itemTooltipTimeoutRef.current =
      setTimeout(() => {
        setItemTooltip(null);
      }, 100);
  };

  useEffect(() => {
    if (!itemTooltip) {
      return;
    }

    const close = () =>
      setItemTooltip(null);

    const nav =
      sidebarNavRef.current;

    window.addEventListener(
      "resize",
      close
    );

    window.addEventListener(
      "scroll",
      close,
      true
    );

    nav?.addEventListener(
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

      nav?.removeEventListener(
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
     ACTIONS
  ======================================================= */

  const toggleSidebar = () => {
    setCollapsed(
      (prev) => !prev
    );
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
    /* COLLAPSED + CHILDREN */

    if (
      collapsedIconMode &&
      Array.isArray(item.children) &&
      item.children.length > 0
    ) {
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

    /* SUBMENU */

    if (
      Array.isArray(item.children) &&
      alreadyOnThisPage
    ) {
      toggleSubmenu(item.key);

      return;
    }

    /* NAVIGATE */

    if (item.path) {
      router.push(item.path);
    }
  };

  const handleSubItemClick = (
    parentKey,
    child
  ) => {
    if (sidebarNavRef.current) {
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

    setActive?.(child.key);

    if (child.path) {
      router.push(child.path);
    }

    setFlyoutState(null);
    setMobileOpen(false);

    if (onClose) {
      onClose();
    }
  };

  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout = () => {
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

    router.push("/login");
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

          bg-[#f4f8ff]
          dark:bg-[#0b1220]

          flex
          flex-col

          border-r
          border-blue-100
          dark:border-slate-800

          overflow-visible

          ${transitionClass}

          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `
      : `
          relative
          ${desktopWidth}
          h-screen

          bg-[#f4f8ff]
          dark:bg-[#0b1220]

          flex
          flex-col
          flex-shrink-0

          border-r
          border-blue-100
          dark:border-slate-800

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
              setMobileOpen(false)
            }
            className="
              fixed
              inset-0
              z-40

              bg-slate-900/40
              dark:bg-black/70

              backdrop-blur-sm
              transition-opacity
              duration-300
            "
            aria-hidden="true"
          />
        )}

      {/* ===================================================
          MOBILE OPEN BUTTON
      =================================================== */}

      {isMobile &&
        !mobileOpen && (
          <button
            type="button"
            onClick={() =>
              setMobileOpen(true)
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

              rounded-xl

              bg-[#2474e8]
              dark:bg-blue-800

              text-white

              shadow-lg
              dark:shadow-black/40

              hover:bg-blue-600
              dark:hover:bg-blue-700

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
          <div
            className="
              relative
              z-10
              flex
              flex-col
              h-full
              min-h-0
              overflow-hidden

              bg-[#f4f8ff]
              dark:bg-[#0b1220]
            "
          >
            {/* =================================================
                HEADER
            ================================================= */}

            <div
              className="
                relative
                h-[112px]
                shrink-0

                bg-[#2474e8]
                dark:bg-[#102a43]

                overflow-visible
              "
            >
              {/* LOGO + BRAND */}

              <div
                ref={logoWrapRef}
                onMouseEnter={
                  collapsed
                    ? showLogoTooltip
                    : undefined
                }
                onMouseLeave={
                  collapsed
                    ? hideLogoTooltip
                    : undefined
                }
                className="
                  absolute
                  left-3
                  top-4
                  z-20

                  flex
                  items-center
                  gap-3

                  min-w-0
                "
              >
              <div
  className="
    relative
    w-12
    h-12
    shrink-0

    rounded-full

    bg-white
    dark:bg-blue-100

    shadow-md
    shadow-blue-900/20
    dark:shadow-black/30

    ring-2
    ring-white/40
    dark:ring-blue-300/20
  "
>
                  <Image
                    src="/logo/logoSS.png"
                    alt="Logo SmartSchool"
                    fill
                    sizes="48px"
                    className="
                      object-contain
                      p-2
                    "
                    priority
                  />
                </div>

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
                        text-[17px]
                        font-semibold
                        tracking-tight

                        text-white

                        truncate
                      "
                    >
                      Smart
                      <span
                        className="
                          text-blue-100
                          dark:text-blue-300
                        "
                      >
                        School
                      </span>
                    </span>

                    <span
                      className="
                        mt-0.5

                        text-[9px]
                        font-medium
                        tracking-[0.1em]
                        uppercase

                        text-white/85
                        dark:text-blue-200/80

                        truncate
                      "
                    >
                      {config?.brandName ||
                        "ADMIN SEKOLAH"}
                    </span>
                  </div>
                )}
              </div>

              {/* MOBILE CLOSE */}

              {isMobile &&
                mobileOpen && (
                  <button
                    type="button"
                    onClick={() =>
                      setMobileOpen(false)
                    }
                    aria-label="Tutup sidebar"
                    className="
                      absolute
                      right-3
                      top-4
                      z-20

                      rounded-lg
                      p-1.5

                      text-white/80
                      dark:text-blue-100/80

                      hover:bg-white/15
                      dark:hover:bg-blue-900/40

                      hover:text-white
                      dark:hover:text-white

                      transition
                    "
                  >
                    <X size={18} />
                  </button>
                )}

              {/* =================================================
                  CURVE
              ================================================= */}

              <svg
                className="
                  absolute
                  left-0
                  bottom-[-1px]
                  w-full
                  h-[42px]
                  z-10

                  pointer-events-none
                "
                viewBox="0 0 320 42"
                preserveAspectRatio="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="
                    M0 0
                    C70 28, 250 28, 320 0
                    L320 42
                    L0 42
                    Z
                  "
                  className="
                    fill-[#f4f8ff]
                    dark:fill-[#0b1220]
                  "
                />
              </svg>
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
                py-2
                space-y-1
                pb-6

                scrollbar-thin

                scrollbar-thumb-blue-200
                dark:scrollbar-thumb-slate-700

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
                    /* =================================================
                       HEADER
                    ================================================= */

                    if (
                      item.type ===
                      "header"
                    ) {
                      if (
                        !showLabels
                      ) {
                        return (
                          <div
                            key={`header-${index}`}
                            className="px-3 py-2"
                          >
                            <div
                              className="
                                h-px

                                bg-slate-200
                                dark:bg-slate-800
                              "
                            />
                          </div>
                        );
                      }

                      return (
                        <div
                          key={`header-${index}`}
                          className="
                            px-2
                            pt-4
                            pb-2
                          "
                        >
                          <div
                            className="
                              flex
                              items-center
                              gap-3
                            "
                          >
                            <div
                              className="
                                flex-1
                                h-px

                                bg-slate-300
                                dark:bg-slate-700
                              "
                            />

                            <span
                              className="
                                text-[10px]
                                font-medium
                                uppercase
                                tracking-[0.18em]
                                whitespace-nowrap

                                text-blue-600
                                dark:text-blue-400
                              "
                            >
                              {
                                item.label
                              }
                            </span>

                            <div
                              className="
                                flex-1
                                h-px

                                bg-slate-300
                                dark:bg-slate-700
                              "
                            />
                          </div>
                        </div>
                      );
                    }

                    /* =================================================
                       MENU
                    ================================================= */

                    const hasChildren =
                      Array.isArray(
                        item.children
                      ) &&
                      item.children
                        .length >
                        0;

                    const isChildActive =
                      hasChildren &&
                      item.children.some(
                        (
                          child
                        ) =>
                          pathname ===
                          child.path
                      );

                    const isLeafActive =
                      !hasChildren &&
                      pathname ===
                        item.path;

                    const isOpen =
                      !!openMenus[
                        item.key
                      ];

                    const collapsedIconMode =
                      collapsed;

                    /* =================================================
                       MENU STATE
                    ================================================= */

                    let stateClass = `
                      text-slate-700
                      dark:text-slate-300

                      hover:bg-blue-50
                      dark:hover:bg-slate-800

                      hover:text-blue-700
                      dark:hover:text-blue-300
                    `;

                    if (
                      isLeafActive
                    ) {
                      stateClass =
                        ACTIVE_SOLID;
                    } else if (
                      hasChildren &&
                      isChildActive &&
                      collapsedIconMode
                    ) {
                      stateClass = `
                        text-blue-700
                        bg-blue-100

                        dark:text-blue-200
                        dark:bg-blue-900/50
                        dark:border
                        dark:border-blue-800/60
                      `;
                    }

                    const iconColor =
                      isLeafActive
                        ? "text-white"
                        : `
                            text-blue-600
                            dark:text-blue-400
                          `;

                    return (
                      <div
                        key={item.key}
                        className="relative"
                      >
                        {/* =================================================
                           MAIN MENU BUTTON
                        ================================================= */}

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

                            text-[13px]
                            font-medium

                            transition-all
                            duration-200
                            ease-out

                            ${stateClass}

                            ${
                              collapsedIconMode
                                ? "justify-center px-2"
                                : ""
                            }
                          `}
                        >
                          {/* ACTIVE INDICATOR */}

                          {isLeafActive &&
                            !collapsedIconMode && (
                              <div
                                className="
                                  absolute
                                  left-0
                                  top-1/2
                                  -translate-y-1/2

                                  w-1
                                  h-8

                                  rounded-r-full

                                  bg-blue-500
                                  dark:bg-blue-400
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

                              ${iconColor}

                              ${
                                collapsedIconMode
                                  ? "w-10 h-10"
                                  : ""
                              }
                            `}
                          >
                            {item.icon && (
                              <item.icon
                                size={18}
                                className="
                                  transition-transform
                                  duration-200

                                  group-hover:scale-105
                                "
                              />
                            )}
                          </div>

                          {/* LABEL */}

                          {showLabels && (
                            <span
                              className="
                                flex-1
                                min-w-0

                                text-left
                                truncate
                              "
                            >
                              {
                                item.label
                              }
                            </span>
                          )}

                          {/* SUBMENU ARROW */}

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

                                  text-slate-500
                                  dark:text-slate-400

                                  hover:bg-blue-100
                                  dark:hover:bg-slate-700

                                  hover:text-blue-600
                                  dark:hover:text-blue-300

                                  transition-colors
                                  duration-150
                                "
                                title={
                                  isOpen
                                    ? "Tutup submenu"
                                    : "Buka submenu"
                                }
                              >
                                {isOpen ? (
                                  <ChevronUp
                                    size={
                                      15
                                    }
                                  />
                                ) : (
                                  <ChevronDown
                                    size={
                                      15
                                    }
                                  />
                                )}
                              </button>
                            )}
                        </div>

                        {/* =================================================
                           SUBMENU
                        ================================================= */}

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
                                    ? "max-h-[600px] opacity-100 mt-1"
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

                                  border-blue-100
                                  dark:border-slate-700
                                "
                              >
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
                                          gap-3

                                          px-3
                                          py-2

                                          rounded-xl

                                          text-[12.5px]

                                          transition-all
                                          duration-200

                                          ${
                                            isChildItemActive
                                              ? `${ACTIVE_SOLID} font-medium`
                                              : `
                                                  font-normal

                                                  text-slate-600
                                                  dark:text-slate-400

                                                  hover:text-blue-700
                                                  dark:hover:text-blue-300

                                                  hover:bg-blue-50
                                                  dark:hover:bg-slate-800
                                                `
                                          }
                                        `}
                                      >
                                        {child.icon && (
                                          <child.icon
                                            size={
                                              16
                                            }
                                            className={`
                                              shrink-0

                                              ${
                                                isChildItemActive
                                                  ? "text-white dark:text-blue-100"
                                                  : "text-slate-500 dark:text-slate-500"
                                              }
                                            `}
                                          />
                                        )}

                                        <span
                                          className="
                                            flex-1
                                            min-w-0
                                            text-left
                                            truncate
                                          "
                                        >
                                          {
                                            child.label
                                          }
                                        </span>

                                        {isChildItemActive && (
                                          <ChevronDown
                                            size={
                                              12
                                            }
                                            className="
                                              shrink-0

                                              text-white
                                              dark:text-blue-200
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
                )
              ) : (
                <div
                  className={`
                    mt-6

                    text-center
                    text-xs

                    text-slate-400
                    dark:text-slate-600

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
              DESKTOP TOGGLE
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

                top-8
                -right-3

                w-7
                h-7

                rounded-full

                bg-white
                dark:bg-slate-900

                border
                border-blue-200
                dark:border-slate-700

                flex
                items-center
                justify-center

                text-blue-500
                dark:text-blue-400

                shadow-md
                shadow-blue-100
                dark:shadow-black/40

                hover:bg-blue-50
                dark:hover:bg-slate-800

                hover:text-blue-600
                dark:hover:text-blue-300

                hover:border-blue-300
                dark:hover:border-blue-600

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

                bg-white
                dark:bg-[#111827]

                rounded-xl

                shadow-xl
                dark:shadow-black/50

                border
                border-blue-100
                dark:border-slate-700

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

                  bg-white
                  dark:bg-[#111827]

                  border-l
                  border-b

                  border-blue-100
                  dark:border-slate-700

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
                  font-semibold
                  uppercase
                  tracking-wider

                  text-slate-400
                  dark:text-slate-500

                  truncate
                "
              >
                {
                  flyoutState.item
                    .label
                }
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
                          gap-3

                          px-3
                          py-2

                          rounded-xl

                          text-[12.5px]
                          text-left

                          transition-all
                          duration-200

                          ${
                            isChildItemActive
                              ? `${ACTIVE_SOLID} font-medium`
                              : `
                                  font-normal

                                  text-slate-600
                                  dark:text-slate-400

                                  hover:text-blue-700
                                  dark:hover:text-blue-300

                                  hover:bg-blue-50
                                  dark:hover:bg-slate-800
                                `
                          }
                        `}
                      >
                        {child.icon && (
                          <child.icon
                            size={16}
                            className={`
                              shrink-0

                              ${
                                isChildItemActive
                                  ? "text-white dark:text-blue-100"
                                  : "text-slate-500 dark:text-slate-500"
                              }
                            `}
                          />
                        )}

                        <span
                          className="
                            flex-1
                            min-w-0
                            truncate
                          "
                        >
                          {
                            child.label
                          }
                        </span>
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
                dark:bg-slate-700

                text-white

                text-[10px]
                font-medium

                whitespace-nowrap

                shadow-lg
                dark:shadow-black/50

                pointer-events-none
              "
            >
              {config?.brandName ??
                "SmartSchool"}

              <div
                className="
                  absolute
                  -left-1.5
                  top-1/2
                  -translate-y-1/2

                  w-3
                  h-3

                  bg-slate-800
                  dark:bg-slate-700

                  rotate-45
                "
              />
            </div>,
            document.body
          )}

        {/* ===================================================
            MENU TOOLTIP
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
                dark:bg-slate-700

                text-white

                text-[10px]
                font-medium

                whitespace-nowrap

                shadow-lg
                dark:shadow-black/50

                pointer-events-none
              "
            >
              {
                itemTooltip.label
              }

              <div
                className="
                  absolute
                  -left-1.5
                  top-1/2
                  -translate-y-1/2

                  w-3
                  h-3

                  bg-slate-800
                  dark:bg-slate-700

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