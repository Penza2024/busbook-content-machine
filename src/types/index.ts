// ─── Projects ──────────────────────────────────────
export interface Project {
  id: string
  user_id: string
  name: string
  description: string
  slug: string
  brand_voice: string
  brand_tone: string
  target_audience: string
  color_palette: string[]
  usps: string
  competitor_mentions: string
  content_examples: string
  launch_phase: "pre-launch" | "launch" | "growth"
  pillars: string[]
  platforms: PlatformConfig[]
  is_default: boolean
  created_at: string
  updated_at: string
}

// ─── Series / Campaigns ────────────────────────────
export interface Series {
  id: string
  user_id: string
  project_id: string
  title: string
  description: string
  goal: string
  total_parts: number
  timeline: string
  status: "planning" | "active" | "completed" | "archived"
  created_at: string
  updated_at: string
}

export interface SeriesItem {
  id: string
  user_id: string
  series_id: string
  idea_id: string | null
  part_number: number
  title: string
  description: string
  status: "planned" | "in-progress" | "done"
  objectives: string[]
  achievements: string[]
  key_learnings: string
  scheduled_date: string | null
  due_date: string | null
  created_at: string
  updated_at: string
}

// ─── Custom Content Types ──────────────────────────
export interface ContentType {
  id: string
  user_id: string | null
  project_id: string | null
  name: string
  slug: string
  icon: string
  description: string
  is_builtin: boolean
  created_at: string
}

// ─── Brand / Settings (legacy, kept for backwards compat) ──
export interface BrandSettings {
  id: string
  user_id: string
  name: string
  website_url: string
  brand_voice: string
  brand_tone: string
  target_audience: string
  color_palette: string[]
  logo_url: string | null
  pillars: string[]
  platforms: PlatformConfig[]
  usps: string
  competitor_mentions: string
  content_examples: string
  launch_phase: "pre-launch" | "launch" | "growth"
  created_at: string
  updated_at: string
}

export interface PlatformConfig {
  id: string
  name: string
  active: boolean
  best_practices: {
    posting_frequency: string
    caption_length: number
    format: string
  }
}

// ─── Content Ideas ─────────────────────────────────
export type IdeaStatus = "draft" | "ready" | "in-production" | "published" | "archived"

export interface ContentIdea {
  id: string
  user_id: string
  project_id: string | null
  series_item_id: string | null
  title: string
  description: string
  core_screenshots: string[]
  tags: string[]
  status: IdeaStatus
  pillar: string
  performance_notes: string
  created_at: string
  updated_at: string
}

// ─── Repurposed Posts ──────────────────────────────
export type PostStatus = "draft" | "scheduled" | "published" | "failed"

export interface RepurposedPost {
  id: string
  idea_id: string
  project_id: string | null
  platform: string
  hook: string
  caption: string
  cta: string
  format: string
  hashtags: string[]
  thumbnail_idea: string
  status: PostStatus
  created_at: string
  updated_at: string
}

// ─── Scheduled Posts ───────────────────────────────
export interface ScheduledPost {
  id: string
  repurposed_post_id: string
  scheduled_date: string
  status: PostStatus
  notes: string
  created_at: string
  updated_at: string
}

// ─── Performance Logs ──────────────────────────────
export interface PerformanceLog {
  id: string
  scheduled_post_id: string
  reach: number
  engagement: number
  clicks: number
  leads: number
  notes: string
  logged_at: string
}

export interface PerformanceLogWithPost extends PerformanceLog {
  scheduled_post?: ScheduledPost & {
    repurposed_post?: RepurposedPost
  }
}

// ─── Dashboard Stats ──────────────────────────────
export interface DashboardStats {
  totalIdeas: number
  totalScheduled: number
  totalPublished: number
  totalLeads: number
  upcomingPosts: ScheduledPost[]
  recentIdeas: ContentIdea[]
  platformBreakdown: { platform: string; count: number }[]
}

// ─── AI Generated Content ─────────────────────────
export interface GeneratedContent {
  hook: string
  caption: string
  cta: string
  hashtags: string[]
  thumbnail_idea: string
  format: string
}

// ─── Series Generation ────────────────────────────
export interface AISeriesSuggestion {
  part_number: number
  title: string
  description: string
  hook: string
}
