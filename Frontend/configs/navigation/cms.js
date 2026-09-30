import {
  LayoutDashboard,
  FileText,
  File,
  Image,
  LayoutPanelTop,
  Menu,
  Megaphone,
  Calendar,
  Settings,
  FolderOpen,
  Images,
  ListTree,
  CalendarDays,
  Globe,
  Share2,
  Palette,
  Clock,
  Layers,
} from "lucide-react";

export const cmsSidebarConfig = {
  basePath: "/cmsAdmin",
  brandName: "CMS Admin",
  initials: "CA",
  email: "cms@smartschool.id",
  menuSections: [
    {
      type: "header",
      label: "UTAMA",
    },
    {
      key: "dashboard",
      label: "Dashboard CMS",
      icon: LayoutDashboard,
      path: "/cmsAdmin",
    },
    {
      type: "header",
      label: "KONTEN",
    },
    {
      key: "articles",
      label: "Artikel",
      icon: FileText,
      path: "/cmsAdmin/articles",
      children: [
        {
          key: "all-articles",
          label: "Semua Artikel",
          icon: FileText,
          path: "/cmsAdmin/articles",
        },
        {
          key: "draft-articles",
          label: "Draft",
          icon: FileText,
          path: "/cmsAdmin/articles?filter=draft",
        },
        {
          key: "categories",
          label: "Kategori Artikel",
          icon: FolderOpen,
          path: "/cmsAdmin/articles/categories",
        },
      ],
    },
    {
      key: "pages",
      label: "Halaman Statis",
      icon: File,
      path: "/cmsAdmin/pages",
      children: [
        {
          key: "all-pages",
          label: "Semua Halaman",
          icon: File,
          path: "/cmsAdmin/pages",
        },
      
        {
          key: "published-pages",
          label: "Halaman Terbit",
          icon: File,
          path: "/cmsAdmin/pages?filter=published",
        },
      ],
    },
    {
      key: "media",
      label: "Media",
      icon: Image,
      path: "/cmsAdmin/media",
      children: [
        {
          key: "all-media",
          label: "Semua Media",
          icon: Images,
          path: "/cmsAdmin/media",
        },
      
        {
          key: "folders",
          label: "Folder Media",
          icon: FolderOpen,
          path: "/cmsAdmin/media/folders",
        },
      ],
    },
    {
      key: "banners",
      label: "Banner & Hero",
      icon: LayoutPanelTop,
      path: "/cmsAdmin/banners",
      children: [
        {
          key: "all-banners",
          label: "Semua Banner",
          icon: LayoutPanelTop,
          path: "/cmsAdmin/banners",
        },
     
      ],
    },
    {
      key: "menus",
      label: "Menu Website",
      icon: Menu,
      path: "/cmsAdmin/website",
      children: [
        {
          key: "main-menu",
          label: "Menu Utama",
          icon: ListTree,
          path: "/cmsAdmin/menus",
        },
        {
          key: "footer-menu",
          label: "Menu Footer",
          icon: ListTree,
          path: "/cmsAdmin/website/menu",
        },
        {
          key: "submenus",
          label: "Submenu",
          icon: Layers,
          path: "/cmsAdmin/menus/submenus",
        },
      ],
    },
    {
      key: "announcements",
      label: "Pengumuman",
      icon: Megaphone,
      path: "/cmsAdmin/pengumuman",
      children: [
        {
          key: "all-announcements",
          label: "Semua Pengumuman",
          icon: Megaphone,
          path: "/cmsAdmin/announcements",
        },
      
        {
          key: "scheduled-announcements",
          label: "Pengumuman Terjadwal",
          icon: Clock,
          path: "/cmsAdmin/pengumuman/terjadwal",
        },
      ],
    },
    {
      key: "events",
      label: "Agenda / Event",
      icon: Calendar,
      path: "/cmsAdmin/agenda",
      children: [
        {
          key: "all-events",
          label: "Semua Agenda",
          icon: CalendarDays,
          path: "/cmsAdmin/agenda",
        },
      
        {
          key: "upcoming-events",
          label: "Agenda Mendatang",
          icon: Calendar,
          path: "/cmsAdmin/agenda/mendatang",
        },
      ],
    },
    {
      type: "header",
      label: "PENGATURAN",
    },
    {
      key: "settings",
      label: "Pengaturan CMS",
      icon: Settings,
      path: "/cmsAdmin/pengaturan",
      children: [
        {
          key: "identity",
          label: "Identitas Website",
          icon: Globe,
          path: "/cmsAdmin/pengaturan/identitas",
        },
        {
          key: "seo",
          label: "SEO",
          icon: Share2,
          path: "/cmsAdmin/pengaturan/seo",
        },
        {
          key: "social",
          label: "Sosial Media",
          icon: Share2,
          path: "/cmsAdmin/pengaturan/sosial-media",
        },
        {
          key: "appearance",
          label: "Pengaturan Tampilan",
          icon: Palette,
          path: "/cmsAdmin/pengaturan/tampilan",
        },
      ],
    },
  ],
};