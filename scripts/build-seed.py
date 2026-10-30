#!/usr/bin/env python3
"""Build seed data for MONSTIEZ Universe from honestly-observed public sources.

Sources used (all public, no auth, no secrets):
1. bm-tracker.com public /api/overview  — observed 2026-10-30 (credited; readings only)
2. Kworb public artist songs page        — dated 2026-10-28 (robots.txt: Allow: /)
3. Prior session manual watch-page observations — dated 2026-10-29 (in repo worklog)

Output: data/catalog.json, data/series/youtube.json, data/series/spotify.json
"""
import json, re, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data")
os.makedirs(os.path.join(DATA, "series"), exist_ok=True)

OBSERVED_AT = "2026-10-30T09:00:00Z"
BMT_URL = "https://bm-tracker.com/"
BMT_API = "https://bm-tracker.com/api/overview"
KWORB_URL = "https://kworb.net/spotify/artist/1SIocsqdEefUTE6XKGUiVS_songs.html"
CHANNEL_ID = "UCqwUnggBBct-AY2lAdI88jQ"   # verified: BM Tracker channels list + prior session official-page check
ARTIST_ID = "1SIocsqdEefUTE6XKGUiVS"

# ---- prior session manual observations (2026-10-29) ----
PRIOR = [
    {"id": "wlHwjkYpSr0", "title": "BABYMONSTER - 'WE GO UP' M/V", "views": 228252529,
     "at": "2026-10-29T06:05:00Z", "url": "https://www.youtube.com/watch?v=wlHwjkYpSr0"},
    {"id": "oC6brLXQe4I", "title": "BABYMONSTER - 'DESERVE' M/V", "views": 66334830,
     "at": "2026-10-29T06:07:00Z", "url": "https://www.youtube.com/watch?v=oC6brLXQe4I"},
]

def num(s):
    return int(s.replace(",", "").strip())

