#!/usr/bin/env python3
"""Add all missing import/call/data-flow edges to the graph using exact node IDs."""
import json
from pathlib import Path

data = json.loads(Path("graphify-out/graph.json").read_text(encoding="utf-8"))
existing = data["links"]
node_ids = {n["id"] for n in data["nodes"]}

# Build set of existing edges for dedup
existing_set = set()
for e in existing:
    existing_set.add((e["source"], e["target"], e.get("relation", "")))

added = 0
skipped = 0

def add_edge(source, target, relation="imports", confidence="EXTRACTED", confidence_score=1.0, weight=1.0):
    global added, skipped
    key = (source, target, relation)
    if source not in node_ids:
        skipped += 1; return
    if target not in node_ids:
        skipped += 1; return
    if key not in existing_set:
        existing.append({
            "source": source, "target": target,
            "relation": relation, "confidence": confidence,
            "confidence_score": confidence_score, "weight": weight
        })
        existing_set.add(key)
        added += 1

# ─── ROOT LAYOUT → rendered children ───
add_edge("app_layout_rootlayout", "layout_sidebar_sidebar", "renders")
add_edge("app_layout_rootlayout", "providers_index_providers", "renders")
add_edge("app_layout_rootlayout", "layout_sidebar_mobilenav", "renders")

# ─── HOME PAGE → auth callback redirect ───
add_edge("app_page_home", "callback_route_get", "redirects_to")
add_edge("app_page_home", "dashboard_page_dashboardpage", "redirects_to")

# ─── PROVIDERS → renders child providers ───
add_edge("providers_index_providers", "providers_theme_provider_themeprovider", "renders")
add_edge("providers_index_providers", "ui_toaster_toaster", "renders")

# ─── PAGES → HOOKS they call ───
add_edge("analytics_page_analyticspage", "hooks_use_posts_useperformancelogs", "calls")
add_edge("analytics_page_analyticspage", "hooks_use_posts_usescheduledposts", "calls")
add_edge("analytics_page_analyticspage", "lib_utils_formatdate", "calls")

add_edge("calendar_page_calendarpage", "hooks_use_posts_usescheduledposts", "calls")
add_edge("calendar_page_calendarpage", "hooks_use_posts_userepurposedposts", "calls")
add_edge("calendar_page_calendarpage", "hooks_use_user_useuser", "calls")
add_edge("calendar_page_calendarpage", "supabase_client_createclient", "calls")
add_edge("calendar_page_calendarpage", "lib_utils_formatdate", "calls")
add_edge("calendar_page_calendarpage", "lib_calendar_export_exportcsv", "calls")
add_edge("calendar_page_calendarpage", "lib_calendar_export_exportics", "calls")
add_edge("calendar_page_calendarpage", "lib_calendar_export_downloadfile", "calls")

add_edge("dashboard_page_dashboardpage", "hooks_use_dashboard_usedashboard", "calls")
add_edge("dashboard_page_dashboardpage", "lib_utils_formatdate", "calls")

add_edge("ideas_page_ideaspage", "hooks_use_ideas_useideas", "calls")
add_edge("ideas_page_ideaspage", "hooks_use_projects_useprojects", "calls")
add_edge("ideas_page_ideaspage", "hooks_use_series_useseries", "calls")
add_edge("ideas_page_ideaspage", "lib_utils_formatdate", "calls")

add_edge("series_page_seriespage", "hooks_use_series_useseries", "calls")
add_edge("series_page_seriespage", "hooks_use_projects_useprojects", "calls")
add_edge("series_page_seriespage", "lib_utils_formatdate", "calls")

add_edge("settings_page_settingspage", "hooks_use_settings_usesettings", "calls")

add_edge("multiplier_page_multiplierpage", "hooks_use_posts_userepurposedposts", "calls")
add_edge("multiplier_page_multiplierpage", "hooks_use_settings_usesettings", "calls")
add_edge("multiplier_page_multiplierpage", "hooks_use_ideas_useideas", "calls")
add_edge("multiplier_page_multiplierpage", "lib_utils_cn", "calls")
add_edge("multiplier_page_multiplierpage", "hooks_use_toast_toast", "calls")
add_edge("multiplier_page_multiplierpage", "lib_ai_provider_names", "references")

add_edge("login_page_loginpage", "supabase_client_createclient", "calls")

