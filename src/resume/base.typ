// Shared typography for the generated PDFs. Imported by resume.typ and
// portfolio.typ; not compiled on its own.
//
// This file exists because there are now two documents and exactly one set of
// measurements. Every number here was recovered from
// `Docs/Ehsan Shahmohammadi CV 4.2.pdf` — a Reactive Resume export (Rhyhorn
// template) that was reviewed and approved — by inflating its content streams
// and replaying the text operators to read each run's size, baseline and
// colour. Reproducing an approved document beats re-deriving it by eye, and it
// is why the table below is written down rather than left to be re-measured
// from a file a fresh clone will not have (`Docs/*.pdf` is gitignored: those
// exports carry a phone number and this repo is public).
//
// THE IDENTITY THAT MAKES THE SPACING SOLVABLE
//
//     baseline(A) -> baseline(B)  =  spacing  +  cap-height x size(B)
//
// because Typst's text box runs cap-height to baseline. Noto Sans' cap-height
// is 714/1000 = 0.714em. Every `spacing`, `above` and `row-gutter` below is a
// measured baseline delta with the next line's cap height subtracted out.
// **Change a size and the spacings touching it have to be re-solved, not
// nudged.** Verify by re-measuring the output, not by looking at it.
//
// The measured targets, in points:
//
//     page margin ................. 30 on all four sides (content 552 wide)
//     name ........................ 15pt bold
//     section heading ............. 10pt bold + full-width 1pt rule
//     everything else ............. 8pt
//     line to line, same para ..... 12.05   (= 1.5 x body, leading 0.79em)
//     name -> headline ............ 15.4
//     headline -> contact ......... 13.6
//     content -> section heading .. 36.7
//     heading -> its rule ......... 3.0 to the rule's top edge
//     heading -> first content .... 13.2
//     company -> position ......... 12.4
//     position -> first bullet .... 12.5
//     bullet -> bullet ............ 15.95
//     entry -> entry .............. 15.1
//
// SPACING DISCIPLINE
//
// Typst resolves the gap between two blocks as max(previous.below, next.above),
// so the two ends fight and the larger wins. To keep that from turning every
// number into a guess, `par.spacing` is set to the smallest gap in the
// document — the one under a section rule — and every larger gap is declared as
// `above` on the block that wants it. A floor never wins an argument, so a
// block's own `above` is always what you read on the page.
//
// The exception is *inside* a container: Typst drops leading spacing at the
// start of one, so a first child's `above` is ignored and the gap has to be set
// as `below` on the child before it.

#let cv = json("/src/data/cv.json")

// The reference sets every glyph in pure black and carries exactly one colour,
// on the header bar. Same rationing rule as the site: one colour, one job. It
// stays this blue rather than the reference's #155DFC, because agreeing with
// the site is the whole reason these documents have a palette at all — the same
// argument that put them in the site's typeface.
#let ink = rgb("#000000")
#let accent = rgb("#0071e3")

#let cap = 0.714 // Noto Sans cap-height, in em. See the note above.

/// Page, type and paragraph defaults. Called once at the top of a document.
///
/// Noto Sans because the approved reference export is set in it and matching
/// that is what these documents are for; the site followed onto the same family
/// afterwards, so a recruiter who reads the page and then opens a PDF is still
/// handed one document. Typst embeds no proportional sans, so the TTFs come
/// from npm (@expo-google-fonts/noto-sans, OFL) and are passed in with
/// --font-path, with --ignore-system-fonts so whatever is installed on a
/// machine cannot leak in and ship a layout nobody approved.
#let preamble(body) = {
  set page(paper: "us-letter", margin: 30pt)
  set text(font: "Noto Sans", size: 8pt, fill: ink, lang: "en")
  set par(justify: true, leading: 0.79em, spacing: 2.49pt)
  // The reference underlines its contact links and nothing else, hairline and
  // close to the baseline. Measured: 0.5pt, 1pt of offset.
  show link: it => underline(offset: 1pt, stroke: 0.5pt, it)
  body
}

// ---------------------------------------------------------------- helpers ---

#let month-names = (
  "01": "Jan", "02": "Feb", "03": "Mar", "04": "Apr",
  "05": "May", "06": "Jun", "07": "Jul", "08": "Aug",
  "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dec",
)

// Accepts "2021" or "2025-11"; cv.json uses both.
#let fmt-date(value) = {
  let parts = value.split("-")
  if parts.len() < 2 { parts.at(0) } else {
    month-names.at(parts.at(1), default: parts.at(1)) + " " + parts.at(0)
  }
}

#let fmt-range(start, end) = {
  fmt-date(start) + " – " + if end == none { "Present" } else { fmt-date(end) }
}

