'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/api-client';
import CreateNgoForm from './create-ngo-form';
import ManageNgoNeeds from './manage-ngo-needs';
import ManageNgoPosts from './manage-ngo-posts';
import { NGO } from '@/types';
import { Loader2 } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type NgoDashboardProps = {
  user: { id: string };
};

export default function NgoDashboard({ user }: NgoDashboardProps) {
  const [ngoData, setNgoData] = useState<NGO[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    const fetchNgo = async () => {
      setIsLoading(true);
      try {
        const res = await apiClient.getNgos({ limit: 10 });
        const myNgos = res.ngos.filter((n: any) =>
          n.members && (n.members[user.id] === 'owner' || n.members[user.id] === 'manager')
        );
        setNgoData(myNgos);
      } catch (err) {
        console.error('Failed to load NGO data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNgo();
  }, [user?.id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Loading your dashboard...</p>
      </div>
    );
  }

  const userNgo = ngoData?.[0];

  return (
    <section>
      <Card className="mb-8 border-l-4 border-primary bg-primary/5">
        <CardHeader>
          <CardTitle>NGO Dashboard</CardTitle>
          <CardDescription>
            Manage your organization's profile, posts, and needs. Your updates will be reflected across the platform.
          </CardDescription>
        </CardHeader>
      </Card>

      {userNgo ? (
        <Tabs defaultValue="posts">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="posts">Manage Posts</TabsTrigger>
            <TabsTrigger value="needs">Manage Needs</TabsTrigger>
          </TabsList>
          <TabsContent value="posts">
            <ManageNgoPosts ngo={userNgo as any} />
          </TabsContent>
          <TabsContent value="needs">
            <ManageNgoNeeds ngo={userNgo as any} />
          </TabsContent>
        </Tabs>
      ) : (
        <CreateNgoForm />
      )}
    </section>
  );
}
