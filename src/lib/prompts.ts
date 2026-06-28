export interface PromptInput {
  title: string
  description: string
  platform: string
  brandVoice: string
  targetAudience: string
  pillars: string[]
  usps?: string
  competitorMentions?: string
  contentExamples?: string
  launchPhase?: string
}

function buildContextBlock(input: PromptInput): string {
  const parts = [
    `Core Idea: "${input.title}"`,
    `Description: "${input.description}"`,
    `Platform: ${input.platform}`,
    `Brand Voice: ${input.brandVoice}`,
    `Target Audience: ${input.targetAudience}`,
    `Content Pillars: ${input.pillars.join(", ")}`,
  ]
  if (input.usps) parts.push(`Key USPs: ${input.usps}`)
  if (input.launchPhase) parts.push(`Launch Phase: ${input.launchPhase}`)
  if (input.competitorMentions) parts.push(`Reference Competitors: ${input.competitorMentions}`)
  if (input.contentExamples) parts.push(`Content Style Reference: ${input.contentExamples}`)
  return parts.join("\n")
}

export function captionPrompt(input: PromptInput): string {
  return `You are a world-class SaaS content strategist.

${buildContextBlock(input)}

Generate EXACTLY:
1. HOOK (max 10 words) — stakes, surprise, or benefit. Must stop scroll.
2. CAPTION (platform-optimized length) — include emojis, value prop, CTA.
3. CTA (benefit-driven, 5-8 words)
4. HASHTAGS (array of 3-5, mix broad + niche)
5. THUMBNAIL IDEA (one sentence, visual-first)

Format as JSON: { hook, caption, cta, hashtags: string[], thumbnail_idea }`
}

export function expandIdeasPrompt(input: PromptInput): string {
  return `You are a creative content strategist who multiplies one idea into many.

${buildContextBlock(input)}

Generate 10 platform-native variations. Each must have:
- A distinct angle
- Platform suggestion
- A scroll-stopping hook

Return as JSON array: [{ angle, platform, hook, format }]`
}

export function launchSequencePrompt(input: PromptInput): string {
  return `You are a SaaS launch strategist. Create a 14-post launch sequence for "${input.title}".

${buildContextBlock(input)}

Pillars to cover: problem-awareness (3 posts), solution-demo (4 posts), social-proof (3 posts), urgency (2 posts), educational (2 posts).

For each post, provide: day_number, pillar, platform, hook, caption, cta.

Return as JSON array.`
}

export function hashtagPrompt(input: PromptInput): string {
  return `Generate 10 optimal hashtags for a ${input.platform} post about "${input.title}".
Mix: 2 broad (500K+ posts), 3 medium (50K-500K), 2 niche (5K-50K), and 3 branded/community tags.
Target audience: ${input.targetAudience}.
Return as JSON array of strings.`
}

export function repurposePrompt(input: PromptInput): string {
  const phaseInstr: Record<string, string> = {
    "pre-launch": "Focus on building anticipation, problem-awareness, and early adopter hooks. Drive waitlist signups and curiosity.",
    "launch": "Focus on launch momentum, social proof, and urgency. Feature signups, first-user testimonials, and limited-time offers.",
    "growth": "Focus on scaling, retention, and community. Feature power-user stories, comparisons, and feature deep-dives.",
  }

  const phaseInstruction = input.launchPhase ? phaseInstr[input.launchPhase] ?? "" : ""

  return `You are a content repurposing expert. Multiply the following core idea into platform-native posts.

${buildContextBlock(input)}

${phaseInstruction ? `\nPHASE CONTEXT: ${phaseInstruction}\n` : ""}

Generate optimized variants for these platforms: TikTok, YouTube Shorts, Instagram Reels, Instagram Carousel, Facebook.

For each platform, provide:
- hook (scroll-stopping, platform-native)
- caption (with emojis and CTA)
- cta (benefit-driven)
- format (reel/carousel/short/static/post)
- hashtags (2-5)
- thumbnail_idea

Return as JSON object keyed by platform name.`
}
