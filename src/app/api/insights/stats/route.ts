import { NextResponse } from "next/server";
import { getInsightStats } from "@/lib/data-access";

export async function GET() {
  return NextResponse.json(getInsightStats());
}
