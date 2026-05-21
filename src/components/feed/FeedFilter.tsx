"use client"

import { cn } from "@/lib/utils"
import { feedTypeOptions, type FeedType } from "@/data/feedData"

type FeedFilterProps = {
  value: FeedType | "all"
  onChange: (value: FeedType | "all") => void
  counts?: Partial<Record<FeedType | "all", number>>
}

export default function FeedFilter({ value, onChange, counts }: FeedFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {feedTypeOptions.map((option) => {
        const active = value === option.id
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all",
              active
                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
            )}
          >
            <span>{option.label}</span>
            {typeof counts?.[option.id] === "number" && (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-semibold",
                  active ? "bg-primary-foreground/15 text-primary-foreground" : "bg-muted text-foreground"
                )}
              >
                {counts[option.id]}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
