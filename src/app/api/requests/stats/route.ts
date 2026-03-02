import { NextResponse } from "next/server";
import { getRequestStats } from "@/lib/data-access";

export async function GET() {
  return NextResponse.json(getRequestStats());
}
