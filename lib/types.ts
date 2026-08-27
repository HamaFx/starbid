export type StarStatus = "active" | "withdrawn" | "banned";
export type PendingBidKind = "new_star" | "fuel";
export type PendingBidStatus =
  | "awaiting_payment"
  | "confirmed"
  | "expired"
  | "failed";
export type EventType = "spawn" | "fuel" | "singularity_takeover";

export type Star = {
  id: string;
  projectId: string;
  name: string;
  logoUrl: string | null;
  linkUrl: string;
  xHandle: string | null;
  totalBidCents: number;
  angleSeed: number;
  enteredAt: string;
  verified: boolean;
  isFounding: boolean;
  isDemo: boolean;
  status: StarStatus;
};

export type PublicStarRow = {
  star_id: string;
  project_id: string;
  total_bid_cents: number;
  angle_seed: number;
  entered_at: string;
  immunity_until: string | null;
  name: string;
  logo_url: string | null;
  link_url: string;
  x_handle: string | null;
  verified: boolean;
  is_founding: boolean;
  is_demo: boolean;
};

export type ProjectDraft = {
  name: string;
  logo_url?: string | null;
  link_url: string;
  x_handle?: string | null;
  email: string;
};

export type GalaxyEvent = {
  starId: string;
  totalBidCents: number;
  eventType: EventType;
  name: string;
};

export type PendingStatus = {
  status: PendingBidStatus;
  star_id: string | null;
};

export function publicStarFromRow(row: PublicStarRow): Star {
  return {
    id: row.star_id,
    projectId: row.project_id,
    name: row.name,
    logoUrl: row.logo_url,
    linkUrl: row.link_url,
    xHandle: row.x_handle,
    totalBidCents: row.total_bid_cents,
    angleSeed: row.angle_seed,
    enteredAt: row.entered_at,
    verified: row.verified,
    isFounding: row.is_founding,
    isDemo: row.is_demo,
    status: "active",
  };
}
