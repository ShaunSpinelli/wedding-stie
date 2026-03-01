/**
 * Helper to correctly resolve asset paths regardless of environment
 * (Local dev vs GitHub Pages subpath)
 */
export const getAssetPath = (path) => {
  const base = import.meta.env.BASE_URL || "/";
  // Remove leading slash from path if it exists to avoid double slashes
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return `${base}${cleanPath}`;
};
