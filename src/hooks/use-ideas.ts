"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/hooks/use-user"
import { toast } from "@/hooks/use-toast"
import type { ContentIdea } from "@/types"

export type IdeaFormData = {
  title: string
  description: string
  pillar: string
  tags: string[]
  status: string
}

const queryKeys = {
  ideas: ["ideas"] as const,
}

export function useIdeas() {
  const { user } = useUser()
  const queryClient = useQueryClient()
  const supabase = createClient()

  const { data: ideas = [], isLoading: loading } = useQuery({
    queryKey: queryKeys.ideas,
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("content_ideas")
        .select("*")
        .order("created_at", { ascending: false })
      return (data ?? []) as ContentIdea[]
    },
  })

  const addIdeaMutation = useMutation({
    mutationFn: async (formData: IdeaFormData) => {
      if (!user) return null
      const { data, error } = await supabase
        .from("content_ideas")
        .insert({
          title: formData.title,
          description: formData.description,
          pillar: formData.pillar,
          tags: formData.tags,
          status: formData.status || "draft",
          core_screenshots: [],
        })
        .select()
        .maybeSingle()
      if (error) throw error
      return data as ContentIdea
    },
    onSuccess: (data, formData) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ideas })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
      toast({ title: "Idea created", description: `"${formData.title}" added to your vault.` })
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    },
  })

  const updateIdeaMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ContentIdea> }) => {
      const { error } = await supabase.from("content_ideas").update(updates).eq("id", id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ideas })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    },
  })

  const deleteIdeaMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("content_ideas").delete().eq("id", id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ideas })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
      toast({ title: "Idea deleted" })
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    },
  })

  const addIdea = (formData: IdeaFormData) => addIdeaMutation.mutateAsync(formData)
  const updateIdea = (id: string, updates: Partial<ContentIdea>) => updateIdeaMutation.mutate({ id, updates })
  const deleteIdea = (id: string) => deleteIdeaMutation.mutate(id)

  const uploadScreenshot = async (ideaId: string, file: File): Promise<string | null> => {
    if (!user) return null
    const ext = file.name.split(".").pop()
    const path = `${user.id}/ideas/${ideaId}/${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage.from("screenshots").upload(path, file)
    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" })
      return null
    }

    const { data: urlData } = supabase.storage.from("screenshots").getPublicUrl(path)
    const url = urlData.publicUrl

    const idea = ideas.find((i) => i.id === ideaId)
    const screenshots = [...(idea?.core_screenshots ?? []), url]
    await updateIdeaMutation.mutateAsync({ id: ideaId, updates: { core_screenshots: screenshots } as Partial<ContentIdea> })

    return url
  }

  const removeScreenshot = async (ideaId: string, url: string) => {
    const idea = ideas.find((i) => i.id === ideaId)
    if (!idea) return
    const screenshots = (idea.core_screenshots ?? []).filter((s) => s !== url)
    await updateIdeaMutation.mutateAsync({ id: ideaId, updates: { core_screenshots: screenshots } as Partial<ContentIdea> })
  }

  return { ideas, loading, addIdea, updateIdea, deleteIdea, uploadScreenshot, removeScreenshot }
}
