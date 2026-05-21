"use client"

import type { ComponentType } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { FeedItem, FeedType } from "@/data/feedData"
import {
  Bell,
  HandCoins,
  HeartHandshake,
  Megaphone,
  Sparkles,
  Trophy,
  CheckCircle2,
  Dot,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

const iconMap: Record<FeedType, { icon: ComponentType<{ className?: string }>; tone: string; label: string }> = {
  donation: { icon: HandCoins, tone: "bg-amber-100 text-amber-700", label: "Donation" },
  volunteer: { icon: HeartHandshake, tone: "bg-emerald-100 text-emerald-700", label: "Volunteer" },
  ngo_update: { icon: Megaphone, tone: "bg-sky-100 text-sky-700", label: "NGO Update" },
  recommendation: { icon: Sparkles, tone: "bg-violet-100 text-violet-700", label: "Recommendation" },
  milestone: { icon: Trophy, tone: "bg-rose-100 text-rose-700", label: "Milestone" },
}

type FeedCardProps = {
  item: FeedItem
  onToggleRead: (id: number) => void
}

export default function FeedCard({ item, onToggleRead }: FeedCardProps) {
  const config = iconMap[item.type]
  const Icon = config.icon
  const timeAgo = formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })

  return (
    <article
      className={cn(
        "group rounded-2xl border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg",
        !item.read && "border-primary/30 ring-1 ring-primary/10"
      )}
    >
      <div className="flex items-start gap-4">
        <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl", config.tone)}>
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="border-0 bg-muted text-foreground">
                  {config.label}
                </Badge>
                {!item.read && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                    <Dot className="h-4 w-4" />
                    Unread
                  </span>
                )}
              </div>
              <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{item.message}</p>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
              onClick={() => onToggleRead(item.id)}
            >
              {item.read ? <Bell className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
              {item.read ? "Mark unread" : "Mark read"}
            </Button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="font-medium text-foreground/80">{item.ngo}</span>
            <span>•</span>
            <span>{timeAgo}</span>
          </div>
        </div>
      </div>
    </article>
  )
}
