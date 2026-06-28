import { NextRequest, NextResponse } from "next/server"
import { generateJSON, getBestAvailableConfig } from "@/lib/ai"
import { captionPrompt, repurposePrompt, expandIdeasPrompt, seriesEpisodePrompt } from "@/lib/prompts"
import type { GeneratedContent } from "@/types"

export async function POST(req: NextRequest) {
  try {
    const config = getBestAvailableConfig()
    if (!config) {
      return NextResponse.json({ error: "No AI provider configured. Add an API key in Settings." }, { status: 400 })
    }

    const body = await req.json()
    const { type, input } = body as {
      type: "caption" | "repurpose" | "expand" | "series-episode"
      input: {
        title: string
        description: string
        platform?: string
        brandVoice?: string
        targetAudience?: string
        pillars?: string[]
        usps?: string
        competitorMentions?: string
        contentExamples?: string
        launchPhase?: string
        seriesContext?: string
        episodeCount?: number
        projectName?: string
      }
    }

    const promptInput = {
      title: input.title,
      description: input.description ?? "",
      platform: input.platform ?? "all",
      brandVoice: input.brandVoice ?? "",
      targetAudience: input.targetAudience ?? "",
      pillars: input.pillars ?? [],
      usps: input.usps,
      competitorMentions: input.competitorMentions,
      contentExamples: input.contentExamples,
      launchPhase: input.launchPhase,
      seriesContext: input.seriesContext,
      episodeCount: input.episodeCount,
      projectName: input.projectName,
    }

    let systemPrompt = "You are a world-class content strategist."
    let userPrompt: string
    let resultPromise: Promise<unknown>

    switch (type) {
      case "caption": {
        if (!input.platform) return NextResponse.json({ error: "Platform required" }, { status: 400 })
        userPrompt = captionPrompt(promptInput)
        resultPromise = generateJSON<GeneratedContent>(systemPrompt, userPrompt, config)
        break
      }
      case "repurpose": {
        userPrompt = repurposePrompt(promptInput)
        resultPromise = generateJSON<Record<string, GeneratedContent>>(systemPrompt, userPrompt, config)
        break
      }
      case "expand": {
        userPrompt = expandIdeasPrompt(promptInput)
        resultPromise = generateJSON<GeneratedContent[]>(systemPrompt, userPrompt, config)
        break
      }
      case "series-episode": {
        userPrompt = seriesEpisodePrompt(promptInput)
        resultPromise = generateJSON<{ part_number: number; title: string; description: string; hook: string }[]>(systemPrompt, userPrompt, config)
        break
      }
      default:
        return NextResponse.json({ error: "Invalid generation type" }, { status: 400 })
    }

    const result = await resultPromise
    return NextResponse.json({ data: result })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
