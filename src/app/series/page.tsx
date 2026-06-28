"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSeries, useSeriesItems } from "@/hooks/use-series"
import { useProjects } from "@/hooks/use-projects"
import { toast } from "@/hooks/use-toast"
import { Plus, Layers, Loader2, Sparkles, Trash2, ChevronRight, CheckCircle2, Circle, Play } from "lucide-react"
import { formatDate } from "@/lib/utils"
import type { Series as SeriesType } from "@/types"

export default function SeriesPage() {
  const { projects, defaultProject } = useProjects()
  const [activeProjectId, setActiveProjectId] = useState(
    typeof window !== "undefined" ? localStorage.getItem("activeProjectId") ?? "" : ""
  )
  const projectId = activeProjectId || defaultProject?.id
  const { seriesList, loading, createSeries, deleteSeries } = useSeries(projectId)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ title: "", description: "", goal: "", total_parts: 5, timeline: "" })
  const [creating, setCreating] = useState(false)

  async function handleCreate() {
    if (!form.title.trim()) return
    setCreating(true)
    await createSeries({
      project_id: projectId,
      title: form.title,
      description: form.description,
      goal: form.goal,
      total_parts: form.total_parts,
      timeline: form.timeline,
    })
    setForm({ title: "", description: "", goal: "", total_parts: 5, timeline: "" })
    setShowCreate(false)
    setCreating(false)
  }

  const statusColors: Record<string, string> = {
    planning: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
    active: "bg-blue-500/10 text-blue-600 border-blue-200",
    completed: "bg-green-500/10 text-green-600 border-green-200",
    archived: "bg-gray-500/10 text-gray-600 border-gray-200",
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div><Skeleton className="h-10 w-40" /><Skeleton className="h-5 w-64 mt-2" /></div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Series & Campaigns</h1>
          <p className="text-muted-foreground">Plan multi-part content series</p>
        </div>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" /> New Series</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Series / Campaign</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title *</label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Beginner Bus Booking Guide" />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What is this series about?" />
              </div>
              <div>
                <label className="text-sm font-medium">Goal</label>
                <Input value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} placeholder="e.g. Educate new users on bus booking features" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Total Parts</label>
                  <Input type="number" min={1} max={50} value={form.total_parts} onChange={(e) => setForm({ ...form, total_parts: parseInt(e.target.value) || 1 })} />
                </div>
                <div>
                  <label className="text-sm font-medium">Timeline</label>
                  <Input value={form.timeline} onChange={(e) => setForm({ ...form, timeline: e.target.value })} placeholder="e.g. 2 weeks" />
                </div>
              </div>
              <Button onClick={handleCreate} className="w-full" disabled={creating || !form.title.trim()}>
                {creating ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
                Create Series
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {seriesList.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-muted-foreground">
            <Layers className="h-12 w-12 mb-4" />
            <p>No series yet. Create your first multi-part content series!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {seriesList.map((s) => (
            <SeriesCard
              key={s.id}
              series={s}
              onDelete={() => deleteSeries(s.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function SeriesCard({ series, onDelete }: { series: SeriesType; onDelete: () => void }) {
  const { items, loading: itemsLoading, addBulkItems, updateItem } = useSeriesItems(series.id)
  const [showDetail, setShowDetail] = useState(false)
  const [generating, setGenerating] = useState(false)
  const doneCount = items.filter((i) => i.status === "done").length
  const progress = series.total_parts > 0 ? Math.round((doneCount / series.total_parts) * 100) : 0

  const statusColors: Record<string, string> = {
    planning: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
    active: "bg-blue-500/10 text-blue-600 border-blue-200",
    completed: "bg-green-500/10 text-green-600 border-green-200",
    archived: "bg-gray-500/10 text-gray-600 border-gray-200",
  }

  async function generateEpisodes() {
    setGenerating(true)
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "expand",
          input: {
            title: series.title,
            description: series.description,
            platform: "all",
            brandVoice: "",
            targetAudience: "",
            pillars: [],
            seriesContext: `This is a ${series.total_parts}-part series. Goal: ${series.goal || "N/A"}. Generate ${series.total_parts} subtopics.`,
            episodeCount: series.total_parts,
          },
        }),
      })
      const json = await res.json()
      const data = json.data as { title: string; description: string; hook: string }[]
      if (Array.isArray(data) && data.length > 0) {
        const parts = data.map((d, i) => ({
          part_number: i + 1,
          title: d.title || `Episode ${i + 1}`,
          description: d.description || d.hook || "",
        }))
        await addBulkItems(parts)
        toast({ title: "Episodes generated", description: `${parts.length} episodes created.` })
      } else {
        throw new Error("No data")
      }
    } catch {
      const parts = Array.from({ length: series.total_parts }, (_, i) => ({
        part_number: i + 1,
        title: `Part ${i + 1}`,
        description: "",
      }))
      await addBulkItems(parts)
      toast({ title: "Episodes created", description: "Used default names." })
    }
    setGenerating(false)
  }

  function cycleStatus(current: string): "planned" | "in-progress" | "done" {
    if (current === "planned") return "in-progress"
    if (current === "in-progress") return "done"
    return "planned"
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base">{series.title}</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">{formatDate(series.created_at)}</p>
          </div>
          <Badge variant="outline" className={statusColors[series.status] ?? ""}>{series.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-3">
        {series.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{series.description}</p>
        )}
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">{doneCount}/{series.total_parts}</span>
          <span className="text-muted-foreground">episodes</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex gap-2 mt-auto pt-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={() => setShowDetail(!showDetail)}>
            {showDetail ? "Hide" : "Manage"}
            <ChevronRight className={`h-3 w-3 ml-1 transition-transform ${showDetail ? "rotate-90" : ""}`} />
          </Button>
          <Button variant="outline" size="sm" onClick={generateEpisodes} disabled={generating}>
            {generating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>

        {showDetail && (
          <div className="space-y-2 mt-2 border-t pt-3">
            {series.goal && (
              <p className="text-xs text-muted-foreground"><span className="font-medium">Goal:</span> {series.goal}</p>
            )}

            <Separator />

            {itemsLoading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)
            ) : items.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-2">No episodes yet. Click <Sparkles className="h-3 w-3 inline" /> to generate.</p>
            ) : (
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 text-sm p-1.5 rounded hover:bg-muted/50">
                    <button onClick={() => updateItem(item.id, { status: cycleStatus(item.status) } as any)}>
                      {item.status === "done" ? <CheckCircle2 className="h-4 w-4 text-green-500" /> :
                       item.status === "in-progress" ? <Play className="h-4 w-4 text-blue-500" /> :
                       <Circle className="h-4 w-4 text-muted-foreground" />}
                    </button>
                    <span className="text-xs text-muted-foreground shrink-0">#{item.part_number}</span>
                    <span className="truncate flex-1">{item.title}</span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {item.status === "done" ? "Done" : item.status === "in-progress" ? "Doing" : "Start"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
