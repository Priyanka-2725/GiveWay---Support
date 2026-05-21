"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import type { ComponentType } from "react"
import {
  ArrowRight,
  Bell,
  Flame,
  Loader2,
  Rss,
  Sparkles,
  TrendingUp,
  CheckCheck,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import FeedCard from "@/components/feed/FeedCard"
import FeedFilter from "@/components/feed/FeedFilter"
import FeedTabs from "@/components/feed/FeedTabs"
import EmptyFeed from "@/components/feed/EmptyFeed"
import { ngos } from "@/lib/data"
import {
  feedData,
  feedTabs,
  type FeedItem,
  type FeedSection,
  type FeedType,
} from "@/data/feedData"

function sortLatest(items: FeedItem[]) {
  return [...items].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  )
}

function getSectionItems(items: FeedItem[], section: FeedSection) {
  switch (section) {
    case "recent-activity":
      return items.filter((item) => item.type !== "recommendation")
    case "recommendations":
      return items.filter((item) => item.type === "recommendation")
    case "urgent-causes":
      return items.filter((item) => item.type === "milestone" || item.type === "ngo_update")
    default:
      return items
  }
}

function getFilteredItems(items: FeedItem[], section: FeedSection, typeFilter: FeedType | "all") {
  const sectionItems = getSectionItems(items, section)
  const typedItems = typeFilter === "all" ? sectionItems : sectionItems.filter((item) => item.type === typeFilter)

  if (section === "for-you") {
    return [...typedItems].sort((left, right) => {
      if (left.read !== right.read) {
        return left.read ? 1 : -1
      }

      return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
    })
  }

  return sortLatest(typedItems)
}

function getTypeCounts(items: FeedItem[]) {
  const counts: Record<FeedType | "all", number> = {
    all: items.length,
    donation: 0,
    volunteer: 0,
    ngo_update: 0,
    recommendation: 0,
    milestone: 0,
  }

  for (const item of items) {
    counts[item.type] += 1
  }

  return counts
}

function getSectionCounts(items: FeedItem[]) {
  return {
    "for-you": items.length,
    "recent-activity": items.filter((item) => item.type !== "recommendation").length,
    recommendations: items.filter((item) => item.type === "recommendation").length,
    "urgent-causes": items.filter((item) => item.type === "milestone" || item.type === "ngo_update").length,
  } satisfies Record<FeedSection, number>
}

function recommendedNgos() {
  return [...ngos]
    .filter((ngo) => ngo.verified)
    .sort((left, right) => (right.impactScore ?? 0) - (left.impactScore ?? 0))
    .slice(0, 4)
}

