// ─── Calendar Export Utilities ──────────────────────

interface ExportPost {
  title: string
  platform: string
  date: string // ISO date
  notes?: string
}

export function exportCSV(posts: ExportPost[]): string {
  const header = "Title,Platform,Date,Notes"
  const rows = posts.map((p) =>
    `"${p.title}","${p.platform}","${p.date.split("T")[0]}","${(p.notes ?? "").replace(/"/g, '""')}"`
  )
  return [header, ...rows].join("\n")
}

export function exportICS(posts: ExportPost[]): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//BusBook Content Machine//EN",
    "CALSCALE:GREGORIAN",
  ]

  for (const post of posts) {
    const dateStr = post.date.split("T")[0].replace(/-/g, "")
    const dtStart = `${dateStr}T100000`
    const dtEnd = `${dateStr}T110000`
    const uid = `busbook-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

    lines.push(
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${escapeICS(post.title)}`,
      `DESCRIPTION:Platform: ${post.platform}\\n${escapeICS(post.notes ?? "")}`,
      "END:VEVENT"
    )
  }

  lines.push("END:VCALENDAR")
  return lines.join("\r\n")
}

function escapeICS(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n")
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
