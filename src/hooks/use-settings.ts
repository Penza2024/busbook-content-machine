"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/hooks/use-user"
import { toast } from "@/hooks/use-toast"
import type { BrandSettings, PlatformConfig } from "@/types"

const DEFAULT_SETTINGS: BrandSettings = {
  id: "",
  user_id: "",
  name: "BusBook",
  website_url: "https://busbook.app",
  brand_voice: "Professional yet friendly — helpful, confident, and occasionally playful.",
  brand_tone: "Helpful and confident. Clear instructions with a touch of warmth.",
  target_audience: "Daily commuters and long-distance travelers (18-45) who want stress-free bus booking.",
  color_palette: ["#2563EB", "#1E40AF", "#F59E0B"],
  logo_url: null,
  pillars: ["problem-awareness", "solution-demo", "social-proof", "urgency", "educational", "behind-the-scenes"],
  usps: "Real-time bus tracking, instant booking, seat selection, multi-route comparison, lowest price guarantee.",
  competitor_mentions: "",
  content_examples: "",
  launch_phase: "pre-launch" as const,
  platforms: [
    { id: "tiktok", name: "TikTok", active: true, best_practices: { posting_frequency: "3-5/week", caption_length: 150, format: "vertical-video" } },
    { id: "youtube", name: "YouTube", active: true, best_practices: { posting_frequency: "1-2/week", caption_length: 300, format: "long-video+shorts" } },
    { id: "instagram", name: "Instagram", active: true, best_practices: { posting_frequency: "3-5/week", caption_length: 150, format: "reels+carousels" } },
    { id: "facebook", name: "Facebook", active: true, best_practices: { posting_frequency: "2-3/week", caption_length: 250, format: "posts+groups" } },
  ],
  created_at: "",
  updated_at: "",
}

const queryKeys = {
  settings: ["settings"] as const,
}

export function useSettings() {
  const { user } = useUser()
  const queryClient = useQueryClient()
  const supabase = createClient()

  const { data: settings = DEFAULT_SETTINGS, isLoading: loading } = useQuery({
    queryKey: queryKeys.settings,
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("brands").select("*").maybeSingle()
      return (data as BrandSettings) ?? DEFAULT_SETTINGS
    },
  })

  const saveSettingsMutation = useMutation({
    mutationFn: async (updated: Partial<BrandSettings>) => {
      const payload = { ...updated, updated_at: new Date().toISOString() }

      if (settings.id) {
        const { error } = await supabase.from("brands").update(payload).eq("id", settings.id)
        if (error) throw error
      } else {
        const { data, error } = await supabase.from("brands").insert(payload).select().maybeSingle()
        if (error) throw error
        if (data) payload.id = data.id
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings })
      toast({ title: "Settings saved", description: "Brand configuration updated." })
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    },
  })

  const uploadLogo = async (file: File): Promise<string | null> => {
    if (!user) return null
    const ext = file.name.split(".").pop()
    const path = `${user.id}/logo.${ext}`

    const { error: uploadError } = await supabase.storage.from("screenshots").upload(path, file, { upsert: true })
    if (uploadError) throw uploadError

    const { data: urlData } = supabase.storage.from("screenshots").getPublicUrl(path)
    const logoUrl = urlData.publicUrl
    await saveSettingsMutation.mutateAsync({ logo_url: logoUrl })
    return logoUrl
  }

  return { settings, saveSettings: (updated: Partial<BrandSettings>) => saveSettingsMutation.mutateAsync(updated), uploadLogo, loading }
}
