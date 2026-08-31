// resume.pdf — generated, never hand-edited.
//
// Reads src/data/cv.json, the same file the website renders from, so the two
// cannot drift apart. Change a fact there and both update on the next push.
//
// Build:  npm run resume     (typst compile … --root .)
// CI:     .github/workflows/deploy.yml, before the Astro build so the PDF is
//         sitting in public/ when Astro copies it into dist/.
//
// Constraints this layout is written against:
//   - Two pages maximum.
//   - ATS-parseable: real selectable text, ordinary section headings, no icon
//     fonts, no text baked into graphics, no multi-column body that a parser
//     would read across.
//   - The font must resolve to the same faces on the CI runner as it does
//     locally, or a layout approved here ships subtly different.
//
// Typst embeds only four faces and none of them is a proportional sans, so
// Noto Sans is sourced through npm (@expo-google-fonts/noto-sans, OFL) and
// passed in with --font-path. That keeps the TTFs out of the repo and pinned by
// package-lock, and --ignore-system-fonts keeps whatever happens to be
// installed on a machine from leaking in.
//
// Noto Sans because the approved reference export is set in it and matching
// that is what this document is for. The site followed onto the same family
// afterwards, so a recruiter who reads the page and then opens the PDF is still
// handed one document — the constraint held, it just got satisfied in the other
// direction than before, when the résumé followed the site onto Open Sans.
//
// The swap cost nothing else, and that is not luck: both families descend from
// Droid Sans and their metrics are the same to four places — cap-height 0.714em,
// ascender 1.069, descender 0.293. Every spacing number below survived it
// untouched, which is the test a font change has to pass here.
//
// ---------------------------------------------------------------------------
// WHERE THE NUMBERS CAME FROM
//
// The metrics below are not taste. Every one of them was measured out of
// `Docs/Ehsan Shahmohammadi CV 4.2.pdf` — a Reactive Resume export (Rhyhorn
// template) that was reviewed and approved — by inflating its content streams
// and replaying the text operators to recover each run's font size, baseline
// and colour. Reproducing an approved document beats re-deriving it by eye.
// That file is local only: `Docs/*.pdf` is gitignored because those exports
// carry a phone number and this repo is public. The measurements below are the
// part worth keeping, which is why they are written down here rather than left
// to be re-derived from a file a fresh clone will not have.
//
// The identity that makes the spacing solvable: Typst's default text box runs
// cap-height to baseline, so
//
//     baseline(A) -> baseline(B)  =  spacing  +  cap-height x size(B)
//
// and Noto Sans' cap-height is 714/1000 = 0.714em. Every `spacing`, `above`
// and `row-gutter` in this file is a measured baseline delta with the cap
// height of the following line subtracted out. Change a size and the spacings
// that touch it have to be re-solved, not nudged.
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
// Two deliberate departures from the reference, both recorded rather than
// silent. It sets headings in Arimo and body in Noto Sans; this file uses Open
// Sans throughout, because agreeing with the website is the whole reason the
// résumé has a typeface at all. And its accent bar is #155DFC; this one stays
// on the site's --color-accent-solid, for the same reason.
//
// ---------------------------------------------------------------------------
// SPACING DISCIPLINE
//
// Typst resolves the gap between two blocks as max(previous.below, next.above),
// so the two ends fight and the larger wins. To keep that from turning every
// number into a guess, `par.spacing` is set to the smallest gap in the
// document — the one under a section rule — and every larger gap is declared as
// `above` on the block that wants it. The floor never wins an argument, so a
// block's own `above` is always what you read on the page.
//
// The exception is *inside* a container: Typst drops leading spacing at the
// start of one, so a first child's `above` is ignored and the gap has to be set
// as `below` on the child before it.

#let cv = json("/src/data/cv.json")
#let basics = cv.basics

// The reference sets every glyph in pure black and carries exactly one colour,
// on the header bar. Same rationing rule as the site: one colour, one job.
#let ink = rgb("#000000")
#let accent = rgb("#0071e3")

#let cap = 0.714 // Noto Sans cap-height, in em. See the note above.

#set document(
  title: basics.name + " — " + basics.label,
  author: basics.name,
  keywords: cv.skills.map(g => g.items).flatten(),
)

#set page(paper: "us-letter", margin: 30pt)
#set text(font: "Noto Sans", size: 8pt, fill: ink, lang: "en")
#set par(justify: true, leading: 0.79em, spacing: 2.49pt)

// The reference underlines its contact links and nothing else, hairline and
// close to the baseline. Measured: 0.5pt, 1pt of offset.
#show link: it => underline(offset: 1pt, stroke: 0.5pt, it)

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
#let entry-gap = 15.1pt - cap * 8pt

