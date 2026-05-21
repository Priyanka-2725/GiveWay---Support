'use client';

import { useAuth } from '@/contexts/auth-context';
import apiClient from '@/lib/api-client';
import { Donation, VolunteerRequest } from '@/types';
import { Loader2, LayoutDashboard, Calendar, ClipboardCheck, Info, Wallet, TrendingUp, PieChart as PieIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths, isWithinInterval } from 'date-fns';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useMemo, useEffect, useState } from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Pie, PieChart, Cell } from 'recharts';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { user, isLoading: isUserLoading } = useAuth();
  const router = useRouter();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [requests, setRequests] = useState<VolunteerRequest[]>([]);
  const [isDonationsLoading, setIsDonationsLoading] = useState(false);
  const [isRequestsLoading, setIsRequestsLoading] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    if (!user?.id) return;

    const fetchData = async () => {
      setIsDonationsLoading(true);
      setIsRequestsLoading(true);
      try {
        const [donationsRes] = await Promise.all([
          apiClient.getDonations({ userId: user.id }),
        ]);
        setDonations(donationsRes.donations || []);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setIsDonationsLoading(false);
        setIsRequestsLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  const stats = useMemo(() => {
    const totalDonated = donations.reduce((sum, d) => sum + (d.amount || 0), 0);
    const supportedNgos = new Set(donations.map(d => d.ngoId)).size;
    const totalRequests = requests.length;
    return { totalDonated, supportedNgos, totalRequests };
  }, [donations, requests]);

  const timelineData = useMemo(() => {
    const months = eachMonthOfInterval({
      start: subMonths(new Date(), 5),
      end: new Date(),
    });

    return months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      const amount = donations
        .filter(d => {
          const date = new Date(d.createdAt);
          return isWithinInterval(date, { start: monthStart, end: monthEnd });
        })
        .reduce((sum, d) => sum + d.amount, 0);

      return { name: format(month, 'MMM'), amount };
    });
  }, [donations]);

  const causeData = useMemo(() => {
    const counts: Record<string, number> = {};
    donations.forEach(d => {
      const cause = (d as any).cause || 'General';
      counts[cause] = (counts[cause] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [donations]);

  const COLORS = ['#3F51B5', '#9C27B0', '#F44336', '#4CAF50', '#FF9800'];

  if (isUserLoading || isDonationsLoading || isRequestsLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <LayoutDashboard className="h-8 w-8 text-primary" />
        <h1 className="text-4xl font-headline font-bold">Impact Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-primary/5 border-primary/20 shadow-md">
          <CardHeader className="pb-2 text-center">
            <CardDescription className="font-bold text-muted-foreground uppercase text-xs">Total Contributed</CardDescription>
            <CardTitle className="text-4xl font-bold text-primary">₹{stats.totalDonated.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-accent/5 border-accent/20 shadow-md">
          <CardHeader className="pb-2 text-center">
            <CardDescription className="font-bold text-muted-foreground uppercase text-xs">NGOs Supported</CardDescription>
            <CardTitle className="text-4xl font-bold text-accent">{stats.supportedNgos}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-secondary/20 border-none shadow-md">
          <CardHeader className="pb-2 text-center">
            <CardDescription className="font-bold text-muted-foreground uppercase text-xs">Volunteer Efforts</CardDescription>
            <CardTitle className="text-4xl font-bold">{stats.totalRequests}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
              Donation Trend
            </CardTitle>
            <CardDescription>Monthly contribution summary for the last 6 months.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3F51B5" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3F51B5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  formatter={(value: number) => [`₹${value}`, 'Amount']}
                />
                <Area type="monotone" dataKey="amount" stroke="#3F51B5" fillOpacity={1} fill="url(#colorAmount)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <PieIcon className="h-5 w-5 text-accent" />
              Impact by Cause
            </CardTitle>
            <CardDescription>Distribution of your support across different sectors.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            {causeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={causeData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {causeData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-sm italic">Not enough data to display causes.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-headline font-bold">
              <Wallet className="h-5 w-5 text-primary" />
              Donation History
            </CardTitle>
            <CardDescription>A record of your financial contributions.</CardDescription>
          </CardHeader>
          <CardContent>
            {donations.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">You haven't made any donations yet.</p>
                <Button variant="link" asChild className="mt-2">
                  <Link href="/discover">Find an NGO to support</Link>
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>NGO Name</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead className="text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...donations]
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((donation) => (
                      <TableRow key={donation.id}>
                        <TableCell className="font-bold">
                          <Link href={`/ngos/${donation.ngoId}`} className="hover:text-primary underline-offset-4 hover:underline">
                            {donation.ngoName}
                          </Link>
                        </TableCell>
                        <TableCell className="font-semibold text-primary">₹{donation.amount?.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          <span className="flex items-center justify-end gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(donation.createdAt), 'MMM d, yyyy')}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-headline font-bold">
              <ClipboardCheck className="h-5 w-5 text-primary" />
              Volunteer Applications
            </CardTitle>
            <CardDescription>Track the status of your volunteer requests.</CardDescription>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">You haven't submitted any volunteer requests yet.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>NGO Name</TableHead>
                    <TableHead>Skills Offered</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Date Submitted</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...requests]
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((req) => (
                      <TableRow key={req.id}>
                        <TableCell className="font-bold">
                          <Link href={`/ngos/${req.ngoId}`} className="hover:text-primary underline-offset-4 hover:underline">
                            {req.ngoName}
                          </Link>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">{req.skills}</TableCell>
                        <TableCell>
                          <Badge variant={req.status === 'accepted' ? 'default' : req.status === 'rejected' ? 'destructive' : 'secondary'}>
                            {req.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          <span className="flex items-center justify-end gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(req.createdAt), 'MMM d, yyyy')}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
