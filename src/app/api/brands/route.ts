import { NextRequest } from "next/server";
import { getBrands, createBrand } from "@/lib/data-access";
import { parseSearchParams, errorResponse, successResponse } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  const params = parseSearchParams(request);
  const result = getBrands(params);
  return successResponse(result);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.name || !body.therapeutic_area) {
      return errorResponse("VALIDATION_ERROR", "ブランド名と治療領域は必須です", 400);
    }
    const brand = createBrand(body);
    return successResponse({ data: brand }, 201);
  } catch {
    return errorResponse("INVALID_BODY", "リクエストボディの解析に失敗しました", 400);
  }
}
