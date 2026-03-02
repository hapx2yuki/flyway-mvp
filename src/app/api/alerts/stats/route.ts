import { NextResponse } from "next/server";
import { getAlertStats } from "@/lib/data-access";

export async function GET() {
  return NextResponse.json(getAlertStats());
}
