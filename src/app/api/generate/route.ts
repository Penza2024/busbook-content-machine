import { NextRequest, NextResponse } from "next/server"
import { generateJSON, getBestAvailableConfig, generateContent } from "@/lib/ai"
import { captionPrompt, repurposePrompt, expandIdeasPrompt } from "@/lib/prompts"
import type { GeneratedContent } from "@/types"

export async function POST(req: NextRequest) {
  try {
    const config = getBestAvailableConfig()
    if (!config) {
      return NextResponse.json({ error: "No AI provider configured. Add an API key in Settings." }, { status: 400 })
    }

    const body = await req.json()
    const { type, input } = body as {
      type: "caption" | "repurpose" | "expand"
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
      }
    }

    let systemPrompt = "You are a world-class SaaS content strategist."
    let userPrompt = ""

    const promptInput = {
      title: input.title,
      description: input.description ?? "",
      platform: input.platform ?? "all",
      brandVoice: input.brandVoice ?? "Professional yet friendly",
      targetAudience: input.targetAudience ?? "Travelers",
      pillars: input.pillars ?? [],
      usps: input.usps,
      competitorMentions: input.competitorMentions,
      contentExamples: input.contentExamples,
      launchPhase: input.launchPhase,
    }

    switch (type) {
      case "caption": {
        if (!input.platform) return NextResponse.json({ error: "Platform required" }, { status: 400 })
        userPrompt = captionPrompt(promptInput)
        break
      }
      case "repurpose": {
        userPrompt = repurposePrompt(promptInput)
        break
      }
      case "expand": {
        userPrompt = expandIdeasPrompt(promptInput)
        break
      }
      default:
        return NextResponse.json({ error: "Invalid generation type" }, { status: 400 })
    }

    const result = await generateJSON<GeneratedContent | GeneratedContent[]>(systemPrompt, userPrompt, config)
    return NextResponse.json({ data: result })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
