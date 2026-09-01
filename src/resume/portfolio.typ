// Portfolio.pdf — generated, never hand-edited.
//
// Build:  npm run portfolio
//
// ---------------------------------------------------------------------------
// THIS DOCUMENT IS NOT PUBLISHED, AND THAT IS THE ONLY HONEST WAY TO KEEP IT
// PRIVATE.
//
// The site is static and served by GitHub Pages. There is no server, so there
// is nothing that can check who is asking: every file under public/ is a public
// URL to anyone who knows or guesses it. A password prompt in JavaScript is
// read straight out of the page source, and an unguessable filename is not
// secrecy when the repository that names it is public.
//
// So this file is written to `private/`, which is gitignored whole. It is never
// committed, never copied into dist/, and never built in CI — `npm run
// portfolio` is a local command and the PDF exists only on the machine that
// ran it. That is a real guarantee rather than a discouragement.
//
// If it should ever become public, the change is deliberate and small: write it
// to public/ instead, add it to the deploy workflow beside `npm run resume`,
// and gate the link on a flag in src/data/site.ts the way resume.pdf is. Do not
// do that halfway — a file in public/ is public, whether or not anything links
// to it.
//
// ---------------------------------------------------------------------------
// WHAT IT IS
//
// One page per project, in cv.json's order — the same order the site and the
// résumé use, so all three agree on which project leads. Every project gets a
// page whether or not it is `featured` and whether or not its write-up is a
// draft: this is Ehsan's own copy, and the projects still carrying TODO are
// exactly the ones worth being reminded of.
//
// The typography is base.typ, the same module resume.typ imports, so the two
// documents are the same document twice — that is the whole requirement and it
// is why none of the measurements are restated here. Read base.typ before
// changing any spacing; every number in it was measured out of an approved
// reference, and a size cannot be changed without re-solving the gaps around
// it.
//
// The data comes from private/portfolio.json, built by
// scripts/build-portfolio-data.mjs, because Typst reads JSON and the write-ups'
// frontmatter is YAML. The markdown body is deliberately absent — a write-up
// runs to several pages and each project gets one, so the page carries the
// project's URL instead and the body stays where it is already published.
//
// IP boundary (CLAUDE.md) still applies even though this file stays local:
// nothing here reaches for schematics, Gerbers, layouts or firmware source. It
// carries the same facts the project pages do.

#import "base.typ": *

#let data = json("/private/portfolio.json")
#let basics = cv.basics

#set document(
  title: basics.name + " — Portfolio",
  author: basics.name,
)

#show: preamble

// A running footer, which the résumé does not have and this document needs: a
// résumé is two pages that are obviously one document, and this is N loose
// pages that are each about something different. Name on the left, page count
// on the right, in the muted-equivalent — 8pt ink at 60% is the only place
// either document departs from "everything is pure black", and it is chrome
// rather than content, which is the same line the website draws.
#set page(footer: context [
  #set text(size: 7pt, fill: ink.lighten(45%))
  #grid(
    columns: (1fr, auto),
    align: (left, right),
    [#basics.name — Portfolio],
    [#counter(page).display("1") / #counter(page).final().first()],
  )
])

// One row of the details table: a bold label in a fixed column and its value
// beside it.
//
// Fixed rather than `auto`, because an auto column is measured per table and
// the labels would then sit at a different x on every page — a table that does
// not line up across pages is the opposite of what this document is for.
//
// 100pt, and it is set by the `specs` labels rather than the fixed ones. The
// fixed set is short and known ("Context" is the longest), but specs labels are
// free text: "Reach demonstrated" and "Protection functions" both run past 80pt
// at 8pt bold. `hyphenate: false` goes with it — at 78pt the first of those
// broke as "Reach demon-strated", and a hyphenated word in a table label reads
// as a defect rather than as tight setting. Together they let a long label wrap
// at its space instead.
#let detail(label, value) = if value != "" {
  block(
    above: 12.4pt - cap * 8pt,
    breakable: false,
    grid(
      columns: (100pt, 1fr),
      column-gutter: 9pt,
      align: (left + top, left + top),
      text(weight: "bold", hyphenate: false)[#label], [#value],
    ),
  )
}

// Each project is its own page. `pagebreak(weak: true)` rather than a plain one
// so the first project does not open on a blank page — a weak break collapses
// when nothing has been laid out yet.
#for project in data.projects [
  #pagebreak(weak: true)

  // The project name takes the masthead the résumé gives Ehsan's own name.
  // Within this document the accent bar has exactly one job, which is the same
  // rationing rule the résumé and the site follow — one colour, one job — read
  // per document rather than across the pair.
  #masthead(project.name, (
    (gap: 15.4pt, body: text[
      #project.year
      #if project.status != "" [ · #project.status ]
      #if project.draft [ · write-up unpublished ]
      #if not project.featured [ · not on the CV page ]
    ]),
  ))

  #section([Summary], above: 36.7pt - cap * 10pt - 3.6pt)

  #project.summary

  #if project.tags.len() > 0 [
    #block(above: 12.5pt - cap * 8pt)[#project.tags.join(" · ")]
  ]

  #section[Project details]

  // `after-rule` on the first row for the same reason the résumé uses it:
  // Typst drops leading spacing at the start of a container, so the gap under a
  // section rule has to be declared from the rule's side, and the first block
  // after it needs the smaller value rather than the entry gap.
  #block(above: after-rule)[
    #detail("Role", project.role)
    #detail("Team", project.team)
    #detail("Context", project.context)
    #detail("Year", project.year)
    #detail("Tools", project.tools)
    #detail("Licence", project.licence)
    #if project.url != "" {
      detail("Page", link(project.url, project.url.replace("https://", "")))
    }
    #for l in project.links {
      detail(l.label, link(l.href, l.href.replace("https://", "")))
    }
  ]

  #if project.specs.len() > 0 [
    #section[Specifications]
    #block(above: after-rule)[
      #for spec in project.specs {
        detail(spec.label, spec.value)
      }
    ]
  ]

  // The cover last, and only if there is one. `fit: "contain"` inside a fixed
  // height rather than a bare width, because these are 16:10 exports and a
  // full-measure image is 345pt tall — which on a page that already carries two
  // tables is the difference between one page and two, and one page per project
  // is the document's whole shape.
  #if project.image != "" [
    #block(above: 22pt)[
      #box(
        width: 100%,
        height: 190pt,
        clip: true,
        image(project.image, width: 100%, fit: "contain"),
      )
    ]
  ]
]
