"use client"

import { cn } from "@/lib/utils"
import type { FeedSection } from "@/data/feedData"
import { feedTabs } from "@/data/feedData"

type FeedTabsProps = {
  value: FeedSection
  onChange: (value: FeedSection) => void
  counts?: Partial<Record<FeedSection, number>>
}

export default function FeedTabs({ value, onChange, counts }: FeedTabsProps) {
  return (
    <div className="grid gap-3 md:grid-cols-4">
      {feedTabs.map((tab) => {
        const active = value === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              "rounded-2xl border p-4 text-left transition-all duration-200 hover:-translate-y-0.5",
              active
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border bg-card hover:shadow-sm"
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className={cn("text-sm font-semibold", active ? "text-primary" : "text-foreground")}>{tab.label}</p>
                <p className="mt-1 text-sm text-muted-foreground">{tab.description}</p>
              </div>
              {typeof counts?.[tab.id] === "number" && (
                <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", active ? "bg-primary text-primary-foreground" : "bg-muted text-foreground")}>{counts[tab.id]}</span>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}
