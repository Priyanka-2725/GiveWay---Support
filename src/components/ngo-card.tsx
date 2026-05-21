import Link from 'next/link';
import type { NGO } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Heart, BookOpen, Globe, ShieldCheck, TreePine, BadgeCheck } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { memo } from 'react';

const icons = {
  Heart,
  BookOpen,
  Globe,
  ShieldCheck,
  TreePine,
};

type NgoCardProps = {
  ngo: NGO;
};

export const NgoCard = memo(function NgoCard({ ngo }: NgoCardProps) {
  const Icon = icons[ngo.icon as keyof typeof icons] || Globe;
  const progress = Math.min(Math.round(((ngo.raisedAmount || 0) / (ngo.goalAmount || 1)) * 100), 100);

  return (
    <Link href={`/ngos/${ngo.id}`} className="group block h-full">
      <Card className="flex h-full flex-col overflow-hidden border bg-card shadow-sm transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl">
        <CardHeader className="items-start pb-2">
          <div className="flex w-full items-start justify-between gap-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            {ngo.verified && (
              <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">
                <BadgeCheck className="mr-1 h-3 w-3" /> Verified
              </Badge>
            )}
          </div>
          <CardTitle className="mt-4 text-left font-headline text-xl text-accent transition-colors group-hover:text-primary line-clamp-2">
            {ngo.name}
          </CardTitle>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            {ngo.cause} • {ngo.state}
          </p>
        </CardHeader>
        <CardContent className="flex-grow px-6 text-left">
          <p className="line-clamp-3 text-sm text-muted-foreground">{ngo.shortDescription}</p>
        </CardContent>
        <CardFooter className="mt-auto flex flex-col gap-2 border-t bg-secondary/10 px-6 pt-4">
          <div className="flex justify-between w-full text-[10px] font-bold">
            <span>Goal: ₹{(ngo.goalAmount || 0).toLocaleString()}</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
          <p className="text-[10px] text-muted-foreground text-right w-full">
            ₹{(ngo.raisedAmount || 0).toLocaleString()} raised
          </p>
        </CardFooter>
      </Card>
    </Link>
  );
});