import { NextRequest } from "next/server";
import { getInsightReports } from "@/lib/data-access";
import { parseSearchParams, successResponse } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  const params = parseSearchParams(request);
  const result = getInsightReports(params);
  return successResponse(result);
}
