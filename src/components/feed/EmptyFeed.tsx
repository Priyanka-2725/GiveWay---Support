"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Inbox } from "lucide-react"

type EmptyFeedProps = {
  title?: string
  description?: string
}

export default function EmptyFeed({
  title = "Your feed is empty",
  description = "Follow more NGOs, donate, or volunteer to see personalized activity here.",
}: EmptyFeedProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed bg-card px-6 py-16 text-center shadow-sm">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Inbox className="h-6 w-6" />
      </div>
      <h3 className="text-xl font-semibold text-foreground">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button asChild>
          <Link href="/discover">Discover NGOs</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/signup">Join the community</Link>
        </Button>
      </div>
    </div>
  )
}
