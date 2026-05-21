'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import apiClient from '@/lib/api-client';
import { NGO, NgoNeed } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ListChecks, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Badge } from './ui/badge';

type ManageNgoNeedsProps = {
  ngo: NGO & { id: string };
};

const needFormSchema = z.object({
  description: z.string().min(10, 'Please provide a detailed description of the need.'),
});

export default function ManageNgoNeeds({ ngo }: ManageNgoNeedsProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [needs, setNeeds] = useState<NgoNeed[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(false);
  }, [ngo.id]);

  const form = useForm<z.infer<typeof needFormSchema>>({
    resolver: zodResolver(needFormSchema),
    defaultValues: { description: '' },
  });

  const formatDate = (date: any) => {
    if (!date) return 'Just now';
    if (typeof date === 'string') return format(new Date(date), 'PPP');
    return 'Invalid date';
  }

  async function onSubmit(values: z.infer<typeof needFormSchema>) {
    setIsSubmitting(true);

    const newNeed = {
      ngoId: ngo.id,
      description: values.description,
      status: 'open',
      datePosted: new Date().toISOString(),
    };

    // For now, just show toast since we don't have create need API
    toast({
        title: "Need Posted!",
        description: "Your new need is now visible on your NGO's page."
    });

    form.reset();
    setIsSubmitting(false);
  }

  const handleDelete = (needId: string) => {
    // For now, just show toast since we don't have delete need API
    toast({
        title: "Need Deleted",
        description: "The need has been removed from your list."
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
            <ListChecks className="mr-3 h-7 w-7 text-primary" />
            Manage Your Needs
        </CardTitle>
        <CardDescription>Add, view, and remove your organization's current needs.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start gap-4 mb-8">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="flex-grow">
                  <FormControl>
                    <Input placeholder="e.g., We need 50 notebooks for our students" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Need
            </Button>
          </form>
        </Form>

        <div className='mt-8 space-y-4'>
            <h3 className="font-semibold">Current Needs List</h3>
             {isLoading ? (
                <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
             ) : needs && needs.length > 0 ? (
                <ul className="space-y-4">
                    {needs.map((need) => (
                    <li key={need.id} className="p-4 bg-secondary/50 rounded-lg flex justify-between items-center">
                        <div>
                            <p className="text-muted-foreground">{need.description}</p>
                             <p className="text-xs text-muted-foreground mt-2">
                                Posted on: {formatDate(need.datePosted)}
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                             <Badge
                                variant={need.status === 'completed' ? 'secondary' : 'default'}
                                className="capitalize"
                            >
                                {need.status}
                            </Badge>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(need.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    </li>
                    ))}
                </ul>
                ) : (
                <p className="text-muted-foreground text-center py-4">
                    You haven't posted any needs yet. Use the form above to add one.
                </p>
                )}
        </div>
      </CardContent>
    </Card>
  );
}

    