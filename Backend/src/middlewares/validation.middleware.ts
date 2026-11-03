import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

const kirimError = (res: Response, issues: { path: PropertyKey[]; message: string }[]) => {
  const messages = issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ");
  return res.status(400).json({
    success: false,
    message: messages || "Data tidak valid",
    errorCode: "VALIDATION_ERROR",
    errors: issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    })),
  });
};

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return kirimError(res, result.error.issues);
    }

    req.body = result.data;

    next();
  };
};

export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body ?? {},
      params: req.params ?? {},
      query: req.query ?? {},
    });

    if (!result.success) {
      return kirimError(res, result.error.issues);
    }

    const data = result.data as { body?: unknown };

    if (data.body !== undefined) {
      req.body = data.body;
    }

    next();
  };
};