'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NgoNeed } from '@/types';
import { ListChecks, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

type NgoNeedsProps = {
  needs: NgoNeed[] | null;
  isLoading: boolean;
};

export default function NgoNeeds({ needs, isLoading }: NgoNeedsProps) {
  const formatDate = (date: any) => {
    if (!date) return 'Just now';
    if (typeof date === 'string') return format(new Date(date), 'PPP');
    return 'Invalid date';
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Loading needs...</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <ListChecks className="mr-3 h-7 w-7 text-primary" />
          Current Needs
        </CardTitle>
      </CardHeader>
      <CardContent>
        {needs && needs.length > 0 ? (
          <ul className="space-y-4">
            {needs.map((need) => (
              <li key={need.id} className="p-4 bg-secondary/50 rounded-lg">
                <div className="flex justify-between items-start">
                  <p className="text-muted-foreground">{need.description}</p>
                  <Badge
                    variant={need.status === 'completed' ? 'secondary' : 'default'}
                    className="capitalize"
                  >
                    {need.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Posted on: {formatDate(need.datePosted)}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-center py-4">
            This organization hasn't posted any specific needs yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

    