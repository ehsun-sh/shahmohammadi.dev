/** Feature flags for phases that are not finished yet. */
export const site = {
  /** The Typst pipeline builds public/resume.pdf on every deploy (Phase 4).
   *  The download link and the primary hero CTA are gated on this. */
  resumeReady: true,
  /** Flip to true when /services and /contact ship (Phase 3). */
  servicesReady: true,

  /**
   * Web3Forms access key for the contact form. This key is designed to live in
   * client HTML — it is not a secret and belongs in the repo.
   *
   * Get one free at web3forms.com (enter the address you want mail delivered
   * to; they email you the key). Until it is set, /contact shows the direct
   * channels only rather than a form that silently fails.
   */
  web3formsKey: '01525581-4ba4-4749-87e2-63cd1fc140a5',
  /** Flip to true when /projects has at least one non-draft entry (Phase 5). */
  projectsReady: false,
  /** Flip to true when /notes ships (Phase 7). */
  notesReady: false,

  /**
   * Privacy-friendly analytics. Off until you supply a site code, so no
   * third-party script reaches a visitor by default and no cookie banner is
   * needed. Both options below are cookieless and do not collect personal data.
   *
   *   goatcounter — sign up at goatcounter.com, then set `code` to your
   *                 subdomain (the `<code>.goatcounter.com` part).
   *   cloudflare  — Cloudflare Web Analytics, then set `code` to the token
   *                 from the dashboard snippet.
   *
   * Set `provider` to 'none' to ship nothing.
   */
  analytics: {
    provider: 'none' as 'none' | 'goatcounter' | 'cloudflare',
    code: '',
  },
} as const;
