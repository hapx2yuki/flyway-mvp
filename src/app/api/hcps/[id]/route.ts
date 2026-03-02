import { NextRequest } from "next/server";
import { getHCP } from "@/lib/data-access";
import { errorResponse, successResponse } from "@/lib/api-helpers";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const hcp = getHCP(id);
  if (!hcp) return errorResponse("NOT_FOUND", "指定されたHCPが見つかりません", 404);
  return successResponse({ data: hcp });
}