def main():
    overview = json.load(open("/tmp/bmt_overview.json"))
    kworb_html = open("/tmp/kworb_songs.html", encoding="utf-8", errors="replace").read()

    # ---------- catalog ----------
    channels = [{"id": c["id"], "title": c["title"], "videoCount": c["videos"]}
                for c in overview["channels"]]
    tags = [{"slug": t["slug"], "label": t["label"], "colour": t.get("colour")}
            for t in overview["tags"]]
    works = [{"id": w["id"], "name": w["name"]} for w in overview["works"]]
    notes = [{"id": n["id"], "day": n["day"], "text": n["text"], "scope": n["scope"],
              "itemId": n.get("item_id"), "workId": n.get("work_id")}
             for n in overview["notes"]]

    videos = []
    for v in overview["youtube"]:
        videos.append({
            "id": v["id"], "title": v["title"], "tag": v["tag"],
            "channelId": v["channel_id"], "channel": v["channel"],
            "publishedAt": v["published_at"], "thumb": v["thumb"],
            "workIds": v.get("work_ids", []),
        })

    songs = []
    for s in overview["spotify"]:
        songs.append({
            "key": s["key"], "name": s["name"], "trackId": s["track_id"],
            "albumId": s["album_id"], "album": s["album"], "albumType": s["album_type"],
            "releaseDate": s["release_date"], "datePrecision": s["date_precision"],
            "trackNo": s.get("track_no"), "discNo": s.get("disc_no"),
            "durationMs": s.get("duration_ms"), "cover": s.get("cover"),
            "workIds": s.get("work_ids", []),
        })

    catalog = {
        "meta": {
            "version": 1,
            "note": "Entity catalogue. Release set and grouping follow the publicly visible set used by bm-tracker.com (observed 2026-10-30); entity metadata (titles, IDs, dates) comes from the platforms themselves. This catalogue lists BABYMONSTER-related videos from 10 channels and 44 Spotify recordings grouped into 27 works.",
            "sources": [
                {"name": "BM Tracker public overview", "url": BMT_API, "observedAt": OBSERVED_AT, "method": "public-api-observation", "isOfficial": False},
                {"name": "Kworb", "url": KWORB_URL, "observedAt": "2026-10-28", "method": "public-page-parse", "isOfficial": False},
            ],
        },
        "channelId": CHANNEL_ID, "artistId": ARTIST_ID,
        "channels": channels, "tags": tags, "works": works, "notes": notes,
        "videos": videos, "songs": songs,
    }

    # ---------- youtube series ----------
    yt_series = {
        "meta": {
            "version": 1,
            "description": "Cumulative daily snapshots. Each value was observed on its date from the cited source. No interpolation: missing days are simply absent. estimated=true means the value came from a source that derived it (marked for honesty).",
            "unit": "views / subscribers (count)",
            "collectionPlan": "Daily via GitHub Action. Official YouTube Data API when YOUTUBE_API_KEY secret is configured; otherwise no automatic collection.",
        },
        "channel": {
            "id": CHANNEL_ID, "title": "BABYMONSTER",
            "subscribers": {
                "2026-10-30": {"v": 13500000, "precision": "rounded", "estimated": False,
                                "source": BMT_URL, "method": "public-api-observation"},
            },
            "views": {
                "2026-10-30": {"v": 10587102276, "estimated": False,
                                "source": BMT_URL, "method": "public-api-observation"},
            },
        },
        "videos": {},
    }
    for v in overview["youtube"]:
        day = {}
        views = v.get("views")
        likes = v.get("likes")
        if views is not None:
            day["views"] = {"2026-10-30": {"v": views, "estimated": False,
                                            "source": BMT_API, "method": "public-api-observation"}}
        if likes is not None:
            day["likes"] = {"2026-10-30": {"v": likes, "estimated": False,
                                            "source": BMT_API, "method": "public-api-observation"}}
        if day:
            yt_series["videos"][v["id"]] = day
    # merge prior session's earlier observations (second dated point => first real charts)
    for p in PRIOR:
        vid = yt_series["videos"].setdefault(p["id"], {})
        vw = vid.setdefault("views", {})
        vw["2026-10-29"] = {"v": p["views"], "estimated": False, "source": p["url"],
                             "method": "manual-public-observation", "note": "Observed by hand on the public watch page (prior agent session, recorded in handoff)."}

    # ---------- spotify series ----------
    # kworb track rows: <td class="text"><a href=".../track/{id}">TITLE</a></td><td>total</td><td>daily</td>
    rows = re.findall(r"<tr[^>]*>(.*?)</tr>", kworb_html, re.S)
    kworb_tracks = []
    for r in rows:
        m = re.search(r'href="https://open\.spotify\.com/track/([A-Za-z0-9]+)"[^>]*>(.*?)</a>.*?<td>([\d,]+)</td><td>([\d,]+)</td>', r, re.S)
        if not m:
            continue
        kworb_tracks.append({
            "trackId": m.group(1),
            "title": re.sub(r"<[^>]+>", "", m.group(2)).strip(),
            "total": num(m.group(3)),
            "daily": num(m.group(4)),
        })

    sp_series = {
        "meta": {
            "version": 1,
            "description": "Cumulative daily play-count snapshots per track (Kworb public page, dated) plus artist followers/listeners observations.",
            "unit": "plays / followers / monthly listeners",
            "collectionPlan": "Daily Kworb page parse via GitHub Action (robots.txt allows). Figures are third-party public stream figures, NOT Spotify Web API output (the Spotify Web API does not publish stream totals).",
            "kworbUpdatedAt": "2026-10-28",
        },
        "artist": {
            "id": ARTIST_ID, "name": "BABYMONSTER",
            "followers": {
                "2026-10-28": {"v": 9291034, "estimated": False, "source": BMT_API,
                                "method": "public-api-observation"},
            },
            "monthlyListeners": {
                "2026-10-28": {"v": 7730101, "estimated": False, "source": BMT_API,
                                "method": "public-api-observation"},
            },
        },
        "tracks": {},
    }
    # spotify track seeds from BM Tracker overview (stat_date 2026-10-28) — plays per track
    for s in overview["spotify"]:
        if s.get("plays") is None:
            continue
        day = s.get("stat_date", "2026-10-28")
        sp_series["tracks"].setdefault(s["key"], {})[day] = {
            "v": s["plays"], "estimated": False, "source": BMT_API,
            "method": "public-api-observation",
        }

    # kworb cross-check: Kworb is the ongoing provider, so its reading becomes the
    # primary value for 2026-10-28 and the BM Tracker same-day reading is kept as `alt`.
    by_track_id = {s["trackId"]: s["key"] for s in songs}
    kworb_seeded, kworb_agree, kworb_differ = 0, 0, 0
    for kt in kworb_tracks:
        key = by_track_id.get(kt["trackId"])
        if not key:
            continue
        days = sp_series["tracks"].setdefault(key, {})
        existing = days.get("2026-10-28")
        entry = {
            "v": kt["total"], "estimated": False, "source": KWORB_URL,
            "method": "public-page-parse", "daily": kt["daily"],
            "note": "Kworb public page dated 2026-10-28 (third-party public stream figures).",
        }
        if existing and existing["v"] == kt["total"]:
            kworb_agree += 1
        elif existing:
            kworb_differ += 1
            entry["alt"] = {"v": existing["v"], "source": existing["source"], "method": existing["method"]}
        days["2026-10-28"] = entry
        kworb_seeded += 1

    json.dump(catalog, open(os.path.join(DATA, "catalog.json"), "w"), ensure_ascii=False, indent=1)
    json.dump(yt_series, open(os.path.join(DATA, "series", "youtube.json"), "w"), ensure_ascii=False, indent=1)
    json.dump(sp_series, open(os.path.join(DATA, "series", "spotify.json"), "w"), ensure_ascii=False, indent=1)

    print(f"catalog: {len(videos)} videos, {len(songs)} songs, {len(works)} works, {len(notes)} notes, {len(channels)} channels, {len(tags)} tags")
    print(f"youtube series: channel + {len(yt_series['videos'])} videos observed 2026-10-30; 2 prior 2026-10-29 observations merged")
    print(f"kworb parsed tracks: {len(kworb_tracks)}; seeded: {kworb_seeded} (same-day agree: {kworb_agree}, differ-but-kept-both: {kworb_differ})")
    print(f"spotify series: {len(sp_series['tracks'])} tracks")

if __name__ == "__main__":
    main()
