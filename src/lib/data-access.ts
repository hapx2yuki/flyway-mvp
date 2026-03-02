import {
  brands as brandSeed,
  insightReports as insightSeed,
  hcps as hcpSeed,
  monitoringAlerts as alertSeed,
  analysisRequests as requestSeed,
  notifications as notifSeed,
} from "@/data/seed";
import type {
  Brand,
  InsightReport,
  HCP,
  MonitoringAlert,
  AnalysisRequest,
  Notification,
  ApiListResponse,
  StatsResponse,
} from "@/lib/types";

// In-memory mutable data stores (demo mode)
let brands: Brand[] = [...brandSeed];
const insightReports: InsightReport[] = [...insightSeed];
const hcps: HCP[] = [...hcpSeed];
const monitoringAlerts: MonitoringAlert[] = [...alertSeed];
let analysisRequests: AnalysisRequest[] = [...requestSeed];
let notificationsList: Notification[] = [...notifSeed];

// --- Generic list query helper ---
interface ListQuery {
  page?: number;
  per_page?: number;
  q?: string;
  sort_by?: string;
  order?: "asc" | "desc";
  [key: string]: string | number | undefined;
}

function queryList<T extends object>(
  data: T[],
  query: ListQuery,
  searchFields: (keyof T)[]
): ApiListResponse<T> {
  const page = Math.max(1, Number(query.page) || 1);
  const per_page = Math.min(100, Math.max(1, Number(query.per_page) || 10));
  let filtered = [...data];

  // Text search
  if (query.q) {
    const q = query.q.toLowerCase();
    filtered = filtered.filter((item) =>
      searchFields.some((field) => {
        const val = item[field];
        return typeof val === "string" && val.toLowerCase().includes(q);
      })
    );
  }

  // Status filter
  if (query.status && typeof query.status === "string") {
    filtered = filtered.filter(
      (item) => (item as Record<string, unknown>).status === query.status
    );
  }

  // Severity filter
  if (query.severity && typeof query.severity === "string") {
    filtered = filtered.filter(
      (item) => (item as Record<string, unknown>).severity === query.severity
    );
  }

  // Category filter
  if (query.category && typeof query.category === "string") {
    filtered = filtered.filter(
      (item) => (item as Record<string, unknown>).category === query.category
    );
  }

  // Therapeutic area filter
  if (query.therapeutic_area && typeof query.therapeutic_area === "string") {
    filtered = filtered.filter(
      (item) =>
        (item as Record<string, unknown>).therapeutic_area === query.therapeutic_area
    );
  }

  // Insight type filter
  if (query.insight_type && typeof query.insight_type === "string") {
    filtered = filtered.filter(
      (item) =>
        (item as Record<string, unknown>).insight_type === query.insight_type
    );
  }

  // Priority filter
  if (query.priority && typeof query.priority === "string") {
    filtered = filtered.filter(
      (item) => (item as Record<string, unknown>).priority === query.priority
    );
  }

  // Region filter
  if (query.region && typeof query.region === "string") {
    filtered = filtered.filter(
      (item) =>
        (item as Record<string, unknown>).facility_region === query.region
    );
  }

  // Specialty filter
  if (query.specialty && typeof query.specialty === "string") {
    filtered = filtered.filter(
      (item) =>
        (item as Record<string, unknown>).specialty === query.specialty
    );
  }

  // Brand filter
  if (query.brand_id && typeof query.brand_id === "string") {
    filtered = filtered.filter(
      (item) => (item as Record<string, unknown>).brand_id === query.brand_id
    );
  }

  // Sort
  const sort_by = (query.sort_by as string) || "created_at";
  const order = query.order || "desc";
  filtered.sort((a, b) => {
    const aVal = a[sort_by as keyof T];
    const bVal = b[sort_by as keyof T];
    if (aVal === bVal) return 0;
    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;
    const cmp = aVal < bVal ? -1 : 1;
    return order === "asc" ? cmp : -cmp;
  });

  const total = filtered.length;
  const total_pages = Math.ceil(total / per_page);
  const start = (page - 1) * per_page;
  const paged = filtered.slice(start, start + per_page);

  return {
    data: paged,
    meta: { total, page, per_page, total_pages },
  };
}

