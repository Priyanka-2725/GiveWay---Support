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
import { Loader2, Heart } from 'lucide-react';
import { NGO } from '@/types';

const donationFormSchema = z.object({
  amount: z.coerce.number().min(1, 'Please enter a valid amount (min ₹1).').max(1000000, 'Max single donation is ₹1,000,000.'),
  message: z.string().max(200, 'Message is too long (max 200 chars).').optional(),
});

type DonationModalProps = {
  ngo: NGO;
};

export default function DonationModal({ ngo }: DonationModalProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof donationFormSchema>>({
    resolver: zodResolver(donationFormSchema),
    defaultValues: { amount: 0, message: '' },
  });

  async function onSubmit(values: z.infer<typeof donationFormSchema>) {
    if (!user) return;
    setIsSubmitting(true);

    try {
      await apiClient.createDonation(values.amount, user.id, ngo.id);

      toast({
        title: 'Donation Successful!',
        description: `You have contributed ₹${values.amount} to ${ngo.name}. Thank you!`,
      });

      setOpen(false);
      form.reset();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error processing donation',
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full text-lg h-14 font-bold" size="lg">
          <Heart className="mr-2 h-5 w-5 fill-current" />
          Donate Now
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Donate to {ngo.name}</DialogTitle>
          <DialogDescription>
            Your contribution directly supports their mission and active projects.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Donation Amount (₹)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Enter amount" {...field} />
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
                  <FormLabel>Optional Message</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add a word of encouragement..."
                      className="min-h-[80px]"
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
                Confirm Donation
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
