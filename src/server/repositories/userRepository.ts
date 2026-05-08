import { prisma } from "@/server/prisma";
import type { User } from "@/types";

export type CreateUserParams = {
  email: string;
  name: string;
  password: string;
};

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function findUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

export async function createUser(data: CreateUserParams) {
  return prisma.user.create({ data });
}
