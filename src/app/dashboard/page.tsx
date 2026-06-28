"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { useDashboard } from "@/hooks/use-dashboard"
import type { ScheduledPost } from "@/types"
import { Lightbulb, Calendar, BarChart3, Target, ArrowRight, Loader2 } from "lucide-react"
import { formatDate } from "@/lib/utils"

const platformDots: Record<string, string> = {
  tiktok: "bg-black",
  youtube: "bg-red-500",
  instagram: "bg-pink-500",
  facebook: "bg-blue-600",
}

export default function DashboardPage() {
  const { stats, loading } = useDashboard()

  const launchTarget = 14
  const launchProgress = Math.min(100, Math.round((stats.totalPublished / launchTarget) * 100))

  if (loading) {
    return (
      <div className="space-y-6">
        <div><Skeleton className="h-10 w-48" /><Skeleton className="h-5 w-72 mt-2" /></div>
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
        <div className="grid gap-4 md:grid-cols-2">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Your BusBook launch content at a glance</p>
      </div>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ideas</CardTitle>
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalIdeas}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalScheduled}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPublished}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLeads}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Launch Campaign -- {launchTarget} Posts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={launchProgress} />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{stats.totalPublished} of {launchTarget} published</span>
            <span className="font-medium">{launchProgress}%</span>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {Array.from({ length: launchTarget }, (_, i) => (
              <div key={i} className={`p-2 rounded ${i < stats.totalPublished ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                Day {i + 1}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Idea Pipeline</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <a href="/ideas">View All <ArrowRight className="ml-1 h-3 w-3" /></a>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.recentIdeas.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No ideas yet.</p>
            ) : (
              stats.recentIdeas.map((idea) => (
                <div key={idea.id} className="flex items-center justify-between py-1">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{idea.title}</p>
                    <p className="text-xs text-muted-foreground capitalize">{idea.pillar?.replace("-", " ")}</p>
                  </div>
                  <Badge variant={idea.status === "published" ? "default" : idea.status === "ready" ? "secondary" : "outline"} className="ml-2 shrink-0">
                    {idea.status}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Upcoming Posts</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <a href="/calendar">Calendar <ArrowRight className="ml-1 h-3 w-3" /></a>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.upcomingPosts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Nothing scheduled yet.</p>
            ) : (
              stats.upcomingPosts.map((post) => {
                const p = post as ScheduledPost & { repurposed_post?: { hook?: string; platform?: string } }
                return (
                  <div key={p.id} className="flex items-center justify-between py-1">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {p.repurposed_post?.hook ?? "Scheduled Post"}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatDate(p.scheduled_date)}</p>
                    </div>
                    <div className={`h-3 w-3 rounded-full ${platformDots[p.repurposed_post?.platform?.toLowerCase() ?? ""] || "bg-gray-400"} shrink-0 ml-2`} />
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>

      {stats.platformBreakdown.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Platform Distribution</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-4 flex-wrap">
              {stats.platformBreakdown.map(({ platform, count }) => (
                <div key={platform} className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${platformDots[platform.toLowerCase()] || "bg-gray-400"}`} />
                  <span className="text-sm capitalize">{platform}</span>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
