import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { AppError } from "../utils/appError";

const getErrorCodeByStatus = (status: number): string => {
  switch (status) {
    case 400:
      return "BAD_REQUEST";
    case 401:
      return "UNAUTHORIZED";
    case 403:
      return "FORBIDDEN";
    case 404:
      return "NOT_FOUND";
    case 409:
      return "CONFLICT";
    case 422:
      return "UNPROCESSABLE_ENTITY";
    default:
      return "INTERNAL_SERVER_ERROR";
  }
};

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let errorCode = err.errorCode || getErrorCodeByStatus(statusCode);
  let errors: any = undefined;

  if (err instanceof ZodError) {
    statusCode = 400;
    errorCode = "VALIDATION_ERROR";
    errors = err.issues.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    message = err.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002": {
        statusCode = 409;
        errorCode = "DUPLICATE_ENTRY";
        const target = Array.isArray(err.meta?.target)
          ? err.meta.target.join(", ")
          : (err.meta?.target as string) || "data";
        message = `Data duplikat: ${target} sudah terdaftar dalam sistem`;
        break;
      }
      case "P2025": {
        statusCode = 404;
        errorCode = "RESOURCE_NOT_FOUND";
        message = "Data yang diminta tidak ditemukan di database";
        break;
      }
      case "P2003": {
        statusCode = 400;
        errorCode = "FOREIGN_KEY_VIOLATION";
        message = "Operasi gagal karena ketergantungan relasi data terkait";
        break;
      }
      default: {
        statusCode = 400;
        errorCode = "DATABASE_ERROR";
        message = "Terjadi kesalahan pada operasi database";
        break;
      }
    }
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    errorCode = "DATABASE_VALIDATION_ERROR";
    message = "Format data tidak sesuai dengan skema database";
  } else if (err?.name === "JsonWebTokenError") {
    statusCode = 401;
    errorCode = "INVALID_TOKEN";
    message = "Token tidak valid";
  } else if (err?.name === "TokenExpiredError") {
    statusCode = 401;
    errorCode = "TOKEN_EXPIRED";
    message = "Token telah kedaluwarsa";
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    errorCode = err.errorCode || getErrorCodeByStatus(statusCode);
    message = err.message;
  }

  // Prevent leaking internal stack/SQL details in production for 500 errors
  const isDev = process.env.NODE_ENV === "development";
  if (statusCode === 500 && !isDev) {
    message = "Terjadi kesalahan internal server";
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorCode,
    ...(errors && { errors }),
    ...(isDev && err.stack && { stack: err.stack }),
  });
};
