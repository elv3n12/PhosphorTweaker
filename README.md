# Phosphor tuner

The Phosphor tuner is a standalone Vite application for tuning a canvas **Mixed** phosphor field: dot specks, stroke glyphs, perspective mesh links, wandering spotlight holds, scroll lag, and pointer-driven lighting. It is a self-contained tool in this folder and is not part of any other site or deployment.

## Run

From this directory:

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:5173](http://127.0.0.1:5173) in your browser.

Other scripts:

- `npm run build` — production build
- `npm run typecheck` — TypeScript check without emit

The stack uses React 19, Vite 8, `@vitejs/plugin-react` 6, and TypeScript 5.7 (see [wiki/third-party.md](wiki/third-party.md)).

## Use

- **Sliders** update the live canvas immediately.
- **Pool** and **cluster** sliders (and other layout keys) rebuild the glyph layout when changed.
- **Rebuild field** remounts the canvas and starts layout from scratch with the current numbers.
- **Save** writes a JSON snapshot to `presets/preset_NNN.json` (parameters plus optional preview background).
- **Import** loads a saved preset JSON from disk.
- **Reset all** sets every panel slider to the midpoint of its min–max range (snapped to step) and restores color pickers to the shipped default RGB values. It does not restore `defaultPhosphorParams` numeric defaults; see [wiki/parameters.md](wiki/parameters.md).
- Each group’s **reset** restores that group’s sliders and colors to the shipped defaults in `defaultPhosphorParams`.
- **Background** changes only the preview surface behind the field; it does not affect phosphor math.

On first load the running field uses `defaultPhosphorParams`. Presets and imports can override any parameter key present in the file.

## Wiki

- [Parameters](wiki/parameters.md) — every slider, color, internal knob, and core formulas
- [Recipes](wiki/recipes.md) — six multi-slider looks to try
- [Third-party](wiki/third-party.md) — licenses and runtime dependencies
