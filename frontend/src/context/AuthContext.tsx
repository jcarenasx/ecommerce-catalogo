import {
  startTransition,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContextStore";
import { AUTH_EXPIRED_EVENT } from "../lib/api";
import {
  fetchMe,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
} from "../api/auth";
import type { LoginInput, RegisterInput, User } from "../types";

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasCheckedSession = useRef(false);

  const refreshUser = useCallback(async (): Promise<void> => {
    setIsLoading(true);

    try {
      const nextUser = await fetchMe();
      startTransition(() => {
        setUser(nextUser);
      });
      queryClient.setQueryData(["user"], nextUser);
    } finally {
      setIsLoading(false);
    }
  }, [queryClient]);

  const login = async (
    input: LoginInput,
    redirectTo = "/home"
  ): Promise<void> => {
    const nextUser = await loginRequest(input);
    startTransition(() => {
      setUser(nextUser);
    });
    queryClient.setQueryData(["user"], nextUser);
    navigate(redirectTo);
  };

  const register = async (
    input: RegisterInput,
    redirectTo = "/home"
  ): Promise<void> => {
    const nextUser = await registerRequest(input);
    startTransition(() => {
      setUser(nextUser);
    });
    queryClient.setQueryData(["user"], nextUser);
    navigate(redirectTo);
  };

  const logout = async (): Promise<void> => {
    await logoutRequest();
    startTransition(() => {
      setUser(null);
    });
    queryClient.setQueryData(["user"], null);
    navigate("/home");
  };

  useEffect(() => {
    if (hasCheckedSession.current) return;
    hasCheckedSession.current = true;
    void refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    const handleAuthExpired = () => {
      startTransition(() => {
        setUser(null);
      });
      queryClient.setQueryData(["user"], null);

      const currentPath = window.location.pathname;
      if (currentPath.startsWith("/admin")) {
        navigate("/login", {
          replace: true,
          state: { from: currentPath },
        });
      }
    };

    window.addEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);

    return () => {
      window.removeEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);
    };
  }, [navigate, queryClient]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: user !== null,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
