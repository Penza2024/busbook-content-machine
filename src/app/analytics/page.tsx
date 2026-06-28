"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { usePerformanceLogs, useScheduledPosts } from "@/hooks/use-posts"
import { BarChart3, TrendingUp, MousePointerClick, Users, Plus, Loader2, Trash2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate } from "@/lib/utils"

export default function AnalyticsPage() {
  const { logs, loading, addLog, deleteLog } = usePerformanceLogs()
  const { scheduled } = useScheduledPosts()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ scheduled_post_id: "", reach: 0, engagement: 0, clicks: 0, leads: 0, notes: "" })

  const totals = logs.reduce(
    (acc, l) => ({
      reach: acc.reach + (l.reach ?? 0),
      engagement: acc.engagement + (l.engagement ?? 0),
      clicks: acc.clicks + (l.clicks ?? 0),
      leads: acc.leads + (l.leads ?? 0),
    }),
    { reach: 0, engagement: 0, clicks: 0, leads: 0 }
  )

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
                      {s.repurposed_post?.hook?.slice(0, 40) ?? "Untitled"}...
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

      <Card>
        <CardHeader><CardTitle>Post Performance</CardTitle></CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No data yet. Log your first result above.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium">Post</th>
                    <th className="text-right py-2 font-medium">Reach</th>
                    <th className="text-right py-2 font-medium">Engagement</th>
                    <th className="text-right py-2 font-medium">Clicks</th>
                    <th className="text-right py-2 font-medium">Leads</th>
                    <th className="text-right py-2 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((l) => (
                    <tr key={l.id} className="border-b last:border-0">
                      <td className="py-2">
                        <p className="truncate max-w-[200px]">{(l as unknown as Record<string, unknown>)?.scheduled_post ? ((l as unknown as Record<string, unknown>).scheduled_post as Record<string, unknown>).hook as string ?? "Unknown" : "Unknown"}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(l.logged_at)}</p>
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
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {logs.length >= 2 && (
        <Card>
          <CardHeader><CardTitle>Insights</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">→</span>
                Average engagement rate: {totals.reach > 0 ? ((totals.engagement / totals.reach) * 100).toFixed(1) : 0}%
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">→</span>
                Click-through rate: {totals.reach > 0 ? ((totals.clicks / totals.reach) * 100).toFixed(1) : 0}%
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">→</span>
                Lead conversion: {totals.clicks > 0 ? ((totals.leads / totals.clicks) * 100).toFixed(1) : 0}% of clicks
              </li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
