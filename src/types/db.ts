export interface BillRow {
  id: string;
  congress: number;
  bill_type: string;
  number: string;
  title: string;
  introduced_date: string | null;
  latest_action_date: string | null;
  latest_action_text: string | null;
  origin_chamber: string | null;
  policy_area: string | null;
  legislation_url: string | null;
  action_count: number;
  is_abandoned: boolean;
  sponsor_name: string | null;
  sponsor_party: string | null;
  sponsor_state: string | null;
  sponsor_district: number | null;
  sponsor_bioguide_id: string | null;
  fetched_at: string;
}

export interface BillActionRow {
  id: string;
  bill_id: string;
  action_date: string | null;
  action_type: string | null;
  action_text: string | null;
}

// Supabase generic DB type wrapper
export interface Database {
  public: {
    Tables: {
      bills: {
        Row: BillRow;
        Insert: Partial<BillRow> & { id: string; congress: number; bill_type: string; number: string; title: string };
        Update: Partial<BillRow>;
      };
      bill_actions: {
        Row: BillActionRow;
        Insert: Omit<BillActionRow, "id">;
        Update: Partial<BillActionRow>;
      };
    };
  };
}
