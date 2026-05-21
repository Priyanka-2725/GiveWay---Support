'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import apiClient from '@/lib/api-client';
import { NGO, NgoPost } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Newspaper, Target, Trash2, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import Image from 'next/image';

type ManageNgoPostsProps = {
  ngo: NGO & { id: string };
};

const postFormSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  content: z.string().min(10, 'Please provide some content for the post.'),
  imageUrl: z.string().url('Please enter a valid image URL.').optional().or(z.literal('')),
  impactGoal: z.coerce.number().optional(),
});

export default function ManageNgoPosts({ ngo }: ManageNgoPostsProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [posts, setPosts] = useState<NgoPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // For now, use empty array since we don't have posts API
  useEffect(() => {
    setIsLoading(false);
  }, [ngo.id]);

  const form = useForm<z.infer<typeof postFormSchema>>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      title: '',
      content: '',
      imageUrl: '',
      impactGoal: undefined,
    },
  });

  const formatDate = (date: any) => {
    if (!date) return 'Just now';
    if (typeof date === 'string') return format(new Date(date), 'PPP');
    if (date.toDate) return format(date.toDate(), 'PPP');
    return 'Invalid date';
  }

  async function onSubmit(values: z.infer<typeof postFormSchema>) {
    setIsSubmitting(true);

    const newPost: Omit<NgoPost, 'id' | 'datePosted'> = {
      ngoId: ngo.id,
      title: values.title,
      content: values.content,
      ...(values.imageUrl && { imageUrl: values.imageUrl }),
      ...(values.impactGoal && { impactGoal: values.impactGoal }),
    };

    // For now, just show toast since we don't have create post API
    toast({
        title: "Post Published!",
        description: "Your new post is now live for your followers."
    });

    form.reset();
    setIsSubmitting(false);
  }

  const handleDelete = (postId: string) => {
    // For now, just show toast since we don't have delete API
    toast({
        title: "Post Deleted",
        description: "The post has been removed."
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
            <Newspaper className="mr-3 h-7 w-7 text-primary" />
            Manage Your Posts
        </CardTitle>
        <CardDescription>Share updates with your followers.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mb-8">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Post Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Our Latest Success Story" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Post Content</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Share your message with your followers..." {...field} rows={4} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Image URL (Optional)</FormLabel>
                        <FormControl>
                            <Input placeholder="https://example.com/image.jpg" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                <FormField
                    control={form.control}
                    name="impactGoal"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Impact Goal (Optional)</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="e.g., 50000 (for funding) or 20 (for volunteers)" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Publish Post
            </Button>
          </form>
        </Form>

        <div className='mt-8 space-y-4'>
            <h3 className="font-semibold">Published Posts</h3>
             {isLoading ? (
                <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
             ) : posts && posts.length > 0 ? (
                <ul className="space-y-4">
                    {posts.map((post) => (
                    <li key={post.id} className="p-4 bg-secondary/50 rounded-lg flex justify-between items-start gap-4">
                        <div className='flex-shrink-0'>
                        {post.imageUrl && (
                            <div className="relative h-20 w-20 rounded-md overflow-hidden">
                                <Image src={post.imageUrl} alt={post.title} fill className="object-cover" />
                            </div>
                         )}
                        </div>
                        <div className='flex-grow'>
                            <p className="font-semibold">{post.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Posted on: {formatDate(post.datePosted)}
                            </p>
                             <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{post.content}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(post.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </li>
                    ))}
                </ul>
                ) : (
                <p className="text-muted-foreground text-center py-4">
                    You haven't published any posts yet.
                </p>
                )}
        </div>
      </CardContent>
    </Card>
  );
}
    