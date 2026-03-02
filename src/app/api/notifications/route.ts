import { NextRequest } from "next/server";
import { getNotifications, markAllNotificationsRead, markNotificationRead } from "@/lib/data-access";
import { parseSearchParams, errorResponse, successResponse } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  const params = parseSearchParams(request);
  const result = getNotifications(params);
  return successResponse(result);
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    if (body.action === "mark_all_read") {
      const count = markAllNotificationsRead();
      return successResponse({ data: { marked_count: count } });
    }
    if (body.id) {
      const updated = markNotificationRead(body.id);
      if (!updated) return errorResponse("NOT_FOUND", "指定された通知が見つかりません", 404);
      return successResponse({ data: updated });
    }
    return errorResponse("VALIDATION_ERROR", "actionまたはidが必要です", 400);
  } catch {
    return errorResponse("INVALID_BODY", "リクエストボディの解析に失敗しました", 400);
  }
}
