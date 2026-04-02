import { api } from "../lib/api";
import type { LoginInput, RegisterInput, User } from "../types";

export async function login(input: LoginInput): Promise<User> {
  const response = await api.post<{ user: User }>("/auth/login", input);
  return response.data.user;
}

export async function register(input: RegisterInput): Promise<User> {
  const response = await api.post<{ user: User }>("/auth/register", input);
  return response.data.user;
}

export async function fetchMe(): Promise<User> {
  const response = await api.get<{ user: User }>("/auth/me");
  return response.data.user;
}

export async function logout(): Promise<void> {
  await api.post("/auth/logout");
}
