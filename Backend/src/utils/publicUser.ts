/** Map an internally selected PIN hash to a public boolean, never the hash. */
export function publicUser<T extends { pinHash: string | null }>(user: T) {
  const { pinHash, ...data } = user;
  return { ...data, pinConfigured: Boolean(pinHash) };
}
