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



export async function registerAuth(
  data: any
) {
  return apiFetch("/api/auth/register", {
    method: "POST",

    body: JSON.stringify(data),
  });
}



export async function verifyRegister(
  email: string,
  kodeOtp: string
) {
  return apiFetch(
    "/api/auth/verify-register",
    {
      method: "POST",

      body: JSON.stringify({
        email,
        kodeOtp,
      }),
    }
  );
}



export async function forgotPassword(
  email: string
) {
  return apiFetch(
    "/api/auth/lupa-kata-sandi",
    {
      method: "POST",

      body: JSON.stringify({
        email,
      }),
    }
  );
}



export async function resetPassword(
  data: any
) {
  return apiFetch(
    "/api/auth/atur-ulang-kata-sandi",
    {
      method: "POST",

      body: JSON.stringify(data),
    }
  );
}