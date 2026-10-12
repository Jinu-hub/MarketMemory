# Market Signal — 확장 브리프 (한국어)

> 영문 원본: [`EXPANSION.md`](./EXPANSION.md)  
> LLM / 이후 구현자 + 제품 해석용. **집계 기준을 잘못 읽지 않도록** Count / minCount 절을 특히 명확히 적었습니다.

## 0. 제품 맥락

Market Memory는 CRUD/관리자 대시보드가 아니라 **콘텐츠 + 데이터 인텔리전스** 제품입니다.
Market Signal은 **인사이트 중심 랭킹 레이어**입니다. 시장 콘텐츠에서 반복적으로 등장하는 엔티티/태그를 기간별 스냅샷으로 모읍니다.

- 현재 UI: `/insights/market-signals` (`MARKET_SIGNAL_VISIBILITY`로 관리자 전용 미리보기)
- 현재 데이터: scope `global-market-issues` 만

---

## 1. 현재 아키텍처 (다시 만들지 말 것)

### 데이터 모델

- `market_signal_snapshots` — `(scope_type, scope_key, period_type, period_key)` 당 1행
- `market_signal_items` — 스냅샷 안의 랭킹 시그널 (count, trend, strength)
- `market_signal_snapshot_sources` — 그 스냅샷에 집계된 원본 계보(lineage)

### 기간 / 상태

- `period_type`: `weekly` | `monthly` | `yearly` (ISO 주 / 달력 월 / 달력 연)
- `status`: `draft` = **집계중**(아직 갱신됨) | `final` = **확정**(기간 종료)
- UI에서 draft는 “문서 초안”이 아니라 **집계중 / In progress** 의미

### 계층 (필수)

```
일별 소스(daily sources)
  → 주간 스냅샷   (leaf 집계)
  → 월간 스냅샷   (주간 rollup, prorate B)
  → 연간 스냅샷   (월간 rollup)
```

월간/연간을 만들 때 **매일 `item_contents`를 다시 전수 스캔하지 말 것.**
월간/연간은 **자식 스냅샷**을 읽고, 원본 리포트를 다시 긁지 않습니다.

### Prorate 규칙 (B) — 주간 → 월간

ISO 주는 달력 월을 가로지릅니다. 주간 → 월간 rollup 시:

- leaf 소스의 `market_date`를 사용 (주간 `snapshot_sources` + 아이템 메타의 `source_item_content_ids`)
- **대상 월 안에 들어가는 날짜**에 대해서만 시그널을 카운트
- “목요일 규칙”만으로 주 전체를 한 달에 몰아넣지 말 것

### Count 의미 (자주 오해하는 부분)

**시그널 = “한 번이라도 나오면 등록”이 아닙니다.**

1. **문서(소스) 1건 안에서는** `(signal_type, signal_key)` 당 **최대 1회**만 셉니다.  
   같은 날/같은 digest에 같은 태그가 여러 번 나와도 1입니다.
2. **주간 count** = 그 주에 포함된 **서로 다른 소스(보통 서로 다른 날짜의 digest)** 에서 등장한 횟수의 합.
3. **월간** = 겹치는 주간들의 leaf 기여를 prorate 해서 합산.
4. **연간** = 월간 count 합 (월은 겹치지 않음).
5. **랭킹 포함 기본값: `minCount >= 2`**  
   - 즉 **서로 다른 소스에서 2번 이상** 나온 것만 `market_signal_items`에 남깁니다.  
   - 소스 1~2개뿐인 주 초/월 초에 화면이 거의 비는 것은 **버그가 아니라 정상**인 경우가 많습니다.  
   - 예: 소스 2건 + minCount=2 → **양쪽 문서에 공통으로 나온 키만** 표시.

### 추출 범위 (무엇을 세나)

현재 extractor `metadata-v1`:

- 사용: `metadata.entities.*` + `metadata.tags.core`
- **사용하지 않음**: `topHardTags` / `topSoftTags` (Tier-1 아님)

