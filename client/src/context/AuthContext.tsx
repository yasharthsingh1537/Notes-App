import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import axios from "axios";
import api from "../services/api";

type User = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

type AuthContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
  }

  useEffect(() => {
    async function restoreUser() {
      const token = localStorage.getItem("token");

      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await api.get<{ user: User }>("/auth/me");
        setUser(response.data.user);
      } catch (error: unknown) {
        setUser(null);
        localStorage.removeItem("token");

        if (axios.isAxiosError(error)) {
          console.error("Error restoring user:", error.response?.status ?? error.message);
        } else {
          console.error("Error restoring user:", error);
        }
      } finally {
        setLoading(false);
      }
    }
    void restoreUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, setLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
