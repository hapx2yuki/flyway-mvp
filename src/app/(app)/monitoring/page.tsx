"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TruncatedPagination } from "@/components/truncated-pagination";
import { TableSkeleton } from "@/components/loading-skeleton";
import { ErrorState } from "@/components/error-state";
import { EmptyState } from "@/components/empty-state";
import { useFetch } from "@/hooks/use-fetch";
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "sonner";
import type { MonitoringAlert, ApiListResponse } from "@/lib/types";
import { severityVariant } from "@/lib/badge-variants";
const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  "未対応": "destructive", "対応中": "default", "対応済み": "secondary", "アーカイブ": "outline",
};

export default function MonitoringPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [severity, setSeverity] = useState("all");
  const [sortBy, setSortBy] = useState("detected_at");
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
    if (category !== "all") params.set("category", category);
    if (severity !== "all") params.set("severity", severity);
    return `/api/alerts?${params.toString()}`;
  }, [page, sortBy, order, debouncedSearch, category, severity]);

  const { data, error, isLoading, mutate } = useFetch<ApiListResponse<MonitoringAlert>>(url);

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/alerts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      toast.success("ステータスを更新しました");
      mutate();
    } catch {
      toast.error("ステータスの更新に失敗しました");
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) { setOrder(order === "asc" ? "desc" : "asc"); } else { setSortBy(field); setOrder("desc"); }
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">市場モニタリング</h1>
        <p className="text-muted-foreground">競合動向、薬価改定、市場変動アラートを確認できます</p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input placeholder="アラートを検索..." className="pl-9" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <Select value={category} onValueChange={(v) => { setCategory(v); setPage(1); }}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="カテゴリ" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべて</SelectItem>
            {["競合参入", "バイオシミラー", "薬価改定", "処方トレンド", "規制変更", "市場シェア変動"].map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
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
      </div>

      {isLoading ? <TableSkeleton /> : error ? <ErrorState message={error} onRetry={mutate} /> : !data || data.data.length === 0 ? (
        <EmptyState title="アラートが見つかりません" description="現在、該当するアラートはありません。" />
      ) : (
        <>
          <p className="text-sm text-muted-foreground">全{data.meta.total}件中 {(data.meta.page - 1) * data.meta.per_page + 1}-{Math.min(data.meta.page * data.meta.per_page, data.meta.total)}件を表示</p>
          <Tabs defaultValue="timeline">
            <TabsList>
              <TabsTrigger value="timeline">タイムライン</TabsTrigger>
              <TabsTrigger value="table">テーブル</TabsTrigger>
            </TabsList>
            <TabsContent value="timeline">
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {data.data.map((alert) => (
                    <Card key={alert.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <Badge variant={severityVariant[alert.severity] || "outline"}>{alert.severity}</Badge>
                              <Badge variant="outline">{alert.category}</Badge>
                              <Badge variant={statusVariant[alert.status] || "outline"}>{alert.status}</Badge>
                              <span className="text-xs text-muted-foreground">{alert.brand_name}</span>
                            </div>
                            <p className="text-sm">{alert.content}</p>
                            <p className="text-xs text-muted-foreground mt-2">{new Date(alert.detected_at).toLocaleString("ja-JP")}</p>
                          </div>
                          {alert.status === "未対応" && (
                            <Button variant="outline" size="sm" onClick={() => handleStatusUpdate(alert.id, "対応中")}>
                              対応開始
                            </Button>
                          )}
                          {alert.status === "対応中" && (
                            <Button variant="outline" size="sm" onClick={() => handleStatusUpdate(alert.id, "対応済み")}>
                              対応済みにする
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="table">
              <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>重要度</TableHead>
                    <TableHead>カテゴリ</TableHead>
                    <TableHead>ブランド</TableHead>
                    <TableHead className="max-w-[300px]">内容</TableHead>
                    <TableHead>ステータス</TableHead>
                    <TableHead><Button variant="ghost" size="sm" onClick={() => handleSort("detected_at")} className="font-medium">検出日 {sortBy === "detected_at" && (order === "asc" ? "↑" : "↓")}</Button></TableHead>
                    <TableHead>アクション</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.data.map((alert) => (
                    <TableRow key={alert.id}>
                      <TableCell><Badge variant={severityVariant[alert.severity] || "outline"} className="text-xs">{alert.severity}</Badge></TableCell>
                      <TableCell className="text-sm">{alert.category}</TableCell>
                      <TableCell className="text-sm">{alert.brand_name}</TableCell>
                      <TableCell className="text-sm max-w-[300px] truncate">{alert.content}</TableCell>
                      <TableCell><Badge variant={statusVariant[alert.status] || "outline"} className="text-xs">{alert.status}</Badge></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{new Date(alert.detected_at).toLocaleDateString("ja-JP")}</TableCell>
                      <TableCell>
                        {alert.status === "未対応" && <Button variant="outline" size="sm" onClick={() => handleStatusUpdate(alert.id, "対応中")}>対応開始</Button>}
                        {alert.status === "対応中" && <Button variant="outline" size="sm" onClick={() => handleStatusUpdate(alert.id, "対応済み")}>完了</Button>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            </TabsContent>
          </Tabs>
          <TruncatedPagination page={page} totalPages={data.meta.total_pages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
