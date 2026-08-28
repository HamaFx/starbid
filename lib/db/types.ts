import type { PendingBidKind, PendingBidStatus, StarStatus } from "@/lib/types";

type Project = {
  id: string; name: string; logo_url: string | null; link_url: string;
  x_handle: string | null; email: string | null; claim_token_hash: string;
  verified: boolean; is_founding: boolean; is_demo: boolean; is_banned: boolean; created_at: string;
};
type StarRow = {
  id: string; project_id: string; total_bid_cents: number; angle_seed: number;
  d_name: string; d_logo_url: string | null; d_link_url: string; d_x_handle: string | null;
  d_verified: boolean; d_is_founding: boolean; d_is_demo: boolean; entered_at: string;
  immunity_until: string | null; status: StarStatus; updated_at: string;
};
type PendingBid = {
  id: string; kind: PendingBidKind; star_id: string | null; project_draft: Record<string, unknown> | null;
  claim_token_hash: string | null; amount_cents: number; status: PendingBidStatus;
  lemonsqueezy_order_id: string | null; created_at: string; confirmed_at: string | null;
};
type PublicStar = {
  star_id: string; project_id: string; total_bid_cents: number; angle_seed: number;
  entered_at: string; immunity_until: string | null; name: string; logo_url: string | null;
  link_url: string; x_handle: string | null; verified: boolean; is_founding: boolean; is_demo: boolean;
};

type Table<Row, Insert = Partial<Row>, Update = Partial<Row>> = { Row: Row; Insert: Insert; Update: Update; Relationships: [] };

export type Database = {
  public: {
    Tables: {
      projects: Table<Project>;
      stars: Table<StarRow>;
      pending_bids: Table<PendingBid>;
      bid_events: Table<{ id: string; star_id: string; project_id: string; pending_bid_id: string | null; amount_cents: number; resulting_total_cents: number; event_type: string; created_at: string }>;
      realtime_events: Table<{ id: number; event_sequence: number; topic: string; payload: Record<string, unknown>; created_at: string }, { topic: string; payload: Record<string, unknown> }, never>;
      zone_snapshots: Table<{ id: number; boundaries: Record<string, unknown>; computed_at: string }>;
      action_grants: Table<{ id: string; kind: "new_star" | "recover"; expires_at: string }>;
      moderation_flags: Table<{ id: string; project_id: string; reason: string; source: string; status: string; created_at: string }>;
      star_clicks: Table<{ star_id: string; click_day: string; visitor_hash: string; created_at: string }>;
    };
    Views: { public_stars: { Row: PublicStar; Insert: never; Update: never; Relationships: [] } };
    Functions: {
      get_pending_status: { Args: { p_pending_id: string }; Returns: { status: PendingBidStatus; star_id: string | null }[] };
      confirm_pending: { Args: { p_pending_id: string; p_ls_order_id: string; p_amount_cents?: number | null }; Returns: { star_id: string; event_type: string }[] };
      create_pending_new_star: { Args: { p_grant_id: string; p_draft: Record<string, unknown>; p_claim_token_hash: string; p_amount_cents: number }; Returns: string };
      create_pending_fuel: { Args: { p_star_id: string; p_claim_token: string; p_amount_cents: number }; Returns: string };
      list_public_stars: { Args: Record<string, never>; Returns: PublicStar[] };
      get_public_star: { Args: { p_star_id: string }; Returns: PublicStar[] };
      list_public_bid_events: { Args: { p_limit?: number }; Returns: { star_id: string; amount_cents: number; resulting_total_cents: number; event_type: string; created_at: string }[] };
      get_star_analytics: { Args: { p_star_id: string; p_claim_token: string }; Returns: { total_clicks: number; total_bid_events: number; total_bid_cents: number; last_bid_at: string | null }[] };
      get_star_analytics_history: { Args: { p_star_id: string; p_claim_token: string; p_days?: number }; Returns: { day: string; clicks: number; bid_events: number; bid_cents: number }[] };
      report_star: { Args: { p_project_id: string; p_reason: string }; Returns: string };
      issue_action_grant: { Args: { p_kind: "new_star" | "recover" }; Returns: string };
      get_project_email: { Args: { p_pending_id: string }; Returns: { email: string | null; project_name: string; star_id: string; amount_cents: number }[] };
      flag_project_chargeback: { Args: { p_order_id: string; p_reason?: string }; Returns: string };
      find_recovery_projects: { Args: { p_email: string }; Returns: { project_id: string; project_name: string; link_url: string }[] };
      admin_ban_project: { Args: { p_project_id: string; p_flag_id: string }; Returns: undefined };
      admin_revoke_project_token: { Args: { p_project_id: string; p_flag_id: string }; Returns: undefined };
    };
    CompositeTypes: Record<string, never>;
    Enums: Record<string, never>;
  };
};
