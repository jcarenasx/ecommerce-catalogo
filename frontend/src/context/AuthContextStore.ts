import { createContext } from "react";

export type AuthContextValue = {
  user: import("../types").User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (input: import("../types").LoginInput, redirectTo?: string) => Promise<void>;
  register: (input: import("../types").RegisterInput, redirectTo?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
