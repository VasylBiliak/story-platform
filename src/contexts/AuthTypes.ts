import type { User } from "@/types";

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updatePseudonym: (pseudonym: string) => Promise<void>;
  deleteAccount: (email: string, password: string) => Promise<void>;
  loading: boolean;
}
