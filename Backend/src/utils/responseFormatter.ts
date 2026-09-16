import { Response } from "express";

export const successResponse = (
  res: Response,
  message: string,
  data: any = null,
  statusCode = 200,
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const paginatedResponse = (
  res: Response,
  message: string,
  data: any[],
  page: number,
  limit: number,
  totalData: number,
  statusCode = 200,
) => {
  const totalPages = Math.ceil(totalData / limit);
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    meta: {
      page,
      limit,
      totalData,
      totalPages,
    },
  });
};
