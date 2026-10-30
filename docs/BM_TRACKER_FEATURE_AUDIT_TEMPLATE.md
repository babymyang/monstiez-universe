# BM Tracker Feature Audit — Evidence Template

**Reference guide:** https://bm-tracker.com/user-guide  
**Main site:** https://bm-tracker.com/  
**Audited by:**  
**Audit date/time/timezone:**  
**Browser/runtime:**  
**Viewport sizes tested:**  

> Complete this document in the Super Z browser. Do not fill uncertain rows from assumptions. Use screenshots and direct guide observations as evidence.

## 1. Guide structure

| Order | Guide section / heading | What it explains | Screenshot / anchor | Read completely? |
|---:|---|---|---|---|

## 2. Navigation and screen inventory

| Feature ID | Exact page/nav label | Route | Publicly accessible? | Main purpose | Screenshot evidence | Status |
|---|---|---|---|---|---|---|

## 3. Feature-by-feature audit

| Feature ID | Exact feature label | User guide section | Inputs / filters | Displayed output | Actions / interactions | Formula / definition | Data source evidence | Refresh / history | MONSTIEZ target | Test ID | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|

## 4. Charts and metrics

| Chart / metric | Units | Time range | Aggregation | Tooltip details | Data provider | Data timestamp | Caveats / edge cases |
|---|---|---|---|---|---|---|---|

## 5. Tables, exports and details

| Table / page | Columns | Sorting / filters | Pagination | Drill-down | Export | Notes |
|---|---|---|---|---|---|---|

## 6. Network/provider observations

| UI feature | Request host | Public path / method | Response shape / important fields | Initiator | Auth required? | Apparent schedule | Evidence / confidence |
|---|---|---|---|---|---|---|---|

Do not store access tokens, cookies, user identifiers or private response data here.

## 7. User/account/settings flows

Record only what is visible and publicly accessible. Note whether login is required and what works without login. Do not bypass authentication.

## 8. Responsive and state behaviour

| Page | Mobile layout | Desktop layout | Loading | Empty | Error | Offline / stale | Accessibility notes |
|---|---|---|---|---|---|---|---|

## 9. Parity coverage ledger

| Feature ID | Confirmed reference behaviour | MONSTIEZ implementation file/component | Tests/evidence | Commit | Status / blocker |
|---|---|---|---|---|---|

## 10. Unresolved questions

| Question | Why it matters | Evidence attempted | What is still unknown | Next safe step |
|---|---|---|---|---|

## Status definitions

- `confirmed`: directly observed in guide/site with supporting screenshot or request evidence.
- `partially-confirmed`: some behaviour was observed, but a formula/source/edge case is unknown.
- `not-accessible`: page/feature could not be reached in the public session; do not infer its behaviour.
- `not-present`: the guide and public site were checked and the feature was not found.
