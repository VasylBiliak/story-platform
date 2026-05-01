import { STORAGE_KEYS } from "./constants";

export type User = {
  name: string;
  email: string;
};

const STORAGE_KEY = STORAGE_KEYS.user;

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  }
  return null;
}

export function storeUser(user: User) {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }
}

export function removeUser() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function logAuthAction(action: string, data: Record<string, unknown>) {
  console.log({
    type: action,
    ...data,
  });
}
