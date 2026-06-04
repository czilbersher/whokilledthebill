-- WhoKilledTheBill — initial schema
-- Run this in: https://supabase.com/dashboard/project/xexusugnryorvcwsddfo/sql

CREATE TABLE IF NOT EXISTS bills (
  id                  text PRIMARY KEY,          -- "119-hr-110"
  congress            integer       NOT NULL,
  bill_type           text          NOT NULL,    -- hr, s, hjres, sjres, hres, sres, hconres, sconres
  number              text          NOT NULL,
  title               text          NOT NULL,
  introduced_date     date,
  latest_action_date  date,
  latest_action_text  text,
  origin_chamber      text,                      -- House | Senate
  policy_area         text,
  legislation_url     text,
  action_count        integer       DEFAULT 0,
  is_abandoned        boolean       DEFAULT false,
  -- Denormalised sponsor fields for fast filtering without joins
  sponsor_name        text,
  sponsor_party       text,                      -- R | D | I
  sponsor_state       text,
  sponsor_district    integer,
  sponsor_bioguide_id text,
  fetched_at          timestamptz   DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bill_actions (
  id          uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  bill_id     text    REFERENCES bills(id) ON DELETE CASCADE,
  action_date date,
  action_type text,
  action_text text
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_bills_abandoned         ON bills (is_abandoned, latest_action_date);
CREATE INDEX IF NOT EXISTS idx_bills_congress          ON bills (congress);
CREATE INDEX IF NOT EXISTS idx_bills_sponsor_party     ON bills (sponsor_party);
CREATE INDEX IF NOT EXISTS idx_bills_origin_chamber    ON bills (origin_chamber);
CREATE INDEX IF NOT EXISTS idx_bills_policy_area       ON bills (policy_area);
CREATE INDEX IF NOT EXISTS idx_bill_actions_bill_id    ON bill_actions (bill_id);

-- Disable RLS — these are public congressional records
ALTER TABLE bills        DISABLE ROW LEVEL SECURITY;
ALTER TABLE bill_actions DISABLE ROW LEVEL SECURITY;
