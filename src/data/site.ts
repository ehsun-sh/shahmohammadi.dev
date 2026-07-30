/** Feature flags for phases that are not finished yet. */
export const site = {
  /** Flip to true once the Typst pipeline lands (Phase 4). Until then the
   *  résumé link is hidden rather than pointing at a 404. */
  resumeReady: false,
  /** Flip to true when /services and /contact ship (Phase 3). */
  servicesReady: false,
  /** Flip to true when /projects has at least one non-draft entry (Phase 5). */
  projectsReady: false,
  /** Flip to true when /notes ships (Phase 7). */
  notesReady: false,
} as const;
