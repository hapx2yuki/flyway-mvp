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
import type { HCP, ApiListResponse } from "@/lib/types";

const opportunityVariant: Record<string, "default" | "secondary" | "outline"> = {
  "高": "default",
  "中": "secondary",
  "低": "outline",
};

export default function HCPPage() {
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("all");
  const [region, setRegion] = useState("all");
  const [sortBy, setSortBy] = useState("opportunity_score");
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
    if (specialty !== "all") params.set("specialty", specialty);
    if (region !== "all") params.set("region", region);
    return `/api/hcps?${params.toString()}`;
  }, [page, sortBy, order, debouncedSearch, specialty, region]);

  const { data, error, isLoading, mutate } = useFetch<ApiListResponse<HCP>>(url);

  const handleSort = (field: string) => {
    if (sortBy === field) { setOrder(order === "asc" ? "desc" : "asc"); } else { setSortBy(field); setOrder("desc"); }
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">HCP分析</h1>
        <p className="text-muted-foreground">医療従事者の商業機会スコアとアクセス状況を分析します</p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input placeholder="HCPを検索..." className="pl-9" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <Select value={specialty} onValueChange={(v) => { setSpecialty(v); setPage(1); }}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="専門領域" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべての領域</SelectItem>
            {["オンコロジー", "循環器", "自己免疫疾患", "感染症", "中枢神経", "代謝性疾患", "呼吸器", "希少疾患", "泌尿器"].map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={region} onValueChange={(v) => { setRegion(v); setPage(1); }}>
          <SelectTrigger className="w-[120px]"><SelectValue placeholder="地域" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべて</SelectItem>
            {["関東", "関西", "東北", "東海", "九州", "北海道"].map((r) => (
              <SelectItem key={r} value={r}>{r}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? <TableSkeleton /> : error ? <ErrorState message={error} onRetry={mutate} /> : !data || data.data.length === 0 ? (
        <EmptyState title="HCPが見つかりません" description="検索条件を変更してください。" />
      ) : (
        <>
          <p className="text-sm text-muted-foreground">全{data.meta.total}件中 {(data.meta.page - 1) * data.meta.per_page + 1}-{Math.min(data.meta.page * data.meta.per_page, data.meta.total)}件を表示</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead><Button variant="ghost" size="sm" onClick={() => handleSort("name")} className="font-medium">氏名 {sortBy === "name" && (order === "asc" ? "↑" : "↓")}</Button></TableHead>
                <TableHead>専門領域</TableHead>
                <TableHead>所属施設</TableHead>
                <TableHead>地域</TableHead>
                <TableHead><Button variant="ghost" size="sm" onClick={() => handleSort("opportunity_score")} className="font-medium">機会スコア {sortBy === "opportunity_score" && (order === "asc" ? "↑" : "↓")}</Button></TableHead>
                <TableHead>アクセス状況</TableHead>
                <TableHead><Button variant="ghost" size="sm" onClick={() => handleSort("prescription_volume")} className="font-medium">処方量 {sortBy === "prescription_volume" && (order === "asc" ? "↑" : "↓")}</Button></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((hcp) => (
                <TableRow key={hcp.id}>
                  <TableCell><Link href={`/hcp/${hcp.id}`} className="font-medium hover:underline">{hcp.name}</Link></TableCell>
                  <TableCell className="text-sm">{hcp.specialty}</TableCell>
                  <TableCell className="text-sm max-w-[200px] truncate">{hcp.facility_name}</TableCell>
                  <TableCell className="text-sm">{hcp.facility_region}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{hcp.opportunity_score}</span>
                      <Badge variant={opportunityVariant[hcp.opportunity_level] || "outline"} className="text-xs">{hcp.opportunity_level}</Badge>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant={hcp.access_status === "アクセス良好" ? "default" : hcp.access_status === "制限あり" ? "secondary" : "outline"} className="text-xs">{hcp.access_status}</Badge></TableCell>
                  <TableCell className="text-sm">{hcp.prescription_volume}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
