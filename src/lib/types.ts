// ============================================
// Type Definitions for MediSearch AI MVP
// ============================================

// --- Master Data Types ---

export type TherapeuticArea =
  | "オンコロジー"
  | "循環器"
  | "自己免疫疾患"
  | "感染症"
  | "中枢神経"
  | "泌尿器"
  | "代謝性疾患"
  | "呼吸器"
  | "希少疾患"
  | "ワクチン";

export type InsightType =
  | "市場機会"
  | "競合動向"
  | "患者コホート発見"
  | "処方パターン変動"
  | "薬価影響"
  | "規制変更"
  | "アクセス改善機会";

export type AlertCategory =
  | "競合参入"
  | "バイオシミラー"
  | "薬価改定"
  | "処方トレンド"
  | "規制変更"
  | "市場シェア変動";

export type Severity = "緊急" | "高" | "中" | "低";

export type InsightStatus = "新規" | "確認済み" | "対応中" | "完了" | "アーカイブ";

export type BrandContractStatus = "アクティブ" | "PoC" | "交渉中" | "終了";

export type HCPAccessStatus = "アクセス良好" | "制限あり" | "未接触";

export type OpportunityLevel = "高" | "中" | "低";

export type AlertStatus = "未対応" | "対応中" | "対応済み" | "アーカイブ";

export type RequestStatus = "下書き" | "提出済み" | "分析中" | "完了" | "キャンセル";

export type RequestPriority = "高" | "中" | "低";

export type NotificationType = "アラート" | "分析完了" | "システム";

// --- Primary Entity Types ---

export interface InsightReport {
  id: string;
  title: string;
  brand_id: string;
  brand_name: string;
  therapeutic_area: TherapeuticArea;
  insight_type: InsightType;
  severity: Severity;
  confidence_score: number;
  narrative_content: string;
  recommended_actions: string[];
  data_sources: string[];
  status: InsightStatus;
  created_at: string;
  updated_at: string;
}

export interface Brand {
  id: string;
  name: string;
  therapeutic_area: TherapeuticArea;
  indications: string[];
  annual_revenue: number;
  market_share: number;
  contract_status: BrandContractStatus;
  kpi_target_insights: number;
  kpi_target_coverage: number;
  created_at: string;
  updated_at: string;
}

export interface HCP {
  id: string;
  name: string;
  specialty: TherapeuticArea;
  facility_name: string;
  facility_region: string;
  prescription_volume: number;
  opportunity_score: number;
  opportunity_level: OpportunityLevel;
  access_status: HCPAccessStatus;
  key_insights: string;
  created_at: string;
  updated_at: string;
}

export interface MonitoringAlert {
  id: string;
  category: AlertCategory;
  severity: Severity;
  brand_id: string;
  brand_name: string;
  detected_at: string;
  content: string;
  recommended_response: string;
  status: AlertStatus;
  created_at: string;
  updated_at: string;
}

export interface AnalysisRequest {
  id: string;
  title: string;
  purpose: string;
  brand_id: string;
  brand_name: string;
  therapeutic_area: TherapeuticArea;
  priority: RequestPriority;
  deadline: string;
  status: RequestStatus;
  result_summary: string;
  created_at: string;
  updated_at: string;
}

// --- Secondary Entity Types ---

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  related_entity_id: string;
  created_at: string;
}

// --- API Response Types ---

export interface ApiListResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
  };
}

export interface ApiSingleResponse<T> {
  data: T;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
  };
}

export interface StatsResponse {
  data: {
    total_count: number;
    status_breakdown: Record<string, number>;
    additional: Record<string, number | string>;
  };
}

// --- Form Schema Types ---

export interface BrandFormData {
  name: string;
  therapeutic_area: TherapeuticArea;
  indications: string;
  annual_revenue: number;
  market_share: number;
  contract_status: BrandContractStatus;
  kpi_target_insights: number;
  kpi_target_coverage: number;
}

export interface AnalysisRequestFormData {
  title: string;
  purpose: string;
  brand_id: string;
  therapeutic_area: TherapeuticArea;
  priority: RequestPriority;
  deadline: string;
}
