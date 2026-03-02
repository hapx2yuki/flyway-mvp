import { NextRequest } from "next/server";
import { getMonitoringAlerts } from "@/lib/data-access";
import { parseSearchParams, successResponse } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  const params = parseSearchParams(request);
  const result = getMonitoringAlerts(params);
  return successResponse(result);
}
