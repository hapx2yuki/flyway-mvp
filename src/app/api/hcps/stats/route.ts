import { NextResponse } from "next/server";
import { getHCPStats } from "@/lib/data-access";

export async function GET() {
  return NextResponse.json(getHCPStats());
}
