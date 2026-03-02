import { NextRequest } from "next/server";
import { getBrand, updateBrand, deleteBrand } from "@/lib/data-access";
import { errorResponse, successResponse } from "@/lib/api-helpers";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const brand = getBrand(id);
  if (!brand) return errorResponse("NOT_FOUND", "指定されたブランドが見つかりません", 404);
  return successResponse({ data: brand });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await request.json();
    const updated = updateBrand(id, body);
    if (!updated) return errorResponse("NOT_FOUND", "指定されたブランドが見つかりません", 404);
    return successResponse({ data: updated });
  } catch {
    return errorResponse("INVALID_BODY", "リクエストボディの解析に失敗しました", 400);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const deleted = deleteBrand(id);
  if (!deleted) return errorResponse("NOT_FOUND", "指定されたブランドが見つかりません", 404);
  return successResponse({ data: { deleted: true } });
}
