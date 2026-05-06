import { NextResponse } from "next/server";
import { registerUser } from "@/server/services/authService";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    const data = await registerUser(email, password, name);

    return NextResponse.json({
      success: true,
      user: data.user,
      token: data.token,
    });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e.message },
      { status: 400 }
    );
  }
}