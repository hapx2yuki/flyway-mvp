import { NextRequest } from "next/server";
import { getHCPs } from "@/lib/data-access";
import { parseSearchParams, successResponse } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  const params = parseSearchParams(request);
  const result = getHCPs(params);
  return successResponse(result);
}
