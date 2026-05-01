"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { User, getStoredUser, storeUser, removeUser, logAuthAction } from "@/lib/auth";

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string, name?: string) => void;
  register: (name: string, email: string, password: string) => void;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = getStoredUser();
    if (stored) {
      setUser(stored);
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, password: string, name?: string) => {
    const userName = name || email.split("@")[0];
    const newUser: User = { name: userName, email };
    
    logAuthAction("LOGIN", { email, password });
    setUser(newUser);
    storeUser(newUser);
  };

  const register = (name: string, email: string, password: string) => {
    logAuthAction("REGISTER", { name, email, password });
    const newUser: User = { name, email };
    setUser(newUser);
    storeUser(newUser);
  };

  const logout = () => {
    logAuthAction("LOGOUT", { user: user?.email });
    setUser(null);
    removeUser();
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
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
