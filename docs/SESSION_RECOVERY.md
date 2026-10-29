# SESSION RECOVERY — MONSTIEZ Universe

A fresh agent must be able to resume **from GitHub alone**. Follow exactly.

## Durable state model

| State | Where |
|---|---|
| Code, docs, worklog, data | GitHub repo `babymyang/monstiez-universe`, branch `main` |
| Task tracker | GitHub Issues on that repo (labels: `type:*`, `area:*`, `priority:*`) |
| Task history / audit | `WORKLOG.md` (append-only entries, newest at bottom of "Session" list) |
| Visual reference | `handoff-extract/a_wide_clean_pastel_ui_mockup_scene_showing_four.png` — **not committed** (licensing caution); re-obtain from the user's original handoff zip if lost |
| Ephemeral workspace | `/home/z/my-project` — assume it can vanish anytime |

## Recovery procedure (exact commands)

```bash
# 1. Fresh workspace setup
cd /home/z/my-project
curl -s https://z-cdn.chatglm.cn/fullstack/init-fullstack.sh | bash   # sandbox Next.js 16 scaffold + dev server
# 2. Reconnect the durable repo (won't overwrite uncommitted work)
git remote -v   # must be https://github.com/babymyang/monstiez-universe.git
git add -A && git status --short --branch   # inspect BEFORE touching anything
git pull --no-rebase origin main              # reconcile, resolve manually if diverged
# 3. Read durable context IN THIS ORDER:
#    WORKLOG.md  →  docs/SESSION_RECOVERY.md  →  AGENTS.md  →  open GitHub issues (gh issue list / API)
# 4. Resume the "Next action" stated at the bottom of WORKLOG.md
```

## Credentials

GitHub push/pull uses the local credential store at `/home/z/.git-credentials`
(`git config --global credential.helper "store --file=/home/z/.git-credentials"`).
The token is **never** committed to the repo. If the credential file is gone,
ask the operator for the current token; never paste tokens into files, logs, or issues.

## Rules for resuming

1. Never `reset --hard`, `push --force`, or discard uncommitted changes you did not create.
2. Re-verify the last commit on `origin/main` before continuing (`git log origin/main -1`).
3. Work is issue-linked: pick the lowest-numbered open issue whose dependencies are met.
4. A task is done only when: implementation + tests + worklog entry + commit + verified push + issue updated.
5. The dev server runs automatically on port 3000; check `/home/z/my-project/dev.log` for runtime errors.

## Current snapshot (updated: 2026-10-29, session 1 — post-implementation)

- Branch `main` — all work committed & pushed (see WORKLOG for hash chain, latest = final docs commit).
- Issues #2–#7 implemented & closed with evidence; #1, #8 closing with final commit.
- App fully implemented: 4 reference screens + 3 supporting routes, data w/ provenance, PWA verified offline.
- Environment limitation on record: youtube RSS blocked in sandbox → curated fallback active.
- Next best action: optional CI workflow for RSS refresh; per-member content curation; real-device install test.
