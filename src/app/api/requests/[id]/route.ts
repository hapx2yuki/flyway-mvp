import { NextRequest } from "next/server";
import { getAnalysisRequest, updateAnalysisRequest, deleteAnalysisRequest } from "@/lib/data-access";
import { errorResponse, successResponse } from "@/lib/api-helpers";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const req = getAnalysisRequest(id);
  if (!req) return errorResponse("NOT_FOUND", "指定された分析リクエストが見つかりません", 404);
  return successResponse({ data: req });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await request.json();
    const updated = updateAnalysisRequest(id, body);
    if (!updated) return errorResponse("NOT_FOUND", "指定された分析リクエストが見つかりません", 404);
    return successResponse({ data: updated });
  } catch {
    return errorResponse("INVALID_BODY", "リクエストボディの解析に失敗しました", 400);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const deleted = deleteAnalysisRequest(id);
  if (!deleted) return errorResponse("NOT_FOUND", "指定された分析リクエストが見つかりません", 404);
  return successResponse({ data: { deleted: true } });
}
