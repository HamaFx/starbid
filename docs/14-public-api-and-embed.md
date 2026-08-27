# StarBid Public API and Embed

StarBid exposes only active public projection data. It never exposes emails, claim hashes, pending bids, moderation records, or payment data.

## Public endpoints

```text
GET https://starboard-silk.vercel.app/api/public/stars
GET https://starboard-silk.vercel.app/api/public/events?limit=50
GET https://starboard-silk.vercel.app/api/embed
GET https://starboard-silk.vercel.app/api/embed/script
```

Public API responses are rate-limited per source address and briefly cached.

## Iframe embed

```html
<iframe src="https://starboard-silk.vercel.app/api/embed" title="StarBid live galaxy" loading="lazy" style="width:100%;min-height:260px;border:0;border-radius:12px"></iframe>
```

## Script embed

```html
<script async src="https://starboard-silk.vercel.app/api/embed/script"></script>
```

The script inserts a read-only iframe before itself. The embed cannot create stars, modify rankings, access owner data, or access claim tokens.

## Owner analytics API

The manage page contains the owner analytics panel. Integrations may use:

```text
GET /api/public/analytics?star_id=<id>&key=<claim-token>
```

This returns aggregate clicks, bid-event count, current total, and last bid time. It is private, uncached, and requires the bearer claim token.
