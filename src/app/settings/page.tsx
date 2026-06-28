"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { useSettings } from "@/hooks/use-settings"
import { Save, Plus, X, Loader2, Palette, Volume2, Target, Lightbulb, Star, Users } from "lucide-react"
import type { BrandSettings } from "@/types"

export default function SettingsPage() {
  const { settings: dbSettings, saveSettings, uploadLogo, loading } = useSettings()
  const [local, setLocal] = useState<BrandSettings>(dbSettings)
  const [saving, setSaving] = useState(false)
  const [logoUploading, setLogoUploading] = useState(false)
  const [pillarInput, setPillarInput] = useState("")
  const [platformInput, setPlatformInput] = useState("")

  useEffect(() => {
    setLocal(dbSettings)
  }, [dbSettings])

  function patch(update: Partial<BrandSettings>) {
    setLocal((prev) => ({ ...prev, ...update }))
  }

  async function handleSave() {
    setSaving(true)
    try {
      await saveSettings(local)
    } catch (err) {
      console.error(err)
    }
    setSaving(false)
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoUploading(true)
    try {
      await uploadLogo(file)
    } catch (err) {
      console.error(err)
    }
    setLogoUploading(false)
  }

  function addPillar() {
    const trimmed = pillarInput.trim()
    if (trimmed && !local.pillars.includes(trimmed)) {
      patch({ pillars: [...local.pillars, trimmed] })
      setPillarInput("")
    }
  }

  function removePillar(p: string) {
    patch({ pillars: local.pillars.filter((x) => x !== p) })
  }

  function addPlatform() {
    const name = platformInput.trim()
    if (name && !local.platforms.some((p) => p.name === name)) {
      patch({
        platforms: [
          ...local.platforms,
          { id: name.toLowerCase().replace(/\s+/g, "-"), name, active: true, best_practices: { posting_frequency: "1-2/week", caption_length: 200, format: "post" } },
        ],
      })
      setPlatformInput("")
    }
  }

  function removePlatform(name: string) {
    patch({ platforms: local.platforms.filter((p) => p.name !== name) })
  }

  function togglePlatform(id: string) {
    patch({ platforms: local.platforms.map((p) => (p.id === id ? { ...p, active: !p.active } : p)) })
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-2xl">
        <div><Skeleton className="h-10 w-48" /><Skeleton className="h-5 w-72 mt-2" /></div>
        <Card><CardContent className="space-y-4 pt-6">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</CardContent></Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Configure your brand for any project or niche</p>
      </div>

      <Tabs defaultValue="brand">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="brand"><Palette className="h-4 w-4 mr-1" />Brand</TabsTrigger>
          <TabsTrigger value="context"><Target className="h-4 w-4 mr-1" />Context</TabsTrigger>
          <TabsTrigger value="content"><Lightbulb className="h-4 w-4 mr-1" />Content</TabsTrigger>
        </TabsList>

        <TabsContent value="brand" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle>Brand Identity</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Brand Name</Label>
                  <Input value={local.name} onChange={(e) => patch({ name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Website URL</Label>
                  <Input value={local.website_url} onChange={(e) => patch({ website_url: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label><Volume2 className="h-3 w-3 inline mr-1" />Brand Voice</Label>
                <Textarea value={local.brand_voice} onChange={(e) => patch({ brand_voice: e.target.value })} />
                <p className="text-xs text-muted-foreground">e.g. Professional yet friendly, confident, occasionally playful</p>
              </div>
              <div className="space-y-2">
                <Label><Volume2 className="h-3 w-3 inline mr-1" />Brand Tone</Label>
                <Textarea value={local.brand_tone} onChange={(e) => patch({ brand_tone: e.target.value })} />
                <p className="text-xs text-muted-foreground">e.g. Helpful and confident with a touch of warmth</p>
              </div>
              <div className="space-y-2">
                <Label><Users className="h-3 w-3 inline mr-1" />Target Audience</Label>
                <Textarea value={local.target_audience} onChange={(e) => patch({ target_audience: e.target.value })} />
                <p className="text-xs text-muted-foreground">Describe who you&apos;re speaking to, their pain points, and goals</p>
              </div>
              <div className="space-y-2">
                <Label><Star className="h-3 w-3 inline mr-1" />Key USPs &amp; Differentiators</Label>
                <Textarea value={local.usps} onChange={(e) => patch({ usps: e.target.value })} placeholder="What makes your app unique? e.g. Real-time tracking, seat selection, lowest price guarantee..." />
                <p className="text-xs text-muted-foreground">These are passed to AI so every generation highlights what makes you different</p>
              </div>
              <div className="space-y-2">
                <Label>Launch Phase</Label>
                <Select value={local.launch_phase} onValueChange={(v: "pre-launch" | "launch" | "growth") => patch({ launch_phase: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pre-launch">Pre-Launch (building buzz)</SelectItem>
                    <SelectItem value="launch">Launch (going live)</SelectItem>
                    <SelectItem value="growth">Growth (scaling)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Color Palette</Label>
                <div className="flex gap-2 flex-wrap items-center">
                  {local.color_palette.map((c, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input type="color" value={c} onChange={(e) => {
                        const colors = [...local.color_palette]
                        colors[i] = e.target.value
                        patch({ color_palette: colors })
                      }} className="w-10 h-10 rounded border cursor-pointer" />
                    </div>
                  ))}
                  <Button variant="outline" size="icon" onClick={() => patch({ color_palette: [...local.color_palette, "#000000"] })}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Logo</Label>
                <div className="flex items-center gap-3">
                  <Input type="file" accept="image/*" onChange={handleLogoUpload} className="flex-1" />
                  {logoUploading && <Loader2 className="h-4 w-4 animate-spin shrink-0" />}
                  {local.logo_url && (
                    <img src={local.logo_url} alt="Logo" className="h-10 w-10 rounded object-cover shrink-0" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="context" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle>AI Context &amp; Reference</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Competitor Mentions</Label>
                <Textarea value={local.competitor_mentions} onChange={(e) => patch({ competitor_mentions: e.target.value })} placeholder="Optional: List competitors or reference apps for the AI to study (e.g. Uber, Bolt, Citymapper)" />
                <p className="text-xs text-muted-foreground">AI will analyze their content style to inform your generations</p>
              </div>
              <div className="space-y-2">
                <Label>Preferred Content Examples</Label>
                <Textarea value={local.content_examples} onChange={(e) => patch({ content_examples: e.target.value })} placeholder="Paste examples of content you love. Include hooks, captions, or full posts that match your brand." className="min-h-[120px]" />
                <p className="text-xs text-muted-foreground">The more examples you provide, the better AI will match your style</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle>Content Pillars</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {local.pillars.length === 0 && (
                  <p className="text-sm text-muted-foreground">No pillars yet. Add your first content pillar below.</p>
                )}
                {local.pillars.map((p) => (
                  <Badge key={p} variant="secondary" className="gap-1">
                    {p.replace("-", " ")}
                    <button onClick={() => removePillar(p)}><X className="h-3 w-3" /></button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input placeholder="New pillar (e.g. user-stories)" value={pillarInput} onChange={(e) => setPillarInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addPillar()} />
                <Button variant="outline" size="icon" onClick={addPillar}><Plus className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Platforms</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {local.platforms.map((p) => (
                  <Badge key={p.id} variant={p.active ? "secondary" : "outline"} className="gap-1 cursor-pointer" onClick={() => togglePlatform(p.id)}>
                    {p.name} {p.active ? "✓" : "✗"}
                    <button onClick={(e) => { e.stopPropagation(); removePlatform(p.name) }}><X className="h-3 w-3" /></button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input placeholder="Add platform (e.g. LinkedIn)" value={platformInput} onChange={(e) => setPlatformInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addPlatform()} />
                <Button variant="outline" size="icon" onClick={addPlatform}><Plus className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Separator />

      {/* Show Save button only if local differs from DB */}
      <Button onClick={handleSave} className="w-full" disabled={saving}>
        {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
        Save Settings
      </Button>
    </div>
  )
}
