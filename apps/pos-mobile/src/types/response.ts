export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type PaginationQuery = {
  page?: number;
  limit?: number;
  sort?: "asc" | "desc";
  sortBy?: string;
  search?: string;
};

export type PaginatedData<T> = {
  data: T[];
  meta: PaginationMeta;
};

export type PaginatedApiResponse<T> = ApiResponse<PaginatedData<T>>;
