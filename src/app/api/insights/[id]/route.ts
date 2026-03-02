import { NextRequest } from "next/server";
import { getInsightReport } from "@/lib/data-access";
import { errorResponse, successResponse } from "@/lib/api-helpers";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const report = getInsightReport(id);
  if (!report) return errorResponse("NOT_FOUND", "指定されたインサイトレポートが見つかりません", 404);
  return successResponse({ data: report });
}
