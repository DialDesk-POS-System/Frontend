export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export const goToPage = (
    p: number, 
    setPage: (page: number) => void, 
    totalPages: number
) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
};

export const pageNumbers = (page: number, totalPages: number) => {
  return Array.from(
    { length: totalPages },
    (_, i) => i + 1,
  ).filter(
    (p) => p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1),
  );
};