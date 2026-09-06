# Tabler Icons Pack

[Tabler Icons](https://tabler.io/icons) repackaged in the same layout as
[google/material-design-icons](https://github.com/google/material-design-icons):
one folder per **category / icon / style**, with the source SVG and pre-rendered
PNGs at several densities.

Source: `@tabler/icons` **v3.46.0** (MIT, © Paweł Kuna) — 5,130 icons, 5,130 `outline` + 1,054 `filled`
variants, 41 categories. See [`metadata/source.json`](metadata/source.json).

## Layout

```
src/<category>/<icon>/<style>/24px.svg
png/<category>/<icon>/<style>/<dp>dp/<density>/<style>_<icon>_black_<dp>dp.png
metadata/icons.json        # name, category, tags, styles (version, unicode, svg path)
metadata/categories.json   # category slug -> display name + icon list
metadata/source.json       # upstream package, version, build parameters
update/                    # sync.sh + build.mjs to regenerate from a newer @tabler/icons
```

Example — the `arrow-left` icon (category *Arrows*):

```
src/arrows/arrow-left/outline/24px.svg
png/arrows/arrow-left/outline/24dp/1x/outline_arrow-left_black_24dp.png   # 24 px
png/arrows/arrow-left/outline/24dp/2x/outline_arrow-left_black_24dp.png   # 48 px
png/arrows/arrow-left/outline/24dp/4x/outline_arrow-left_black_24dp.png   # 96 px
```

* **Styles**: `outline` (2 px stroke, all icons) and `filled` (subset). Icon names keep Tabler's kebab-case.
* **SVG**: unmodified upstream files, 24×24 viewBox, `currentColor` — recolor with CSS.
* **PNG**: sizes 18, 24, 36, 48 dp × densities 1x, 2x, 4x (12 files per icon/style), rendered in black
  on a transparent background with [resvg](https://github.com/RazrFalcon/resvg). Pixel size = dp × density.
* **Unicode** code points in `metadata/icons.json` match the official `@tabler/icons-webfont` glyphs.

## Categories

| Slug | Name | Icons |
|---|---|---|
| `animals` | Animals | 18 |
| `arrows` | Arrows | 333 |
| `badges` | Badges | 22 |
| `brand` | Brand | 376 |
| `buildings` | Buildings | 95 |
| `charts` | Charts | 39 |
| `communication` | Communication | 117 |
| `computers` | Computers | 44 |
| `currencies` | Currencies | 76 |
| `database` | Database | 42 |
| `design` | Design | 342 |
| `development` | Development | 62 |
| `devices` | Devices | 358 |
| `document` | Document | 203 |
| `e-commerce` | E-commerce | 154 |
| `electrical` | Electrical | 19 |
| `extensions` | Extensions | 13 |
| `food` | Food | 96 |
| `games` | Games | 48 |
| `gender` | Gender | 18 |
| `gestures` | Gestures | 17 |
| `health` | Health | 87 |
| `laundry` | Laundry | 40 |
| `letters` | Letters | 214 |
| `logic` | Logic | 8 |
| `map` | Map | 262 |
| `math` | Math | 88 |
| `media` | Media | 155 |
| `mood` | Mood | 52 |
| `nature` | Nature | 47 |
| `numbers` | Numbers | 196 |
| `photography` | Photography | 50 |
| `shapes` | Shapes | 183 |
| `sport` | Sport | 76 |
| `symbols` | Symbols | 37 |
| `system` | System | 781 |
| `text` | Text | 188 |
| `vehicles` | Vehicles | 90 |
| `version-control` | Version control | 11 |
| `weather` | Weather | 61 |
| `zodiac` | Zodiac | 12 |

## Using the icons

Direct link to a raw file (replace `OWNER`):

```
https://raw.githubusercontent.com/OWNER/tabler-icons-pack/main/src/arrows/arrow-left/outline/24px.svg
```

Find an icon by tag:

```bash
jq -r '.[] | select(.tags | index("delete")) | .name' metadata/icons.json
```

## Updating to a newer Tabler release

```bash
./update/sync.sh            # latest
./update/sync.sh 3.47.0     # specific version
git add -A && git commit -m "Sync @tabler/icons 3.47.0"
```

Requires Node ≥ 18 and npm. The build renders ~73,872 PNGs in under a minute on two cores.

## License

MIT. Icon artwork © Paweł Kuna / Tabler Icons; repository tooling and rasters © 2026 Allan Vásquez.
See [LICENSE](LICENSE). This is an unofficial repackaging and is not affiliated with Tabler or Google.
