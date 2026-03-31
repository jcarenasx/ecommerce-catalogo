import axios from "axios";
import type { AxiosInstance } from "axios";
import { AUTH_EXPIRED_EVENT } from "../lib/api";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  status?: number;
  code?: string;
  details?: Record<string, unknown>;

  constructor(message: string, status?: number, code?: string, details?: Record<string, unknown>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const client: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 15_000,
});

client.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    return config;
  }

  config.headers.set("Content-Type", "application/json");
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      const { response } = error;
      if (response?.status === 401) {
        window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT));
      }
      if (response?.data && typeof response.data === "object") {
        const { message = error.message, error: code, details } = response.data as {
          message?: string;
          error?: string;
          details?: Record<string, unknown>;
        };
        return Promise.reject(new ApiError(message, response.status, code, details));
      }
    }

    return Promise.reject(error);
  }
);

export default client;
