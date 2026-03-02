"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export default function SettingsPage() {
  const [name, setName] = useState("田中 太郎");
  const [email, setEmail] = useState("tanaka@pharma-corp.co.jp");
  const [role, setRole] = useState("シニアアナリスト");
  const [alertEmail, setAlertEmail] = useState(true);
  const [alertPush, setAlertPush] = useState(true);
  const [insightEmail, setInsightEmail] = useState(true);
  const [insightPush, setInsightPush] = useState(false);
  const [systemEmail, setSystemEmail] = useState(false);
  const [systemPush, setSystemPush] = useState(true);
  const [language, setLanguage] = useState("ja-JP");
  const [timezone, setTimezone] = useState("Asia/Tokyo");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("medisearch-settings");
      if (saved) {
        const s = JSON.parse(saved);
        if (s.name !== undefined) setName(s.name);
        if (s.email !== undefined) setEmail(s.email);
        if (s.role !== undefined) setRole(s.role);
        if (s.alertEmail !== undefined) setAlertEmail(s.alertEmail);
        if (s.alertPush !== undefined) setAlertPush(s.alertPush);
        if (s.insightEmail !== undefined) setInsightEmail(s.insightEmail);
        if (s.insightPush !== undefined) setInsightPush(s.insightPush);
        if (s.systemEmail !== undefined) setSystemEmail(s.systemEmail);
        if (s.systemPush !== undefined) setSystemPush(s.systemPush);
        if (s.language !== undefined) setLanguage(s.language);
        if (s.timezone !== undefined) setTimezone(s.timezone);
      }
    } catch { /* ignore parse errors */ }
  }, []);

  const persistSettings = (patch: Record<string, unknown>) => {
    try {
      const saved = localStorage.getItem("medisearch-settings");
      const current = saved ? JSON.parse(saved) : {};
      localStorage.setItem("medisearch-settings", JSON.stringify({ ...current, ...patch }));
    } catch { /* ignore */ }
  };

  const handleSaveProfile = () => {
    persistSettings({ name, email, role });
    toast.success("プロフィールを保存しました");
  };

  const handleSaveNotifications = () => {
    persistSettings({ alertEmail, alertPush, insightEmail, insightPush, systemEmail, systemPush });
    toast.success("通知設定を保存しました");
  };

  const handleSaveGeneral = () => {
    persistSettings({ language, timezone });
    toast.success("一般設定を保存しました");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">設定</h1>
        <p className="text-muted-foreground">アカウント情報や通知設定を管理します</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">プロフィール</TabsTrigger>
          <TabsTrigger value="notifications">通知設定</TabsTrigger>
          <TabsTrigger value="general">一般設定</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader><CardTitle className="text-base">プロフィール情報</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">氏名</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">メールアドレス</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">役職</Label>
                <Input id="role" value={role} onChange={(e) => setRole(e.target.value)} />
              </div>
              <Separator />
              <Button onClick={handleSaveProfile}>保存</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader><CardTitle className="text-base">通知設定</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">アラート通知</h3>
                <div className="flex items-center justify-between">
                  <Label htmlFor="alert-email" className="font-normal">メール通知</Label>
                  <Switch id="alert-email" checked={alertEmail} onCheckedChange={setAlertEmail} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="alert-push" className="font-normal">プッシュ通知</Label>
                  <Switch id="alert-push" checked={alertPush} onCheckedChange={setAlertPush} />
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-sm font-medium">インサイト通知</h3>
                <div className="flex items-center justify-between">
                  <Label htmlFor="insight-email" className="font-normal">メール通知</Label>
                  <Switch id="insight-email" checked={insightEmail} onCheckedChange={setInsightEmail} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="insight-push" className="font-normal">プッシュ通知</Label>
                  <Switch id="insight-push" checked={insightPush} onCheckedChange={setInsightPush} />
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-sm font-medium">システム通知</h3>
                <div className="flex items-center justify-between">
                  <Label htmlFor="system-email" className="font-normal">メール通知</Label>
                  <Switch id="system-email" checked={systemEmail} onCheckedChange={setSystemEmail} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="system-push" className="font-normal">プッシュ通知</Label>
                  <Switch id="system-push" checked={systemPush} onCheckedChange={setSystemPush} />
                </div>
              </div>
              <Separator />
              <Button onClick={handleSaveNotifications}>保存</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general">
          <Card>
            <CardHeader><CardTitle className="text-base">一般設定</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>表示言語</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ja-JP">日本語</SelectItem>
                      <SelectItem value="en-US">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>タイムゾーン</Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Tokyo">日本標準時（JST）</SelectItem>
                      <SelectItem value="UTC">協定世界時（UTC）</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Separator />
              <Button onClick={handleSaveGeneral}>保存</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
