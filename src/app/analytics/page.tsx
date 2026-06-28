"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { usePerformanceLogs, useScheduledPosts } from "@/hooks/use-posts"
import { BarChart3, TrendingUp, MousePointerClick, Users, Plus, Trash2, Globe, Calendar } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate } from "@/lib/utils"
import type { PerformanceLogWithPost } from "@/types"

type DateRange = "7d" | "30d" | "90d" | "all"

const DATE_LABELS: Record<DateRange, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
  "all": "All time",
}

export default function AnalyticsPage() {
  const { logs, loading, addLog, deleteLog } = usePerformanceLogs()
  const { scheduled } = useScheduledPosts()
  const [open, setOpen] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange>("all")
  const [form, setForm] = useState({ scheduled_post_id: "", reach: 0, engagement: 0, clicks: 0, leads: 0, notes: "" })

  const filteredLogs = useMemo(() => {
    if (dateRange === "all") return logs
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - parseInt(dateRange))
    return logs.filter((l) => new Date(l.logged_at) >= cutoff)
  }, [logs, dateRange])

  const totals = filteredLogs.reduce(
    (acc, l) => ({
      reach: acc.reach + (l.reach ?? 0),
      engagement: acc.engagement + (l.engagement ?? 0),
      clicks: acc.clicks + (l.clicks ?? 0),
      leads: acc.leads + (l.leads ?? 0),
    }),
    { reach: 0, engagement: 0, clicks: 0, leads: 0 }
  )

  const platformMetrics = useMemo(() => {
    const map = new Map<string, { reach: number; engagement: number; clicks: number; leads: number; count: number }>()
    for (const l of filteredLogs) {
      const log = l as PerformanceLogWithPost
      const platform = log.scheduled_post?.repurposed_post?.platform ?? "Unknown"
      const prev = map.get(platform) ?? { reach: 0, engagement: 0, clicks: 0, leads: 0, count: 0 }
      prev.reach += l.reach ?? 0
      prev.engagement += l.engagement ?? 0
      prev.clicks += l.clicks ?? 0
      prev.leads += l.leads ?? 0
      prev.count++
      map.set(platform, prev)
    }
    return Array.from(map.entries()).map(([platform, m]) => ({ platform, ...m }))
  }, [filteredLogs])

  async function handleAddLog() {
    if (!form.scheduled_post_id) return
    await addLog(form)
    setForm({ scheduled_post_id: "", reach: 0, engagement: 0, clicks: 0, leads: 0, notes: "" })
    setOpen(false)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between"><div><Skeleton className="h-10 w-40" /><Skeleton className="h-5 w-56 mt-2" /></div></div>
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Track performance and iterate</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-1" /> Log Results</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Log Performance</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <Select value={form.scheduled_post_id} onValueChange={(v) => setForm({ ...form, scheduled_post_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select a post" /></SelectTrigger>
                  <SelectContent>
                    {scheduled.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        <span className="flex items-center gap-2">
                          <span className="capitalize text-xs text-muted-foreground">{s.repurposed_post?.platform}</span>
                          {s.repurposed_post?.hook?.slice(0, 36) ?? "Untitled"}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Reach</label>
                    <Input type="number" value={form.reach || ""} onChange={(e) => setForm({ ...form, reach: parseInt(e.target.value) || 0 })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Engagement</label>
                    <Input type="number" value={form.engagement || ""} onChange={(e) => setForm({ ...form, engagement: parseInt(e.target.value) || 0 })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Clicks</label>
                    <Input type="number" value={form.clicks || ""} onChange={(e) => setForm({ ...form, clicks: parseInt(e.target.value) || 0 })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Leads</label>
                    <Input type="number" value={form.leads || ""} onChange={(e) => setForm({ ...form, leads: parseInt(e.target.value) || 0 })} />
                  </div>
                </div>
                <Input placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                <Button onClick={handleAddLog} className="w-full" disabled={!form.scheduled_post_id}>Save</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <p className="text-xs text-muted-foreground -mt-4">
        Showing data for <span className="font-medium">{DATE_LABELS[dateRange].toLowerCase()}</span>
        {filteredLogs.length !== logs.length && (
          <span> ({filteredLogs.length} of {logs.length} entries)</span>
        )}
      </p>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{totals.reach.toLocaleString()}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Engagement</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{totals.engagement.toLocaleString()}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Clicks</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{totals.clicks.toLocaleString()}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Leads</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{totals.leads.toLocaleString()}</div></CardContent>
        </Card>
      </div>

      {platformMetrics.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                Performance by Source
              </CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">
              Breakdown of metrics by platform across {DATE_LABELS[dateRange].toLowerCase()}
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium">Platform</th>
                    <th className="text-right py-2 font-medium">Posts</th>
                    <th className="text-right py-2 font-medium">Reach</th>
                    <th className="text-right py-2 font-medium">Engagement</th>
                    <th className="text-right py-2 font-medium">Clicks</th>
                    <th className="text-right py-2 font-medium">Leads</th>
                    <th className="text-right py-2 font-medium">Eng. Rate</th>
                    <th className="text-right py-2 font-medium">CTR</th>
                  </tr>
                </thead>
                <tbody>
                  {platformMetrics.map((p) => (
                    <tr key={p.platform} className="border-b last:border-0">
                      <td className="py-2 font-medium capitalize">{p.platform}</td>
                      <td className="py-2 text-right text-muted-foreground">{p.count}</td>
                      <td className="py-2 text-right">{p.reach.toLocaleString()}</td>
                      <td className="py-2 text-right">{p.engagement.toLocaleString()}</td>
                      <td className="py-2 text-right">{p.clicks.toLocaleString()}</td>
                      <td className="py-2 text-right">{p.leads}</td>
                      <td className="py-2 text-right">{p.reach > 0 ? ((p.engagement / p.reach) * 100).toFixed(1) : "—"}%</td>
                      <td className="py-2 text-right">{p.reach > 0 ? ((p.clicks / p.reach) * 100).toFixed(1) : "—"}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Post Performance</CardTitle>
          <p className="text-sm text-muted-foreground">
            Individual post metrics logged in this period
          </p>
        </CardHeader>
        <CardContent>
          {filteredLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No data for this period. Log your first result above.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium">Post</th>
                    <th className="text-left py-2 font-medium">Source</th>
                    <th className="text-right py-2 font-medium">Reach</th>
                    <th className="text-right py-2 font-medium">Engagement</th>
                    <th className="text-right py-2 font-medium">Clicks</th>
                    <th className="text-right py-2 font-medium">Leads</th>
                    <th className="text-right py-2 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((l) => {
                    const log = l as PerformanceLogWithPost
                    const hook = log.scheduled_post?.repurposed_post?.hook ?? "Unknown"
                    const platform = log.scheduled_post?.repurposed_post?.platform ?? "—"
                    return (
                      <tr key={l.id} className="border-b last:border-0">
                        <td className="py-2">
                          <p className="truncate max-w-[180px] font-medium">{hook.slice(0, 50)}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(l.logged_at)}</p>
                        </td>
                        <td className="py-2">
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium capitalize text-primary">
                            {platform}
                          </span>
                        </td>
                        <td className="py-2 text-right">{l.reach?.toLocaleString()}</td>
                        <td className="py-2 text-right">{l.engagement?.toLocaleString()}</td>
                        <td className="py-2 text-right">{l.clicks?.toLocaleString()}</td>
                        <td className="py-2 text-right">{l.leads}</td>
                        <td className="py-2 text-right">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteLog(l.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {filteredLogs.length >= 2 && (
        <Card>
          <CardHeader><CardTitle>Insights</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Based on {filteredLogs.length} entries across {platformMetrics.length} platforms ({DATE_LABELS[dateRange].toLowerCase()})
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">→</span>
                Average engagement rate: {totals.reach > 0 ? ((totals.engagement / totals.reach) * 100).toFixed(1) : 0}%
                {platformMetrics.length > 0 && (
                  <span className="text-muted-foreground">
                    {" "}(best: <span className="font-medium capitalize">{platformMetrics.reduce((a, b) => (a.reach > 0 ? (a.engagement / a.reach) : 0) > (b.reach > 0 ? (b.engagement / b.reach) : 0) ? a : b).platform}</span>)
                  </span>
                )}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">→</span>
                Click-through rate: {totals.reach > 0 ? ((totals.clicks / totals.reach) * 100).toFixed(1) : 0}%
                {platformMetrics.length > 0 && (
                  <span className="text-muted-foreground">
                    {" "}(best: <span className="font-medium capitalize">{platformMetrics.reduce((a, b) => (a.reach > 0 ? (a.clicks / a.reach) : 0) > (b.reach > 0 ? (b.clicks / b.reach) : 0) ? a : b).platform}</span>)
                  </span>
                )}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">→</span>
                Lead conversion: {totals.clicks > 0 ? ((totals.leads / totals.clicks) * 100).toFixed(1) : 0}% of clicks
                {platformMetrics.length > 0 && (
                  <span className="text-muted-foreground">
                    {" "}(best: <span className="font-medium capitalize">{platformMetrics.reduce((a, b) => (a.clicks > 0 ? (a.leads / a.clicks) : 0) > (b.clicks > 0 ? (b.leads / b.clicks) : 0) ? a : b).platform}</span>)
                  </span>
                )}
              </li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
