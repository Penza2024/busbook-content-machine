// ─── AI Service Layer — Multi-Provider ──────────────
// Supports NVIDIA NIM (primary), OpenAI, Anthropic, Groq (fallbacks)
// Configure via env vars + user settings stored in Supabase

export type AIProvider = "nvidia" | "openai" | "anthropic" | "groq"

export interface AIConfig {
  provider: AIProvider
  apiKey: string
  model?: string
}

export interface AIGenerateOptions {
  temperature?: number
  maxTokens?: number
  stream?: boolean
}

export const PROVIDER_MODELS: Record<AIProvider, string> = {
  nvidia: "meta/llama-3.1-70b-instruct",
  openai: "gpt-4o-mini",
  anthropic: "claude-3-5-haiku-latest",
  groq: "llama-3.1-8b-instant",
}

export const PROVIDER_NAMES: Record<AIProvider, string> = {
  nvidia: "NVIDIA NIM (Meta Llama 3.1 70B)",
  openai: "OpenAI (GPT-4o Mini)",
  anthropic: "Anthropic (Claude 3.5 Haiku)",
  groq: "Groq (Llama 3.1 8B)",
}

const PROVIDER_BASE_URLS: Record<AIProvider, string> = {
  nvidia: "https://integrate.api.nvidia.com/v1",
  openai: "https://api.openai.com/v1",
  anthropic: "https://api.anthropic.com/v1",
  groq: "https://api.groq.com/openai/v1",
}

export function getActiveProviderName(): string {
  const cfg = getBestAvailableConfig()
  if (!cfg) return "No AI provider configured"
  return PROVIDER_NAMES[cfg.provider] ?? cfg.provider
}

// Get best available provider config from env vars
export function getBestAvailableConfig(): AIConfig | null {
  const providers: AIProvider[] = ["nvidia", "openai", "anthropic", "groq"]
  for (const provider of providers) {
    const key = process.env[`${provider.toUpperCase()}_API_KEY`]
    if (key) return { provider, apiKey: key }
  }
  return null
}

// Generate content using the configured AI provider
export async function generateContent(
  systemPrompt: string,
  userPrompt: string,
  config?: AIConfig,
  options?: AIGenerateOptions
): Promise<string> {
  const cfg = config ?? getBestAvailableConfig()
  if (!cfg) throw new Error("No AI provider configured. Add an API key in Settings or .env.")

  const model = cfg.model ?? PROVIDER_MODELS[cfg.provider]
  const baseUrl = PROVIDER_BASE_URLS[cfg.provider]

  if (cfg.provider === "anthropic") {
    return generateAnthropic(systemPrompt, userPrompt, cfg, options)
  }

  const body: Record<string, unknown> = {
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.maxTokens ?? 1024,
    stream: false,
  }

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cfg.apiKey}`,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`${cfg.provider} API error ${res.status}: ${errText}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? ""
}

async function generateAnthropic(
  systemPrompt: string,
  userPrompt: string,
  config: AIConfig,
  options?: AIGenerateOptions
): Promise<string> {
  const model = config.model ?? "claude-3-5-haiku-latest"

  const res = await fetch(`${PROVIDER_BASE_URLS.anthropic}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": config.apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
      max_tokens: options?.maxTokens ?? 1024,
      temperature: options?.temperature ?? 0.7,
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Anthropic API error ${res.status}: ${errText}`)
  }

  const data = await res.json()
  return data.content?.[0]?.text ?? ""
}

async function withRetry<T>(fn: () => Promise<T>, maxRetries = 2): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (err) {
      if (attempt === maxRetries) throw err
      const delay = Math.min(1000 * Math.pow(2, attempt), 4000)
      await new Promise((r) => setTimeout(r, delay))
    }
  }
  throw new Error("Max retries exceeded")
}

// Generate JSON-structured content from AI
export async function generateJSON<T>(
  systemPrompt: string,
  userPrompt: string,
  config?: AIConfig,
  options?: AIGenerateOptions
): Promise<T> {
  const jsonPrompt = `${systemPrompt}\n\nIMPORTANT: Respond with valid JSON only, no markdown formatting, no code blocks.`
  const raw = await withRetry(() => generateContent(jsonPrompt, userPrompt, config, options))
  try {
    return JSON.parse(raw) as T
  } catch {
    // Try to extract JSON from the response
    const match = raw.match(/\{[\s\S]*\}/) ?? raw.match(/\[[\s\S]*\]/)
    if (match) return JSON.parse(match[0]) as T
    throw new Error(`Failed to parse AI response as JSON: ${raw.slice(0, 200)}`)
  }
}

// Stream content from AI (for real-time generation UX)
export async function* streamContent(
  systemPrompt: string,
  userPrompt: string,
  config?: AIConfig,
  options?: AIGenerateOptions
): AsyncGenerator<string> {
  const cfg = config ?? getBestAvailableConfig()
  if (!cfg) throw new Error("No AI provider configured.")

  const model = cfg.model ?? PROVIDER_MODELS[cfg.provider]
  const baseUrl = PROVIDER_BASE_URLS[cfg.provider]

  const body: Record<string, unknown> = {
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.maxTokens ?? 2048,
    stream: true,
  }

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cfg.apiKey}`,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) throw new Error(`${cfg.provider} API error ${res.status}`)

  const reader = res.body?.getReader()
  if (!reader) throw new Error("No response body")

  const decoder = new TextDecoder()
  let buffer = ""

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split("\n")
    buffer = lines.pop() ?? ""

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || !trimmed.startsWith("data: ")) continue
      const data = trimmed.slice(6)
      if (data === "[DONE]") return
      try {
        const parsed = JSON.parse(data)
        const content = parsed.choices?.[0]?.delta?.content
        if (content) yield content
      } catch {
        // Skip malformed chunks
      }
    }
  }
}
