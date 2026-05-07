//src/server/services/authService.ts

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/server/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

type AuthResponse = {
  user: { id: string; email: string; name?: string | null };
  token: string;
};

// =========================
// REGISTER
// =========================
export async function registerUser(
  email: string,
  password: string,
  name?: string
): Promise<AuthResponse> {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name: name || "",
    },
  });

const token = jwt.sign(
  {
    userId: user.id,
    email: user.email,
  },
  JWT_SECRET,
  { expiresIn: "7d" }
);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    token,
  };
}

// =========================
// LOGIN
// =========================
export async function loginUser(
  email: string,
  password: string
): Promise<AuthResponse> {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    throw new Error("Invalid credentials");
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    token,
  };
}