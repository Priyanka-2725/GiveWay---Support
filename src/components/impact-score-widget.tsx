'use client';

import { useState, useTransition, useEffect } from 'react';
import type { NGO } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import apiClient from '@/lib/api-client';

type ImpactScoreWidgetProps = {
  ngo: NGO;
};

export default function ImpactScoreWidget({ ngo }: ImpactScoreWidgetProps) {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [currentScore, setCurrentScore] = useState(ngo.impactScore ?? 0);

  const calculateLocalImpactScore = () => {
    const baseScore = ngo.impactScore ?? 0;
    const verifiedBonus = ngo.verified ? 8 : 0;
    const fundingRatio = ngo.goalAmount ? Math.min((ngo.raisedAmount || 0) / ngo.goalAmount, 1) : 0;
    const fundingBonus = Math.round(fundingRatio * 20);
    const descriptionBonus = Math.min(Math.floor((ngo.description?.length || 0) / 80), 10);
    return Math.min(100, Math.max(0, Math.round(baseScore || verifiedBonus + fundingBonus + descriptionBonus || 50)));
  };

  useEffect(() => {
    if (user?.followingNgoIds?.includes(ngo.id)) {
      setIsFollowing(true);
    } else {
      setIsFollowing(false);
    }
  }, [user, ngo.id]);

  const handleFollow = async () => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Please log in',
        description: 'You need to be logged in to follow an NGO.',
      });
      return;
    }

    try {
      const currentFollowing = user.followingNgoIds || [];
      const updatedFollowing = isFollowing
        ? currentFollowing.filter((id) => id !== ngo.id)
        : [...currentFollowing, ngo.id];

      await apiClient.updateUser(user.id, { followingNgoIds: updatedFollowing });

      setIsFollowing(!isFollowing);
      toast({ title: isFollowing ? 'Unfollowed NGO.' : 'Followed NGO!' });
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not update follows.' });
    }
  };

  const handleRecalculate = () => {
    startTransition(async () => {
      try {
        const score = calculateLocalImpactScore();
        setCurrentScore(score);
        toast({
          title: 'Impact Score Updated',
          description: (
            <div>
              <p className="font-bold">New Score: {score}</p>
              <p className="text-sm mt-2">Based on verification, funding progress, and profile completeness.</p>
            </div>
          ),
        });
      } catch {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to recalculate impact score.' });
      }
    });
  };

  return (
    <Card className="text-center">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Impact Score</CardTitle>
        <CardDescription>A lightweight score based on public profile data and funding progress.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative w-32 h-32 mx-auto">
          <svg className="w-full h-full" viewBox="0 0 36 36">
            <path
              className="text-gray-200"
              strokeWidth="3"
              fill="none"
              stroke="currentColor"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-primary"
              strokeWidth="3"
              fill="none"
              stroke="currentColor"
              strokeDasharray={`${currentScore}, 100`}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl font-bold text-primary">{currentScore}</span>
          </div>
        </div>

        <div className="flex justify-center gap-2">
          <Button
            onClick={handleFollow}
            variant={isFollowing ? 'default' : 'outline'}
            className="w-full"
            disabled={!user}
          >
            <Heart className={`mr-2 h-4 w-4 ${isFollowing ? 'fill-current' : ''}`} />
            {isFollowing ? 'Following' : 'Follow'}
          </Button>
          <Button
            onClick={handleRecalculate}
            disabled={isPending}
            variant="outline"
            className="w-full bg-accent/10 text-accent-foreground hover:bg-accent/20"
          >
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4 text-accent" />}
            Recalculate
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
