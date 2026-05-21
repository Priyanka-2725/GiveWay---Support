"use client"

import { useEffect } from "react"

export default function HideNextDevtools() {
  useEffect(() => {
    const removeMatching = (root: ParentNode = document) => {
      try {
        const selectors = [
          'button[aria-label*="Next.js"]',
          'button[aria-label*="Open Next.js"]',
          'button[title*="Next.js"]',
          'button[title*="Open Next.js"]',
          'button[aria-label*="Open Next.js Dev Tools"]',
          'button[title="Open Next.js Dev Tools"]',
          '[data-nextjs-devtools]'
        ]

        for (const sel of selectors) {
          const els = Array.from(root.querySelectorAll(sel))
          for (const el of els) {
            if (el instanceof HTMLElement) el.style.display = "none"
          }
        }

        // also hide likely circular icon elements by position
        const all = Array.from(document.querySelectorAll('div,button'))
        for (const el of all) {
          if (!(el instanceof HTMLElement)) continue
          const r = el.getBoundingClientRect()
          if (r.width > 10 && r.height > 10 && r.left < 80 && (window.innerHeight - r.bottom) < 80) {
            // heuristics: small circular element bottom-left
            const bg = window.getComputedStyle(el).backgroundImage || ''
            if (bg.includes('data:image') || bg.includes('svg') || el.textContent?.trim() === 'N') {
              el.style.display = 'none'
            }
          }
        }
      } catch (e) {
        // ignore
      }
    }

    removeMatching(document)

    const obs = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.addedNodes && m.addedNodes.length) {
          removeMatching(m.target as ParentNode)
        }
      }
    })

    obs.observe(document, { childList: true, subtree: true })

    return () => obs.disconnect()
  }, [])

  return null
}
