import axios from "axios";
import type { AxiosInstance } from "axios";

export const AUTH_EXPIRED_EVENT = "auth:expired";

const FALLBACK_API_URL =
  "http://ecommerce-api.eba-xvrmbgv4.us-east-1.elasticbeanstalk.com";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? FALLBACK_API_URL;

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

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 15_000,
});

api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    return config;
  }

  config.headers.set("Content-Type", "application/json");
  return config;
});

api.interceptors.response.use(
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
