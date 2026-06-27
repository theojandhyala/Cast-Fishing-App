#!/usr/bin/env python3
"""
Generate data/overtureFishingSpots.generated.ts from Overture Maps.

Source: Overture Maps `base` theme, `water` type (GeoParquet on public S3).
Overture water is OpenStreetMap-derived and openly licensed (ODbL / CDLA-Permissive-2.0).
We keep only NAMED, plottable, reasonably-sized inland & coastal water features
(lakes, ponds, reservoirs, rivers, streams, canals, springs) and assign each to a
country bucket with quotas so the UK & Ireland, Europe, the United States and Canada
are all represented. Coordinates are the bbox centre (Overture ships a bbox struct,
so no spatial/geometry parsing is needed). Species are intentionally left blank here;
they are inferred at runtime by region in data/speciesEnrichment.ts, and every record
flows through normalizeFishingSpot + verifyFishingSpot in data/fishingSpots.ts.

Requires: pip install pyarrow requests
Usage:    python3 scripts/generate-overture-fishing-spots.py [RELEASE]
          RELEASE defaults to the latest known release below.

Reads the parquet over HTTPS with range requests (footer + only the row groups whose
bbox overlaps the target regions), so it never downloads whole multi-GB files unless
your network makes whole-file download faster (see README in commit message).
"""
import io, json, sys, time, collections
import requests
import pyarrow.parquet as pq

RELEASE = sys.argv[1] if len(sys.argv) > 1 else "2026-06-17.0"
BASE = f"https://overturemaps-us-west-2.s3.amazonaws.com/release/{RELEASE}/theme=base/type=water/"
OUT_TS = "data/overtureFishingSpots.generated.ts"

# bucket key, bbox (lon_min, lon_max, lat_min, lat_max), quota, display area
BUCKETS = [
    ("uk",     (-11.0,  2.0, 49.0, 61.0), 20000, "United Kingdom & Ireland"),
    ("europe", (-25.0, 45.0, 34.0, 72.0), 35000, "Europe"),
    ("usa",    (-125.0, -66.0, 24.0, 49.0), 30000, "United States"),
    ("canada", (-141.0, -52.0, 49.0, 83.0), 15000, "Canada"),
]
USA_EXTRA = [(-170.0, -130.0, 51.0, 72.0), (-161.0, -154.0, 18.0, 23.0)]  # Alaska, Hawaii
QUOTA = {b[0]: b[2] for b in BUCKETS}
KEEP = {  # Overture subtype -> app water type
    "lake": "lake", "pond": "lake", "water": "lake", "lagoon": "lake", "basin": "lake",
    "reflecting_pool": "lake", "reservoir": "reservoir", "river": "river", "stream": "river",
    "canal": "river", "ditch": "river", "drain": "river", "spring": "fishery",
}
MAX_SPAN = 0.25  # degrees; keeps the bbox-centre pin meaningful


def in_box(lon, lat, b):
    return b[0] <= lon <= b[1] and b[2] <= lat <= b[3]


def assign(lon, lat):
    for key, box, _, area in BUCKETS:
        if in_box(lon, lat, box):
            return key, area
    for box in USA_EXTRA:
        if in_box(lon, lat, box):
            return "usa", "United States"
    return None, None


ANY = [b[1] for b in BUCKETS] + USA_EXTRA


def overlap(a, b):
    return not (a[1] < b[0] or a[0] > b[1] or a[3] < b[2] or a[2] > b[3])


class HTTPRangeFile(io.RawIOBase):
    def __init__(self, url):
        self.url = url
        self.pos = 0
        self.size = int(requests.head(url, timeout=30).headers["Content-Length"])

    def seekable(self): return True
    def readable(self): return True

    def seek(self, o, w=0):
        self.pos = o if w == 0 else (self.pos + o if w == 1 else self.size + o)
        return self.pos

    def tell(self): return self.pos

    def read(self, n=-1):
        if n is None or n < 0:
            n = self.size - self.pos
        if n == 0:
            return b""
        e = min(self.pos + n, self.size) - 1
        for attempt in range(4):
            try:
                d = requests.get(self.url, headers={"Range": f"bytes={self.pos}-{e}"}, timeout=180).content
                self.pos += len(d)
                return d
            except Exception:
                if attempt == 3:
                    raise
                time.sleep(2 * (attempt + 1))


