-- BusBook Content Machine — Enhanced Episode Tracking
-- Run after 003_projects_series_custom_types.sql
-- Adds objectives, achievements, key learnings, and calendar scheduling to series_items

ALTER TABLE series_items
  ADD COLUMN IF NOT EXISTS objectives TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS achievements TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS key_learnings TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS scheduled_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS due_date TIMESTAMPTZ;
