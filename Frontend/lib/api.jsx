const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function apiFetch(endpoint, options = {}) {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  const isFormData =
    typeof FormData !== "undefined" &&
    options.body instanceof FormData;

  const headers = {
    ...(options.headers || {}),
  };

  // Jangan set Content-Type untuk FormData.
  // Browser akan otomatis membuat:
  // multipart/form-data; boundary=...
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  /*
   * Ambil response sesuai Content-Type.
   *
   * JSON:
   * application/json
   *
   * File / text:
   * text/plain, application/octet-stream, dll.
   */
  const contentType =
    response.headers.get("content-type") || "";

  let data = null;

  if (contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch (error) {
      console.error("Response JSON tidak valid:", error);
      data = null;
    }
  } else {
    const text = await response.text();

    data = text || null;
  }

  /*
   * HANDLE ERROR
   */
  if (!response.ok) {
    let message = `Request gagal. Status: ${response.status}`;

    if (data && typeof data === "object") {
      message =
        data.message ||
        data.error ||
        message;
    } else if (typeof data === "string" && data.trim()) {
      message = data;
    }

    throw new Error(message);
  }

  /*
   * HANDLE SUCCESS
   */
  return data;
}