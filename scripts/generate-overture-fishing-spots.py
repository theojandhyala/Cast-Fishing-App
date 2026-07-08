#!/usr/bin/env python3
"""
Generate data/overtureFishingSpots.generated.ts from Overture Maps.

Source: Overture Maps `base` theme, `water` type (GeoParquet on public S3).
Overture water is OpenStreetMap-derived and openly licensed (ODbL / CDLA-Permissive-2.0).

We keep only NAMED, plottable, reasonably-sized inland & coastal water features
(lakes, ponds, reservoirs, rivers, streams, canals, springs). Each feature's
coordinate is the centre of Overture's bbox struct (no geometry parsing needed),
and each feature is geolocated to its REAL country by point-in-polygon against
official country boundaries. Features are then bucketed by country with quotas so
the requested regions are represented exactly:

    United States              30,000
    United Kingdom & Ireland   20,000
    Canada                     15,000
    Europe                     35,000   (real European countries incl. Iceland/Faroe)

Species are intentionally blank here; they are inferred at runtime by region in
data/speciesEnrichment.ts, and every record flows through normalizeFishingSpot +
verifyFishingSpot in data/fishingSpots.ts (uniform, complete, integrity-checked).

Requires: pip install pyarrow requests shapely
Boundaries: datasets/geo-countries countries.geojson (downloaded automatically).
Usage:     python3 scripts/generate-overture-fishing-spots.py [RELEASE]
"""
import io, json, sys, time, collections
import requests
import pyarrow.parquet as pq
from shapely.geometry import shape, Point
from shapely.strtree import STRtree
from shapely.prepared import prep

RELEASE = sys.argv[1] if len(sys.argv) > 1 else "2026-06-17.0"
S3 = "https://overturemaps-us-west-2.s3.amazonaws.com/"
PREFIX = f"release/{RELEASE}/theme=base/type=water/"
COUNTRIES_URL = "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson"
OUT_TS = "data/overtureFishingSpots.generated.ts"

QUOTA = {"usa": 30000, "uk": 20000, "canada": 15000, "europe": 35000}
AREA_LABEL = {"United States of America": "United States"}  # friendlier display names
UK_SET = {"United Kingdom", "Ireland", "Isle of Man", "Guernsey", "Jersey"}
EUROPE_SET = {
    "France","Germany","Spain","Italy","Portugal","Netherlands","Belgium","Luxembourg",
    "Switzerland","Austria","Denmark","Norway","Sweden","Finland","Iceland","Faroe Islands",
    "Poland","Czechia","Czech Republic","Slovakia","Hungary","Slovenia","Croatia",
    "Bosnia and Herzegovina","Serbia","Montenegro","North Macedonia","Albania","Greece",
    "Bulgaria","Romania","Moldova","Ukraine","Belarus","Lithuania","Latvia","Estonia",
    "Russia","Russian Federation","Turkey","Cyprus","Malta","Andorra","Monaco",
    "Liechtenstein","San Marino","Gibraltar","Kosovo",
}
KEEP = {  # Overture subtype -> app water type
    "lake": "lake", "pond": "lake", "water": "lake", "lagoon": "lake", "basin": "lake",
    "reflecting_pool": "lake", "reservoir": "reservoir", "river": "river", "stream": "river",
    "canal": "river", "ditch": "river", "drain": "river", "spring": "fishery",
}
MAX_SPAN = 0.25
# Only scan row groups whose bbox can hold a still-needed region.
REGION_BOX = {"usa": (-170, -66, 18, 72), "uk": (-11, 2, 49, 61),
              "canada": (-141, -52, 42, 83), "europe": (-25, 45, 34, 72)}


def bucket(country):
    if country in ("United States of America", "United States"): return "usa"
    if country == "Canada": return "canada"
    if country in UK_SET: return "uk"
    if country in EUROPE_SET: return "europe"
    return None


class HTTPRangeFile(io.RawIOBase):
    def __init__(self, url):
        self.url = url; self.pos = 0
        self.size = int(requests.head(url, timeout=30).headers["Content-Length"])
    def seekable(self): return True
    def readable(self): return True
    def seek(self, o, w=0):
        self.pos = o if w == 0 else (self.pos + o if w == 1 else self.size + o); return self.pos
    def tell(self): return self.pos
    def read(self, n=-1):
        if n is None or n < 0: n = self.size - self.pos
        if n == 0: return b""
        e = min(self.pos + n, self.size) - 1
        for a in range(4):
            try:
                d = requests.get(self.url, headers={"Range": f"bytes={self.pos}-{e}"}, timeout=180).content
                self.pos += len(d); return d
            except Exception:
                if a == 3: raise
                time.sleep(2 * (a + 1))


