# Graph Report - .  (2026-06-29)

## Corpus Check
- 66 files · ~18,717 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 368 nodes · 811 edges · 36 communities (11 shown, 25 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 51 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Shared Utilities & cn|Shared Utilities & cn]]
- [[_COMMUNITY_Hooks & Auth Core|Hooks & Auth Core]]
- [[_COMMUNITY_AI Generation Pipeline|AI Generation Pipeline]]
- [[_COMMUNITY_Package Dependencies|Package Dependencies]]
- [[_COMMUNITY_Analytics & Calendar Pages|Analytics & Calendar Pages]]
- [[_COMMUNITY_UI Providers & Sidebar|UI Providers & Sidebar]]
- [[_COMMUNITY_Supabase Data Hooks|Supabase Data Hooks]]
- [[_COMMUNITY_Dev & Script Dependencies|Dev & Script Dependencies]]
- [[_COMMUNITY_TypeScript Configuration|TypeScript Configuration]]
- [[_COMMUNITY_Middleware & Auth Routes|Middleware & Auth Routes]]
- [[_COMMUNITY_AI Service Architecture|AI Service Architecture]]
- [[_COMMUNITY_Error Boundary|Error Boundary]]
- [[_COMMUNITY_Dropdown Menu UI|Dropdown Menu UI]]
- [[_COMMUNITY_PostCSS Configuration|PostCSS Configuration]]
- [[_COMMUNITY_ESLint Configuration|ESLint Configuration]]
- [[_COMMUNITY_Next.js Configuration|Next.js Configuration]]
- [[_COMMUNITY_Supabase Auth Clients|Supabase Auth Clients]]
- [[_COMMUNITY_Tailwind Font Config|Tailwind Font Config]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 26 edges
2. `useUser()` - 21 edges
3. `createClient()` - 21 edges
4. `toast()` - 18 edges
5. `compilerOptions` - 16 edges
6. `formatDate()` - 12 edges
7. `CalendarPage()` - 11 edges
8. `Button` - 11 edges
9. `useSettings()` - 11 edges
10. `useRepurposedPosts()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `BusBook Content Machine` --references--> `MultiplierPage()`  [INFERRED]
  README.md → src/app/multiplier/page.tsx
- `Modular Brand Configuration` --references--> `useSettings()`  [INFERRED]
  README.md → src/hooks/use-settings.ts
- `Supabase Schema (5 Tables)` --references--> `Enhanced Brand Settings Migration`  [INFERRED]
  README.md → supabase/migrations/002_enhanced_settings.sql
- `BusBook Content Machine` --references--> `Prompt Templates`  [INFERRED]
  README.md → src/lib/prompts.ts
- `Modular Brand Configuration` --references--> `useSettings`  [INFERRED]
  README.md → src/hooks/use-settings.ts

## Hyperedges (group relationships)
- **Content Pipeline Flow** — ideas_page_ideas, multiplier_page_multiplier, calendar_page_calendar, dashboard_page_dashboard [INFERRED 0.85]
- **Authentication System** — src_middleware_middleware, callback_route_get, signout_route_post, app_page_home [INFERRED 0.85]
- **Database Data Model Evolution** — migrations_001_initial_schema_schema, migrations_002_enhanced_settings_settings, migrations_003_projects_series_custom_types_projects, types_index_definitions [INFERRED 0.95]
- **Provider Composition Stack** — providers_index_providers, providers_theme_provider_themeprovider, ui_toaster_toaster [INFERRED 0.95]
- **Analytics Data Pipeline** — analytics_page_analyticspage, analytics_page_performancelog, analytics_page_insightsengine [INFERRED 0.95]
- **Content Pipeline Flow** — hooks_useideas, hooks_userepurposedposts, hooks_usescheduledposts, hooks_useperformancelogs, hooks_usedashboard [INFERRED 0.85]
- **CRUD Hook Architecture** — hooks_crud_pattern, hooks_useideas, hooks_useprojects, hooks_useseries, hooks_usesettings [INFERRED 0.85]
- **Authentication System** — hooks_useuser, supabase_client, supabase_server, supabase_middleware [INFERRED 0.95]

## Communities (36 total, 25 thin omitted)

### Community 0 - "Shared Utilities & cn"
Cohesion: 0.10
Nodes (43): platformDots, pillars, statusBadgeVariant, statuses, navItems, cn(), slugify(), GeneratedVariant (+35 more)

### Community 1 - "Hooks & Auth Core"
Cohesion: 0.10
Nodes (43): EMPTY_STATS, useDashboard(), IdeaFormData, queryKeys, useIdeas(), queryKeys, usePerformanceLogs(), useRepurposedPosts() (+35 more)

### Community 2 - "AI Generation Pipeline"
Cohesion: 0.09
Nodes (33): AI Content Generation Pipeline, POST(), Idea Vault Page, AIConfig, AIGenerateOptions, AIProvider, body, data (+25 more)

### Community 3 - "Package Dependencies"
Cohesion: 0.06
Nodes (35): dependencies, class-variance-authority, clsx, date-fns, @hello-pangea/dnd, @hookform/resolvers, lucide-react, next (+27 more)

### Community 4 - "Analytics & Calendar Pages"
Cohesion: 0.10
Nodes (27): AnalyticsPage(), Analytics Insights Engine, Performance Log Data Model, Home(), Props, Content Calendar Page, CalendarPage(), DAYS (+19 more)

### Community 5 - "UI Providers & Sidebar"
Cohesion: 0.11
Nodes (22): inter, metadata, RootLayout(), useToast(), MobileNav(), Sidebar(), Provider Composition Hierarchy, Providers() (+14 more)

### Community 6 - "Supabase Data Hooks"
Cohesion: 0.26
Nodes (23): Project-based Content Organization, User Data Isolation Pattern, TanStack React Query CRUD Pattern, useActiveProject, useDashboard, useIdeas, usePerformanceLogs, useProjects (+15 more)

### Community 7 - "Dev & Script Dependencies"
Cohesion: 0.10
Nodes (19): devDependencies, autoprefixer, eslint, @eslint/eslintrc, postcss, tailwindcss, @types/node, @types/react (+11 more)

### Community 8 - "TypeScript Configuration"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 9 - "Middleware & Auth Routes"
Cohesion: 0.22
Nodes (6): GET(), POST(), config, middleware(), updateSession(), createClient()

### Community 10 - "AI Service Architecture"
Cohesion: 0.29
Nodes (7): AI Service Layer, Anthropic Provider, Groq Provider, NVIDIA NIM Provider, OpenAI Provider, Prompt Templates, Modular Brand Configuration

## Knowledge Gaps
- **162 isolated node(s):** `config`, `{ fontFamily }`, `name`, `version`, `private` (+157 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **25 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Modular Brand Configuration` connect `AI Service Architecture` to `Hooks & Auth Core`, `Supabase Data Hooks`?**
  _High betweenness centrality (0.087) - this node is a cross-community bridge._
- **Why does `useSettings()` connect `Hooks & Auth Core` to `Shared Utilities & cn`, `AI Service Architecture`, `Analytics & Calendar Pages`?**
  _High betweenness centrality (0.082) - this node is a cross-community bridge._
- **Why does `useSettings` connect `Supabase Data Hooks` to `AI Service Architecture`?**
  _High betweenness centrality (0.080) - this node is a cross-community bridge._
- **What connects `config`, `{ fontFamily }`, `name` to the rest of the system?**
  _168 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Shared Utilities & cn` be split into smaller, more focused modules?**
  _Cohesion score 0.10316066725197541 - nodes in this community are weakly interconnected._
- **Should `Hooks & Auth Core` be split into smaller, more focused modules?**
  _Cohesion score 0.10014513788098693 - nodes in this community are weakly interconnected._
- **Should `AI Generation Pipeline` be split into smaller, more focused modules?**
  _Cohesion score 0.08558558558558559 - nodes in this community are weakly interconnected._