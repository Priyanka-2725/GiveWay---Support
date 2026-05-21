'use client';

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useMemo, useState, useEffect } from 'react';
import { Loader2, MapPin, Target, BadgeCheck, Users, Briefcase, Globe, ShieldAlert, Trash2 } from 'lucide-react';

import { useAuth } from '@/contexts/auth-context';
import apiClient from '@/lib/api-client';
import { NGO } from '@/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import VolunteerModal from '@/components/volunteer-modal';
import DonationModal from '@/components/donation-modal';
import { useToast } from '@/hooks/use-toast';
import NgoPosts from '@/components/ngo-posts';
import NgoNeeds from '@/components/ngo-needs';

export default function NgoPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { user } = useAuth();
  const { toast } = useToast();
  const [ngo, setNgo] = useState<NGO | null>(null);
  const [isNgoLoading, setIsNgoLoading] = useState(true);

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'admin' ||
    user?.role === 'SUPERADMIN' || user?.role === 'superadmin';

  useEffect(() => {
    if (!id) return;

    const fetchNgo = async () => {
      setIsNgoLoading(true);
      try {
        const res = await apiClient.getNgo(id);
        setNgo(res.ngo);
      } catch (err) {
        console.error('Failed to load NGO:', err);
        setNgo(null);
      } finally {
        setIsNgoLoading(false);
      }
    };

    fetchNgo();
  }, [id]);

  const handleToggleVerify = async () => {
    if (!ngo) return;
    try {
      const res = await apiClient.updateNgo(ngo.id, { verified: !ngo.verified });
      setNgo(res.ngo);
      toast({ title: ngo.verified ? 'NGO Unverified' : 'NGO Verified!' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error updating status', description: e.message });
    }
  };

  const handleDeleteNgo = async () => {
    if (!ngo) return;
    if (!confirm('Are you sure you want to delete this NGO? This action cannot be undone.')) return;
    try {
      await apiClient.deleteNgo(ngo.id);
      toast({ title: 'NGO Deleted' });
      router.push('/discover');
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error deleting NGO', description: e.message });
    }
  };

  if (isNgoLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!ngo) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl font-headline font-bold mb-4">NGO Not Found</h1>
        <p className="text-muted-foreground mb-8">The organization you are looking for doesn't exist or has been removed.</p>
        <Button asChild>
          <a href="/discover">Back to Discovery</a>
        </Button>
      </div>
    );
  }

  const placeholder = PlaceHolderImages.find((p) => p.id === ngo.image);
  const imageUrl = placeholder?.imageUrl ?? `https://picsum.photos/seed/${id}/1200/600`;
  const progress = Math.min(Math.round(((ngo.raisedAmount || 0) / (ngo.goalAmount || 1)) * 100), 100);
  const posts = (ngo as any).posts || [];
  const needs = (ngo as any).needs || [];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Section */}
      <section className="relative w-full h-[40vh] md:h-[50vh] min-h-[300px] overflow-hidden">
        <Image src={imageUrl} alt={ngo.name} fill priority className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12">
          <div className="container mx-auto">
            <div className="flex flex-col gap-4 max-w-4xl">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl md:text-6xl font-headline font-bold text-white tracking-tight">
                  {ngo.name}
                </h1>
                {ngo.verified && (
                  <BadgeCheck className="h-8 w-8 md:h-12 md:w-12 text-blue-400 fill-white shrink-0" />
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4 text-white/90">
                <div className="flex items-center gap-1 text-sm md:text-lg">
                  <MapPin className="h-5 w-5 text-primary" />
                  {ngo.city}, {ngo.state}
                </div>
                <div className="h-1.5 w-1.5 rounded-full bg-white/30 hidden md:block" />
                <Badge variant="secondary" className="bg-primary text-primary-foreground text-sm md:text-base px-4">
                  {ngo.cause}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 mt-8 md:mt-12">
        {/* Admin Section */}
        {isAdmin && (
          <Card className="mb-8 border-destructive/20 bg-destructive/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <ShieldAlert className="h-5 w-5" />
                  Admin Controls
                </CardTitle>
                <CardDescription>Management tools for this organization profile.</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleToggleVerify}>
                  {ngo.verified ? 'Unverify' : 'Verify NGO'}
                </Button>
                <Button variant="destructive" size="sm" onClick={handleDeleteNgo}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete NGO
                </Button>
              </div>
            </CardHeader>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <Card className="border-2 border-primary/10 shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center gap-2">
                  <Target className="h-6 w-6 text-primary" />
                  Fundraising Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-3xl font-bold text-accent">₹{ngo.raisedAmount?.toLocaleString() || 0}</p>
                    <p className="text-sm text-muted-foreground">raised of ₹{ngo.goalAmount?.toLocaleString() || 0} goal</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{progress}%</p>
                    <p className="text-sm text-muted-foreground text-nowrap">Funded</p>
                  </div>
                </div>
                <Progress value={progress} className="h-4 bg-secondary" />
              </CardContent>
            </Card>

            <section className="space-y-6">
              <h2 className="text-3xl font-headline font-bold text-foreground border-b-2 border-primary/20 pb-2">
                About the Organization
              </h2>
              <div className="prose prose-lg max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {ngo.description}
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="text-3xl font-headline font-bold text-foreground border-b-2 border-primary/20 pb-2">
                Our Impact
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <Card className="bg-secondary/20 border-none shadow-sm">
                  <CardContent className="p-6 text-center space-y-2">
                    <Users className="h-8 w-8 mx-auto text-primary" />
                    <p className="text-2xl font-bold">5,000+</p>
                    <p className="text-sm text-muted-foreground">People Helped</p>
                  </CardContent>
                </Card>
                <Card className="bg-secondary/20 border-none shadow-sm">
                  <CardContent className="p-6 text-center space-y-2">
                    <Briefcase className="h-8 w-8 mx-auto text-primary" />
                    <p className="text-2xl font-bold">120+</p>
                    <p className="text-sm text-muted-foreground">Projects Completed</p>
                  </CardContent>
                </Card>
                <Card className="bg-secondary/20 border-none shadow-sm">
                  <CardContent className="p-6 text-center space-y-2">
                    <Globe className="h-8 w-8 mx-auto text-primary" />
                    <p className="text-2xl font-bold">15+</p>
                    <p className="text-sm text-muted-foreground">Communities Served</p>
                  </CardContent>
                </Card>
              </div>
            </section>

            {posts.length > 0 && (
              <NgoPosts posts={posts} isLoading={false} />
            )}

            {needs.length > 0 && (
              <NgoNeeds needs={needs} isLoading={false} />
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-6">
              <Card className="shadow-xl border-primary/20">
                <CardHeader>
                  <CardTitle className="text-xl">Support our mission</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {user ? <DonationModal ngo={ngo} /> : (
                    <Button size="lg" className="w-full text-lg h-14 font-bold" asChild>
                      <a href="/login">Login to Donate</a>
                    </Button>
                  )}
                  {user ? <VolunteerModal ngo={ngo} hasAlreadyRequested={false} /> : (
                    <Button size="lg" variant="outline" className="w-full text-lg h-14" asChild>
                      <a href="/login">Login to Volunteer</a>
                    </Button>
                  )}
                  <p className="text-xs text-center text-muted-foreground px-4">
                    Your contribution directly supports our active projects and operational costs.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-accent/5 border-accent/10">
                <CardHeader>
                  <CardTitle className="text-sm uppercase tracking-wider text-accent font-bold">Organization Details</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cause:</span>
                    <span className="font-semibold">{ngo.cause}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location:</span>
                    <span className="font-semibold">{ngo.city}, {ngo.state}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Verified Status:</span>
                    <span className={`font-semibold ${ngo.verified ? 'text-green-600' : 'text-muted-foreground'}`}>
                      {ngo.verified ? 'Verified Partner' : 'Standard Member'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