// --- Insight Reports ---
export function getInsightReports(query: ListQuery): ApiListResponse<InsightReport> {
  return queryList(insightReports, query, ["title", "narrative_content", "brand_name"]);
}
export function getInsightReport(id: string): InsightReport | undefined {
  return insightReports.find((r) => r.id === id);
}
export function getInsightStats(): StatsResponse {
  const statusBreakdown: Record<string, number> = {};
  const typeBreakdown: Record<string, number> = {};
  insightReports.forEach((r) => {
    statusBreakdown[r.status] = (statusBreakdown[r.status] || 0) + 1;
    typeBreakdown[r.insight_type] = (typeBreakdown[r.insight_type] || 0) + 1;
  });
  return {
    data: {
      total_count: insightReports.length,
      status_breakdown: statusBreakdown,
      additional: {
        avg_confidence: Math.round(insightReports.reduce((sum, r) => sum + r.confidence_score, 0) / insightReports.length),
        high_severity_count: insightReports.filter((r) => r.severity === "高" || r.severity === "緊急").length,
        ...typeBreakdown,
      },
    },
  };
}

// --- Brands ---
export function getBrands(query: ListQuery): ApiListResponse<Brand> {
  return queryList(brands, query, ["name", "therapeutic_area"]);
}
export function getBrand(id: string): Brand | undefined {
  return brands.find((b) => b.id === id);
}
export function createBrand(data: Omit<Brand, "id" | "created_at" | "updated_at">): Brand {
  const now = new Date().toISOString();
  const brand: Brand = {
    ...data,
    id: `brand-${String(brands.length + 1).padStart(3, "0")}`,
    created_at: now,
    updated_at: now,
  };
  brands = [...brands, brand];
  return brand;
}
export function updateBrand(id: string, data: Partial<Brand>): Brand | undefined {
  const idx = brands.findIndex((b) => b.id === id);
  if (idx === -1) return undefined;
  brands[idx] = { ...brands[idx], ...data, updated_at: new Date().toISOString() };
  return brands[idx];
}
export function deleteBrand(id: string): boolean {
  const len = brands.length;
  brands = brands.filter((b) => b.id !== id);
  return brands.length < len;
}
export function getBrandStats(): StatsResponse {
  const statusBreakdown: Record<string, number> = {};
  brands.forEach((b) => {
    statusBreakdown[b.contract_status] = (statusBreakdown[b.contract_status] || 0) + 1;
  });
  return {
    data: {
      total_count: brands.length,
      status_breakdown: statusBreakdown,
      additional: {
        total_revenue: brands.reduce((sum, b) => sum + b.annual_revenue, 0),
        avg_market_share: Math.round(brands.reduce((sum, b) => sum + b.market_share, 0) / brands.length * 10) / 10,
      },
    },
  };
}

// --- HCPs ---
export function getHCPs(query: ListQuery): ApiListResponse<HCP> {
  return queryList(hcps, query, ["name", "facility_name", "specialty"]);
}
export function getHCP(id: string): HCP | undefined {
  return hcps.find((h) => h.id === id);
}
export function getHCPStats(): StatsResponse {
  const specialtyBreakdown: Record<string, number> = {};
  const regionBreakdown: Record<string, number> = {};
  hcps.forEach((h) => {
    specialtyBreakdown[h.specialty] = (specialtyBreakdown[h.specialty] || 0) + 1;
    regionBreakdown[h.facility_region] = (regionBreakdown[h.facility_region] || 0) + 1;
  });
  return {
    data: {
      total_count: hcps.length,
      status_breakdown: specialtyBreakdown,
      additional: {
        avg_opportunity_score: Math.round(hcps.reduce((sum, h) => sum + h.opportunity_score, 0) / hcps.length),
        high_opportunity_count: hcps.filter((h) => h.opportunity_level === "高").length,
        ...regionBreakdown,
      },
    },
  };
}

// --- Monitoring Alerts ---
export function getMonitoringAlerts(query: ListQuery): ApiListResponse<MonitoringAlert> {
  return queryList(monitoringAlerts, query, ["content", "brand_name", "recommended_response"]);
}
export function getMonitoringAlert(id: string): MonitoringAlert | undefined {
  return monitoringAlerts.find((a) => a.id === id);
}
export function updateAlertStatus(id: string, status: MonitoringAlert["status"]): MonitoringAlert | undefined {
  const idx = monitoringAlerts.findIndex((a) => a.id === id);
  if (idx === -1) return undefined;
  monitoringAlerts[idx] = { ...monitoringAlerts[idx], status, updated_at: new Date().toISOString() };
  return monitoringAlerts[idx];
}
export function getAlertStats(): StatsResponse {
  const statusBreakdown: Record<string, number> = {};
  const categoryBreakdown: Record<string, number> = {};
  monitoringAlerts.forEach((a) => {
    statusBreakdown[a.status] = (statusBreakdown[a.status] || 0) + 1;
    categoryBreakdown[a.category] = (categoryBreakdown[a.category] || 0) + 1;
  });
  return {
    data: {
      total_count: monitoringAlerts.length,
      status_breakdown: statusBreakdown,
      additional: {
        urgent_count: monitoringAlerts.filter((a) => a.severity === "緊急").length,
        unresolved_count: monitoringAlerts.filter((a) => a.status === "未対応").length,
        ...categoryBreakdown,
      },
    },
  };
}

