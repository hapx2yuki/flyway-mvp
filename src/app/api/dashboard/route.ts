import { NextResponse } from "next/server";
import { getDashboardStats } from "@/lib/data-access";

export async function GET() {
  return NextResponse.json({ data: getDashboardStats() });
}
