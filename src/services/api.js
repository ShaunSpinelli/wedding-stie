const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/**
 * Authorization helpers
 */
let adminSecret = sessionStorage.getItem("admin_secret") || "";

export const setAdminSecret = (secret) => {
  adminSecret = secret;
  sessionStorage.setItem("admin_secret", secret);
};

export const getAdminSecret = () => adminSecret;

const getHeaders = () => {
  const headers = {
    "Content-Type": "application/json",
  };
  if (adminSecret) {
    headers["Authorization"] = adminSecret;
  }
  return headers;
};

/**
 * Fetch all wishes for an invitation
 * @param {string} uid - Invitation UID
 * @param {object} options - Query options (limit, offset)
 * @returns {Promise<object>} Response with wishes data
 */
export async function fetchWishes(uid, options = {}) {
  const { limit = 50, offset = 0 } = options;
  const url = new URL(`${API_URL}/api/${uid}/wishes`);
  url.searchParams.set("limit", limit);
  url.searchParams.set("offset", offset);

  const response = await fetch(url, { headers: getHeaders() });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch wishes");
  }
  return response.json();
}

/**
 * Create a new wish
 * @param {string} uid - Invitation UID
 * @param {object} wishData - Wish data (name, message, attendance)
 * @returns {Promise<object>} Response with created wish
 */
export async function createWish(uid, wishData) {
  const response = await fetch(`${API_URL}/api/${uid}/wishes`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(wishData),
  });

  const data = await response.json();

  if (!response.ok) {
    // Preserve error code for duplicate wish detection
    const error = new Error(data.error || "Failed to create wish");
    error.code = data.code;
    throw error;
  }
  return data;
}

/**
 * Check if guest has already submitted a wish
 * @param {string} uid - Invitation UID
 * @param {string} name - Guest name
 * @returns {Promise<object>} Response with hasSubmitted boolean
 */
export async function checkWishSubmitted(uid, name) {
  const response = await fetch(
    `${API_URL}/api/${uid}/wishes/check/${encodeURIComponent(name)}`,
    { headers: getHeaders() },
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to check wish status");
  }
  return response.json();
}

/**
 * Delete a wish (admin function)
 * @param {string} uid - Invitation UID
 * @param {number} wishId - Wish ID to delete
 * @returns {Promise<object>} Response with deletion confirmation
 */
export async function deleteWish(uid, wishId) {
  const response = await fetch(`${API_URL}/api/${uid}/wishes/${wishId}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete wish");
  }
  return response.json();
}

/**
 * Get attendance statistics
 * @param {string} uid - Invitation UID
 * @returns {Promise<object>} Response with stats data
 */
export async function fetchAttendanceStats(uid) {
  const response = await fetch(`${API_URL}/api/${uid}/stats`, {
    headers: getHeaders(),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch stats");
  }
  return response.json();
}

/**
 * Get invitation details
 * @param {string} uid - Invitation UID
 * @returns {Promise<object>} Response with invitation data
 */
export async function fetchInvitation(uid) {
  const response = await fetch(`${API_URL}/api/invitation/${uid}`, {
    headers: getHeaders(),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch invitation");
  }
  return response.json();
}

/**
 * GUESTS API
 */

/**
 * Verify admin secret
 * @returns {Promise<object>}
 */
export async function verifyAdmin() {
  const response = await fetch(`${API_URL}/api/admin/verify`, {
    headers: getHeaders(),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Unauthorized");
  }
  return response.json();
}

/**
 * Search guest by name or email
 * @param {string} uid - Invitation UID
 * @param {object} params - { name, email }
 * @returns {Promise<object>} Response with guest data
 */
export async function searchGuest(uid, params = {}) {
  const url = new URL(`${API_URL}/api/${uid}/guests/search`);
  if (params.name) url.searchParams.set("name", params.name);
  if (params.email) url.searchParams.set("email", params.email);

  const response = await fetch(url, { headers: getHeaders() });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch guest");
  }
  return response.json();
}

/**
 * Fetch all guests (Admin only)
 * @param {string} uid
 * @returns {Promise<object>}
 */
export async function fetchGuests(uid) {
  const response = await fetch(`${API_URL}/api/${uid}/guests`, {
    headers: getHeaders(),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch guests");
  }
  return response.json();
}

/**
 * Create a new guest record (Registration)
 * @param {string} uid - Invitation UID
 * @param {object} guestData - Guest data
 * @returns {Promise<object>} Response with created guest
 */
export async function createGuest(uid, guestData) {
  const response = await fetch(`${API_URL}/api/${uid}/guests`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(guestData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to register guest");
  }
  return response.json();
}

/**
 * Update guest details
 * @param {string} uid - Invitation UID
 * @param {string} id - Guest ID (UUID)
 * @param {object} updates - Fields to update
 * @returns {Promise<object>} Response with updated guest
 */
export async function updateGuest(uid, id, updates) {
  const response = await fetch(`${API_URL}/api/${uid}/guests/${id}`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update guest");
  }
  return response.json();
}
