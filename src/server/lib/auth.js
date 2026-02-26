/**
 * Authorization middleware
 */

/**
 * Middleware to check for admin access
 */
export const adminAuth = async (c, next) => {
  const adminSecret = c.env?.ADMIN_SECRET || process.env.ADMIN_SECRET;
  const authHeader = c.req.header("Authorization");

  if (!authHeader || authHeader !== adminSecret) {
    return c.json({ success: false, error: "Unauthorized access" }, 401);
  }

  await next();
};

/**
 * Helper to check if the request is from an admin
 */
export const isAdmin = (c) => {
  const adminSecret = c.env?.ADMIN_SECRET || process.env.ADMIN_SECRET;
  const authHeader = c.req.header("Authorization");
  return authHeader === adminSecret;
};
