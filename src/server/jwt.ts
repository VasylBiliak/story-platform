import jwt from "jsonwebtoken";
import type { JwtPayload } from "@/types";

const JWT_SECRET_VALUE = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = "7d";

if (!JWT_SECRET_VALUE) {
  throw new Error("Missing JWT_SECRET environment variable");
}

const JWT_SECRET = JWT_SECRET_VALUE;

export function signJwt(payload: JwtPayload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export function verifyJwt(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}
