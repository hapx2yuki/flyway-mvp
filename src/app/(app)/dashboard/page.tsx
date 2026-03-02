"use client";

import { useState } from "react";
import Link from "next/link";
import { Lightbulb, Package, Users, AlertTriangle, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { DashboardSkeleton } from "@/components/loading-skeleton";
import { ErrorState } from "@/components/error-state";
import { useFetch } from "@/hooks/use-fetch";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

const severityVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  "緊急": "destructive",
  "高": "default",
  "中": "secondary",
  "低": "outline",
};

interface DashboardData {
  data: {
    new_insights: number;
    active_brands: number;
    hcp_coverage: number;
    unresolved_alerts: number;
    insight_trend: { month: string; count: number }[];
    insight_type_distribution: { name: string; value: number }[];
    severity_distribution: { name: string; value: number }[];
    recent_insights: Array<{
      id: string;
      title: string;
      brand_name: string;
      severity: string;
      confidence_score: number;
      created_at: string;
    }>;
    recent_alerts: Array<{
      id: string;
      category: string;
      severity: string;
      brand_name: string;
      content: string;
      detected_at: string;
      status: string;
    }>;
    request_status_breakdown: { name: string; value: number }[];
  };
}

export default function DashboardPage() {
  const [period, setPeriod] = useState("30");
  const { data, error, isLoading, mutate } = useFetch<DashboardData>("/api/dashboard");

  if (isLoading) return <DashboardSkeleton />;
  if (error) return <ErrorState message={error} onRetry={mutate} />;
  if (!data) return <DashboardSkeleton />;

  const stats = data.data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">ダッシュボード</h1>
        <p className="text-muted-foreground">プラットフォーム全体の状況を俯瞰します</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">新規インサイト</CardTitle>
            <Lightbulb className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.new_insights}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-500" aria-hidden="true" />
              前月比 +20%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">アクティブブランド</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active_brands}</div>
            <p className="text-xs text-muted-foreground">契約中のブランド数</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">HCPカバレッジ率</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.hcp_coverage}%</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-500" aria-hidden="true" />
              アクセス良好のHCP割合
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">未対応アラート</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.unresolved_alerts}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              {stats.unresolved_alerts > 0 && <TrendingDown className="h-3 w-3 text-red-500" aria-hidden="true" />}
              要対応のアラート件数
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Tabs defaultValue="insights" className="space-y-4">
            <TabsList>
              <TabsTrigger value="insights">最新インサイト</TabsTrigger>
              <TabsTrigger value="alerts">アラート</TabsTrigger>
              <TabsTrigger value="requests">リクエスト状況</TabsTrigger>
            </TabsList>
            <TabsContent value="insights">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">最新インサイト</CardTitle>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/insights">
                      すべて表示 <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[360px]">
                    <div className="space-y-4">
                      {stats.recent_insights.map((insight) => (
                        <Link key={insight.id} href={`/insights/${insight.id}`} className="block">
                          <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent transition-colors">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium leading-tight line-clamp-2">{insight.title}</p>
                              <div className="flex items-center gap-2 mt-1.5">
                                <Badge variant={severityVariant[insight.severity] || "outline"} className="text-xs">
                                  {insight.severity}
                                </Badge>
                                <span className="text-xs text-muted-foreground">{insight.brand_name}</span>
                                <span className="text-xs text-muted-foreground">信頼度 {insight.confidence_score}%</span>
                              </div>
                            </div>
                          </div>
                          <Separator />
                        </Link>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="alerts">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">最新アラート</CardTitle>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/monitoring">
                      すべて表示 <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[360px]">
                    <div className="space-y-4">
                      {stats.recent_alerts.map((alert) => (
                        <div key={alert.id} className="p-3 rounded-lg">
                          <div className="flex items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm leading-tight line-clamp-2">{alert.content}</p>
                              <div className="flex items-center gap-2 mt-1.5">
                                <Badge variant={severityVariant[alert.severity] || "outline"} className="text-xs">{alert.severity}</Badge>
                                <span className="text-xs text-muted-foreground">{alert.brand_name}</span>
                                <Badge variant="outline" className="text-xs">{alert.status}</Badge>
                              </div>
                            </div>
                          </div>
                          <Separator className="mt-3" />
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="requests">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">リクエスト状況</CardTitle>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/requests">
                      すべて表示 <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.request_status_breakdown}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {stats.request_status_breakdown.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">インサイト推移</CardTitle>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-[100px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7日</SelectItem>
                  <SelectItem value="30">30日</SelectItem>
                  <SelectItem value="90">90日</SelectItem>
                  <SelectItem value="all">全期間</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.insight_trend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="hsl(var(--chart-1))"
                      fill="hsl(var(--chart-1))"
                      fillOpacity={0.2}
                      name="検出数"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">インサイト種別分布</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.insight_type_distribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      dataKey="value"
                    >
                      {stats.insight_type_distribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
