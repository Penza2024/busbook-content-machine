"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"
import { useRepurposedPosts } from "@/hooks/use-posts"
import { useSettings } from "@/hooks/use-settings"
import { useIdeas } from "@/hooks/use-ideas"
import { PROVIDER_NAMES } from "@/lib/ai"
import { Repeat2, Sparkles, Copy, Check, Send, Loader2, Info, StopCircle, History, RefreshCw } from "lucide-react"

type GeneratedVariant = {
  platform: string
  hook: string
  caption: string
  cta: string
  hashtags: string[]
  format: string
  thumbnail_idea: string
}

const platforms = ["TikTok", "YouTube Shorts", "Instagram Reels", "Instagram Carousel", "Facebook"]

export default function MultiplierPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [variants, setVariants] = useState<GeneratedVariant[]>([])
  const [loading, setLoading] = useState(false)
  const [stopping, setStopping] = useState(false)
  const [abortController, setAbortController] = useState<AbortController | null>(null)
  const [savingPost, setSavingPost] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState(platforms[0])
  const [regeneratingPlatform, setRegeneratingPlatform] = useState<string | null>(null)
  const [variantHistory, setVariantHistory] = useState<Map<string, GeneratedVariant[]>>(new Map())
  const [showHistory, setShowHistory] = useState<string | null>(null)
  const { settings } = useSettings()
  const { ideas } = useIdeas()
  const { posts, loading: postsLoading, savePost } = useRepurposedPosts()

  const saveVariantToSupabase = useCallback(async (variant: GeneratedVariant) => {
    const idea = ideas.find((i) => i.title.toLowerCase().includes(title.toLowerCase().split(" ")[0]))
    const ideaId = idea?.id

    const saved = await savePost({
      idea_id: ideaId || undefined,
      platform: variant.platform,
      hook: variant.hook,
      caption: variant.caption,
      cta: variant.cta,
      format: variant.format as "reel" | "carousel" | "short" | "static" | "story" | "post",
      hashtags: variant.hashtags,
      thumbnail_idea: variant.thumbnail_idea,
      status: "draft",
    })
    return saved
  }, [ideas, title, savePost])

  const generateOneVariant = async (platform: string, signal?: AbortSignal): Promise<GeneratedVariant | null> => {
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal,
        body: JSON.stringify({
          type: "repurpose",
          input: {
            title,
            description,
            platform,
            brandVoice: settings.brand_voice,
            targetAudience: settings.target_audience,
            pillars: settings.pillars,
            usps: settings.usps || undefined,
            competitorMentions: settings.competitor_mentions || undefined,
            contentExamples: settings.content_examples || undefined,
            launchPhase: settings.launch_phase || undefined,
          },
        }),
      })
      const json = await res.json()
      if (!res.ok) return null
      const data = json.data as Record<string, GeneratedVariant>
      if (Array.isArray(data)) return data[0] ?? null
      return data[platform] ?? data[platform.toLowerCase().replace(/\s+/g, "-")] ?? null
    } catch {
      return null
    }
  }

  async function generateVariants() {
    if (!title.trim()) return
    setLoading(true)
    setStopping(false)
    const controller = new AbortController()
    setAbortController(controller)

    const generatedVariants: GeneratedVariant[] = []
    const seenPlatforms = new Set<string>()

    for (const platform of platforms) {
      if (controller.signal.aborted) break

      const variant = await generateOneVariant(platform, controller.signal)
      if (variant && !seenPlatforms.has(variant.platform)) {
        seenPlatforms.add(variant.platform)
        generatedVariants.push(variant)

        const key = platform.toLowerCase()
        setVariantHistory((prev) => {
          const next = new Map(prev)
          const existing = next.get(key) ?? []
          next.set(key, [...existing, variant])
          return next
        })
      }
    }

    if (!controller.signal.aborted) {
      if (generatedVariants.length > 0) {
        setVariants(generatedVariants)
        setActiveTab(generatedVariants[0].platform)

        for (const v of generatedVariants) {
          try {
            await saveVariantToSupabase(v)
          } catch {
            // individual save failure is non-fatal
          }
        }
        toast({ title: "Variants generated & saved", description: `${generatedVariants.length} platform-native versions created.` })
      } else {
        const hooks: Record<string, string> = {
          "TikTok": "Stop scrolling -- this bus hack saves you 40% 🚌",
          "YouTube Shorts": "I tested 5 bus apps so you don't have to",
          "Instagram Reels": "Bus tracking IRL 📍 watch till the end",
          "Instagram Carousel": "Swipe -> 3 bus booking mistakes costing you 💸",
          "Facebook": "Your bus is late again? Here's the fix.",
        }
        const fallback: GeneratedVariant[] = platforms.map((platform) => ({
          platform,
          hook: hooks[platform] || `Check out this ${title} tip`,
          caption: `Your bus experience is about to change forever. ${description}\n\n👉 ${title.toLowerCase()} -- try it now!\n\n#BusBook #BusTracking #TravelTips`,
          cta: `Download BusBook and book your first trip risk-free ->`,
          hashtags: ["#BusBook", "#BusTracking", "#TravelHacks", "#SmartTravel"],
          format: platform === "Instagram Carousel" ? "carousel" : platform === "YouTube Shorts" ? "short" : "post",
          thumbnail_idea: `${platform === "Instagram Carousel" ? "3-panel carousel showing" : "Eye-catching shot of"} bus dashboard with "40% savings" overlay`,
        }))
        setVariants(fallback)
        setActiveTab(fallback[0].platform)
        toast({ title: "Used fallback templates", description: "AI generation unavailable." })
      }
    }

    setLoading(false)
    setAbortController(null)
    setStopping(false)
  }

  function stopGeneration() {
    if (abortController) {
      abortController.abort()
      setStopping(true)
      toast({ title: "Generation stopped" })
    }
  }

  async function regenerateSingle(platform: string) {
    setRegeneratingPlatform(platform)
    const variant = await generateOneVariant(platform)

    if (variant) {
      setVariants((prev) => prev.map((v) => v.platform === platform ? variant : v))
      const key = platform.toLowerCase()
      setVariantHistory((prev) => {
        const next = new Map(prev)
        const existing = next.get(key) ?? []
        next.set(key, [...existing, variant])
        return next
      })

      try {
        await saveVariantToSupabase(variant)
        toast({ title: "Regenerated", description: `${platform} variant updated.` })
      } catch {
        toast({ title: "Saved locally", description: "Could not save to library." })
      }
    } else {
      toast({ title: "Regeneration failed", description: "Could not generate new variant.", variant: "destructive" })
    }
    setRegeneratingPlatform(null)
  }

  async function saveToSupabase(variant: GeneratedVariant) {
    setSavingPost(variant.platform)
    try {
      await saveVariantToSupabase(variant)
      toast({ title: "Saved to library", description: `${variant.platform} post saved.` })
    } catch {
      toast({ title: "Save failed", description: "Could not save to library.", variant: "destructive" })
    }
    setSavingPost(null)
  }

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const activeVariant = variants.find((v) => v.platform === activeTab) ?? variants[0]
  const historyForPlatform = variantHistory.get(activeTab.toLowerCase()) ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Content Multiplier</h1>
        <p className="text-muted-foreground">One idea → 5+ platform-native posts</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Input Core Idea</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Idea title (e.g. Real-time bus tracking)" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Textarea placeholder="Describe the idea, key screenshots, and value proposition..." value={description} onChange={(e) => setDescription(e.target.value)} />
          <div className="flex gap-2 items-center flex-wrap">
            {loading ? (
              <Button variant="destructive" onClick={stopGeneration} disabled={stopping}>
                <StopCircle className="h-4 w-4 mr-1" />
                Stop
              </Button>
            ) : (
              <Button onClick={generateVariants} disabled={loading || !title.trim()}>
                {loading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Sparkles className="h-4 w-4 mr-1" />}
                {loading ? "Generating..." : "Multiply → 5 Platforms"}
              </Button>
            )}
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Info className="h-3 w-3" />
              NVIDIA Llama 3.1 70B
            </span>
          </div>
        </CardContent>
      </Card>

      {variants.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-1">
            {variants.map((v, i) => (
              <button
                key={v.platform || `p-${i}`}
                onClick={() => setActiveTab(v.platform)}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-md transition-colors",
                  activeTab === v.platform
                    ? "bg-primary text-primary-foreground shadow"
                    : "bg-muted text-muted-foreground hover:bg-accent"
                )}
              >
                {v.platform}
              </button>
            ))}
          </div>

          {activeVariant && (
            <div key={`variant-${activeVariant.platform}`}>
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">{activeVariant.platform} Variant</h2>
                    <div className="flex gap-2">
                      {historyForPlatform.length > 1 && (
                        <Button variant="ghost" size="sm" onClick={() => setShowHistory(showHistory === activeVariant.platform ? null : activeVariant.platform)}>
                          <History className="h-4 w-4 mr-1" />
                          History ({historyForPlatform.length})
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => regenerateSingle(activeVariant.platform)} disabled={regeneratingPlatform === activeVariant.platform}>
                        {regeneratingPlatform === activeVariant.platform ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4 mr-1" />
                        )}
                        Regenerate
                      </Button>
                    </div>
                  </div>

                  {showHistory === activeVariant.platform && historyForPlatform.length > 1 && (
                    <div className="bg-muted rounded-md p-3 space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">Previous versions</p>
                      {historyForPlatform.slice(0, -1).reverse().map((hv, hi) => (
                        <div key={hi} className="text-sm border-b border-border pb-2 last:border-0">
                          <p className="font-medium">{hv.hook}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{hv.caption}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <Separator />

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">Hook</h3>
                      <Button variant="ghost" size="icon" onClick={() => copyToClipboard(activeVariant.hook, `hook-${activeVariant.platform}`)}>
                        {copiedId === `hook-${activeVariant.platform}` ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-lg font-medium bg-muted p-3 rounded-md">{activeVariant.hook}</p>
                  </div>

                  <Separator />

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">Caption</h3>
                      <Button variant="ghost" size="icon" onClick={() => copyToClipboard(activeVariant.caption, `cap-${activeVariant.platform}`)}>
                        {copiedId === `cap-${activeVariant.platform}` ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-sm whitespace-pre-wrap bg-muted p-3 rounded-md">{activeVariant.caption}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold text-sm mb-1">CTA</h3>
                      <p className="text-sm bg-muted p-2 rounded-md">{activeVariant.cta}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm mb-1">Format</h3>
                      <Badge variant="secondary" className="capitalize">{activeVariant.format}</Badge>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-sm mb-1">Hashtags</h3>
                    <div className="flex flex-wrap gap-1">
                      {activeVariant.hashtags.map((h, j) => <Badge key={`${h}-${j}`} variant="outline">{h}</Badge>)}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-sm mb-1">Thumbnail Idea</h3>
                    <p className="text-sm text-muted-foreground">{activeVariant.thumbnail_idea}</p>
                  </div>

                  <Button variant="outline" className="w-full" onClick={() => saveToSupabase(activeVariant)} disabled={savingPost === activeVariant.platform}>
                    {savingPost === activeVariant.platform ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Send className="h-4 w-4 mr-1" />}
                    Save to Content Library
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {postsLoading ? (
            <Card><CardHeader><Skeleton className="h-6 w-32" /></CardHeader><CardContent className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</CardContent></Card>
          ) : posts.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Saved Posts ({posts.length})</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {posts.slice(0, 5).map((post, i) => (
                  <div key={post.id || `sp-${i}`} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{post.hook}</p>
                      <p className="text-xs text-muted-foreground">{post.platform} · {post.format}</p>
                    </div>
                    <Badge variant="outline" className="ml-2 shrink-0">{post.status}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