// --- Analysis Requests ---
export function getAnalysisRequests(query: ListQuery): ApiListResponse<AnalysisRequest> {
  return queryList(analysisRequests, query, ["title", "purpose", "brand_name"]);
}
export function getAnalysisRequest(id: string): AnalysisRequest | undefined {
  return analysisRequests.find((r) => r.id === id);
}
export function createAnalysisRequest(data: Omit<AnalysisRequest, "id" | "created_at" | "updated_at" | "result_summary">): AnalysisRequest {
  const now = new Date().toISOString();
  const request: AnalysisRequest = {
    ...data,
    id: `req-${String(analysisRequests.length + 1).padStart(3, "0")}`,
    result_summary: "",
    created_at: now,
    updated_at: now,
  };
  analysisRequests = [...analysisRequests, request];
  return request;
}
export function updateAnalysisRequest(id: string, data: Partial<AnalysisRequest>): AnalysisRequest | undefined {
  const idx = analysisRequests.findIndex((r) => r.id === id);
  if (idx === -1) return undefined;
  analysisRequests[idx] = { ...analysisRequests[idx], ...data, updated_at: new Date().toISOString() };
  return analysisRequests[idx];
}
export function deleteAnalysisRequest(id: string): boolean {
  const len = analysisRequests.length;
  analysisRequests = analysisRequests.filter((r) => r.id !== id);
  return analysisRequests.length < len;
}
export function getRequestStats(): StatsResponse {
  const statusBreakdown: Record<string, number> = {};
  analysisRequests.forEach((r) => {
    statusBreakdown[r.status] = (statusBreakdown[r.status] || 0) + 1;
  });
  return {
    data: {
      total_count: analysisRequests.length,
      status_breakdown: statusBreakdown,
      additional: {
        in_progress_count: analysisRequests.filter((r) => r.status === "分析中").length,
        completed_count: analysisRequests.filter((r) => r.status === "完了").length,
      },
    },
  };
}

// --- Notifications ---
export function getNotifications(query: ListQuery): ApiListResponse<Notification> {
  return queryList(notificationsList, query, ["title", "message"]);
}
export function markNotificationRead(id: string): Notification | undefined {
  const idx = notificationsList.findIndex((n) => n.id === id);
  if (idx === -1) return undefined;
  notificationsList[idx] = { ...notificationsList[idx], is_read: true };
  return notificationsList[idx];
}
export function markAllNotificationsRead(): number {
  let count = 0;
  notificationsList = notificationsList.map((n) => {
    if (!n.is_read) { count++; return { ...n, is_read: true }; }
    return n;
  });
  return count;
}

// --- Dashboard Stats ---
export function getDashboardStats() {
  return {
    new_insights: insightReports.filter((r) => r.status === "新規").length,
    active_brands: brands.filter((b) => b.contract_status === "アクティブ").length,
    hcp_coverage: Math.round(hcps.filter((h) => h.access_status === "アクセス良好").length / hcps.length * 100),
    unresolved_alerts: monitoringAlerts.filter((a) => a.status === "未対応").length,
    insight_trend: [
      { month: "2025年10月", count: 5 },
      { month: "2025年11月", count: 8 },
      { month: "2025年12月", count: 6 },
      { month: "2026年1月", count: 10 },
      { month: "2026年2月", count: 12 },
    ],
    insight_type_distribution: (() => {
      const dist: Record<string, number> = {};
      insightReports.forEach((r) => {
        dist[r.insight_type] = (dist[r.insight_type] || 0) + 1;
      });
      return Object.entries(dist).map(([name, value]) => ({ name, value }));
    })(),
    severity_distribution: (() => {
      const dist: Record<string, number> = {};
      insightReports.forEach((r) => {
        dist[r.severity] = (dist[r.severity] || 0) + 1;
      });
      return Object.entries(dist).map(([name, value]) => ({ name, value }));
    })(),
    recent_insights: insightReports.slice(0, 5),
    recent_alerts: monitoringAlerts.slice(0, 5),
    request_status_breakdown: (() => {
      const dist: Record<string, number> = {};
      analysisRequests.forEach((r) => {
        dist[r.status] = (dist[r.status] || 0) + 1;
      });
      return Object.entries(dist).map(([name, value]) => ({ name, value }));
    })(),
  };
}
