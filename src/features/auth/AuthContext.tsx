import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchMe, isAuthenticated, logout as apiLogout, type Me } from "../../api/auth";


type AuthContextType = {
  user: Me | null;
  loading: boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const [hasToken, setHasToken] = useState(isAuthenticated());

  // Re-read localStorage whenever React Query invalidates `me`
  // (which is what LoginPage does right after setting the token).
  useEffect(() => {
    return qc.getQueryCache().subscribe((event) => {
      if (
        event?.type === "updated" &&
        Array.isArray(event.query.queryKey) &&
        event.query.queryKey[0] === "me"
      ) {
        setHasToken(isAuthenticated());
      }
    });
  }, [qc]);

  // Also poll localStorage on window focus as a fallback
  useEffect(() => {
    const sync = () => setHasToken(isAuthenticated());
    window.addEventListener("focus", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("focus", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const { data: user, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: fetchMe,
    enabled: hasToken,
    retry: false,
    staleTime: Infinity,
  });

  const logout = () => {
    apiLogout();
    qc.clear();
    setHasToken(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        loading: hasToken && isLoading,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}