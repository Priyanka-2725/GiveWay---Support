import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Frown } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center text-center px-4">
      <Frown className="w-24 h-24 text-primary mb-4" />
      <h1 className="text-6xl font-headline font-bold text-primary">404</h1>
      <h2 className="text-3xl font-headline mt-4">Page Not Found</h2>
      <p className="text-muted-foreground mt-4 max-w-md">
        Sorry, the page you are looking for does not exist. It might have been moved or deleted.
      </p>
      <Button asChild className="mt-8">
        <Link href="/">Return to Homepage</Link>
      </Button>
    </div>
  )
}
