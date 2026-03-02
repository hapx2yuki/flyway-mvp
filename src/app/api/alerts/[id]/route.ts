import { NextRequest } from "next/server";
import { getMonitoringAlert, updateAlertStatus } from "@/lib/data-access";
import { errorResponse, successResponse } from "@/lib/api-helpers";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const alert = getMonitoringAlert(id);
  if (!alert) return errorResponse("NOT_FOUND", "指定されたアラートが見つかりません", 404);
  return successResponse({ data: alert });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await request.json();
    if (!body.status) return errorResponse("VALIDATION_ERROR", "ステータスは必須です", 400);
    const updated = updateAlertStatus(id, body.status);
    if (!updated) return errorResponse("NOT_FOUND", "指定されたアラートが見つかりません", 404);
    return successResponse({ data: updated });
  } catch {
    return errorResponse("INVALID_BODY", "リクエストボディの解析に失敗しました", 400);
  }
}
