-- BusBook Content Machine — Enhanced Brand Settings Migration
-- Run in Supabase SQL Editor or via `supabase migration up`

ALTER TABLE brands ADD COLUMN IF NOT EXISTS usps TEXT DEFAULT 'Real-time bus tracking, instant booking, seat selection, multi-route comparison, lowest price guarantee.';
ALTER TABLE brands ADD COLUMN IF NOT EXISTS competitor_mentions TEXT DEFAULT '';
ALTER TABLE brands ADD COLUMN IF NOT EXISTS content_examples TEXT DEFAULT '';
ALTER TABLE brands ADD COLUMN IF NOT EXISTS launch_phase TEXT DEFAULT 'pre-launch' CHECK (launch_phase IN ('pre-launch', 'launch', 'growth'));