def load_boundaries():
    gj = requests.get(COUNTRIES_URL, timeout=120).json()
    geoms, names, prepd = [], [], []
    for f in gj["features"]:
        if not f.get("geometry"): continue
        g = shape(f["geometry"]); geoms.append(g)
        names.append(f["properties"]["name"]); prepd.append(prep(g))
    tree = STRtree(geoms)
    def country_of(lon, lat):
        pt = Point(lon, lat)
        for c in tree.query(pt):
            gi = int(c)
            if prepd[gi].contains(pt): return names[gi]
        return None
    return country_of


def list_files():
    url = f"{S3}?list-type=2&prefix={PREFIX.replace('=', '%3D')}"
    xml = requests.get(url, timeout=60).text
    return [p.split("</Key>")[0] for p in xml.split("<Key>")[1:] if ".parquet" in p]


def overlap(a, b): return not (a[1] < b[0] or a[0] > b[1] or a[3] < b[2] or a[2] > b[3])


def main():
    print("loading boundaries…", flush=True)
    country_of = load_boundaries()
    files = list_files()
    print(f"{len(files)} water files in release {RELEASE}", flush=True)

    counts = collections.Counter(); seen = set(); out = []
    def full(): return all(counts[k] >= QUOTA[k] for k in QUOTA)

    for fi, key in enumerate(files):
        if full(): break
        need = [REGION_BOX[k] for k in QUOTA if counts[k] < QUOTA[k]]
        pf = pq.ParquetFile(HTTPRangeFile(S3 + key)); md = pf.metadata
        cols = {md.schema.column(i).path: i for i in range(md.num_columns)}
        ix = [cols['bbox.xmin'], cols['bbox.xmax'], cols['bbox.ymin'], cols['bbox.ymax']]
        cand = []
        for g in range(md.num_row_groups):
            rg = md.row_group(g)
            box = (rg.column(ix[0]).statistics.min, rg.column(ix[1]).statistics.max,
                   rg.column(ix[2]).statistics.min, rg.column(ix[3]).statistics.max)
            if any(overlap(box, t) for t in need): cand.append(g)
        if not cand: continue
        print(f"file {fi}: {len(cand)} row groups  {dict(counts)}", flush=True)
        for g in cand:
            if full(): break
            t = pf.read_row_group(g, columns=['id', 'names', 'bbox', 'subtype'])
            nm = t.column('names').to_pylist(); bbs = t.column('bbox').to_pylist()
            subs = t.column('subtype').to_pylist(); ids = t.column('id').to_pylist()
            for i in range(len(ids)):
                prim = (nm[i] or {}).get('primary') if isinstance(nm[i], dict) else None
                if not prim: continue
                wt = KEEP.get(subs[i])
                if not wt: continue
                bb = bbs[i]
                if (bb['xmax'] - bb['xmin']) > MAX_SPAN or (bb['ymax'] - bb['ymin']) > MAX_SPAN: continue
                lon = round((bb['xmin'] + bb['xmax']) / 2, 6); lat = round((bb['ymin'] + bb['ymax']) / 2, 6)
                dk = f"{prim.lower()}|{lat:.4f}|{lon:.4f}"
                if dk in seen: continue
                country = country_of(lon, lat)
                if not country: continue
                b = bucket(country)
                if not b or counts[b] >= QUOTA[b]: continue
                seen.add(dk)
                out.append([f"ovt-{ids[i][:18]}", prim, lat, lon, wt,
                            AREA_LABEL.get(country, country), "", ""])
                counts[b] += 1

    print("FINAL", dict(counts), "total", len(out))
    header = (
        "// Generated from Overture Maps (base/water) — openly licensed (ODbL / CDLA-Permissive-2.0),\n"
        "// derived primarily from OpenStreetMap. Named, plottable inland & coastal water features,\n"
        "// each geolocated to its real country by point-in-polygon, across the UK & Ireland, Europe,\n"
        "// the United States and Canada. Regenerate with scripts/generate-overture-fishing-spots.py.\n"
        "import type { OsmFishingSpotTuple } from './osmFishingSpots.generated';\n"
        f"export const OVERTURE_FISHING_SPOTS: readonly OsmFishingSpotTuple[] = {json.dumps(out)};\n"
    )
    open(OUT_TS, "w").write(header)
    print(f"Wrote {len(out)} spots to {OUT_TS}")


if __name__ == "__main__":
    main()
