# Market Signal — Expansion Brief (for LLM / future implementers)

## 0. Product context

Market Memory is a **content + data intelligence** product (reading + insight), not a CRUD/admin dashboard.
Market Signal is an **insight-first ranking layer**: period snapshots of recurring entities/tags from market content.

Current UI: `/insights/market-signals` (admin-only preview via `MARKET_SIGNAL_VISIBILITY`).
Current data: scope `global-market-issues` only.

---

## 1. Current architecture (do not reinvent)

### Data model

- `market_signal_snapshots` — one row per `(scope_type, scope_key, period_type, period_key)`
- `market_signal_items` — ranked signals inside a snapshot (count, trend, strength)
- `market_signal_snapshot_sources` — lineage of what was aggregated into that snapshot

### Identity / period

- `period_type`: `weekly` | `monthly` | `yearly` (ISO week / calendar month / calendar year)
- `status`: `draft` (= in progress / still updating) | `final` (= period closed)
- UI copy for draft should mean **“집계중 / In progress”**, not “document draft”

### Hierarchy (required)

```
daily sources
  → weekly snapshot   (leaf aggregate)
  → monthly snapshot  (rollup from weekly, prorate B)
  → yearly snapshot   (rollup from monthly)
```

**Do NOT** re-scan all daily `item_contents` to rebuild monthly/yearly on every cron.
Monthly/yearly read **child snapshots**, not raw reports.

### Prorate rule (B) — weekly → monthly

ISO weeks cross calendar months.
When rolling weekly → monthly:

- Use each leaf source’s `market_date` (via weekly `snapshot_sources` + item metadata `source_item_content_ids`)
- Count a signal only for dates that fall **inside the target month**
- Do not assign a whole ISO week to a single month by “Thursday rule” alone

### Count semantics

- One appearance per `(signal_type, signal_key)` per **episode/source row** (dedupe within one day/report)
- Weekly = sum of daily episodes in that week
- Monthly = sum of prorated leaf contributions from overlapping weeks
- Yearly = sum of monthly counts (months don’t overlap)
- Rank inclusion default: `minCount >= 2` (a month with only 1 daily source often shows **0 items** — expected)

### Trend

- Compare to **previous period of same type** (prev week / prev month / prev year)
- Types: `rising` | `falling` | `new` | `stable`

### Pipeline modes

- `backfill` — initial / rebuild historical periods (expensive; run rarely)
- `discover_and_aggregate` — incremental cron
  - weekly: only **current** ISO week; discover pending `item_content` via `snapshot_sources`
  - monthly: rollup from weekly snapshots for **current** month; detect child `updated_at` vs lineage hash
  - yearly: rollup from monthly for **current** year
- Closed `draft` periods must be promoted to `final` (status-only or re-aggregate if pending) — do not leave forever-draft

### Cron schedule intent

- Daily → `periodTypes: ["weekly"]`
- Weekly → `periodTypes: ["monthly"]`
- Monthly → `periodTypes: ["yearly"]`
- Never put full `backfill` on daily cron

### Auth / visibility

- Feature flag: `MARKET_SIGNAL_VISIBILITY` in `app/features/market-signals/lib/visibility.ts`
  - `"admin"` (current) → `"authenticated"` → `"public"`
- Sidebar `adminOnly` is tied to this flag
- RLS today: authenticated SELECT; writes admin. Public open may need anon SELECT later

### Key code paths

- Cron lib: `app/features/cron/lib/market-signal/`
  - `pipeline.server.ts`, `rollup.server.ts`, `discover.server.ts`, `persist.server.ts`, `period.ts`
  - selector: `source-selectors/global-market-issues.ts`
  - extractor: `extractors/metadata-v1.ts` (metadata.entities + metadata.tags.core)
- UI: `app/features/market-signals/`
- API: `POST /api/cron/market-signal` (Authorization = `CRON_SECRET`, no Bearer prefix)
- Dev script: `scripts/run-market-signal-pipeline.mts`

---

## 2. Expansion tracks (keep them separate)

There are **two different expansions**. Never merge their counts into one naive snapshot.

### Track A — Scope expansion (more reports)

**Goal:** Aggregate beyond Global Market Issues (GMI), up to “all reports”.

| Item | Guidance |
|------|----------|
| Mechanism | New or broader `scope_key` + selector in registry |
| Source | Still `item_contents` (+ same metadata extractor v1 unless versioned) |
| Hierarchy | Same daily→weekly→monthly→yearly |
| Preferred shape | Keep **per-line scopes** (e.g. GMI, AI digest) AND optionally a separate `all-reports` / `global` scope |
| Anti-pattern | Overwriting GMI scope with “everything” and losing line-level drilldown |

