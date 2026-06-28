"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd"
import { useScheduledPosts, useRepurposedPosts } from "@/hooks/use-posts"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate, generateId } from "@/lib/utils"
import { exportCSV, exportICS, downloadFile } from "@/lib/calendar-export"
import { Plus, ChevronLeft, ChevronRight, Download, Loader2, CalendarDays } from "lucide-react"

const platformColors: Record<string, string> = {
  tiktok: "border-l-black",
  youtube: "border-l-red-500",
  instagram: "border-l-pink-500",
  facebook: "border-l-blue-600",
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function getMonthDays(year: number, month: number) {
  const first = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days: (number | null)[] = Array(first).fill(null)
  for (let i = 1; i <= daysInMonth; i++) days.push(i)
  return days
}

export default function CalendarPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const { scheduled, loading, schedulePost, updateSchedule, deleteSchedule } = useScheduledPosts()
  const { posts: repurposedPosts } = useRepurposedPosts()
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [selectedPostId, setSelectedPostId] = useState("")
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [notes, setNotes] = useState("")

  const monthDays = getMonthDays(year, month)
  const monthName = new Date(year, month).toLocaleString("default", { month: "long" })

  const getPostsForDay = useCallback(
    (day: number | null) => {
      if (!day) return []
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
      return scheduled.filter((s) => s.scheduled_date?.startsWith(dateStr))
    },
    [scheduled, year, month]
  )

  function onDragEnd(result: DropResult) {
    if (!result.destination) return
    const { draggableId } = result
    const destDay = parseInt(result.destination.droppableId)
    if (isNaN(destDay)) return

    const newDate = new Date(year, month, destDay, 10, 0, 0).toISOString()
    updateSchedule(draggableId, { scheduled_date: newDate })
  }

  async function handleSchedule() {
    if (!selectedPostId || !selectedDay) return
    const date = new Date(year, month, selectedDay, 10, 0, 0).toISOString()
    await schedulePost(selectedPostId, date, notes)
    setScheduleOpen(false)
    setSelectedPostId("")
    setNotes("")
  }

  function handleExportCSV() {
    const posts = scheduled.map((s) => ({
      title: s.repurposed_post?.hook ?? "Untitled",
      platform: s.repurposed_post?.platform ?? "unknown",
      date: s.scheduled_date,
      notes: s.notes,
    }))
    const csv = exportCSV(posts)
    downloadFile(csv, `calendar-${monthName}-${year}.csv`, "text/csv")
  }

  function handleExportICS() {
    const posts = scheduled.map((s) => ({
      title: s.repurposed_post?.hook ?? "Untitled",
      platform: s.repurposed_post?.platform ?? "unknown",
      date: s.scheduled_date,
      notes: s.notes,
    }))
    const ics = exportICS(posts)
    downloadFile(ics, `calendar-${monthName}-${year}.ics`, "text/calendar")
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between"><div><Skeleton className="h-10 w-48" /><Skeleton className="h-5 w-36 mt-2" /></div></div>
        <Card><CardContent className="p-4"><div className="grid grid-cols-7 gap-1">{Array.from({ length: 35 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-md" />)}</div></CardContent></Card>
      </div>
    )
  }

  const draftPosts = repurposedPosts.filter((p) => p.status === "draft")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Calendar</h1>
          <p className="text-muted-foreground">Drag posts to reschedule</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-1" /> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportICS}>
            <CalendarDays className="h-4 w-4 mr-1" /> ICS
          </Button>
          <Button variant="outline" size="icon" onClick={() => { if (month === 0) { setYear(year - 1); setMonth(11) } else setMonth(m => m - 1) }}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-medium min-w-[140px] text-center">{monthName} {year}</span>
          <Button variant="outline" size="icon" onClick={() => { if (month === 11) { setYear(year + 1); setMonth(0) } else setMonth(m => m + 1) }}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-7 gap-1">
              {DAYS.map((d) => (
                <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>
              ))}
              {monthDays.map((day, i) => (
                <Droppable key={i} droppableId={String(day ?? `empty-${i}`)}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-[100px] border rounded-md p-1 ${snapshot.isDraggingOver ? "bg-accent" : ""} ${!day ? "bg-muted/30" : ""}`}
                    >
                      {day && (
                        <>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-muted-foreground">{day}</span>
                            {draftPosts.length > 0 && (
                              <Dialog open={scheduleOpen && selectedDay === day} onOpenChange={(o) => { setScheduleOpen(o); if (o) setSelectedDay(day) }}>
                                <DialogTrigger asChild>
                                  <button className="text-xs text-primary hover:underline"><Plus className="h-3 w-3" /></button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader><DialogTitle>Schedule Post</DialogTitle></DialogHeader>
                                  <div className="space-y-4">
                                    <Select value={selectedPostId} onValueChange={setSelectedPostId}>
                                      <SelectTrigger><SelectValue placeholder="Select a post" /></SelectTrigger>
                                      <SelectContent>
                                        {draftPosts.map((p) => (
                                          <SelectItem key={p.id} value={p.id}>{p.hook.slice(0, 40)}...</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <Textarea placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
                                    <Button onClick={handleSchedule} className="w-full" disabled={!selectedPostId}>
                                      Schedule for {monthName} {day}, {year}
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            )}
                          </div>
                          {getPostsForDay(day).map((post, idx) => (
                            <Draggable key={post.id} draggableId={post.id} index={idx}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  style={provided.draggableProps.style as React.CSSProperties}
                                  className={`text-xs p-1.5 mb-1 rounded border-l-2 bg-background shadow-sm ${platformColors[post.repurposed_post?.platform?.toLowerCase() ?? ""] || "border-l-gray-400"} ${snapshot.isDragging ? "opacity-50" : ""}`}
                                >
                                  <p className="truncate font-medium">{post.repurposed_post?.hook ?? "Untitled"}</p>
                                  <p className="capitalize text-muted-foreground">{post.repurposed_post?.platform}</p>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </>
                      )}
                    </div>
                  )}
                </Droppable>
              ))}
            </div>
          </CardContent>
        </Card>
      </DragDropContext>

      {/* Upcoming list */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>All Scheduled Posts ({scheduled.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {scheduled.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No scheduled posts. Drag from ideas or click + on a day.</p>
          ) : (
            scheduled.map((post) => (
              <div key={post.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{post.repurposed_post?.hook ?? "Untitled Post"}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(post.scheduled_date)} · {post.repurposed_post?.platform ?? "Unknown"}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <Select value={post.status} onValueChange={(v) => updateSchedule(post.id, { status: v as "draft" | "scheduled" | "published" | "failed" })}>
                    <SelectTrigger className="h-7 w-24 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => deleteSchedule(post.id)}>
                    Remove
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
