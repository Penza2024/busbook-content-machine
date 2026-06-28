"use client"

import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/hooks/use-user"
import type { DashboardStats } from "@/types"

const EMPTY_STATS: DashboardStats = {
  totalIdeas: 0,
  totalScheduled: 0,
  totalPublished: 0,
  totalLeads: 0,
  upcomingPosts: [],
  recentIdeas: [],
  platformBreakdown: [],
}

export function useDashboard() {
  const { user } = useUser()
  const supabase = createClient()

  const { data: stats = EMPTY_STATS, isLoading: loading } = useQuery({
    queryKey: ["dashboard"],
    enabled: !!user,
    queryFn: async () => {
      const [ideasRes, scheduledRes, logsRes, postsRes] = await Promise.all([
        supabase.from("content_ideas").select("id, status, pillar, title, created_at", { count: "exact" }),
        supabase.from("scheduled_posts").select("*, repurposed_post:repurposed_posts(*)").order("scheduled_date", { ascending: true }),
        supabase.from("performance_logs").select("leads"),
        supabase.from("repurposed_posts").select("platform"),
      ])

      const ideas = ideasRes.data ?? []
      const scheduled = scheduledRes.data ?? []
      const logs = logsRes.data ?? []
      const posts = postsRes.data ?? []

      const totalLeads = logs.reduce((sum, l) => sum + (l.leads ?? 0), 0)
      const published = ideas.filter((i) => i.status === "published").length

      const platformMap = new Map<string, number>()
      for (const p of posts) {
        platformMap.set(p.platform, (platformMap.get(p.platform) ?? 0) + 1)
      }

      return {
        totalIdeas: ideas.length,
        totalScheduled: scheduled.length,
        totalPublished: published,
        totalLeads,
        upcomingPosts: scheduled.slice(0, 5) as DashboardStats["upcomingPosts"],
        recentIdeas: ideas.slice(0, 5) as DashboardStats["recentIdeas"],
        platformBreakdown: Array.from(platformMap.entries()).map(([platform, count]) => ({ platform, count })),
      }
    },
  })

  return { stats, loading }
}