소스 필터 (`global-market-issues`):

- `report_type = digest-report`
- 제목이 `글로벌 시장 이슈` / `글로벌 시장 주요 이슈` 로 시작

다른 리포트 라인(deep_dive 등)의 메타는 **이 scope 집계에 들어가지 않습니다.**

### UI 레이어 (표시만 분리, 수집은 그대로)

- **테마·엔티티**: `country` / `region` 제외
- **지역**: `country` / `region` 만  
지역이 항상 상위권을 먹어서, 기본 뷰는 테마·엔티티입니다. (`?layer=geo`로 지역)

### Trend

- **같은 period_type의 직전 기간**과 비교 (이전 주 / 이전 월 / 이전 연)
- 종류: `rising` | `falling` | `new` | `stable`

### 파이프라인 모드

- `backfill` — 초기/이력 재구축 (비쌈, 드물게)
- `discover_and_aggregate` — 증분 cron
  - weekly: **현재** ISO 주만; `snapshot_sources`로 pending `item_content` 발견
  - monthly: **현재** 월의 주간 스냅샷 rollup
  - yearly: **현재** 연의 월간 rollup
- 기간이 끝난 `draft`는 `final`로 승격해야 함 (영원히 draft로 두지 말 것)

### Cron 의도

- 매일 → `periodTypes: ["weekly"]`
- 매주 → `periodTypes: ["monthly"]`
- 매월 → `periodTypes: ["yearly"]`
- 일일 cron에 full `backfill` 넣지 말 것

### 권한 / 노출

- 플래그: `app/features/market-signals/lib/visibility.ts` 의 `MARKET_SIGNAL_VISIBILITY`
  - `"admin"` (현재) → `"authenticated"` → `"public"`
- 사이드바 `adminOnly`도 이 플래그에 연결
- RLS: 현재 authenticated SELECT, 쓰기는 admin. 공개 시 anon SELECT 검토 가능

### 주요 코드 경로

- Cron: `app/features/cron/lib/market-signal/`
  - `pipeline.server.ts`, `rollup.server.ts`, `discover.server.ts`, `persist.server.ts`, `period.ts`
  - selector: `source-selectors/global-market-issues.ts`
  - extractor: `extractors/metadata-v1.ts`
- UI: `app/features/market-signals/`
- API: `POST /api/cron/market-signal` (Authorization = `CRON_SECRET`, Bearer 없음)
- Dev: `scripts/run-market-signal-pipeline.mts`

---

## 2. 확장 트랙 (절대 섞지 말 것)

확장은 **두 갈래**입니다. 카운트를 한 스냅샷에 대충 합치지 마세요.

### Track A — Scope 확장 (더 많은 리포트)

**목표:** Global Market Issues(GMI) 밖으로, 필요 시 “전체 리포트”까지.

| 항목 | 가이드 |
|------|--------|
| 방식 | registry에 새/넓은 `scope_key` + selector |
| 소스 | 여전히 `item_contents` (+ 버전 올리지 않는 한 metadata-v1) |
| 계층 | 동일 daily→weekly→monthly→yearly |
| 권장 | **라인별 scope** 유지 + 선택적으로 별도 `all-reports` / `global` |
| 안티패턴 | GMI scope를 “전부”로 덮어써서 라인별 drilldown 상실 |

예시:

- `scope_key = global-market-issues` (현재)
- `scope_key = weekly-ai-issue-digest` (예시)
- `scope_key = all-item-contents` 또는 `scope_type = global` (교차 라인; 정의 신중히)

### Track B — 집계 유형 확장 (Daily Market Memory)

**목표:** 이미 일별 합성인 `daily_market_memories`에서 시그널 레이어.

| 항목 | 가이드 |
|------|--------|
| 방식 | 새 `scope_key` 예: `daily-market-memory` |
| 소스 | `source_kind = daily_market_memory` |
| Extractor | DMM 필드용 **새 extractor** (metadata-v1 맹목 재사용 금지) |
| 계층 | DMM 일별 → weekly→monthly→yearly 가능 |
| 안티패턴 | raw `item_contents`와 **같은 스냅샷에** DMM count 합치기 → **이중 집계** |

