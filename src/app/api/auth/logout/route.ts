import { logoutHandler } from "@/server/controllers/authController";

export async function POST() {
  return logoutHandler();
}
