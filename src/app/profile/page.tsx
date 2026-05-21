'use client';

import { NgoCard } from '@/components/ngo-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Heart, Search, Loader2, ShieldCheck, Crown } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import apiClient from '@/lib/api-client';
import { NGO } from '@/types';
import { useState, useEffect } from 'react';

export default function ProfilePage() {
  const { user, isLoading: isUserLoading } = useAuth();
  const [followedNgos, setFollowedNgos] = useState<NGO[]>([]);
  const [isFollowingLoading, setIsFollowingLoading] = useState(false);

  const role = user?.role as string | undefined;
  const isSuperAdmin = role === 'SUPERADMIN' || role === 'superadmin';
  const isAdmin = role === 'ADMIN' || role === 'admin' || isSuperAdmin;

  useEffect(() => {
    if (!user?.followingNgoIds?.length) return;

    const fetchFollowedNgos = async () => {
      setIsFollowingLoading(true);
      try {
        const results = await Promise.all(
          (user.followingNgoIds || []).slice(0, 30).map(id => apiClient.getNgo(id).then(r => r.ngo).catch(() => null))
        );
        setFollowedNgos(results.filter(Boolean) as NGO[]);
      } catch (err) {
        console.error('Failed to load followed NGOs:', err);
      } finally {
        setIsFollowingLoading(false);
      }
    };

    fetchFollowedNgos();
  }, [user?.followingNgoIds]);

  if (isUserLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold">Please log in to view your profile.</h1>
      </div>
    );
  }

  const recentSearches = user.recentSearchTerms || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12">
        <div className="relative">
          <Avatar className="h-32 w-32 border-4 border-primary">
            <AvatarImage
              src={user.photoURL ?? `https://api.dicebear.com/8.x/adventurer/svg?seed=${user.id}`}
              alt={user.displayName || 'User profile picture'}
            />
            <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          {isSuperAdmin ? (
            <div className="absolute -bottom-2 -right-2 bg-destructive text-white p-1.5 rounded-full shadow-lg">
              <Crown className="h-5 w-5" />
            </div>
          ) : isAdmin ? (
            <div className="absolute -bottom-2 -right-2 bg-primary text-white p-1.5 rounded-full shadow-lg">
              <ShieldCheck className="h-5 w-5" />
            </div>
          ) : null}
        </div>
        <div className="text-center md:text-left flex-1">
          <h1 className="text-4xl font-headline font-bold">User Profile</h1>
          <p className="text-xl text-muted-foreground mt-2">{user.email}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2">
            <Badge variant={isSuperAdmin ? 'destructive' : isAdmin ? 'default' : 'secondary'}>
              {isSuperAdmin ? 'Super Administrator' : isAdmin ? 'Administrator' : 'Donor'}
            </Badge>
          </div>
          <p className="mt-4 max-w-xl text-muted-foreground">
            Welcome to your GiveWay profile. Track followed NGOs and manage your account.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-3xl font-headline font-bold mb-6 flex items-center">
            <Heart className="mr-3 h-7 w-7 text-primary" />
            Followed NGOs
          </h2>
          {isFollowingLoading ? (
            <p>Loading followed NGOs...</p>
          ) : followedNgos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {followedNgos.map((ngo) => (
                <NgoCard key={ngo.id} ngo={ngo} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">
              You aren't following any NGOs yet. Use the Discover page to find and follow organizations.
            </p>
          )}
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="mr-2 h-5 w-5" />
                Recent Searches
              </CardTitle>
              <CardDescription>Your recent search activity.</CardDescription>
            </CardHeader>
            <CardContent>
              {recentSearches.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {recentSearches.map((search, index) => (
                    <Badge key={index} variant="outline" className="text-md justify-start py-2 px-3">
                      {search}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No recent searches.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