// Must stay equal to the rule's `below`: it is the same gap, declared from the
// other side for the one block that opens a section.
#let after-rule = 13.2pt - 2.93pt - rule-height - cap * 8pt

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

// -------------------------------------------------------------------- head ---

// Contact line. Placeholder profile URLs are filtered out — a résumé that
// links to github.com/TODO is worse than one that links nowhere.
// The chain is wrapped in parentheses so it can span lines: in code mode a bare
// newline ends the expression, which silently left the raw dictionaries in the
// array instead of the links they map to.
#let profile-links = (
  basics.profiles
    .filter(p => not p.url.contains("TODO"))
    .map(p => link(p.url, p.network))
)

// cv.json stores an ISO code because schema.org wants one; a résumé should say
// the country's name. Falls back to the code for anywhere not listed.
#let country-names = ("CA": "Canada", "IR": "Iran", "US": "United States")

// No phone number, here or in cv.json. This repo is public and the PDF is
// served from a public URL; the reference export carries one because it lives
// behind an account. Email and the site are the contact path.
#let contact-items = (
  link("mailto:" + basics.email, basics.email),
  [#basics.location.city, #country-names.at(basics.location.countryCode, default: basics.location.countryCode)],
  link(basics.url, basics.url.replace("https://", "")),
) + profile-links

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
// cap and ends 3.6pt below the contact baseline, for a 46.2pt bar.
#let bar-width = 5pt

#pad(left: bar-width / 2)[
  #block(
    inset: (left: 14.5pt, top: 2.9pt, bottom: 3.6pt),
    stroke: (left: bar-width + accent),
  )[
    #text(size: 15pt, weight: "bold")[#basics.name]
    #v(15.4pt - cap * 8pt, weak: true)
    #text[#basics.label]
    #v(13.6pt - cap * 8pt, weak: true)
    #contact-items.join(h(9pt))
  ]
]

#section([Professional Summary], above: 36.7pt - cap * 10pt - 3.6pt)

#basics.summary

// ------------------------------------------------------------------ skills ---

// Second, ahead of Experience, as the reference orders it. A hardware CV is
// filtered on its stack before it is read for its story, so the list a screener
// is matching against should not be two pages down. Category on its own line in
// bold, its items underneath. Both are ink: the reference sets the whole
// document in one colour and lets weight carry the hierarchy, and at this
// density a second grey would only blur it.
#section[Technical Skills]

#for (i, group) in cv.skills.enumerate() [
  #block(above: if i == 0 { after-rule } else { 15.1pt - cap * 8pt })[
    #text(weight: "bold")[#group.category]
    #v(12.8pt - cap * 8pt, weak: true)
    #group.items.join(" · ")
  ]
]

// -------------------------------------------------------------- experience ---

#section[Experience]

#for (i, job) in cv.work.enumerate() [
  #entry(
    job.company,
    job.location,
    job.position,
    fmt-range(job.startDate, job.endDate),
    above: if i == 0 { after-rule } else { entry-gap },
  )
  #if job.summary != "" [#block(above: 0pt)[#job.summary]]
  #if job.highlights.len() > 0 [
    #bullets(job.highlights)
  ]
]

// ---------------------------------------------------------------- projects ---

#if cv.projects.len() > 0 [
  #section[Selected Projects]
  #for (i, project) in cv.projects.enumerate() [
    #entry(
      project.name,
      project.year,
      project.tags.join(" · "),
      "",
      above: if i == 0 { after-rule } else { entry-gap },
    )
    #block(above: 0pt)[#project.summary]
  ]
]

// --------------------------------------------------------------- education ---

#section[Education]

#for (i, school) in cv.education.enumerate() [
  #entry(
    school.institution,
    school.startDate + " – " + school.endDate,
    school.studyType + ", " + school.area,
    "",
    above: if i == 0 { after-rule } else { entry-gap },
  )
  #if school.note != "" [#block(above: 0pt)[#school.note]]
]

// ------------------------------------------------------ awards & the tail ---

#if cv.awards.len() > 0 [
  #section[Awards]
  #for (i, award) in cv.awards.enumerate() [
    #entry(
      award.title,
      award.date,
      award.issuer,
      "",
      above: if i == 0 { after-rule } else { entry-gap },
    )
  ]
]

#if cv.certificates.len() > 0 [
  #section[Certifications]
  #for (i, cert) in cv.certificates.enumerate() [
    #entry(
      cert.name,
      fmt-date(cert.date),
      cert.issuer,
      "",
      above: if i == 0 { after-rule } else { entry-gap },
    )
  ]
]

#if cv.languages.len() > 0 [
  #section[Languages]
  #block(above: after-rule)[
    #cv.languages.map(l => l.language + " — " + l.fluency).join("  ·  ")
  ]
]
