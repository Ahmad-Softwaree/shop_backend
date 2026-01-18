import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { PaginationParams, QueryParam } from 'src/types/global';

export interface PaginationMeta {
  total: number;
  total_page: number;
  next: boolean;
  page: number;
  limit: number;
}

export function buildPagination(
  total: number,
  page: number,
  limit: number,
): PaginationMeta {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.max(1, Number(limit) || 10);

  const total_page = Math.ceil(total / safeLimit);

  const next = safePage < total_page;

  return {
    total,
    total_page,
    next,
    page: safePage,
    limit: safeLimit,
  };
}

interface Pagination {
  page: number;
  limit: number;
}

export const Pagination = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): PaginationParams => {
    const request = ctx.switchToHttp().getRequest();
    const { page = 1, limit = 10 } = request.query;

    return {
      page: Number(page),
      limit: Number(limit),
    };
  },
);

export const Queries = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): QueryParam => {
    const request = ctx.switchToHttp().getRequest();
    const { page, limit, ...other } = request.query;
    return Object.fromEntries(
      Object.entries({
        ...other,
      }).filter(([_, value]) => value !== undefined),
    ) as QueryParam;
  },
);
