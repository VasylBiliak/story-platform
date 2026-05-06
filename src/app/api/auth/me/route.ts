import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { success: false, error: "Auth migrated to Supabase client-side" },
    { status: 410 }
  );
}
