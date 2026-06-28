"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSeries, useSeriesItems } from "@/hooks/use-series"
import { useProjects } from "@/hooks/use-projects"
import { toast } from "@/hooks/use-toast"
import { Plus, Layers, Loader2, Sparkles, Trash2, ChevronRight, CheckCircle2, Circle, Play, Pencil, Target, Award, BookOpen, Calendar, BarChart3, X, GripVertical } from "lucide-react"
import { formatDate } from "@/lib/utils"
import type { Series as SeriesType, SeriesItem } from "@/types"

export default function SeriesPage() {
  const { projects, defaultProject } = useProjects()
  const [activeProjectId, setActiveProjectId] = useState(
    typeof window !== "undefined" ? localStorage.getItem("activeProjectId") ?? "" : ""
  )
  const projectId = activeProjectId || defaultProject?.id
  const { seriesList, loading, createSeries, deleteSeries, updateSeries } = useSeries(projectId)
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
          <p className="text-muted-foreground">Plan multi-part content series and track episode progress</p>
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
              onStatusChange={(status) => updateSeries(s.id, { status } as any)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function SeriesCard({ series, onDelete, onStatusChange }: { series: SeriesType; onDelete: () => void; onStatusChange: (status: string) => void }) {
  const { items, loading: itemsLoading, addBulkItems, updateItem } = useSeriesItems(series.id)
  const [showDetail, setShowDetail] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [editingItem, setEditingItem] = useState<SeriesItem | null>(null)
  const [showReport, setShowReport] = useState(false)
  const doneCount = items.filter((i) => i.status === "done").length
  const inProgressCount = items.filter((i) => i.status === "in-progress").length
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
          objectives: [] as string[],
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
        objectives: [] as string[],
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
    <>
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
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium">{doneCount}/{series.total_parts}</span>
              <span className="text-muted-foreground">episodes</span>
            </div>
            {inProgressCount > 0 && (
              <span className="text-xs text-blue-500">{inProgressCount} in progress</span>
            )}
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex gap-2 mt-auto pt-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={() => setShowDetail(!showDetail)}>
              {showDetail ? "Hide" : "Manage"}
              <ChevronRight className={`h-3 w-3 ml-1 transition-transform ${showDetail ? "rotate-90" : ""}`} />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowReport(true)} disabled={items.length === 0}>
              <BarChart3 className="h-3 w-3" />
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
              {series.timeline && (
                <p className="text-xs text-muted-foreground"><span className="font-medium">Timeline:</span> {series.timeline}</p>
              )}

              <Separator />

              {itemsLoading ? (
                Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
              ) : items.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-2">No episodes yet. Click <Sparkles className="h-3 w-3 inline" /> to generate.</p>
              ) : (
                <div className="space-y-1 max-h-60 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id}>
                      <div className="flex items-center gap-2 text-sm p-1.5 rounded hover:bg-muted/50 cursor-pointer" onClick={() => setEditingItem(item)}>
                        <button onClick={(e) => { e.stopPropagation(); updateItem(item.id, { status: cycleStatus(item.status) } as any) }}>
                          {item.status === "done" ? <CheckCircle2 className="h-4 w-4 text-green-500" /> :
                           item.status === "in-progress" ? <Play className="h-4 w-4 text-blue-500" /> :
                           <Circle className="h-4 w-4 text-muted-foreground" />}
                        </button>
                        <span className="text-xs text-muted-foreground shrink-0">#{item.part_number}</span>
                        <div className="flex-1 min-w-0">
                          <p className="truncate font-medium">{item.title}</p>
                          {item.objectives && item.objectives.length > 0 && (
                            <p className="text-xs text-muted-foreground truncate">
                              <Target className="h-3 w-3 inline mr-0.5" />
                              {item.objectives.length} objective{item.objectives.length > 1 ? "s" : ""}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {item.scheduled_date && (
                            <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                              <Calendar className="h-3 w-3" />
                              {new Date(item.scheduled_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </span>
                          )}
                          {item.achievements && item.achievements.length > 0 && (
                            <Award className="h-3 w-3 text-amber-500" />
                          )}
                          <Pencil className="h-3 w-3 text-muted-foreground" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {editingItem && (
        <EpisodeDetailDialog
          key={editingItem.id}
          item={editingItem}
          open={!!editingItem}
          onOpenChange={(open) => { if (!open) setEditingItem(null) }}
          onSave={(id, updates) => updateItem(id, updates as any)}
          onCycleStatus={(id, status) => updateItem(id, { status } as any)}
        />
      )}

      <ProgressReportDialog
        series={series}
        items={items}
        open={showReport}
        onOpenChange={setShowReport}
        onEditItem={(item) => { setShowReport(false); setEditingItem(item) }}
        onCycleStatus={(id, status) => updateItem(id, { status } as any)}
      />
    </>
  )
}

function EpisodeDetailDialog({
  item,
  open,
  onOpenChange,
  onSave,
  onCycleStatus,
}: {
  item: SeriesItem
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (id: string, updates: Partial<SeriesItem>) => void
  onCycleStatus: (id: string, status: SeriesItem["status"]) => void
}) {
  const [title, setTitle] = useState(item.title ?? "")
  const [description, setDescription] = useState(item.description ?? "")
  const [objectives, setObjectives] = useState<string[]>(item.objectives ?? [])
  const [achievements, setAchievements] = useState<string[]>(item.achievements ?? [])
  const [keyLearnings, setKeyLearnings] = useState(item.key_learnings ?? "")
  const [scheduledDate, setScheduledDate] = useState(item.scheduled_date ? item.scheduled_date.slice(0, 10) : "")
  const [dueDate, setDueDate] = useState(item.due_date ? item.due_date.slice(0, 10) : "")
  const [newObjective, setNewObjective] = useState("")
  const [newAchievement, setNewAchievement] = useState("")

  function cycleStatus() {
    const next = item.status === "planned" ? "in-progress" : item.status === "in-progress" ? "done" : "planned"
    onCycleStatus(item.id, next)
  }

  function handleSave() {
    onSave(item.id, {
      title,
      description,
      objectives,
      achievements,
      key_learnings: keyLearnings,
      scheduled_date: scheduledDate ? new Date(scheduledDate + "T10:00:00").toISOString() : null,
      due_date: dueDate ? new Date(dueDate + "T10:00:00").toISOString() : null,
    } as any)
    onOpenChange(false)
  }

  function addObjective() {
    if (newObjective.trim()) {
      setObjectives([...objectives, newObjective.trim()])
      setNewObjective("")
    }
  }

  function removeObjective(i: number) {
    setObjectives(objectives.filter((_, idx) => idx !== i))
  }

  function addAchievement() {
    if (newAchievement.trim()) {
      setAchievements([...achievements, newAchievement.trim()])
      setNewAchievement("")
    }
  }

  function removeAchievement(i: number) {
    setAchievements(achievements.filter((_, idx) => idx !== i))
  }

  const statusIcon = item.status === "done" ? CheckCircle2 : item.status === "in-progress" ? Play : Circle
  const statusLabel = item.status === "done" ? "Mark as planned" : item.status === "in-progress" ? "Mark complete" : "Start episode"
  const statusColor = item.status === "done" ? "text-green-500" : item.status === "in-progress" ? "text-blue-500" : "text-muted-foreground"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-muted-foreground">#{item.part_number}</span>
            {title}
          </DialogTitle>
          <DialogDescription>
            Define objectives, track achievements, and schedule this episode.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
          </div>

          <Separator />

          <div>
            <label className="text-sm font-medium flex items-center gap-1.5">
              <Target className="h-4 w-4 text-primary" />
              Objectives
            </label>
            <div className="space-y-1.5 mt-1.5">
              {objectives.map((obj, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span className="flex-1">{obj}</span>
                  <button onClick={() => removeObjective(i)} className="text-muted-foreground hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <Input
                  value={newObjective}
                  onChange={(e) => setNewObjective(e.target.value)}
                  placeholder="Add an objective..."
                  className="text-xs h-7"
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addObjective() } }}
                />
                <Button size="sm" variant="ghost" className="h-7 px-2" onClick={addObjective} disabled={!newObjective.trim()}>
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <label className="text-sm font-medium flex items-center gap-1.5">
              <Award className="h-4 w-4 text-amber-500" />
              Achievements
            </label>
            <p className="text-xs text-muted-foreground mb-1.5">What was actually accomplished</p>
            <div className="space-y-1.5">
              {achievements.map((ach, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                  <span className="flex-1">{ach}</span>
                  <button onClick={() => removeAchievement(i)} className="text-muted-foreground hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <Input
                  value={newAchievement}
                  onChange={(e) => setNewAchievement(e.target.value)}
                  placeholder="Add an achievement..."
                  className="text-xs h-7"
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addAchievement() } }}
                />
                <Button size="sm" variant="ghost" className="h-7 px-2" onClick={addAchievement} disabled={!newAchievement.trim()}>
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <label className="text-sm font-medium flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              Key Learnings
            </label>
            <Textarea
              value={keyLearnings}
              onChange={(e) => setKeyLearnings(e.target.value)}
              placeholder="What did you learn from this episode?"
              rows={2}
              className="mt-1"
            />
          </div>

          <Separator />

          <div>
            <label className="text-sm font-medium flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Schedule
            </label>
            <div className="grid grid-cols-2 gap-3 mt-1">
              <div>
                <label className="text-xs text-muted-foreground">Publish Date</label>
                <Input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} className="h-8 text-xs" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Due Date</label>
                <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="h-8 text-xs" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <Button variant="outline" size="sm" onClick={cycleStatus} className="gap-1.5">
              {item.status === "done" ? <CheckCircle2 className="h-4 w-4 text-green-500" /> :
               item.status === "in-progress" ? <Play className="h-4 w-4 text-blue-500" /> :
               <Circle className="h-4 w-4" />}
              {statusLabel}
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ProgressReportDialog({
  series,
  items,
  open,
  onOpenChange,
  onEditItem,
  onCycleStatus,
}: {
  series: SeriesType
  items: SeriesItem[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onEditItem: (item: SeriesItem) => void
  onCycleStatus: (id: string, status: SeriesItem["status"]) => void
}) {
  const doneCount = items.filter((i) => i.status === "done").length
  const inProgressCount = items.filter((i) => i.status === "in-progress").length
  const plannedCount = items.filter((i) => i.status === "planned").length
  const totalObjectives = items.reduce((sum, i) => sum + (i.objectives?.length ?? 0), 0)
  const achievedCount = items.reduce((sum, i) => sum + (i.achievements?.length ?? 0), 0)
  const progress = series.total_parts > 0 ? Math.round((doneCount / series.total_parts) * 100) : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Progress Report: {series.title}
          </DialogTitle>
          <DialogDescription>
            Overview of all episodes, objectives, and achievements.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-4 gap-3 mb-4">
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold">{doneCount}/{series.total_parts}</p>
              <p className="text-xs text-muted-foreground">Episodes Done</p>
              <div className="h-1.5 bg-muted rounded-full mt-1.5 overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${progress}%` }} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-blue-500">{inProgressCount}</p>
              <p className="text-xs text-muted-foreground">In Progress</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-yellow-500">{plannedCount}</p>
              <p className="text-xs text-muted-foreground">Planned</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-amber-500">{achievedCount}/{totalObjectives}</p>
              <p className="text-xs text-muted-foreground">Achievements</p>
            </CardContent>
          </Card>
        </div>

        {series.goal && (
          <p className="text-sm text-muted-foreground mb-3"><span className="font-medium">Goal:</span> {series.goal}</p>
        )}

        <div className="space-y-1">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => onEditItem(item)}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  const next = item.status === "planned" ? "in-progress" : item.status === "in-progress" ? "done" : "planned"
                  onCycleStatus(item.id, next)
                }}
                className="mt-0.5 shrink-0"
              >
                {item.status === "done" ? <CheckCircle2 className="h-5 w-5 text-green-500" /> :
                 item.status === "in-progress" ? <Play className="h-5 w-5 text-blue-500" /> :
                 <Circle className="h-5 w-5 text-muted-foreground" />}
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-mono shrink-0">#{item.part_number}</span>
                  <p className="font-medium text-sm truncate">{item.title}</p>
                  <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${
                    item.status === "done" ? "border-green-200 text-green-600" :
                    item.status === "in-progress" ? "border-blue-200 text-blue-600" :
                    "border-gray-200 text-gray-500"
                  }`}>
                    {item.status === "done" ? "Done" : item.status === "in-progress" ? "Doing" : "Planned"}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
                  {item.objectives && item.objectives.length > 0 && (
                    <span className="flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      {item.objectives.length} objective{item.objectives.length > 1 ? "s" : ""}
                    </span>
                  )}
                  {item.achievements && item.achievements.length > 0 && (
                    <span className="flex items-center gap-1 text-amber-600">
                      <Award className="h-3 w-3" />
                      {item.achievements.length} achievement{item.achievements.length > 1 ? "s" : ""}
                    </span>
                  )}
                  {item.scheduled_date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(item.scheduled_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <div className="mt-3 p-3 rounded-lg bg-muted/30 text-sm">
            <p className="font-medium mb-1">Summary</p>
            <p className="text-muted-foreground">
              {doneCount} of {series.total_parts} episodes complete ({progress}%).
              {totalObjectives > 0 && ` ${achievedCount} of ${totalObjectives} objectives achieved.`}
              {series.timeline && ` Timeline: ${series.timeline}.`}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
