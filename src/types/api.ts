export interface ApiError {
  status?: number | string;
  message: string;
  data?: unknown;
}
