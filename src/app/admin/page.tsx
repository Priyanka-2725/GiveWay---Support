'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import apiClient from '@/lib/api-client';
import { NGO } from '@/types';
import { Loader2, ShieldCheck, CheckCircle, Building2, ExternalLink, Trash2, Crown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const { user, isLoading: isUserLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [pendingNgos, setPendingNgos] = useState<NGO[]>([]);
  const [isNgosLoading, setIsNgosLoading] = useState(false);

  const role = user?.role as string | undefined;
  const isSuperAdmin = role === 'SUPERADMIN' || role === 'superadmin';
  const isAdmin = role === 'ADMIN' || role === 'admin' || isSuperAdmin;

  useEffect(() => {
    if (!isUserLoading) {
      if (!user) {
        router.push('/login');
      } else if (!isAdmin) {
        router.push('/discover');
      }
    }
  }, [user, isUserLoading, isAdmin, router]);

  useEffect(() => {
    if (!isAdmin) return;

    const fetchPendingNgos = async () => {
      setIsNgosLoading(true);
      try {
        const res = await apiClient.getNgos({ verified: false });
        setPendingNgos(res.ngos || []);
      } catch (err) {
        console.error('Failed to load pending NGOs:', err);
      } finally {
        setIsNgosLoading(false);
      }
    };

    fetchPendingNgos();
  }, [isAdmin]);

  const handleApprove = async (ngo: NGO) => {
    try {
      await apiClient.updateNgo(ngo.id, { verified: true });
      setPendingNgos(prev => prev.filter(n => n.id !== ngo.id));
      toast({ title: 'NGO Approved', description: `${ngo.name} is now verified.` });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Approval Failed', description: e.message });
    }
  };

  const handleDelete = async (ngo: NGO) => {
    if (!isSuperAdmin) return;
    if (!confirm(`Are you sure you want to permanently delete ${ngo.name}? This cannot be undone.`)) return;

    try {
      await apiClient.deleteNgo(ngo.id);
      setPendingNgos(prev => prev.filter(n => n.id !== ngo.id));
      toast({ title: 'NGO Deleted', description: `${ngo.name} has been removed from the platform.` });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Deletion Failed', description: e.message });
    }
  };

  if (isUserLoading || (!isAdmin && user)) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          {isSuperAdmin ? <Crown className="h-8 w-8 text-destructive" /> : <ShieldCheck className="h-8 w-8 text-primary" />}
          <h1 className="text-4xl font-headline font-bold">
            {isSuperAdmin ? 'SuperAdmin Panel' : 'Admin Panel'}
          </h1>
        </div>
        <Badge variant={isSuperAdmin ? 'destructive' : 'default'} className="px-4 py-1 uppercase tracking-widest">
          {isSuperAdmin ? 'superadmin' : 'admin'} Access
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Verification Queue
            </CardTitle>
            <CardDescription>Review and approve NGOs applying for partnership status.</CardDescription>
          </CardHeader>
          <CardContent>
            {isNgosLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : pendingNgos.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-lg bg-background">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">The queue is empty. All current NGOs are verified.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingNgos.map((ngo) => (
                  <div key={ngo.id} className="flex flex-col lg:flex-row justify-between items-start lg:items-center p-6 bg-background border rounded-xl shadow-sm gap-4">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold">{ngo.name}</h3>
                        <Badge variant="outline">{ngo.cause}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{ngo.city}, {ngo.state} • Goal: ₹{ngo.goalAmount?.toLocaleString()}</p>
                      <p className="text-sm italic line-clamp-1 max-w-md">"{ngo.shortDescription}"</p>
                    </div>
                    <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                      <Button variant="outline" size="sm" asChild className="flex-1 lg:flex-none">
                        <Link href={`/ngos/${ngo.id}`} target="_blank">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Review
                        </Link>
                      </Button>
                      <Button size="sm" onClick={() => handleApprove(ngo)} className="flex-1 lg:flex-none bg-green-600 hover:bg-green-700">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Verify
                      </Button>
                      {isSuperAdmin && (
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(ngo)} className="flex-1 lg:flex-none">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
