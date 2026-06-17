'use client';

import { useAuth } from '@/contexts/auth-context';
import apiClient from '@/lib/api-client';
import { NGO, VolunteerRequest, Donation } from '@/types';
import { Loader2, LayoutDashboard, Heart, Users, Info, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import ManageNgoNeeds from '@/components/manage-ngo-needs';
import ManageNgoPosts from '@/components/manage-ngo-posts';
import ManageNgoMembers from '@/components/manage-ngo-members';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function NgoDashboardPage() {
  const { user, isLoading: isUserLoading } = useAuth();
  const router = useRouter();
  const [userNgo, setUserNgo] = useState<NGO | null>(null);
  const [volunteers, setVolunteers] = useState<VolunteerRequest[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [isNgoLoading, setIsNgoLoading] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    if (!user?.id) return;

    const fetchNgo = async () => {
      setIsNgoLoading(true);
      try {
        const res = await apiClient.getNgos({ limit: 10 });
        // Find NGO where user is a member
        const myNgo = res.ngos.find((n: any) =>
          n.members && (n.members[user.id] === 'owner' || n.members[user.id] === 'manager')
        );
        if (myNgo) {
          setUserNgo(myNgo);
          const [donRes, volRes] = await Promise.all([
            apiClient.getDonations({ ngoId: myNgo.id }),
            apiClient.getVolunteerRequests({ ngoId: myNgo.id }),
          ]);
          setDonations(donRes.donations || []);
          setVolunteers(volRes.volunteerRequests || []);
        }
      } catch (err) {
        console.error('Failed to load NGO data:', err);
      } finally {
        setIsNgoLoading(false);
      }
    };

    fetchNgo();
  }, [user?.id]);

  const handleStatusChange = async (reqId: string, status: 'accepted' | 'rejected') => {
    try {
      const res = await apiClient.updateVolunteerRequestStatus(reqId, status);
      setVolunteers(prev =>
        prev.map(v => v.id === reqId ? res.volunteerRequest : v)
      );
    } catch (err) {
      console.error('Failed to update volunteer request status:', err);
    }
  };

  if (isUserLoading || isNgoLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  if (!userNgo) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Card className="border-2 border-primary/10 p-8 text-center">
          <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">No NGO Found</h2>
          <p className="text-muted-foreground">You are not associated with any NGO yet. Contact an admin to be added.</p>
        </Card>
      </div>
    );
  }

  const userNgoRole = (userNgo as any).members?.[user.id] || 'manager';
  const totalRaised = donations.reduce((sum, d) => sum + d.amount, 0) || userNgo.raisedAmount || 0;
  const progress = Math.min(Math.round((totalRaised / (userNgo.goalAmount || 1)) * 100), 100);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <LayoutDashboard className="h-6 w-6 text-primary" />
            <h1 className="text-4xl font-headline font-bold">NGO Admin Hub</h1>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <p>Managing: <span className="font-bold text-foreground">{userNgo.name}</span></p>
            <Badge variant="outline" className="capitalize">{userNgoRole}</Badge>
          </div>
        </div>
        {!userNgo.verified && (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 py-2 px-4 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Registration Pending Approval
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardDescription className="font-bold text-muted-foreground uppercase text-xs">Fundraising Progress</CardDescription>
            <CardTitle className="text-3xl font-bold text-primary">₹{totalRaised.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={progress} className="h-2 mb-2" />
            <p className="text-xs text-muted-foreground">{progress}% of ₹{userNgo.goalAmount?.toLocaleString()} target</p>
          </CardContent>
        </Card>
        <Card className="bg-accent/5 border-accent/20">
          <CardHeader className="pb-2">
            <CardDescription className="font-bold text-muted-foreground uppercase text-xs">Volunteers</CardDescription>
            <CardTitle className="text-3xl font-bold text-accent">{volunteers.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Active supporters helping the cause</p>
          </CardContent>
        </Card>
        <Card className="bg-secondary/20 border-none">
          <CardHeader className="pb-2">
            <CardDescription className="font-bold text-muted-foreground uppercase text-xs">Supporters</CardDescription>
            <CardTitle className="text-3xl font-bold">{donations.length} Donors</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Community contributions received</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="management" className="space-y-8">
        <TabsList className="grid w-full md:w-auto grid-cols-2 md:grid-cols-4 md:inline-flex h-auto p-1 bg-muted rounded-lg">
          <TabsTrigger value="management">Operations</TabsTrigger>
          <TabsTrigger value="team">
            <Users className="h-4 w-4 mr-2" />
            Team
          </TabsTrigger>
          <TabsTrigger value="volunteers">Applicants</TabsTrigger>
          <TabsTrigger value="donations">Donations</TabsTrigger>
        </TabsList>

        <TabsContent value="management" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ManageNgoPosts ngo={userNgo as any} />
            <ManageNgoNeeds ngo={userNgo as any} />
          </div>
        </TabsContent>

        <TabsContent value="team">
          <ManageNgoMembers ngo={userNgo} currentUserId={user.id} />
        </TabsContent>

        <TabsContent value="volunteers">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Volunteer Applicants
              </CardTitle>
              <CardDescription>Review and respond to community members wishing to help.</CardDescription>
            </CardHeader>
            <CardContent>
              {volunteers.length === 0 ? (
                <div className="text-center py-12">
                  <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p>No active volunteer applications.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Skills</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...volunteers]
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .map((v) => (
                        <TableRow key={v.id}>
                          <TableCell>
                            <div className="font-bold">{v.userName}</div>
                            <div className="text-xs text-muted-foreground">{v.userEmail}</div>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">{v.skills}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {format(new Date(v.createdAt), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant={v.status === 'accepted' ? 'default' : v.status === 'rejected' ? 'destructive' : 'outline'}
                                className={v.status === 'accepted' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50' : ''}
                              >
                                {v.status}
                              </Badge>
                              {v.status === 'pending' && (
                                <div className="flex items-center gap-1 ml-2">
                                  <Button size="sm" className="h-7 px-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleStatusChange(v.id, 'accepted')}>
                                    Accept
                                  </Button>
                                  <Button size="sm" variant="outline" className="h-7 px-2 text-xs border-rose-200 text-rose-600 hover:text-rose-700 hover:bg-rose-50" onClick={() => handleStatusChange(v.id, 'rejected')}>
                                    Reject
                                  </Button>
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="donations">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                Donation Feed
              </CardTitle>
              <CardDescription>Community contributions to your organization.</CardDescription>
            </CardHeader>
            <CardContent>
              {donations.length === 0 ? (
                <div className="text-center py-12">
                  <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p>Waiting for the first donation.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Donor</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...donations]
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .map((d) => (
                        <TableRow key={d.id}>
                          <TableCell className="font-bold">{d.userName}</TableCell>
                          <TableCell className="text-primary font-bold">₹{d.amount.toLocaleString()}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {format(new Date(d.createdAt), 'MMM d, yyyy')}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