# ─── SeriesCard (co-located in series/page.tsx) → useSeriesItems, toast ───
add_edge("series_page_seriescard", "hooks_use_series_useseriesitems", "calls")
add_edge("series_page_seriescard", "hooks_use_toast_toast", "calls")

# ─── SIDEBAR → hooks & components ───
add_edge("layout_sidebar_sidebar", "hooks_use_user_useuser", "calls")
add_edge("layout_sidebar_sidebar", "hooks_use_projects_useprojects", "calls")
add_edge("layout_sidebar_sidebar", "lib_utils_cn", "calls")
add_edge("layout_sidebar_sidebar", "supabase_client_createclient", "calls")
add_edge("layout_sidebar_sidebar", "ui_avatar_avatar", "renders")
add_edge("layout_sidebar_sidebar", "ui_avatar_avatarfallback", "renders")

# ─── HOOKS → their internal dependencies ───
# useUser → createClient
add_edge("hooks_use_user_useuser", "supabase_client_createclient", "calls")

# useDashboard → useUser, createClient
add_edge("hooks_use_dashboard_usedashboard", "hooks_use_user_useuser", "calls")
add_edge("hooks_use_dashboard_usedashboard", "supabase_client_createclient", "calls")

# useIdeas → useUser, createClient, toast
add_edge("hooks_use_ideas_useideas", "hooks_use_user_useuser", "calls")
add_edge("hooks_use_ideas_useideas", "supabase_client_createclient", "calls")
add_edge("hooks_use_ideas_useideas", "hooks_use_toast_toast", "calls")

# useRepurposedPosts → useUser, createClient, toast
add_edge("hooks_use_posts_userepurposedposts", "hooks_use_user_useuser", "calls")
add_edge("hooks_use_posts_userepurposedposts", "supabase_client_createclient", "calls")
add_edge("hooks_use_posts_userepurposedposts", "hooks_use_toast_toast", "calls")

# useScheduledPosts → useUser, createClient, toast
add_edge("hooks_use_posts_usescheduledposts", "hooks_use_user_useuser", "calls")
add_edge("hooks_use_posts_usescheduledposts", "supabase_client_createclient", "calls")
add_edge("hooks_use_posts_usescheduledposts", "hooks_use_toast_toast", "calls")

# usePerformanceLogs → useUser, createClient, toast
add_edge("hooks_use_posts_useperformancelogs", "hooks_use_user_useuser", "calls")
add_edge("hooks_use_posts_useperformancelogs", "supabase_client_createclient", "calls")
add_edge("hooks_use_posts_useperformancelogs", "hooks_use_toast_toast", "calls")

# useSeries → useUser, createClient, toast
add_edge("hooks_use_series_useseries", "hooks_use_user_useuser", "calls")
add_edge("hooks_use_series_useseries", "supabase_client_createclient", "calls")
add_edge("hooks_use_series_useseries", "hooks_use_toast_toast", "calls")

# useSeriesItems → useUser, createClient, toast
add_edge("hooks_use_series_useseriesitems", "hooks_use_user_useuser", "calls")
add_edge("hooks_use_series_useseriesitems", "supabase_client_createclient", "calls")
add_edge("hooks_use_series_useseriesitems", "hooks_use_toast_toast", "calls")

# useSettings → useUser, createClient, toast
add_edge("hooks_use_settings_usesettings", "hooks_use_user_useuser", "calls")
add_edge("hooks_use_settings_usesettings", "supabase_client_createclient", "calls")
add_edge("hooks_use_settings_usesettings", "hooks_use_toast_toast", "calls")

# ─── CROSS-HOOK CACHE KEY COUPLING (implicit data sharing) ───
# useIdeas invalidates ["dashboard"] → useDashboard reads from that cache key
add_edge("hooks_use_ideas_useideas", "hooks_use_dashboard_usedashboard", "shares_data_with", "INFERRED", 0.95)
# useScheduledPosts invalidates ["dashboard"]
add_edge("hooks_use_posts_usescheduledposts", "hooks_use_dashboard_usedashboard", "shares_data_with", "INFERRED", 0.95)
# useRepurposedPosts invalidates ["scheduled_posts"] and ["dashboard"]
add_edge("hooks_use_posts_userepurposedposts", "hooks_use_posts_usescheduledposts", "shares_data_with", "INFERRED", 0.85)
add_edge("hooks_use_posts_userepurposedposts", "hooks_use_dashboard_usedashboard", "shares_data_with", "INFERRED", 0.85)