// A filled block, not `line()`. A line reserves no vertical space, so whatever
// followed could sit on top of it — which is why the rule appeared under some
// headings and not others depending on the next block's own spacing.
//
// 1pt, and reading that number out of the reference took a second pass. Its
// section rules are stroked with `2 w`, which is what a naive read reports —
// but Skia draws a border by doubling the stroke and clipping it back to a band
// of the real width, and the clip path around each of these is 1pt tall. The
// same trick is why the header's accent bar is stroked at `10 w` and lands on
// the page 5pt wide. Taking `2 w` at face value shipped rules at exactly twice
// the reference's weight, which is the sort of error that is obvious side by
// side and invisible in a table of numbers.
#let rule-height = 1pt

// `sticky` pulls the heading and its rule onto the next page with the entry
// they introduce. Without it a section title can end up alone at the foot of a
// page with its content overleaf.
//
// `above` is exposed for exactly one caller: the first section. The header
// block carries a 3.6pt bottom inset so its accent bar can overhang the contact
// baseline, and that inset lands in the gap underneath, which would make the
// first heading sit 3.6pt lower than every other one. Subtracting it there is
// the only way to keep all seven gaps measuring the same 36.7.
#let section(title, above: 36.7pt - cap * 10pt) = {
  block(
    above: above,
    below: 3pt,
    sticky: true,
    text(size: 10pt, weight: "bold")[#title],
  )
  block(
    width: 100%, height: rule-height, fill: ink,
    above: 2.93pt, below: 13.2pt - 2.93pt - rule-height - cap * 8pt,
    sticky: true,
  )
}

#let entry-gap = 15.1pt - cap * 8pt

// Must stay equal to the rule's `below`: it is the same gap, declared from the
// other side for the one block that opens a section.
#let after-rule = 13.2pt - 2.93pt - rule-height - cap * 8pt

// Two lines, four fields: the organisation and where it was on the first,
// what the role was and when on the second. Left column bold on line one,
// because the name of the place is what a recruiter scans a résumé for; the
// right column is flush to the measure so the dates form their own column.
//
// One grid rather than two blocks, so the pair cannot be split across a page:
// a company name stranded at the foot of a page with its dates overleaf is the
// exact failure `breakable: false` exists to prevent.
//
// `bottom` alignment matters — the two cells hold different weights and, in
// some entries, different string lengths that wrap. Aligning on the baseline
// keeps the dates level with the text they belong to.
#let entry(org, place, role, when, above: entry-gap) = block(
  breakable: false,
  above: above,
  below: 12.5pt - cap * 8pt, // to the summary or the first bullet
  grid(
    columns: (1fr, auto),
    column-gutter: 12pt,
    row-gutter: 12.4pt - cap * 8pt,
    align: (left + bottom, right + bottom),
    text(weight: "bold")[#org], [#place],
    [#role], [#when],
  ),
)

// The marker sits 5pt into the margin and the text 10.5pt, both measured. The
// gap between items is the one place the reference is airier than a plain line
// break — 15.95 against 12.05 — which is what keeps a six-bullet entry from
// reading as a paragraph.
//
// Wrapped in a block because a bare `list` takes `par.spacing` as its `above`,
// and par.spacing is the document's floor — which put the first bullet 8.2pt
// under the line before it instead of 12.5.
#let bullets(items) = block(
  above: 12.5pt - cap * 8pt,
  list(
    marker: text(fill: ink)[•],
    indent: 5pt,
    body-indent: 2.7pt,
    spacing: 15.95pt - cap * 8pt,
    ..items,
  ),
)

// Name, role and contact line share one accent bar.
//
// The bar is a left stroke on the block rather than a filled cell beside it,
// because a stroke spans exactly the height of the thing it is attached to. A
// rect sized `height: 100%` in an auto grid row resolves against the page, not
// the row, which drew a bar down the whole of page 1.
//
// Typst centres a block stroke on the block's edge, so the block is pushed
// right by half the bar to leave the bar itself sitting flush in the margin at
// x=30..35, exactly where the reference puts it. Unlike the previous layout,
// the header text is then indented past it rather than pulled back level with
// the sections — that indent is the reference's, and the bar reads as a
// masthead rule rather than a marginal tick because of it.
//
// The insets are the measured overhang: the bar starts 2.9pt above the name's
// cap and ends 3.6pt below the last baseline, for a 46.2pt bar.
#let bar-width = 5pt

/// A masthead: one 15pt bold line, then any number of 8pt lines under it, all
/// sharing the accent bar. The résumé passes its name, label and contact line;
/// the portfolio passes a project's name and its year.
///
/// `lines` is an array of `(gap: length, body: content)` and the gap is per
/// line rather than one value for all of them, because the reference's two are
/// not the same: 15.4pt from the name to the headline and 13.6pt from the
/// headline to the contact line. A single gap here would have quietly moved the
/// résumé's third line by 1.8pt — the exact class of drift this file exists to
/// prevent.
#let masthead(title, lines) = pad(left: bar-width / 2)[
  #block(
    inset: (left: 14.5pt, top: 2.9pt, bottom: 3.6pt),
    stroke: (left: bar-width + accent),
  )[
    #text(size: 15pt, weight: "bold")[#title]
    #for line in lines [
      #v(line.gap - cap * 8pt, weak: true)
      #line.body
    ]
  ]
]
