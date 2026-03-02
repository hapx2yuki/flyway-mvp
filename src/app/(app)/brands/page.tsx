"use client";

import { useState, useMemo } from "react";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { CardSkeleton } from "@/components/loading-skeleton";
import { ErrorState } from "@/components/error-state";
import { EmptyState } from "@/components/empty-state";
import { useFetch } from "@/hooks/use-fetch";
import { useDebounce } from "@/hooks/use-debounce";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import type { Brand, ApiListResponse } from "@/lib/types";

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  "アクティブ": "default",
  "PoC": "secondary",
  "交渉中": "outline",
  "終了": "destructive",
};

const brandFormSchema = z.object({
  name: z.string().min(1, "ブランド名は必須です"),
  therapeutic_area: z.string().min(1, "治療領域は必須です"),
  indications: z.string().min(1, "適応症は必須です"),
  annual_revenue: z.string().min(1, "年間売上は必須です"),
  market_share: z.string().min(1, "市場シェアは必須です"),
  contract_status: z.string().min(1, "契約ステータスは必須です"),
  kpi_target_insights: z.string().min(1, "KPIは必須です"),
  kpi_target_coverage: z.string().min(1, "カバレッジは必須です"),
});

type BrandFormValues = z.infer<typeof brandFormSchema>;

export default function BrandsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);

  const debouncedSearch = useDebounce(search);

  const url = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("per_page", "9");
    if (debouncedSearch) params.set("q", debouncedSearch);
    if (statusFilter !== "all") params.set("status", statusFilter);
    return `/api/brands?${params.toString()}`;
  }, [page, debouncedSearch, statusFilter]);

  const { data, error, isLoading, mutate } = useFetch<ApiListResponse<Brand>>(url);

  const form = useForm<BrandFormValues>({
    resolver: zodResolver(brandFormSchema),
    defaultValues: {
      name: "",
      therapeutic_area: "",
      indications: "",
      annual_revenue: "0",
      market_share: "0",
      contract_status: "PoC",
      kpi_target_insights: "10",
      kpi_target_coverage: "80",
    },
  });

  const onSubmit = async (values: BrandFormValues) => {
    try {
      const res = await fetch("/api/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          indications: values.indications.split("、"),
          annual_revenue: Number(values.annual_revenue),
          market_share: Number(values.market_share),
          kpi_target_insights: Number(values.kpi_target_insights),
          kpi_target_coverage: Number(values.kpi_target_coverage),
        }),
      });
      if (!res.ok) throw new Error("作成に失敗しました");
      toast.success("ブランドを追加しました");
      setDialogOpen(false);
      form.reset();
      mutate();
    } catch {
      toast.error("ブランドの追加に失敗しました");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/brands/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("削除に失敗しました");
      toast.success("ブランドを削除しました");
      mutate();
    } catch {
      toast.error("ブランドの削除に失敗しました");
    }
  };

  const formatRevenue = (value: number) => {
    if (value >= 100000000) return `${Math.round(value / 100000000)}億円`;
    if (value >= 10000) return `${Math.round(value / 10000)}万円`;
    return `${value}円`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">ブランド管理</h1>
          <p className="text-muted-foreground">契約中のブランドとKPI設定を管理します</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" />新規ブランド追加</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>新規ブランド追加</DialogTitle></DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>ブランド名 <span className="text-destructive">*</span></FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="therapeutic_area" render={({ field }) => (
                  <FormItem><FormLabel>治療領域 <span className="text-destructive">*</span></FormLabel><FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger><SelectValue placeholder="選択してください" /></SelectTrigger>
                      <SelectContent>
                        {["オンコロジー", "循環器", "自己免疫疾患", "感染症", "中枢神経", "泌尿器", "代謝性疾患", "呼吸器", "希少疾患", "ワクチン"].map((area) => (
                          <SelectItem key={area} value={area}>{area}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="indications" render={({ field }) => (
                  <FormItem><FormLabel>適応症（「、」区切り） <span className="text-destructive">*</span></FormLabel><FormControl><Input {...field} placeholder="例: 非小細胞肺がん、腎細胞がん" /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="annual_revenue" render={({ field }) => (
                    <FormItem><FormLabel>年間売上（円）</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="market_share" render={({ field }) => (
                    <FormItem><FormLabel>市場シェア（%）</FormLabel><FormControl><Input type="number" step="0.1" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="contract_status" render={({ field }) => (
                  <FormItem><FormLabel>契約ステータス</FormLabel><FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["アクティブ", "PoC", "交渉中", "終了"].map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl><FormMessage /></FormItem>
                )} />
                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "追加中..." : "追加"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input placeholder="ブランドを検索..." className="pl-9" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="ステータス" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべて</SelectItem>
            <SelectItem value="アクティブ">アクティブ</SelectItem>
            <SelectItem value="PoC">PoC</SelectItem>
            <SelectItem value="交渉中">交渉中</SelectItem>
            <SelectItem value="終了">終了</SelectItem>
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
        <EmptyState title="ブランドが登録されていません" description="新しいブランドを追加して分析を開始しましょう。" actionLabel="新規ブランド追加" onAction={() => setDialogOpen(true)} />
      ) : (
        <>
          <p className="text-sm text-muted-foreground">全{data.meta.total}件中 {(data.meta.page - 1) * data.meta.per_page + 1}-{Math.min(data.meta.page * data.meta.per_page, data.meta.total)}件を表示</p>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.data.map((brand) => (
              <Card key={brand.id} className="flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">{brand.name}</CardTitle>
                    <Badge variant={statusVariant[brand.contract_status] || "outline"} className="text-xs shrink-0">{brand.contract_status}</Badge>
                  </div>
                  <Badge variant="outline" className="text-xs w-fit">{brand.therapeutic_area}</Badge>
                </CardHeader>
                <CardContent className="flex-1 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">年間売上</span><span className="font-medium">{formatRevenue(brand.annual_revenue)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">市場シェア</span><span className="font-medium">{brand.market_share}%</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">適応症</span><span className="font-medium text-right max-w-[180px] truncate">{brand.indications.join("、")}</span></div>
                  <div className="pt-3 flex gap-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild><Button variant="outline" size="sm" className="flex-1">削除</Button></AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>ブランドを削除しますか？</AlertDialogTitle>
                          <AlertDialogDescription>「{brand.name}」を削除します。この操作は取り消せません。</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>キャンセル</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(brand.id)}>削除</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
