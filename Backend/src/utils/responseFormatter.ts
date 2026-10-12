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
  const safeLimit = limit > 0 ? limit : 10;
  const safePage = page > 0 ? page : 1;
  const totalPages = totalData > 0 ? Math.ceil(totalData / safeLimit) : 0;
  const hasNext = safePage < totalPages;
  const hasPrev = safePage > 1 && totalPages > 0;

  return res.status(statusCode).json({
    success: true,
    message,
    data,
    meta: {
      page: safePage,
      limit: safeLimit,
      total: totalData,
      totalData,
      totalPages,
      hasNext,
      hasPrev,
    },
  });
};
