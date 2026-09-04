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
// **The typography lives in base.typ and so does the note explaining where
// every number in it came from.** This file is the résumé's content and
// section order and nothing else; portfolio.typ imports the same module, which
// is the only reason the two documents can be trusted to look like a set.
//
// Two deliberate departures from the reference, both recorded rather than
// silent. It sets headings in Arimo and body in Noto Sans; these documents use
// Noto Sans throughout, because agreeing with the website is the whole reason
// they have a typeface at all. And its accent bar is #155DFC; this one stays on
// the site's --color-accent-solid, for the same reason.

#import "base.typ": *

#let basics = cv.basics

#set document(
  title: basics.name + " — " + basics.label,
  author: basics.name,
  keywords: cv.skills.map(g => g.items).flatten(),
)

#show: preamble

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

#masthead(basics.name, (
  (gap: 15.4pt, body: text[#basics.label]),
  (gap: 13.6pt, body: contact-items.join(h(9pt))),
))
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

// The first `max-highlights` bullets of each role, not all of them. Same
// argument as `featured` below and the same shape: cv.json holds everything
// because the website has room for everything, and this document has a page
// count. Without it the résumé runs to a third page carrying nothing but the
// Awards section, which is worse than any bullet it saves.
//
// It is a slice and not a flag, so no fact leaves cv.json and the site keeps
// every bullet. The cost is that a role's bullets are now ORDERED — the ones
// that must reach the PDF have to lead — which is the right pressure anyway:
// a reader who stops after four has stopped after the four you chose.
#let max-highlights = 4

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
    #bullets(job.highlights.slice(0, calc.min(max-highlights, job.highlights.len())))
  ]
]

// ---------------------------------------------------------------- projects ---

// `featured` only. cv.json holds every project because /projects lists every
// project; this document is one page and cannot. Same flag the landing page
// reads, so the two can never disagree about which projects are the ones —
// and a project added for the website does not silently push this to a second
// page. The heading stays "Selected", which is what a CV calls a subset;
// "Featured" is the website's word for it, and it earns it there by sitting
// above a link to the full list, which a PDF has no equivalent of.
#let featured = cv.projects.filter(p => p.at("featured", default: false))

#if featured.len() > 0 [
  #section[Selected Projects]
  #for (i, project) in featured.enumerate() [
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