Examples:

- `scope_key = global-market-issues` (current)
- `scope_key = weekly-ai-issue-digest` (example)
- `scope_key = all-item-contents` or `scope_type = global` (cross-line; define carefully)

### Track B — Aggregation type expansion (Daily Market Memory)

**Goal:** Signal layer from `daily_market_memories` (already a daily synthesis).

| Item | Guidance |
|------|----------|
| Mechanism | New `scope_key` e.g. `daily-market-memory` |
| Source | `daily_market_memories` via `source_kind = daily_market_memory` |
| Extractor | DMM fields (`top_tags`, `top_entities`, `core_data.top_themes`, etc.) — **new extractor**, not metadata-v1 blindly |
| Hierarchy | Can still weekly→monthly→yearly from DMM daily rows / snapshots |
| Anti-pattern | Adding DMM counts into the same snapshot as raw `item_contents` → **double counting** and narrative conflict |

DMM already aggregates multiple reports/day. Combining with raw report stats destroys meaning.

---

## 3. Hard constraints / warnings

1. **No full historical rebuild on daily cron** — discover + open period only.
2. **Do not demote closed `final` periods to `draft`** by re-running with `finalize: false` over all history.
3. **Period-aware status**: open period → draft/집계중; `referenceDate > period_end` → final.
4. **ISO week vs calendar month**: always prorate by `market_date` for monthly rollup.
5. **minCount=2**: sparse early-month/early-week empty UI is often correct, not a bug.
6. **Idempotent persist**: upsert snapshot, replace items + sources for that snapshot.
7. **Lineage**: monthly sources = `weekly_snapshot`; yearly sources = `monthly_snapshot`; weekly sources = `item_content` (or DMM for Track B).
8. **UI is Content Layer**: InsightCard / reading hierarchy; not admin CRUD tables. Themes: light / dark / warm; prefer semantic tokens.
9. **i18n**: meaning-based keys; page strings under `marketSignals.*`; reuse `common`/`navigation` when applicable.
10. **Nex components** from `~/core/components/nex` barrel imports.

---

## 4. Recommended implementation order

1. Stabilize GMI (current) — weekly discover cron + monthly/yearly cron jobs
2. **Track A**: add one more report-line selector + scope; reuse pipeline; backfill that scope; add scope switcher in UI
3. **Track A optional**: `all-reports` / global scope with explicit definition (which report_types, active/public filters)
4. **Track B**: DMM selector + extractor + separate scope; never merge with Track A counts
5. Flip `MARKET_SIGNAL_VISIBILITY` when ready for broader audience

---

## 5. UI expansion direction

Market Signals hub should support multiple scopes:

```
Market Signals
  ├─ Global Market Issues     (Track A — current)
  ├─ <Other report line>      (Track A)
  ├─ All reports (optional)   (Track A — careful)
  └─ Daily Market Memory      (Track B)
       └─ Weekly | Monthly | Yearly
```

Same UX patterns (period tabs, rank list, trend badges, draft=집계중 / final=확정).
Query layer already accepts `scopeKey`; screen currently hardcodes `MARKET_SIGNAL_DEFAULT_SCOPE_KEY`.

---

## 6. What “done” looks like for an expansion PR

- [ ] New selector registered (or DMM extractor) with clear `scope_key`
- [ ] Backfill for that scope only (not unrelated scopes)
- [ ] Discover/cron path scoped correctly (open period / rollup)
- [ ] `snapshot_sources` lineage correct for the layer
- [ ] UI scope switch (or dedicated route) without mixing counts
- [ ] No double-count with existing GMI or DMM
- [ ] i18n + admin/public visibility unchanged unless intentional
- [ ] Document any new count semantics or minCount overrides

---

## 7. Non-goals (unless explicitly requested)

- Replacing reading/report UX with a BI dashboard wall of charts
- Using `weekly-market-issues` **series** as the daily GMI signal source (that series is curated reading, not the daily GMI identity)
- Treating `item_tags` / soft tags as Tier-1 counts (Tier-1 is metadata.entities + tags.core unless version bumped)
- Merging Track A and Track B into one scope “for convenience”

---

## 8. One-sentence north star

**Market Signal = period-ranked, lineage-backed observation of what keeps showing up — by content family (scope), never by naively blending raw reports with already-synthesized DMM.**
