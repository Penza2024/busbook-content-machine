"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useIdeas } from "@/hooks/use-ideas"
import type { IdeaStatus } from "@/types"
import { Plus, Lightbulb, Trash2, Image as ImageIcon, Search, Loader2, X } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate } from "@/lib/utils"

const pillars = ["problem-awareness", "solution-demo", "social-proof", "urgency", "educational", "behind-the-scenes"]
const statuses = ["draft", "ready", "in-production", "published", "archived"]

const statusBadgeVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  draft: "outline", ready: "secondary", "in-production": "secondary", published: "default", archived: "destructive",
}

export default function IdeasPage() {
  const { ideas, loading, addIdea, updateIdea, deleteIdea, uploadScreenshot, removeScreenshot } = useIdeas()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [filterPillar, setFilterPillar] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [form, setForm] = useState({ title: "", description: "", pillar: "solution-demo", tags: "", status: "draft" })
  const [adding, setAdding] = useState(false)
  const [uploadingId, setUploadingId] = useState<string | null>(null)

  async function handleAdd() {
    if (!form.title.trim()) return
    setAdding(true)
    const tags = form.tags.split(",").map((t) => t.trim()).filter(Boolean)
    await addIdea({ ...form, tags })
    setForm({ title: "", description: "", pillar: "solution-demo", tags: "", status: "draft" })
    setOpen(false)
    setAdding(false)
  }

  async function handleScreenshotUpload(ideaId: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingId(ideaId)
    await uploadScreenshot(ideaId, file)
    setUploadingId(null)
    e.target.value = ""
  }

  const filtered = ideas.filter((idea) => {
    const matchesSearch = idea.title.toLowerCase().includes(search.toLowerCase()) || idea.description.toLowerCase().includes(search.toLowerCase())
    const matchesPillar = filterPillar === "all" || idea.pillar === filterPillar
    const matchesStatus = filterStatus === "all" || idea.status === filterStatus
    return matchesSearch && matchesPillar && matchesStatus
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between"><div><Skeleton className="h-10 w-48" /><Skeleton className="h-5 w-64 mt-2" /></div><Skeleton className="h-10 w-28 rounded-md" /></div>
        <div className="flex gap-3"><Skeleton className="h-10 flex-1 rounded-md" /><Skeleton className="h-10 w-[180px] rounded-md" /><Skeleton className="h-10 w-[160px] rounded-md" /></div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-44 rounded-xl" />)}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Idea Vault</h1>
          <p className="text-muted-foreground">Store, organize, and multiply your content ideas</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" /> New Idea</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Content Idea</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title *</label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Real-time bus tracking" />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the idea..." />
              </div>
              <div>
                <label className="text-sm font-medium">Pillar</label>
                <Select value={form.pillar} onValueChange={(v) => setForm({ ...form, pillar: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {pillars.map((p) => <SelectItem key={p} value={p}>{p.replace("-", " ")}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {statuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Tags (comma-separated)</label>
                <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="launch, feature, bus-tracking" />
              </div>
              <Button onClick={handleAdd} className="w-full" disabled={adding || !form.title.trim()}>
                {adding ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
                Save Idea
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search ideas..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterPillar} onValueChange={setFilterPillar}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="All pillars" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Pillars</SelectItem>
            {pillars.map((p) => <SelectItem key={p} value={p}>{p.replace("-", " ")}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="All statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {statuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-muted-foreground">
            <Lightbulb className="h-12 w-12 mb-4" />
            <p>{ideas.length === 0 ? "No ideas yet. Create your first one!" : "No ideas match your filters."}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((idea) => (
            <Card key={idea.id} className="flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base truncate">{idea.title}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">{formatDate(idea.created_at)}</p>
                  </div>
                  <div className="flex gap-1 shrink-0 ml-2">
                    <Select value={idea.status} onValueChange={(v) => updateIdea(idea.id, { status: v as IdeaStatus })}>
                      <SelectTrigger className="h-7 w-24 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {statuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteIdea(idea.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-3">
                <p className="text-sm text-muted-foreground line-clamp-2">{idea.description || "No description"}</p>

                {/* Screenshots */}
                {idea.core_screenshots && idea.core_screenshots.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {idea.core_screenshots.map((url, i) => (
                      <div key={i} className="relative group">
                        <img src={url} alt={`Screenshot ${i + 1}`} className="h-14 w-14 rounded object-cover border" />
                        <button
                          onClick={() => removeScreenshot(idea.id, url)}
                          className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full h-4 w-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2 flex-wrap mt-auto">
                  <Badge variant={statusBadgeVariant[idea.status] || "outline"}>{idea.status}</Badge>
                  <Badge variant="secondary" className="capitalize text-xs">{idea.pillar.replace("-", " ")}</Badge>
                  <label className="cursor-pointer">
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleScreenshotUpload(idea.id, e)} />
                    <Badge variant="outline" className="cursor-pointer hover:bg-accent text-xs">
                      {uploadingId === idea.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <ImageIcon className="h-3 w-3" />}
                    </Badge>
                  </label>
                  {idea.tags?.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
