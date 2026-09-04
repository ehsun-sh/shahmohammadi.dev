# Project thumbnails

Drop the image here, then point `cv.json` at it by **filename only**:

```json
{
  "name": "SFP 4.25G Transceiver Design",
  "image": "sfp-4g25-transceiver.webp",
  "imageAlt": "The 4-layer SFP transceiver board with the ROSA and TOSA fitted"
}
```

Astro hashes, resizes and re-encodes it at build time, so what ships is not what
you export here. Do not put these in `public/` — that path skips all of it.

## Export spec

| | |
|---|---|
| Ratio | **16:10** — the same as the hero visual |
| Size | **1600 × 1000** |
| Format | WebP, quality 82 (JPG and PNG also work) |
| Background | **Transparent**, wherever the subject has a real edge |
| Weight | Under 400 KB each before Astro processes it |

The frame renders at 160 px wide on desktop and full width on phones, and Astro
emits 160/320/640 variants from your one file. 1600 px is deliberate headroom —
it survives the layout getting wider later without a re-export.

**Crop tight.** At 160 px a wide shot of a whole bench turns to mush. Fill the
frame with the board, the module, or the instrument screen. If a photo cannot
survive being 160 px wide, it is the wrong photo.

`object-fit: cover` means anything not 16:10 gets centre-cropped rather than
squashed, so keep the subject centred and leave a little air at the edges.

## The same file has a second job

A cover is not only the thumbnail. `ProjectGallery` shows it as the first slide
of the project page's carousel, at the full measure and drawn `contain` — so one
export is read at 160 px cropped and at ~750 px whole, which is why the crop has
to be tight *and* the whole subject has to be in the frame.

It is also why the background is transparent rather than solid. Both surfaces
sit on `--color-bg`, which is a near-white tint in the light theme and black in
the dark one, so a background baked into the file is correct in exactly one of
them and a visible plate in the other. Export a render or a cut-out with its
alpha intact; a photograph that genuinely has a room behind it keeps the room.

Check that against `npm run preview`, never `npm run dev`: Astro's dev image
endpoint drops the alpha channel when it re-encodes to WebP, so a file that will
ship with a white box around it looks perfect on the dev server.

## What must not go in here

Read the IP boundary in `CLAUDE.md` before exporting anything. No schematics, no
Gerbers, no PCB layouts, no firmware on a screen. A photograph of finished
hardware is fine; a screenshot of the CAD that produced it is not — and a
bare board shot at this size can still show enough copper to be a layout.

## Naming

Lowercase, hyphenated, descriptive: `mri-optical-coil.webp`,
`wdm-transmitter.webp`. The name appears in the built asset path, so it is
public.

## Missing files fail the build

A filename in `cv.json` with no matching file here throws during build with the
list of what is actually present. That is on purpose — the alternative is a
blank frame that ships unnoticed. Leave `"image": null` until the file exists;
that renders the dashed placeholder frame instead.
