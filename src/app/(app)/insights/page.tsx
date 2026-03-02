"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { TableSkeleton } from "@/components/loading-skeleton";
import { ErrorState } from "@/components/error-state";
import { EmptyState } from "@/components/empty-state";
import { useFetch } from "@/hooks/use-fetch";
import { useDebounce } from "@/hooks/use-debounce";
import type { InsightReport, ApiListResponse } from "@/lib/types";

const severityVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  "緊急": "destructive",
  "高": "default",
  "中": "secondary",
  "低": "outline",
};

export default function InsightsPage() {
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("all");
  const [insightType, setInsightType] = useState("all");
  const [therapeuticArea, setTherapeuticArea] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search);

  const url = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("per_page", "10");
    params.set("sort_by", sortBy);
    params.set("order", order);
    if (debouncedSearch) params.set("q", debouncedSearch);
    if (severity !== "all") params.set("severity", severity);
    if (insightType !== "all") params.set("insight_type", insightType);
    if (therapeuticArea !== "all") params.set("therapeutic_area", therapeuticArea);
    return `/api/insights?${params.toString()}`;
  }, [page, sortBy, order, debouncedSearch, severity, insightType, therapeuticArea]);

  const { data, error, isLoading, mutate } = useFetch<ApiListResponse<InsightReport>>(url);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setOrder(order === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setOrder("desc");
    }
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">インサイト</h1>
        <p className="text-muted-foreground">AIエージェントが発見した商業機会を確認できます</p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            placeholder="インサイトを検索..."
            className="pl-9"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <Select value={therapeuticArea} onValueChange={(v) => { setTherapeuticArea(v); setPage(1); }}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="治療領域" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべての領域</SelectItem>
            <SelectItem value="オンコロジー">オンコロジー</SelectItem>
            <SelectItem value="循環器">循環器</SelectItem>
            <SelectItem value="自己免疫疾患">自己免疫疾患</SelectItem>
            <SelectItem value="感染症">感染症</SelectItem>
            <SelectItem value="中枢神経">中枢神経</SelectItem>
            <SelectItem value="代謝性疾患">代謝性疾患</SelectItem>
            <SelectItem value="呼吸器">呼吸器</SelectItem>
            <SelectItem value="希少疾患">希少疾患</SelectItem>
          </SelectContent>
        </Select>
        <Select value={severity} onValueChange={(v) => { setSeverity(v); setPage(1); }}>
          <SelectTrigger className="w-[120px]"><SelectValue placeholder="重要度" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべて</SelectItem>
            <SelectItem value="緊急">緊急</SelectItem>
            <SelectItem value="高">高</SelectItem>
            <SelectItem value="中">中</SelectItem>
            <SelectItem value="低">低</SelectItem>
          </SelectContent>
        </Select>
        <Select value={insightType} onValueChange={(v) => { setInsightType(v); setPage(1); }}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="タイプ" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべて</SelectItem>
            <SelectItem value="市場機会">市場機会</SelectItem>
            <SelectItem value="競合動向">競合動向</SelectItem>
            <SelectItem value="患者コホート発見">患者コホート発見</SelectItem>
            <SelectItem value="処方パターン変動">処方パターン変動</SelectItem>
            <SelectItem value="薬価影響">薬価影響</SelectItem>
            <SelectItem value="規制変更">規制変更</SelectItem>
            <SelectItem value="アクセス改善機会">アクセス改善機会</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={mutate} />
      ) : !data || data.data.length === 0 ? (
        <EmptyState title="インサイトが見つかりません" description="検索条件を変更するか、AIエージェントが新しいインサイトを検出するまでお待ちください。" />
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            全{data.meta.total}件中 {(data.meta.page - 1) * data.meta.per_page + 1}-{Math.min(data.meta.page * data.meta.per_page, data.meta.total)}件を表示
          </p>
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button variant="ghost" size="sm" onClick={() => handleSort("title")} className="font-medium">
                    タイトル {sortBy === "title" && (order === "asc" ? "↑" : "↓")}
                  </Button>
                </TableHead>
                <TableHead>ブランド</TableHead>
                <TableHead>治療領域</TableHead>
                <TableHead>タイプ</TableHead>
                <TableHead>重要度</TableHead>
                <TableHead>
                  <Button variant="ghost" size="sm" onClick={() => handleSort("confidence_score")} className="font-medium">
                    信頼度 {sortBy === "confidence_score" && (order === "asc" ? "↑" : "↓")}
                  </Button>
                </TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead>
                  <Button variant="ghost" size="sm" onClick={() => handleSort("created_at")} className="font-medium">
                    検出日 {sortBy === "created_at" && (order === "asc" ? "↑" : "↓")}
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((insight) => (
                <TableRow key={insight.id}>
                  <TableCell className="max-w-[300px]">
                    <Link href={`/insights/${insight.id}`} className="text-sm font-medium hover:underline line-clamp-2">
                      {insight.title}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm">{insight.brand_name}</TableCell>
                  <TableCell className="text-sm">{insight.therapeutic_area}</TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{insight.insight_type}</Badge></TableCell>
                  <TableCell><Badge variant={severityVariant[insight.severity] || "outline"} className="text-xs">{insight.severity}</Badge></TableCell>
                  <TableCell className="text-sm">{insight.confidence_score}%</TableCell>
                  <TableCell><Badge variant="secondary" className="text-xs">{insight.status}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{new Date(insight.created_at).toLocaleDateString("ja-JP")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
          {data.meta.total_pages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious onClick={() => setPage(Math.max(1, page - 1))} className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} />
                </PaginationItem>
                {Array.from({ length: data.meta.total_pages }, (_, i) => i + 1).map((p) => (
                  <PaginationItem key={p}>
                    <PaginationLink onClick={() => setPage(p)} isActive={page === p} className="cursor-pointer">{p}</PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext onClick={() => setPage(Math.min(data.meta.total_pages, page + 1))} className={page === data.meta.total_pages ? "pointer-events-none opacity-50" : "cursor-pointer"} />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
}
