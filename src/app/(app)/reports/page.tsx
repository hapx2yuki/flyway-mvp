"use client";

import { useState, useMemo } from "react";
import { Search, Download, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { CardSkeleton } from "@/components/loading-skeleton";
import { ErrorState } from "@/components/error-state";
import { EmptyState } from "@/components/empty-state";
import { useFetch } from "@/hooks/use-fetch";
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "sonner";
import type { InsightReport, ApiListResponse } from "@/lib/types";

const typeVariant: Record<string, "default" | "secondary" | "outline"> = {
  "市場機会": "default",
  "競合動向": "secondary",
  "患者コホート発見": "outline",
  "処方パターン変動": "secondary",
  "薬価影響": "default",
  "規制変更": "outline",
  "アクセス改善機会": "secondary",
};

export default function ReportsPage() {
  const [search, setSearch] = useState("");
  const [areaFilter, setAreaFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search);

  const url = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("per_page", "9");
    params.set("sort_by", "created_at");
    params.set("order", "desc");
    if (debouncedSearch) params.set("q", debouncedSearch);
    if (areaFilter !== "all") params.set("therapeutic_area", areaFilter);
    if (typeFilter !== "all") params.set("insight_type", typeFilter);
    // Only show completed/archived reports
    params.set("status", "完了");
    return `/api/insights?${params.toString()}`;
  }, [page, debouncedSearch, areaFilter, typeFilter]);

  const { data, error, isLoading, mutate } = useFetch<ApiListResponse<InsightReport>>(url);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">レポートライブラリ</h1>
        <p className="text-muted-foreground">過去に生成されたインサイトレポートを閲覧・エクスポートできます</p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input placeholder="レポートを検索..." className="pl-9" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <Select value={areaFilter} onValueChange={(v) => { setAreaFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="治療領域" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべての領域</SelectItem>
            {["オンコロジー", "循環器", "自己免疫疾患", "感染症", "中枢神経", "代謝性疾患", "呼吸器", "希少疾患"].map((a) => (
              <SelectItem key={a} value={a}>{a}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="レポートタイプ" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべてのタイプ</SelectItem>
            {["市場機会", "競合動向", "患者コホート発見", "処方パターン変動", "薬価影響", "規制変更", "アクセス改善機会"].map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (<Card key={i}><CardSkeleton /></Card>))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={mutate} />
      ) : !data || data.data.length === 0 ? (
        <EmptyState title="レポートがありません" description="完了したインサイトレポートがここに表示されます。" />
      ) : (
        <>
          <p className="text-sm text-muted-foreground">全{data.meta.total}件中 {(data.meta.page - 1) * data.meta.per_page + 1}-{Math.min(data.meta.page * data.meta.per_page, data.meta.total)}件を表示</p>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.data.map((report) => (
              <Card key={report.id} className="flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base line-clamp-2">{report.title}</CardTitle>
                    <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={typeVariant[report.insight_type] || "outline"} className="text-xs">{report.insight_type}</Badge>
                    <Badge variant="outline" className="text-xs">{report.therapeutic_area}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-3 text-sm">
                  <p className="text-muted-foreground line-clamp-3">{report.narrative_content}</p>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ブランド</span>
                    <span className="font-medium">{report.brand_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">信頼度</span>
                    <span className="font-medium">{report.confidence_score}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">作成日</span>
                    <span className="font-medium">{new Date(report.created_at).toLocaleDateString("ja-JP")}</span>
                  </div>
                  <div className="pt-2">
                    <Button variant="outline" size="sm" className="w-full" onClick={() => toast.success("レポートをエクスポートしました")}>
                      <Download className="h-4 w-4 mr-1" />エクスポート
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {data.meta.total_pages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem><PaginationPrevious onClick={() => setPage(Math.max(1, page - 1))} className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} /></PaginationItem>
                {Array.from({ length: data.meta.total_pages }, (_, i) => i + 1).map((p) => (
                  <PaginationItem key={p}><PaginationLink onClick={() => setPage(p)} isActive={page === p} className="cursor-pointer">{p}</PaginationLink></PaginationItem>
                ))}
                <PaginationItem><PaginationNext onClick={() => setPage(Math.min(data.meta.total_pages, page + 1))} className={page === data.meta.total_pages ? "pointer-events-none opacity-50" : "cursor-pointer"} /></PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
}
