import { apiFetch } from "../lib/api";

const ROLE_BASE_URL = "/api/role";

/**
 * =====================================================
 * GET SEMUA ROLE
 * GET /api/role
 * =====================================================
 */
export async function getRoles() {
  const response = await apiFetch(ROLE_BASE_URL);

  return response?.data || [];
}

/**
 * =====================================================
 * GET DETAIL ROLE
 * GET /api/role/:id
 * =====================================================
 */
export async function getRoleById(id) {
  if (!id) {
    throw new Error("ID role wajib diisi.");
  }

  const response = await apiFetch(
    `${ROLE_BASE_URL}/${id}`
  );

  return response?.data || null;
}

/**
 * =====================================================
 * GET SEMUA IZIN / PERMISSION
 * GET /api/role/izin
 * =====================================================
 */
export async function getPermissions() {
  const response = await apiFetch(
    `${ROLE_BASE_URL}/izin`
  );

  return response?.data || [];
}

/**
 * =====================================================
 * CREATE ROLE
 * POST /api/role
 * =====================================================
 */
export async function createRole(payload) {
  const response = await apiFetch(
    ROLE_BASE_URL,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );

  return response?.data || null;
}

/**
 * =====================================================
 * UPDATE ROLE
 * PUT /api/role/:id
 * =====================================================
 */
export async function updateRole(
  id,
  payload
) {
  if (!id) {
    throw new Error("ID role wajib diisi.");
  }

  const response = await apiFetch(
    `${ROLE_BASE_URL}/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    }
  );

  return response?.data || null;
}

/**
 * =====================================================
 * DELETE ROLE
 * DELETE /api/role/:id
 *
 * Backend menggunakan soft delete.
 * =====================================================
 */
export async function deleteRole(id) {
  if (!id) {
    throw new Error("ID role wajib diisi.");
  }

  const response = await apiFetch(
    `${ROLE_BASE_URL}/${id}`,
    {
      method: "DELETE",
    }
  );

  return response?.data || null;
}