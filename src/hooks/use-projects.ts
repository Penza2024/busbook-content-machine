"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/hooks/use-user"
import { toast } from "@/hooks/use-toast"
import type { Project } from "@/types"

const queryKeys = {
  projects: ["projects"] as const,
  project: (id: string) => ["projects", id] as const,
}

export function useProjects() {
  const { user } = useUser()
  const queryClient = useQueryClient()
  const supabase = createClient()

  const { data: projects = [], isLoading: loading } = useQuery({
    queryKey: queryKeys.projects,
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("projects").select("*").order("created_at", { ascending: true })
      return (data ?? []) as Project[]
    },
  })

  const createProject = useMutation({
    mutationFn: async (input: { name: string; description?: string }) => {
      if (!user) throw new Error("Not authenticated")
      const slug = input.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
      const { data, error } = await supabase.from("projects").insert({
        name: input.name,
        description: input.description ?? "",
        slug,
      }).select().maybeSingle()
      if (error) throw error
      return data as Project
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects })
      toast({ title: "Project created", description: `"${data.name}" is ready.` })
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    },
  })

  const updateProject = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Project> }) => {
      const { error } = await supabase.from("projects").update(updates).eq("id", id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects })
      toast({ title: "Project updated" })
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    },
  })

  const deleteProject = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("projects").delete().eq("id", id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects })
      toast({ title: "Project deleted" })
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    },
  })

  const defaultProject = projects.find((p) => p.is_default) ?? projects[0]

  return {
    projects,
    defaultProject,
    loading,
    createProject: (input: { name: string; description?: string }) => createProject.mutateAsync(input),
    updateProject: (id: string, updates: Partial<Project>) => updateProject.mutate({ id, updates }),
    deleteProject: (id: string) => deleteProject.mutate(id),
  }
}

export function useActiveProject() {
  const { user } = useUser()
  const supabase = createClient()

  const key = typeof window !== "undefined" ? localStorage.getItem("activeProjectId") : null

  const { data: project, isLoading: loading } = useQuery({
    queryKey: ["activeProject", key],
    enabled: !!user && !!key,
    queryFn: async () => {
      const { data } = await supabase.from("projects").select("*").eq("id", key!).maybeSingle()
      return (data as Project) ?? null
    },
  })

  return { project, loading }
}
