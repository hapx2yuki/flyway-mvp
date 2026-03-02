"use client";

import { useState, useMemo } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { TableSkeleton } from "@/components/loading-skeleton";
import { ErrorState } from "@/components/error-state";
import { EmptyState } from "@/components/empty-state";
import { useFetch } from "@/hooks/use-fetch";
import { toast } from "sonner";
import type { Notification, ApiListResponse } from "@/lib/types";

const typeVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  "アラート": "destructive",
  "分析完了": "default",
  "システム": "secondary",
};

export default function NotificationsPage() {
  const [typeFilter, setTypeFilter] = useState("all");
  const [readFilter, setReadFilter] = useState("all");
  const [page, setPage] = useState(1);

  const url = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("per_page", "10");
    params.set("sort_by", "created_at");
    params.set("order", "desc");
    if (typeFilter !== "all") params.set("type", typeFilter);
    if (readFilter !== "all") params.set("is_read", readFilter);
    return `/api/notifications?${params.toString()}`;
  }, [page, typeFilter, readFilter]);

  const { data, error, isLoading, mutate } = useFetch<ApiListResponse<Notification>>(url);

  const handleMarkRead = async (id: string) => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error();
      toast.success("既読にしました");
      mutate();
    } catch {
      toast.error("更新に失敗しました");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_all_read" }),
      });
      if (!res.ok) throw new Error();
      toast.success("すべて既読にしました");
      mutate();
    } catch {
      toast.error("更新に失敗しました");
    }
  };

  const unreadCount = data?.data.filter((n) => !n.is_read).length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">通知</h1>
          <p className="text-muted-foreground">アラートやシステムからの通知を確認できます</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={handleMarkAllRead}>
            <CheckCheck className="h-4 w-4 mr-1" />すべて既読にする
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="タイプ" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべて</SelectItem>
            <SelectItem value="アラート">アラート</SelectItem>
            <SelectItem value="分析完了">分析完了</SelectItem>
            <SelectItem value="システム">システム</SelectItem>
          </SelectContent>
        </Select>
        <Select value={readFilter} onValueChange={(v) => { setReadFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[120px]"><SelectValue placeholder="状態" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべて</SelectItem>
            <SelectItem value="false">未読</SelectItem>
            <SelectItem value="true">既読</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? <TableSkeleton /> : error ? <ErrorState message={error} onRetry={mutate} /> : !data || data.data.length === 0 ? (
        <EmptyState title="通知はありません" description="新しい通知があるとここに表示されます。" />
      ) : (
        <>
          <p className="text-sm text-muted-foreground">全{data.meta.total}件中 {(data.meta.page - 1) * data.meta.per_page + 1}-{Math.min(data.meta.page * data.meta.per_page, data.meta.total)}件を表示</p>
          <ScrollArea className="h-[600px]">
            <div className="space-y-3">
              {data.data.map((notification) => (
                <Card key={notification.id} className={notification.is_read ? "opacity-60" : ""}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <Bell className={`h-5 w-5 mt-0.5 shrink-0 ${notification.is_read ? "text-muted-foreground" : "text-primary"}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={typeVariant[notification.type] || "outline"} className="text-xs">{notification.type}</Badge>
                            {!notification.is_read && <Badge variant="default" className="text-xs">未読</Badge>}
                          </div>
                          <p className="text-sm font-medium">{notification.title}</p>
                          <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-2">{new Date(notification.created_at).toLocaleString("ja-JP")}</p>
                        </div>
                      </div>
                      {!notification.is_read && (
                        <Button variant="outline" size="sm" onClick={() => handleMarkRead(notification.id)} className="shrink-0">
                          既読にする
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
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