export default function MyFeedPage() {
  const [items, setItems] = useState<FeedItem[]>(feedData)
  const [activeSection, setActiveSection] = useState<FeedSection>("for-you")
  const [activeTypeFilter, setActiveTypeFilter] = useState<FeedType | "all">("all")
  const [visibleCount, setVisibleCount] = useState(6)
  const [isLoading, setIsLoading] = useState(true)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 500)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    setVisibleCount(6)
  }, [activeSection, activeTypeFilter])

  const unreadCount = items.filter((item) => !item.read).length
  const filteredItems = getFilteredItems(items, activeSection, activeTypeFilter)
  const visibleItems = filteredItems.slice(0, visibleCount)
  const hasMore = visibleCount < filteredItems.length
  const typeCounts = getTypeCounts(items)
  const sectionCounts = getSectionCounts(items)
  const currentTab = feedTabs.find((tab) => tab.id === activeSection)
  const topNgos = recommendedNgos()

  useEffect(() => {
    if (!hasMore || !sentinelRef.current) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((current) => Math.min(current + 4, filteredItems.length))
        }
      },
      { threshold: 0.5, rootMargin: "120px" }
    )

    observer.observe(sentinelRef.current)

    return () => observer.disconnect()
  }, [filteredItems.length, hasMore, visibleCount])

  const toggleRead = (id: number) => {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, read: !item.read } : item))
    )
  }

  const markAllRead = () => {
    setItems((current) => current.map((item) => ({ ...item, read: true })))
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-3xl border bg-card p-6 shadow-sm">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="mt-3 h-5 w-96 max-w-full" />
          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-24 rounded-2xl" />
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-40 rounded-3xl" />
            ))}
          </div>
          <Skeleton className="h-[420px] rounded-3xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] border bg-gradient-to-br from-background via-background to-primary/5 p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              <Rss className="h-3.5 w-3.5 text-primary" />
              Personal feed
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-5xl">My Feed</h1>
              <p className="mt-3 max-w-2xl text-sm text-muted-foreground md:text-base">
                A local-first activity timeline for donations, volunteer approvals, NGO updates,
                milestones, and personalized recommendations.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/discover">
                  Discover NGOs <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" onClick={markAllRead}>
                <CheckCheck className="h-4 w-4" />
                Mark all read
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard icon={Bell} label="Unread" value={unreadCount} tone="bg-primary/10 text-primary" />
            <MetricCard icon={Sparkles} label="Recommendations" value={typeCounts.recommendation} tone="bg-violet-100 text-violet-700" />
            <MetricCard icon={Flame} label="Urgent" value={sectionCounts["urgent-causes"]} tone="bg-rose-100 text-rose-700" />
            <MetricCard icon={TrendingUp} label="Activity" value={items.length} tone="bg-emerald-100 text-emerald-700" />
          </div>
        </div>
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <FeedTabs
            value={activeSection}
            onChange={setActiveSection}
            counts={sectionCounts}
          />

          <section className="rounded-3xl border bg-card p-5 shadow-sm md:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  {currentTab?.label ?? "Feed"}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {currentTab?.description ?? "Your latest activity"}
                </p>
              </div>

              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span>{filteredItems.length} items</span>
                <span>•</span>
                <span>{unreadCount} unread</span>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-4 border-t pt-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Filter feed type
                </div>
                <FeedFilter value={activeTypeFilter} onChange={setActiveTypeFilter} counts={typeCounts} />
              </div>

              <div className="space-y-4">
                {visibleItems.length === 0 ? (
                  <EmptyFeed
                    title="No feed items match this view"
                    description="Try a different section or filter to see more activity in your timeline."
                  />
                ) : (
                  visibleItems.map((item) => (
                    <FeedCard key={item.id} item={item} onToggleRead={toggleRead} />
                  ))
                )}
              </div>

              {hasMore && (
                <div ref={sentinelRef} className="flex items-center justify-center py-4 text-sm text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading more activity
                </div>
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-3xl border bg-card p-5 shadow-sm md:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Recommended NGOs</h2>
                <p className="mt-1 text-sm text-muted-foreground">High-impact local matches for you</p>
              </div>
              <Sparkles className="h-5 w-5 text-primary" />
            </div>

            <div className="mt-5 space-y-4">
              {topNgos.map((ngo) => {
                const progress = Math.min((ngo.raisedAmount / ngo.goalAmount) * 100, 100)
                return (
                  <div key={ngo.id} className="rounded-2xl border p-4 transition-all hover:shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-foreground">{ngo.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {ngo.cause} • {ngo.city}
                        </p>
                      </div>
                      <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                        {ngo.impactScore}%
                      </span>
                    </div>

                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3 text-sm text-muted-foreground">
                      <span>
                        ₹{ngo.raisedAmount.toLocaleString()} / ₹{ngo.goalAmount.toLocaleString()}
                      </span>
                      <Button asChild size="sm" variant="ghost" className="px-0 text-primary hover:bg-transparent">
                        <Link href={`/ngos/${ngo.id}`}>
                          View
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          <section className="rounded-3xl border bg-gradient-to-br from-primary/10 to-background p-5 shadow-sm md:p-6">
            <h2 className="text-lg font-semibold text-foreground">Why this works</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              This version keeps the feed fully local, so you can refine layout, filters, empty states,
              and interaction patterns before connecting Firestore or backend triggers later.
            </p>
          </section>
        </aside>
      </div>
    </div>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: ComponentType<{ className?: string }>
  label: string
  value: number
  tone: string
}) {
  return (
    <div className="rounded-2xl border bg-background p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-2xl", tone)}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm leading-tight text-muted-foreground whitespace-normal break-words">
            {label}
          </p>
          <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
        </div>
      </div>
    </div>
  )
}
