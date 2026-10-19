"use client";

import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from "react";

type User = {
  id: string;
  email: string;
  name?: string | null;
  plan?: "FREE" | "CREATOR" | "AUTHOR";
};

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updatePseudonym: (pseudonym: string) => Promise<void>;
  deleteAccount: (email: string, password: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
};

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // =========================
  // GET CURRENT USER
  // =========================
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const res = await fetch("/api/auth/me", {
          headers,
        });

        if (!res.ok) {
          setUser(null);
        } else {
          const data = await res.json();
          setUser(data.user);
        }
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  // =========================
  // LOGIN
  // =========================
  const login = async (email: string, password: string) => {
    const res = await fetch("/api/user", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Login failed");
    }

    if (data.token) {
      localStorage.setItem("token", data.token);
    }
    setUser(data.user);
  };

  // =========================
  // REGISTER
  // =========================
  const register = async (
    pseudonym: string,
    email: string,
    password: string
  ) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name: pseudonym, email, password }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || data.error || "Register failed");
    }

    if (data.token) {
      localStorage.setItem("token", data.token);
    }
    setUser(data.user);
  };

  // =========================
  // LOGOUT
  // =========================
  const logout = async () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  // =========================
  // UPDATE PSEUDONYM
  // =========================
  const updatePseudonym = async (pseudonym: string) => {
    const token = localStorage.getItem("token");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch("/api/user/pseudonym", {
      method: "PUT",
      body: JSON.stringify({ pseudonym }),
      headers,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || data.error || "Pseudonym update failed");
    }

    // Update user state with new pseudonym
    setUser(data.user);
  };

  // =========================
  // DELETE ACCOUNT
  // =========================
  const deleteAccount = async (email: string, password: string) => {
    const token = localStorage.getItem("token");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch("/api/user/delete", {
      method: "DELETE",
      body: JSON.stringify({ email, password }),
      headers,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || data.error || "Account deletion failed");
    }

    // Clear local storage and user state
    localStorage.removeItem("token");
    setUser(null);
  };

  // =========================
  // REFRESH USER
  // =========================
  const refreshUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("/api/auth/me", {
        headers,
      });

      if (!res.ok) {
        setUser(null);
      } else {
        const data = await res.json();
        setUser(data.user);
      }
    } catch {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, updatePseudonym, deleteAccount, refreshUser, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// =========================
// HOOK
// =========================
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}