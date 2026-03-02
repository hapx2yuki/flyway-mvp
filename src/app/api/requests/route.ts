import { NextRequest } from "next/server";
import { getAnalysisRequests, createAnalysisRequest } from "@/lib/data-access";
import { parseSearchParams, errorResponse, successResponse } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  const params = parseSearchParams(request);
  const result = getAnalysisRequests(params);
  return successResponse(result);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.title || !body.purpose) {
      return errorResponse("VALIDATION_ERROR", "件名と分析目的は必須です", 400);
    }
    const req = createAnalysisRequest(body);
    return successResponse({ data: req }, 201);
  } catch {
    return errorResponse("INVALID_BODY", "リクエストボディの解析に失敗しました", 400);
  }
}