DMM은 이미 하루 여러 리포트를 합친 결과입니다. raw와 합치면 의미가 깨집니다.

---

## 3. 하드 제약 / 경고

1. **일일 cron에서 전체 이력 재구축 금지** — discover + 열린 기간만.
2. **닫힌 `final`을 `draft`로 되돌리지 말 것** (`finalize: false`로 전 이력 재실행 금지).
3. **기간 인식 상태**: 열린 기간 → draft/집계중; `referenceDate > period_end` → final.
4. **ISO 주 vs 달력 월**: 월간 rollup은 항상 `market_date`로 prorate.
5. **`minCount=2`**: 주·월 초반에 UI가 비는 것은 대개 **정상**.
6. **멱등 persist**: snapshot upsert, 해당 snapshot의 items + sources 교체.
7. **계보**: 월간 소스 = `weekly_snapshot`; 연간 = `monthly_snapshot`; 주간 = `item_content` (Track B면 DMM).
8. **UI는 Content Layer**: InsightCard / 읽기 계층. light / dark / warm, semantic 토큰.
9. **i18n**: 의미 기반 키; 화면 문구는 `marketSignals.*`.
10. **Nex**는 `~/core/components/nex` barrel import.

---

## 4. 권장 구현 순서

1. GMI(현재) 안정화 — weekly discover + monthly/yearly cron
2. **Track A**: 리포트 라인 selector + scope 하나 추가 → backfill → UI scope 전환
3. **Track A 옵션**: `all-reports` / global (report_types, active/public 명시)
4. **Track B**: DMM selector + extractor + 별도 scope; Track A count와 합치지 말 것
5. 준비되면 `MARKET_SIGNAL_VISIBILITY` 확대

---

## 5. UI 확장 방향

```
Market Signals
  ├─ Global Market Issues     (Track A — 현재)
  ├─ <다른 리포트 라인>        (Track A)
  ├─ All reports (옵션)       (Track A — 신중)
  └─ Daily Market Memory      (Track B)
       └─ Weekly | Monthly | Yearly
```

같은 UX 패턴 (기간 탭, 랭크, trend, draft=집계중 / final=확정).
쿼리 레이어는 이미 `scopeKey` 지원; 화면은 아직 `MARKET_SIGNAL_DEFAULT_SCOPE_KEY` 고정.

---

## 6. 확장 PR “완료” 체크리스트

- [ ] 새 selector(또는 DMM extractor) + 명확한 `scope_key`
- [ ] 해당 scope만 backfill
- [ ] discover/cron이 open period / rollup에 맞게 scoped
- [ ] `snapshot_sources` lineage 올바름
- [ ] UI scope 전환(또는 전용 라우트), count 섞지 않음
- [ ] 기존 GMI / DMM과 이중 집계 없음
- [ ] i18n + visibility는 의도할 때만 변경
- [ ] 새 count 의미 또는 minCount 예외는 **문서에 기록**

---

## 7. Non-goals (명시 요청 없으면 하지 않음)

- 읽기/리포트 UX를 BI 차트 벽으로 대체
- `weekly-market-issues` **시리즈**를 일별 GMI 시그널 소스로 사용 (그 시리즈는 큐레이션 읽기용)
- `item_tags` / soft tags를 Tier-1 count로 취급 (Tier-1은 entities + tags.core, 버전 bump 전까지)
- Track A와 Track B를 “편하자고” 한 scope로 병합

---

## 8. 한 줄 북극성

**Market Signal = scope(콘텐츠 패밀리)별로, 계보가 있는 “계속 등장하는 것”의 기간 랭킹이다. raw 리포트와 이미 합성된 DMM을 무식하게 섞지 않는다. 한 번 나온 것만으로는 시그널이 아니고, 기본은 2번 이상이다.**
