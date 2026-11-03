import { apiFetch } from "../lib/api";


export async function login(
  identifier: string,
  kataSandi: string
) {
  return apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      identifier,
      kataSandi,
    }),
  });
}

export async function logout() {
  return apiFetch("/api/auth/logout", {
    method: "POST",
  });
}


export async function registerAuth(data: Record<string, unknown>) {
  return apiFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function verifyRegister(
  email: string,
  kodeOtp: string
) {
  return apiFetch("/api/auth/verify-register", {
    method: "POST",
    body: JSON.stringify({
      email,
      kodeOtp,
    }),
  });
}


export async function forgotPassword(email: string) {
  return apiFetch("/api/auth/lupa-kata-sandi", {
    method: "POST",
    body: JSON.stringify({
      email,
    }),
  });
}

export async function resetPassword(data: Record<string, unknown>) {
  return apiFetch("/api/auth/atur-ulang-kata-sandi", {
    method: "POST",
    body: JSON.stringify(data),
  });
}


export async function setupPin(
  pin: string,
  setupToken: string
) {
  return apiFetch("/api/auth/pin/setup", {
    method: "POST",
    body: JSON.stringify({
      pin,
      setupToken,
    }),
  });
}

export async function verifyPin(
  pin: string,
  pinToken: string
) {
  return apiFetch("/api/auth/pin/verify", {
    method: "POST",
    body: JSON.stringify({
      pin,
      pinToken,
    }),
  });
}

export async function forgotPin(identifier: string) {
  return apiFetch("/api/auth/pin/forgot", {
    method: "POST",
    body: JSON.stringify({ identifier }),
  });
}

export async function resetPin(
  identifier: string,
  kodeOtp: string,
  pinBaru: string
) {
  return apiFetch("/api/auth/pin/reset", {
    method: "POST",
    body: JSON.stringify({ identifier, kodeOtp, pinBaru }),
  });
}




export async function resetPinByAdmin(userId: string | number) {
  return apiFetch(
    `/api/auth/pin/admin-reset/${encodeURIComponent(String(userId))}`,
    {
      method: "POST",
    }
  );
}

export interface UbahKataSandiPayload {
  kataSandiLama: string;
  kataSandiBaru: string;
}

export interface UbahKataSandiResponse {
  success: boolean;
  message: string;
}

export async function changePassword(
  payload: UbahKataSandiPayload
): Promise<UbahKataSandiResponse> {
  return apiFetch("/api/auth/ubah-kata-sandi", {
    method: "POST",
    body: JSON.stringify({
      kataSandiLama: payload.kataSandiLama,
      kataSandiBaru: payload.kataSandiBaru,
    }),
  });
}

export const ubahKataSandi = changePassword;
