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
// Almarai is sourced through npm (@expo-google-fonts/almarai, OFL) and passed
// in with --font-path. That keeps the TTFs out of the repo and pinned by
// package-lock, and --ignore-system-fonts keeps whatever happens to be
// installed on a machine from leaking in. Almarai ships no italic — the
// layout must not ask for one, or Typst will synthesise a slant.

#let cv = json("/src/data/cv.json")
#let basics = cv.basics

#let ink = rgb("#1d1d1f")
#let muted = rgb("#5c5c60")
#let rule-color = rgb("#c8c8cd")
// The one colour in the document, and the same --color-accent-solid the site
// fills its primary button with. It has exactly one job here: the header bar.
#let accent = rgb("#0071e3")

#set document(
  title: basics.name + " — " + basics.label,
  author: basics.name,
  keywords: cv.skills.map(g => g.items).flatten(),
)

#set page(paper: "us-letter", margin: (x: 0.62in, top: 0.58in, bottom: 0.5in))
#set text(font: "Almarai", size: 9.5pt, fill: ink, lang: "en")
#set par(justify: true, leading: 0.62em, spacing: 0.62em)
#show link: set text(fill: ink)

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
#let rule(above: 0.25em, below: 0.4em, sticky: false) = block(
  width: 100%, height: 0.5pt, fill: rule-color,
  above: above, below: below, sticky: sticky,
)

// `sticky` pulls the heading and its rule onto the next page with the entry
// they introduce. Without it a section title can end up alone at the foot of a
// page with its content overleaf.
#let section(title) = {
  block(
    above: 0.95em, below: 0.25em, sticky: true,
    text(size: 9pt, weight: "bold", tracking: 0.09em)[#upper(title)],
  )
  rule(sticky: true)
}

// Title left, dates right on one baseline, with the scope note underneath.
//
// `breakable: false` keeps the title with its description. Without it a page
// break could land between them and strand a heading alone at the foot of a
// page — which is exactly what happened to the first project entry.
#let entry(title, meta, note: none) = block(
  breakable: false,
  above: 0.85em,
  below: 0.35em,
)[
  #grid(
    columns: (1fr, auto),
    column-gutter: 1em,
    align: (left + bottom, right + bottom),
    title,
    text(size: 8.5pt, fill: muted)[#meta],
  )
  #if note != none and note != "" [
    #block(above: 0.32em, below: 0em, text(fill: muted)[#note])
  ]
]

#let bullets(items) = list(
  marker: text(fill: rule-color)[•],
  indent: 0.4em,
  body-indent: 0.45em,
  spacing: 0.5em,
  ..items,
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

#let contact-items = (
  [#basics.location.city, #country-names.at(basics.location.countryCode, default: basics.location.countryCode)],
  link("mailto:" + basics.email, basics.email),
  link(basics.url, basics.url.replace("https://", "")),
) + profile-links

// Name, role and contact line share one accent bar.
//
// The bar is a left stroke on the block rather than a filled cell beside it,
// because a stroke spans exactly the height of the thing it is attached to. A
// rect sized `height: 100%` in an auto grid row resolves against the page, not
// the row, which drew a bar down the whole of page 1.
//
// The block is then pulled into the left margin by half the stroke plus the
// gap, so the header text keeps the same left edge as every section below it.
// Indenting the header instead would break the spine the whole document reads
// against, and the bar is a marginal mark either way.
#let bar-width = 3.5pt
#let bar-offset = 8pt + bar-width / 2

#pad(left: -bar-offset)[
  #block(
    inset: (left: bar-offset),
    stroke: (left: bar-width + accent),
  )[
    #text(size: 20pt, weight: "bold", tracking: -0.015em)[#basics.name]
    #v(0.28em, weak: true)
    #text(size: 10.5pt, fill: muted)[#basics.label]
    #v(0.5em, weak: true)
    #text(size: 8.5pt, fill: muted)[
      #contact-items.join(text(fill: rule-color)[ · ])
    ]
  ]
]

#rule(above: 0.8em, below: 0.55em)

#par(justify: true)[#basics.summary]

// -------------------------------------------------------------- experience ---

#section[Experience]

#for job in cv.work [
  #entry(
    [#text(weight: "bold")[#job.position] #text(fill: muted)[· #job.company]],
    fmt-range(job.startDate, job.endDate)
      + if job.location != "" { " · " + job.location } else { "" },
    note: job.summary,
  )
  #if job.highlights.len() > 0 [#bullets(job.highlights)]
]

// ------------------------------------------------------------------ skills ---

#section[Technical Skills]

#for group in cv.skills [
  #block(below: 0.45em)[
    #text(weight: "bold")[#group.category] #h(0.35em)
    #text(fill: muted)[#group.items.join(" · ")]
  ]
]

// ---------------------------------------------------------------- projects ---

#if cv.projects.len() > 0 [
  #section[Selected Projects]
  #for project in cv.projects [
    #entry(
      [#text(weight: "bold")[#project.name]],
      project.year,
      note: project.summary,
    )
  ]
]

// --------------------------------------------------------------- education ---

#section[Education]

#for school in cv.education [
  #entry(
    [#text(weight: "bold")[#school.studyType, #school.area]],
    school.startDate + " – " + school.endDate,
    note: [#school.institution#if school.note != "" [ · #school.note]],
  )
]

// ------------------------------------------------------ awards & the tail ---

#if cv.awards.len() > 0 [
  #section[Awards]
  #for award in cv.awards [
    #entry(
      [#text(weight: "bold")[#award.title]],
      award.date,
      note: award.issuer,
    )
  ]
]

#if cv.certificates.len() > 0 [
  #section[Certifications]
  #for cert in cv.certificates [
    #block(below: 0.35em)[
      #cert.name #text(fill: muted)[· #cert.issuer · #fmt-date(cert.date)]
    ]
  ]
]

#if cv.languages.len() > 0 [
  #section[Languages]
  #cv.languages.map(l => l.language + " — " + l.fluency).join("  ·  ")
]
