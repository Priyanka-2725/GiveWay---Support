
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import apiClient from '@/lib/api-client';
import { Loader2, ClipboardCheck, ShieldAlert } from 'lucide-react';
import { NGO } from '@/types';
import Link from 'next/link';

const volunteerFormSchema = z.object({
  skills: z.string().min(2, 'Please list your skills.').max(100, 'Keep skills brief (max 100 chars).'),
  availability: z.string().min(2, 'Please describe your availability.').max(100, 'Max 100 chars.'),
  message: z.string().min(10, 'Please include a message for the NGO (min 10 chars).').max(500, 'Max 500 chars.'),
});

type VolunteerModalProps = {
  ngo: NGO;
  hasAlreadyRequested: boolean;
};

export default function VolunteerModal({ ngo, hasAlreadyRequested: initialRequested }: VolunteerModalProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasRequested, setHasRequested] = useState(initialRequested);
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof volunteerFormSchema>>({
    resolver: zodResolver(volunteerFormSchema),
    defaultValues: {
      skills: '',
      availability: '',
      message: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof volunteerFormSchema>) => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      // For now, just show success message since we don't have volunteer API
      // In future: await apiClient.createVolunteerRequest(ngo.id, data);
      
      toast({
        title: 'Request Sent!',
        description: `Your volunteer application for ${ngo.name} has been submitted.`,
      });

      setHasRequested(true);
      setOpen(false);
      form.reset();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error submitting request',
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const isUnverified = user && !user.emailVerified;

  if (isUnverified) {
    return (
      <Button className="w-full text-lg h-14" size="lg" variant="outline" asChild>
        <Link href="/verify-email">
          <ShieldAlert className="mr-2 h-5 w-5 text-destructive" />
          Verify Email to Volunteer
        </Link>
      </Button>
    );
  }

  if (hasRequested) {
    return (
      <Button size="lg" variant="outline" disabled className="w-full text-lg h-14 bg-muted">
        <ClipboardCheck className="mr-2 h-5 w-5" />
        Application Sent
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" variant="outline" className="w-full text-lg h-14 hover:bg-primary/5 transition-colors">
          Volunteer Now
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Volunteer for {ngo.name}</DialogTitle>
          <DialogDescription>
            Tell the organization how you can contribute to their mission.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="skills"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Key Skills</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Teaching, Design, Event Planning" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="availability"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Availability</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Weekends, 5 hours/week" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Why do you want to help?</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Share your motivation..." 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Application
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