# ─── SeriesCard → toast (calls toast() directly) ───
add_edge("series_page_seriescard", "hooks_use_toast_toast", "calls")

# ─── API ROUTE → lib dependencies ───
add_edge("generate_route_post", "lib_ai_generatejson", "calls")
add_edge("generate_route_post", "lib_ai_getbestavailableconfig", "calls")
add_edge("generate_route_post", "lib_prompts_captionprompt", "calls")
add_edge("generate_route_post", "lib_prompts_repurposeprompt", "calls")
add_edge("generate_route_post", "lib_prompts_expandideasprompt", "calls")
add_edge("generate_route_post", "lib_prompts_seriesepisodeprompt", "calls")

# Sign out route
add_edge("signout_route_post", "supabase_server_createclient", "calls")

# Auth callback
add_edge("callback_route_get", "supabase_server_createclient", "calls")

# ─── MIDDLEWARE → updateSession ───
add_edge("src_middleware_middleware", "supabase_middleware_updatesession", "calls")

# ─── TYPES → used by hooks (type references) ───
add_edge("hooks_use_dashboard_usedashboard", "types_index_dashboardstats", "references")
add_edge("hooks_use_ideas_useideas", "types_index_contentidea", "references")
add_edge("hooks_use_posts_userepurposedposts", "types_index_repurposedpost", "references")
add_edge("hooks_use_posts_usescheduledposts", "types_index_scheduledpost", "references")
add_edge("hooks_use_posts_useperformancelogs", "types_index_performancelog", "references")
add_edge("hooks_use_series_useseries", "types_index_series", "references")
add_edge("hooks_use_series_useseriesitems", "types_index_seriesitem", "references")
add_edge("hooks_use_settings_usesettings", "types_index_brandsettings", "references")
add_edge("hooks_use_settings_usesettings", "types_index_platformconfig", "references")
add_edge("lib_prompts_captionprompt", "lib_prompts_buildcontextblock", "calls")
add_edge("lib_prompts_expandideasprompt", "lib_prompts_buildcontextblock", "calls")
add_edge("lib_prompts_launchsequenceprompt", "lib_prompts_buildcontextblock", "calls")
add_edge("lib_prompts_repurposeprompt", "lib_prompts_buildcontextblock", "calls")
add_edge("lib_prompts_seriesepisodeprompt", "lib_prompts_buildcontextblock", "calls")
add_edge("lib_utils_cn", "lib_utils_slugify", "conceptually_related_to", "INFERRED", 0.65)

# ─── README doc → code references ───
add_edge("readme_busbook_content_machine", "dashboard_page_dashboardpage", "references", "INFERRED", 0.85)
add_edge("readme_busbook_content_machine", "ideas_page_ideaspage", "references", "INFERRED", 0.85)
add_edge("readme_busbook_content_machine", "multiplier_page_multiplierpage", "references", "INFERRED", 0.85)
add_edge("readme_busbook_content_machine", "calendar_page_calendarpage", "references", "INFERRED", 0.85)
add_edge("readme_busbook_content_machine", "analytics_page_analyticspage", "references", "INFERRED", 0.85)
add_edge("readme_busbook_content_machine", "settings_page_settingspage", "references", "INFERRED", 0.85)
add_edge("readme_busbook_content_machine", "login_page_loginpage", "references", "INFERRED", 0.85)
add_edge("readme_busbook_content_machine", "lib_prompt_templates", "references", "INFERRED", 0.85)
add_edge("readme_supabase_schema", "migrations_001_initial_schema_schema", "references", "INFERRED", 0.95)
add_edge("readme_supabase_schema", "migrations_002_enhanced_settings_settings", "references", "INFERRED", 0.85)
add_edge("readme_supabase_schema", "migrations_003_projects_series_custom_types_projects", "references", "INFERRED", 0.85)
add_edge("readme_supabase_schema", "types_index_definitions", "references", "INFERRED", 0.85)
add_edge("readme_v2_roadmap", "lib_calendar_export_downloadfile", "references", "INFERRED", 0.75)
add_edge("readme_modular_brand_configuration", "hooks_use_settings_usesettings", "references", "INFERRED", 0.85)

print(f"Added {added} new edges (skipped {skipped} with unknown node IDs)")
print(f"Total edges: {len(existing)}")

data["links"] = existing
Path("graphify-out/graph.json").write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
print("graph.json updated.")
