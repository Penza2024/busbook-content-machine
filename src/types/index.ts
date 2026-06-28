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

export type IdeaStatus = "draft" | "ready" | "in-production" | "published" | "archived"

export interface ContentIdea {
  id: string
  user_id: string
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

export type PostStatus = "draft" | "scheduled" | "published" | "failed"

export interface RepurposedPost {
  id: string
  idea_id: string
  platform: string
  hook: string
  caption: string
  cta: string
  format: "reel" | "carousel" | "short" | "static" | "story" | "post"
  hashtags: string[]
  thumbnail_idea: string
  status: PostStatus
  created_at: string
  updated_at: string
}

export interface ScheduledPost {
  id: string
  repurposed_post_id: string
  scheduled_date: string
  status: PostStatus
  notes: string
  created_at: string
  updated_at: string
}

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

export interface DashboardStats {
  totalIdeas: number
  totalScheduled: number
  totalPublished: number
  totalLeads: number
  upcomingPosts: ScheduledPost[]
  recentIdeas: ContentIdea[]
  platformBreakdown: { platform: string; count: number }[]
}

export interface GeneratedContent {
  hook: string
  caption: string
  cta: string
  hashtags: string[]
  thumbnail_idea: string
  format: RepurposedPost["format"]
}
