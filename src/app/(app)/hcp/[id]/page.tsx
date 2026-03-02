"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, UserPlus, FileSearch } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DetailSkeleton } from "@/components/loading-skeleton";
import { ErrorState } from "@/components/error-state";
import { useFetch } from "@/hooks/use-fetch";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import type { HCP } from "@/lib/types";

const prescriptionData = [
  { month: "10月", volume: 38 },
  { month: "11月", volume: 42 },
  { month: "12月", volume: 35 },
  { month: "1月", volume: 48 },
  { month: "2月", volume: 52 },
];

export default function HCPDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, error, isLoading, mutate } = useFetch<{ data: HCP }>(`/api/hcps/${id}`);

  if (isLoading) return <DetailSkeleton />;
  if (error) return <ErrorState message={error} onRetry={mutate} />;
  if (!data) return <DetailSkeleton />;

  const hcp = data.data;

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/dashboard">ダッシュボード</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbLink href="/hcp">HCP分析</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>{hcp.name}</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-start justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-2">
            <Link href="/hcp"><ArrowLeft className="h-4 w-4 mr-1" />戻る</Link>
          </Button>
          <h1 className="text-xl font-bold">{hcp.name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline">{hcp.specialty}</Badge>
            <Badge variant={hcp.opportunity_level === "高" ? "default" : hcp.opportunity_level === "中" ? "secondary" : "outline"}>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>機会スコア: {hcp.opportunity_score}</TooltipTrigger>
                  <TooltipContent>処方量、アクセス状況、専門領域の適合度から算出されたスコアです</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Badge>
            <Badge variant={hcp.access_status === "アクセス良好" ? "default" : "secondary"}>{hcp.access_status}</Badge>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button onClick={() => toast.success("ターゲットリストに追加しました")}>
            <UserPlus className="h-4 w-4 mr-1" />ターゲットリストに追加
          </Button>
          <Button variant="outline" asChild>
            <Link href="/requests"><FileSearch className="h-4 w-4 mr-1" />深掘り分析を依頼</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">プロフィール</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div><span className="text-sm text-muted-foreground">所属施設</span><p className="font-medium">{hcp.facility_name}</p></div>
            <div><span className="text-sm text-muted-foreground">地域</span><p className="font-medium">{hcp.facility_region}</p></div>
            <div><span className="text-sm text-muted-foreground">処方量（月間）</span><p className="font-medium">{hcp.prescription_volume}件</p></div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="prescription" className="space-y-4">
        <TabsList>
          <TabsTrigger value="prescription">処方パターン</TabsTrigger>
          <TabsTrigger value="opportunity">商業機会</TabsTrigger>
          <TabsTrigger value="access">アクセス状況</TabsTrigger>
        </TabsList>
        <TabsContent value="prescription">
          <Card>
            <CardHeader><CardTitle className="text-base">処方推移</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={prescriptionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <RechartsTooltip />
                    <Bar dataKey="volume" fill="hsl(var(--chart-1))" name="処方件数" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="opportunity">
          <Card>
            <CardHeader><CardTitle className="text-base">商業機会詳細</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{hcp.key_insights}</p>
              <Separator className="my-4" />
              <div className="grid gap-4 md:grid-cols-2">
                <div><span className="text-sm text-muted-foreground">機会レベル</span><p className="font-medium">{hcp.opportunity_level}</p></div>
                <div><span className="text-sm text-muted-foreground">機会スコア</span><p className="font-medium">{hcp.opportunity_score}/100</p></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="access">
          <Card>
            <CardHeader><CardTitle className="text-base">アクセス情報</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div><span className="text-muted-foreground">アクセスステータス</span><p className="font-medium">{hcp.access_status}</p></div>
              <Separator />
              <div><span className="text-muted-foreground">最終コンタクト</span><p className="font-medium">{new Date(hcp.updated_at).toLocaleDateString("ja-JP")}</p></div>
              <Separator />
              <div><span className="text-muted-foreground">登録日</span><p className="font-medium">{new Date(hcp.created_at).toLocaleDateString("ja-JP")}</p></div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