def list_files():
    xml = requests.get(BASE.replace(f"/release/", "/?list-type=2&prefix=release/")
                       .replace("type=water/", "type%3Dwater/")
                       .replace("theme=base", "theme%3Dbase"), timeout=60).text
    keys = []
    for part in xml.split("<Key>")[1:]:
        keys.append(part.split("</Key>")[0])
    return [k for k in keys if k.endswith(".parquet")]


def main():
    files = list_files()
    print(f"{len(files)} water files in release {RELEASE}")
    counts = collections.Counter()
    seen = set()
    out = []

    def full():
        return all(counts[b[0]] >= b[2] for b in BUCKETS)

    for fi, key in enumerate(files):
        if full():
            break
        url = "https://overturemaps-us-west-2.s3.amazonaws.com/" + key
        pf = pq.ParquetFile(HTTPRangeFile(url))
        md = pf.metadata
        cols = {md.schema.column(i).path: i for i in range(md.num_columns)}
        ix = [cols['bbox.xmin'], cols['bbox.xmax'], cols['bbox.ymin'], cols['bbox.ymax']]
        cand = []
        for g in range(md.num_row_groups):
            rg = md.row_group(g)
            box = (rg.column(ix[0]).statistics.min, rg.column(ix[1]).statistics.max,
                   rg.column(ix[2]).statistics.min, rg.column(ix[3]).statistics.max)
            if any(overlap(box, t) for t in ANY):
                cand.append(g)
        if not cand:
            continue
        print(f"file {fi}: {len(cand)} candidate row groups  {dict(counts)}", flush=True)
        for g in cand:
            if full():
                break
            t = pf.read_row_group(g, columns=['id', 'names', 'bbox', 'subtype'])
            names = t.column('names').to_pylist()
            bbs = t.column('bbox').to_pylist()
            subs = t.column('subtype').to_pylist()
            ids = t.column('id').to_pylist()
            for i in range(len(ids)):
                nm = names[i]
                prim = (nm or {}).get('primary') if isinstance(nm, dict) else None
                if not prim:
                    continue
                wt = KEEP.get(subs[i])
                if not wt:
                    continue
                bb = bbs[i]
                if (bb['xmax'] - bb['xmin']) > MAX_SPAN or (bb['ymax'] - bb['ymin']) > MAX_SPAN:
                    continue
                lon = round((bb['xmin'] + bb['xmax']) / 2, 6)
                lat = round((bb['ymin'] + bb['ymax']) / 2, 6)
                key2, area = assign(lon, lat)
                if not key2 or counts[key2] >= QUOTA[key2]:
                    continue
                dk = f"{prim.lower()}|{lat:.4f}|{lon:.4f}"
                if dk in seen:
                    continue
                seen.add(dk)
                out.append([f"ovt-{ids[i][:18]}", prim, lat, lon, wt, area, "", ""])
                counts[key2] += 1

    print("FINAL", dict(counts), "total", len(out))
    header = (
        "// Generated from Overture Maps (base/water) — openly licensed (ODbL / CDLA-Permissive-2.0),\n"
        "// derived primarily from OpenStreetMap. Named, plottable inland & coastal water features\n"
        "// across the UK & Ireland, Europe, the United States and Canada. Regenerate with\n"
        "// scripts/generate-overture-fishing-spots.py.\n"
        "import type { OsmFishingSpotTuple } from './osmFishingSpots.generated';\n"
        f"export const OVERTURE_FISHING_SPOTS: readonly OsmFishingSpotTuple[] = {json.dumps(out)};\n"
    )
    open(OUT_TS, "w").write(header)
    print(f"Wrote {len(out)} spots to {OUT_TS}")


if __name__ == "__main__":
    main()
