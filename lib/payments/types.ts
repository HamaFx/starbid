export type CheckoutParams = {
  amountCents: number;
  pendingBidId: string;
};

export type CheckoutResult = {
  checkoutUrl: string;
  pendingBidId: string;
};

export type LemonSqueezyOrderPayload = {
  meta?: {
    event_name?: string;
    custom_data?: { pending_bid_id?: string };
  };
  data?: {
    type?: string;
    id?: string;
    attributes?: {
      total?: number;
      currency?: string;
      status?: string;
      order_number?: number;
    };
  };
};

export type ParsedOrder = {
  eventName: string;
  orderId: string;
  pendingBidId: string;
  amountCents: number | null;
};
