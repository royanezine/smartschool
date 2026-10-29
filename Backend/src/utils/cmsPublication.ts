// Canonical value for new writes; the other two values are legacy published data.
export const CMS_PUBLISHED_STATUS = "dipublikasikan";
export const CMS_PUBLIC_STATUSES = [CMS_PUBLISHED_STATUS, "publikasi", "aktif"] as const;

export function normalizeCmsStatus(status: string) {
  return CMS_PUBLIC_STATUSES.some(value => value === status) ? CMS_PUBLISHED_STATUS : status;
}
