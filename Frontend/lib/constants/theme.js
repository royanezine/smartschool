// lib/constants/theme.js

/**
 * Semantic Theme Tokens
 *
 * File ini berisi nama/fungsi warna yang digunakan
 * oleh seluruh halaman SmartSchool.
 *
 * Nilai warna sebenarnya dikontrol oleh globals.css
 * melalui CSS variables.
 */

export const THEME = {
  background: "var(--background)",
  foreground: "var(--foreground)",

  page: "var(--color-page)",
  card: "var(--color-card)",
  cardSoft: "var(--color-card-soft)",

  text: "var(--color-text)",
  textSecondary: "var(--color-text-secondary)",
  textMuted: "var(--color-text-muted)",
  textPlaceholder: "var(--color-text-placeholder)",

  border: "var(--color-border)",
  borderSoft: "var(--color-border-soft)",

  input: "var(--color-input)",
  inputHover: "var(--color-input-hover)",

  sidebar: "var(--color-sidebar)",
  sidebarHover: "var(--color-sidebar-hover)",
  sidebarActive: "var(--color-sidebar-active)",

  header: "var(--color-header)",
  headerHover: "var(--color-header-hover)",

  tableHeader: "var(--color-table-header)",
  tableHover: "var(--color-table-hover)",

  primary: "var(--color-primary)",
  primaryHover: "var(--color-primary-hover)",

  success: "var(--color-success)",
  successBackground: "var(--color-success-background)",

  warning: "var(--color-warning)",
  warningBackground: "var(--color-warning-background)",

  danger: "var(--color-danger)",
  dangerBackground: "var(--color-danger-background)",

  info: "var(--color-info)",
  infoBackground: "var(--color-info-background)",
};

export const THEME_CLASSES = {
  page: "theme-page",
  card: "theme-card",
  cardSoft: "theme-card-soft",

  text: "theme-text",
  textSecondary: "theme-text-secondary",
  textMuted: "theme-text-muted",
  textPlaceholder: "theme-text-placeholder",

  border: "theme-border",
  borderSoft: "theme-border-soft",

  input: "theme-input",

  sidebar: "theme-sidebar",
  sidebarHover: "theme-sidebar-hover",
  sidebarActive: "theme-sidebar-active",

  header: "theme-header",
  headerHover: "theme-header-hover",

  tableHeader: "theme-table-header",
  tableHover: "theme-table-hover",

  primary: "theme-primary",
  primaryOutline: "theme-primary-outline",

  success: "theme-success",
  warning: "theme-warning",
  danger: "theme-danger",
  info: "theme-info",
};

export default THEME;