import { Request, Response, NextFunction } from "express";

export const requireSekolah = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = (req as any).user;

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  if (!user.sekolahId) {
    return res.status(403).json({
      success: false,
      message: "Pengguna tidak memiliki sekolah",
    });
  }

  next();
};