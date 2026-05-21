'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NgoPost } from '@/types';
import { Newspaper, Loader2, Target, Upload } from 'lucide-react';
import { format } from 'date-fns';
import Image from 'next/image';

type NgoPostsProps = {
  posts: NgoPost[] | null;
  isLoading: boolean;
};

export default function NgoPosts({ posts, isLoading }: NgoPostsProps) {
  const formatDate = (date: any) => {
    if (!date) return 'Just now';
    if (typeof date === 'string') return format(new Date(date), 'PPP');
    return 'Invalid date';
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Loading posts...</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Newspaper className="mr-3 h-7 w-7 text-primary" />
          Latest Posts
        </CardTitle>
      </CardHeader>
      <CardContent>
        {posts && posts.length > 0 ? (
          <ul className="space-y-6">
            {posts.map((post) => (
              <li key={post.id} className="p-4 bg-secondary/50 rounded-lg">
                <h3 className="font-bold text-lg mb-1">{post.title}</h3>
                <p className="text-xs text-muted-foreground mb-2">
                  Posted on: {formatDate(post.datePosted)}
                </p>
                {post.imageUrl && (
                    <div className="relative h-64 w-full rounded-md overflow-hidden my-4">
                        <Image src={post.imageUrl} alt={post.title} fill className="object-cover" />
                    </div>
                )}
                <p className="text-muted-foreground">{post.content}</p>
                {post.impactGoal && (
                    <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-primary">
                        <Target className="h-5 w-5" />
                        <span>Impact Goal: {post.impactGoal.toLocaleString()}</span>
                    </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-center py-4">
            This organization hasn't made any posts yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

    