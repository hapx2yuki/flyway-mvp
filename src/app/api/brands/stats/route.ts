import { NextResponse } from "next/server";
import { getBrandStats } from "@/lib/data-access";

export async function GET() {
  return NextResponse.json(getBrandStats());
}
