"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/hooks/use-user"
import { toast } from "@/hooks/use-toast"
import type { Series, SeriesItem } from "@/types"

const queryKeys = {
  series: (projectId?: string) => ["series", projectId] as const,
  seriesDetail: (id: string) => ["series", id] as const,
  seriesItems: (seriesId: string) => ["series_items", seriesId] as const,
}

export function useSeries(projectId?: string) {
  const { user } = useUser()
  const queryClient = useQueryClient()
  const supabase = createClient()

  const { data: list = [], isLoading: loading } = useQuery({
    queryKey: queryKeys.series(projectId),
    enabled: !!user,
    queryFn: async () => {
      let query = supabase.from("series").select("*").order("created_at", { ascending: false })
      if (projectId) query = query.eq("project_id", projectId)
      const { data } = await query
      return (data ?? []) as Series[]
    },
  })

  const createSeries = useMutation({
    mutationFn: async (input: Partial<Series>) => {
      const { data, error } = await supabase.from("series").insert(input).select().maybeSingle()
      if (error) throw error
      return data as Series
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.series(projectId) })
      toast({ title: "Series created" })
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    },
  })

  const updateSeries = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Series> }) => {
      const { error } = await supabase.from("series").update(updates).eq("id", id)
      if (error) throw error
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.series(projectId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.seriesDetail(id) })
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    },
  })

  const deleteSeries = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("series").delete().eq("id", id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.series(projectId) })
      toast({ title: "Series deleted" })
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    },
  })

  return {
    seriesList: list,
    loading,
    createSeries: (input: Partial<Series>) => createSeries.mutateAsync(input),
    updateSeries: (id: string, updates: Partial<Series>) => updateSeries.mutate({ id, updates }),
    deleteSeries: (id: string) => deleteSeries.mutate(id),
  }
}

export function useSeriesItems(seriesId: string) {
  const { user } = useUser()
  const queryClient = useQueryClient()
  const supabase = createClient()

  const { data: items = [], isLoading: loading } = useQuery({
    queryKey: queryKeys.seriesItems(seriesId),
    enabled: !!user && !!seriesId,
    queryFn: async () => {
      const { data } = await supabase
        .from("series_items")
        .select("*")
        .eq("series_id", seriesId)
        .order("part_number", { ascending: true })
      return (data ?? []) as SeriesItem[]
    },
  })

  const addItem = useMutation({
    mutationFn: async (input: Partial<SeriesItem>) => {
      const { data, error } = await supabase.from("series_items").insert(input).select().maybeSingle()
      if (error) throw error
      return data as SeriesItem
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.seriesItems(seriesId) })
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    },
  })

  const updateItem = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<SeriesItem> }) => {
      const { error } = await supabase.from("series_items").update(updates).eq("id", id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.seriesItems(seriesId) })
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    },
  })

  const removeItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("series_items").delete().eq("id", id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.seriesItems(seriesId) })
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    },
  })

  const addBulkItems = async (parts: { part_number: number; title: string; description: string }[]) => {
    const inserts = parts.map((p) => ({
      series_id: seriesId,
      part_number: p.part_number,
      title: p.title,
      description: p.description,
    }))
    const { error } = await supabase.from("series_items").insert(inserts)
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
      return
    }
    queryClient.invalidateQueries({ queryKey: queryKeys.seriesItems(seriesId) })
    toast({ title: "Episodes created", description: `${parts.length} episodes added.` })
  }

  return {
    items,
    loading,
    addItem: (input: Partial<SeriesItem>) => addItem.mutateAsync(input),
    updateItem: (id: string, updates: Partial<SeriesItem>) => updateItem.mutate({ id, updates }),
    removeItem: (id: string) => removeItem.mutate(id),
    addBulkItems,
  }
}
