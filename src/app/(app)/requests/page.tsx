"use client";

import { useState, useMemo } from "react";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { TableSkeleton } from "@/components/loading-skeleton";
import { ErrorState } from "@/components/error-state";
import { EmptyState } from "@/components/empty-state";
import { useFetch } from "@/hooks/use-fetch";
import { useDebounce } from "@/hooks/use-debounce";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import type { AnalysisRequest, ApiListResponse } from "@/lib/types";

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  "下書き": "outline", "提出済み": "secondary", "分析中": "default", "完了": "default", "キャンセル": "destructive",
};
const priorityVariant: Record<string, "default" | "secondary" | "outline"> = {
  "高": "default", "中": "secondary", "低": "outline",
};

const requestFormSchema = z.object({
  title: z.string().min(1, "件名は必須です"),
  purpose: z.string().min(1, "分析目的は必須です"),
  brand_id: z.string().min(1, "ブランドは必須です"),
  therapeutic_area: z.string().min(1, "治療領域は必須です"),
  priority: z.string().min(1, "優先度は必須です"),
  deadline: z.string().min(1, "期限は必須です"),
});

type RequestFormValues = z.infer<typeof requestFormSchema>;

export default function RequestsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);

  const debouncedSearch = useDebounce(search);

  const url = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("per_page", "10");
    params.set("sort_by", sortBy);
    params.set("order", order);
    if (debouncedSearch) params.set("q", debouncedSearch);
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (priorityFilter !== "all") params.set("priority", priorityFilter);
    return `/api/requests?${params.toString()}`;
  }, [page, sortBy, order, debouncedSearch, statusFilter, priorityFilter]);

  const { data, error, isLoading, mutate } = useFetch<ApiListResponse<AnalysisRequest>>(url);

  const form = useForm<RequestFormValues>({
    resolver: zodResolver(requestFormSchema),
    defaultValues: { title: "", purpose: "", brand_id: "", therapeutic_area: "", priority: "中", deadline: "" },
  });

  const onSubmit = async (values: RequestFormValues) => {
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, brand_name: "ブランド", status: "提出済み" }),
      });
      if (!res.ok) throw new Error();
      toast.success("分析リクエストを作成しました");
      setDialogOpen(false);
      form.reset();
      mutate();
    } catch { toast.error("リクエストの作成に失敗しました"); }
  };

  const handleCancel = async (id: string) => {
    try {
      const res = await fetch(`/api/requests/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "キャンセル" }),
      });
      if (!res.ok) throw new Error();
      toast.success("リクエストをキャンセルしました");
      mutate();
    } catch { toast.error("キャンセルに失敗しました"); }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) { setOrder(order === "asc" ? "desc" : "asc"); } else { setSortBy(field); setOrder("desc"); }
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">分析リクエスト</h1>
          <p className="text-muted-foreground">深掘り分析の依頼と結果を管理します</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" />新規分析リクエスト</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>新規分析リクエスト</DialogTitle></DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem><FormLabel>件名 <span className="text-destructive">*</span></FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="purpose" render={({ field }) => (
                  <FormItem><FormLabel>分析目的 <span className="text-destructive">*</span></FormLabel><FormControl><Textarea {...field} rows={3} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="therapeutic_area" render={({ field }) => (
                  <FormItem><FormLabel>治療領域 <span className="text-destructive">*</span></FormLabel><FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger><SelectValue placeholder="選択" /></SelectTrigger>
                      <SelectContent>
                        {["オンコロジー", "循環器", "自己免疫疾患", "感染症", "中枢神経", "泌尿器", "代謝性疾患", "呼吸器", "希少疾患"].map((a) => (
                          <SelectItem key={a} value={a}>{a}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl><FormMessage /></FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="priority" render={({ field }) => (
                    <FormItem><FormLabel>優先度</FormLabel><FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="高">高</SelectItem>
                          <SelectItem value="中">中</SelectItem>
                          <SelectItem value="低">低</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="deadline" render={({ field }) => (
                    <FormItem><FormLabel>期限 <span className="text-destructive">*</span></FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="brand_id" render={({ field }) => (
                  <FormItem><FormLabel>対象ブランド <span className="text-destructive">*</span></FormLabel><FormControl><Input {...field} placeholder="ブランドIDを入力" /></FormControl><FormMessage /></FormItem>
                )} />
                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "送信中..." : "リクエストを送信"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input placeholder="リクエストを検索..." className="pl-9" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[130px]"><SelectValue placeholder="ステータス" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべて</SelectItem>
            {["下書き", "提出済み", "分析中", "完了", "キャンセル"].map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={(v) => { setPriorityFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[120px]"><SelectValue placeholder="優先度" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべて</SelectItem>
            <SelectItem value="高">高</SelectItem>
            <SelectItem value="中">中</SelectItem>
            <SelectItem value="低">低</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? <TableSkeleton /> : error ? <ErrorState message={error} onRetry={mutate} /> : !data || data.data.length === 0 ? (
        <EmptyState title="分析リクエストがありません" description="新しい分析リクエストを作成しましょう。" actionLabel="新規リクエスト作成" onAction={() => setDialogOpen(true)} />
      ) : (
        <>
          <p className="text-sm text-muted-foreground">全{data.meta.total}件中 {(data.meta.page - 1) * data.meta.per_page + 1}-{Math.min(data.meta.page * data.meta.per_page, data.meta.total)}件を表示</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead><Button variant="ghost" size="sm" onClick={() => handleSort("title")} className="font-medium">件名 {sortBy === "title" && (order === "asc" ? "↑" : "↓")}</Button></TableHead>
                <TableHead>ブランド</TableHead>
                <TableHead>優先度</TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead>期限</TableHead>
                <TableHead><Button variant="ghost" size="sm" onClick={() => handleSort("created_at")} className="font-medium">作成日 {sortBy === "created_at" && (order === "asc" ? "↑" : "↓")}</Button></TableHead>
                <TableHead>アクション</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((req) => (
                <TableRow key={req.id}>
                  <TableCell className="max-w-[250px]"><span className="text-sm font-medium line-clamp-1">{req.title}</span></TableCell>
                  <TableCell className="text-sm">{req.brand_name}</TableCell>
                  <TableCell><Badge variant={priorityVariant[req.priority] || "outline"} className="text-xs">{req.priority}</Badge></TableCell>
                  <TableCell><Badge variant={statusVariant[req.status] || "outline"} className="text-xs">{req.status}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{new Date(req.deadline).toLocaleDateString("ja-JP")}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{new Date(req.created_at).toLocaleDateString("ja-JP")}</TableCell>
                  <TableCell>
                    {(req.status === "下書き" || req.status === "提出済み") && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild><Button variant="outline" size="sm">キャンセル</Button></AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>リクエストをキャンセルしますか？</AlertDialogTitle>
                            <AlertDialogDescription>この操作は取り消せません。</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>戻る</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleCancel(req.id)}>キャンセルする</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                    {req.status === "完了" && req.result_summary && (
                      <Button variant="outline" size="sm" onClick={() => toast.success("結果レポートを表示しました")}>結果を見る</Button>
                    )}
                  </TableCell>
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
