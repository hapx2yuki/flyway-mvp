"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Bookmark } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { DetailSkeleton } from "@/components/loading-skeleton";
import { ErrorState } from "@/components/error-state";
import { useFetch } from "@/hooks/use-fetch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { InsightReport } from "@/lib/types";
import { severityVariant } from "@/lib/badge-variants";

export default function InsightDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, error, isLoading, mutate } = useFetch<{ data: InsightReport }>(`/api/insights/${id}`);

  if (isLoading) return <DetailSkeleton />;
  if (error) return <ErrorState message={error} onRetry={mutate} />;
  if (!data) return <DetailSkeleton />;

  const insight = data.data;

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/dashboard">ダッシュボード</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbLink href="/insights">インサイト</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>{insight.title.length > 30 ? insight.title.substring(0, 30) + "…" : insight.title}</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/insights"><ArrowLeft className="h-4 w-4 mr-1" />戻る</Link>
            </Button>
          </div>
          <h1 className="text-xl font-bold leading-tight">{insight.title}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge variant={severityVariant[insight.severity] || "outline"}>{insight.severity}</Badge>
            <Badge variant="outline">{insight.insight_type}</Badge>
            <Badge variant="secondary">{insight.status}</Badge>
            <span className="text-sm text-muted-foreground">信頼度 {insight.confidence_score}%</span>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span tabIndex={0}>
                  <Button variant="outline" disabled>
                    <Download className="h-4 w-4 mr-1" />エクスポート
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>デモ版では利用できません</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span tabIndex={0}>
                  <Button variant="outline" disabled>
                    <Bookmark className="h-4 w-4 mr-1" />ブックマーク
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>デモ版では利用できません</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <div className="md:col-span-3">
          <Tabs defaultValue="report" className="space-y-4">
            <TabsList>
              <TabsTrigger value="report">レポート</TabsTrigger>
              <TabsTrigger value="sources">データソース</TabsTrigger>
              <TabsTrigger value="actions">推奨アクション</TabsTrigger>
            </TabsList>
            <TabsContent value="report">
              <Card>
                <CardContent className="pt-6">
                  <ScrollArea className="h-[500px]">
                    <div className="prose prose-sm max-w-none">
                      <p className="text-base leading-relaxed whitespace-pre-wrap">{insight.narrative_content}</p>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="sources">
              <Card>
                <CardHeader><CardTitle className="text-base">データソース</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {insight.data_sources.map((source, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                        <span className="text-sm">{source}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="actions">
              <Card>
                <CardHeader><CardTitle className="text-base">推奨アクション</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {insight.recommended_actions.map((action, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg border">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                          {i + 1}
                        </div>
                        <p className="text-sm">{action}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">メタ情報</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div><span className="text-muted-foreground">ブランド</span><p className="font-medium">{insight.brand_name}</p></div>
              <Separator />
              <div><span className="text-muted-foreground">治療領域</span><p className="font-medium">{insight.therapeutic_area}</p></div>
              <Separator />
              <div><span className="text-muted-foreground">検出日</span><p className="font-medium">{new Date(insight.created_at).toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" })}</p></div>
              <Separator />
              <div><span className="text-muted-foreground">最終更新</span><p className="font-medium">{new Date(insight.updated_at).toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" })}</p></div>
              <Separator />
              <div><span className="text-muted-foreground">ID</span><p className="font-medium font-mono text-xs">{insight.id}</p></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
