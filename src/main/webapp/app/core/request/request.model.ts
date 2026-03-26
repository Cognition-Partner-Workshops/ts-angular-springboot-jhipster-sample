/** Standard pagination parameters sent as query params to Spring Data REST endpoints. */
export interface Pagination {
  /** Zero-based page index. */
  page: number;
  /** Number of items per page. */
  size: number;
  /** Sort expressions, e.g. ['name,asc', 'id,desc']. */
  sort: string[];
}

/** Full-text search parameter for server-side search endpoints. */
export interface Search {
  query: string;
}

/** Combines search and pagination for endpoints that support both. */
export interface SearchWithPagination extends Search, Pagination {}
