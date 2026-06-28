"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/hooks/use-user"
import { toast } from "@/hooks/use-toast"
import type { RepurposedPost, ScheduledPost, PerformanceLog } from "@/types"

const queryKeys = {
  repurposedPosts: (ideaId?: string) => ["repurposed_posts", ideaId] as const,
  scheduledPosts: ["scheduled_posts"] as const,
  performanceLogs: ["performance_logs"] as const,
}

// ─── Repurposed Posts ───────────────────────────────

export function useRepurposedPosts(ideaId?: string) {
  const { user } = useUser()
  const queryClient = useQueryClient()
  const supabase = createClient()

  const { data: posts = [], isLoading: loading } = useQuery({
    queryKey: queryKeys.repurposedPosts(ideaId),
    enabled: !!user,
    queryFn: async () => {
      let query = supabase.from("repurposed_posts").select("*").order("created_at", { ascending: false })
      if (ideaId) query = query.eq("idea_id", ideaId)
      const { data } = await query
      return (data ?? []) as RepurposedPost[]
    },
  })

  const savePostMutation = useMutation({
    mutationFn: async (post: Partial<RepurposedPost>) => {
      if (post.id) {
        const { error } = await supabase.from("repurposed_posts").update(post).eq("id", post.id)
        if (error) throw error
        return post as RepurposedPost
      }
      const { data, error } = await supabase.from("repurposed_posts").insert(post).select().maybeSingle()
      if (error) throw error
      return data as RepurposedPost
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.repurposedPosts(ideaId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.scheduledPosts })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    },
  })

  const deletePostMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("repurposed_posts").delete().eq("id", id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.repurposedPosts(ideaId) })
      toast({ title: "Post deleted" })
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    },
  })

  const savePost = (post: Partial<RepurposedPost>) => savePostMutation.mutateAsync(post)
  const deletePost = (id: string) => deletePostMutation.mutate(id)

  return { posts, loading, savePost, deletePost }
}

// ─── Scheduled Posts ────────────────────────────────

export function useScheduledPosts() {
  const { user } = useUser()
  const queryClient = useQueryClient()
  const supabase = createClient()

  const { data: scheduled = [], isLoading: loading } = useQuery({
    queryKey: queryKeys.scheduledPosts,
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("scheduled_posts")
        .select("*, repurposed_post:repurposed_posts(*)")
        .order("scheduled_date", { ascending: true })
      return (data ?? []) as (ScheduledPost & { repurposed_post?: RepurposedPost })[]
    },
  })

  const schedulePostMutation = useMutation({
    mutationFn: async ({ repurposedPostId, date, notes }: { repurposedPostId: string; date: string; notes?: string }) => {
      const { data, error } = await supabase
        .from("scheduled_posts")
        .insert({ repurposed_post_id: repurposedPostId, scheduled_date: date, notes: notes ?? "" })
        .select()
        .maybeSingle()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.scheduledPosts })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
      toast({ title: "Scheduled", description: "Post added to calendar." })
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    },
  })

  const updateScheduleMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ScheduledPost> }) => {
      const { error } = await supabase.from("scheduled_posts").update(updates).eq("id", id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.scheduledPosts })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    },
  })

  const deleteScheduleMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("scheduled_posts").delete().eq("id", id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.scheduledPosts })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
      toast({ title: "Removed from schedule" })
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    },
  })

  const schedulePost = (repurposedPostId: string, date: string, notes?: string) =>
    schedulePostMutation.mutateAsync({ repurposedPostId, date, notes })
  const updateSchedule = (id: string, updates: Partial<ScheduledPost>) =>
    updateScheduleMutation.mutate({ id, updates })
  const deleteSchedule = (id: string) => deleteScheduleMutation.mutate(id)

  return { scheduled, loading, schedulePost, updateSchedule, deleteSchedule }
}

// ─── Performance Logs ───────────────────────────────

export function usePerformanceLogs() {
  const { user } = useUser()
  const queryClient = useQueryClient()
  const supabase = createClient()

  const { data: logs = [], isLoading: loading } = useQuery({
    queryKey: queryKeys.performanceLogs,
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("performance_logs")
        .select("*, scheduled_post:scheduled_posts(*)")
        .order("logged_at", { ascending: false })
      return (data ?? []) as (PerformanceLog & { scheduled_post?: ScheduledPost })[]
    },
  })

  const addLogMutation = useMutation({
    mutationFn: async (entry: Partial<PerformanceLog>) => {
      const { data, error } = await supabase.from("performance_logs").insert(entry).select().maybeSingle()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.performanceLogs })
      toast({ title: "Logged", description: "Performance data saved." })
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    },
  })

  const deleteLogMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("performance_logs").delete().eq("id", id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.performanceLogs })
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    },
  })

  const addLog = (entry: Partial<PerformanceLog>) => addLogMutation.mutateAsync(entry)
  const deleteLog = (id: string) => deleteLogMutation.mutate(id)

  return { logs, loading, addLog, deleteLog }
}
