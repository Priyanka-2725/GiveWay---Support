'use client';

import { useState, useEffect } from 'react';
import type { NGO, Activity } from '@/types';
import { NgoCard } from './ngo-card';
import { Button } from './ui/button';
import Image from 'next/image';
import Link from 'next/link';
import apiClient from '@/lib/api-client';
import { Loader2, Zap, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Logo from './logo';

type NgoDiscoveryClientProps = {
  ngos: NGO[];
};

export default function NgoDiscoveryClient({ ngos }: NgoDiscoveryClientProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);

  // For now, use sample data since we don't have activities API
  useEffect(() => {
    setActivitiesLoading(false);
  }, []);

  return (
    <div className="space-y-16 md:space-y-24">
        <section className="text-center py-12 md:py-20 bg-gradient-to-b from-primary/5 to-transparent">
            <div className="container mx-auto px-4">
                <h1 className="text-4xl md:text-7xl font-headline font-bold text-accent tracking-tight leading-tight max-w-4xl mx-auto">
                    Empowering Change,<br /><span className="text-primary">One Act at a Time.</span>
                </h1>
                <p className="mt-6 max-w-2xl mx-auto text-muted-foreground text-xl">
                    GiveWay connects you with vetted NGOs to facilitate transparent giving and meaningful volunteering.
                </p>
                <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button size="lg" className="h-14 px-8 text-lg font-bold" asChild>
                        <Link href="/discover">Start Your Journey</Link>
                    </Button>
                    <Button size="lg" variant="outline" className="h-14 px-8 text-lg" asChild>
                        <Link href="/signup">Join the Community</Link>
                    </Button>
                </div>
            </div>
        </section>

        {/* Recent Activity Section */}
        <section className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-primary fill-primary" />
              <h2 className="text-3xl font-headline font-bold">Community Activity</h2>
            </div>
            <Link href="/discover" className="text-sm font-bold text-primary hover:underline">View all NGOs</Link>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {ngos.slice(0, 3).map((ngo) => (
                    <NgoCard key={ngo.id} ngo={ngo} />
                ))}
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="bg-card rounded-2xl border p-6 shadow-sm h-full">
                <h3 className="font-bold flex items-center gap-2 mb-4">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  Recent on GiveWay
                </h3>
                {activitiesLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : !activities || activities.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No recent activity. Be the first!</p>
                ) : (
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <div key={activity.id} className="border-l-2 border-primary/20 pl-4 py-1">
                        <p className="text-sm font-medium leading-snug">{activity.message}</p>
                        <span className="text-[10px] text-muted-foreground">
                          {activity.createdAt?.toDate ? formatDistanceToNow(activity.createdAt.toDate(), { addSuffix: true }) : 'Just now'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4">
             <div className="grid md:grid-cols-2 gap-16 items-center">
                <div className='order-2 md:order-1'>
                    <div className="relative aspect-square md:aspect-[4/5] w-full rounded-3xl overflow-hidden shadow-2xl">
                        <Image src="https://picsum.photos/seed/giving-hands/800/1000" alt="Community Work" fill className="object-cover" data-ai-hint="community charity" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-8 left-8 right-8 text-white">
                            <p className="text-2xl font-headline font-bold italic">"Alone we can do so little; together we can do so much."</p>
                            <p className="mt-2 text-sm opacity-80">— Helen Keller</p>
                        </div>
                    </div>
                </div>
                <div className='space-y-6 order-1 md:order-2'>
                    <h2 className="text-5xl font-headline font-bold text-accent leading-tight">Find Your Way <br />to Give Back</h2>
                    <p className="text-muted-foreground text-lg leading-relaxed">Search through a curated list of verified NGOs to find causes that align with your passions. Whether it's education, environment, or animal welfare, your support makes a real-world difference.</p>
                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <Zap className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h4 className="font-bold">AI-Powered Insights</h4>
                                <p className="text-sm text-muted-foreground">Get objective impact scores generated by our advanced AI models.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                                <Clock className="h-5 w-5 text-accent" />
                            </div>
                            <div>
                                <h4 className="font-bold">Transparent Tracking</h4>
                                <p className="text-sm text-muted-foreground">Monitor fundraising goals and see exactly how your money is used.</p>
                            </div>
                        </div>
                    </div>
                    <Button size="lg" className="h-14 px-8 mt-4" asChild>
                        <Link href="/discover">Explore All Causes</Link>
                    </Button>
                </div>
             </div>
        </section>

        <footer className='bg-slate-900 text-slate-200 py-16'>
            <div className='container mx-auto px-4'>
                 <div className="grid md:grid-cols-4 gap-12 mb-12">
                     <div className="md:col-span-2">
                        <Logo className="mb-4" />
                        <p className="text-slate-400 max-w-sm">GiveWay is a dedicated platform for non-profit discovery, facilitating verified connections between donors, volunteers, and causes.</p>
                     </div>
                     <div>
                         <h3 className='font-bold text-primary mb-4 uppercase text-xs tracking-widest'>Navigation</h3>
                         <ul className="space-y-2 text-slate-400">
                             <li><Link href="/discover" className="hover:text-white transition-colors">Discover</Link></li>
                             <li><Link href="/feed" className="hover:text-white transition-colors">Community Feed</Link></li>
                             <li><Link href="/signup" className="hover:text-white transition-colors">Join as NGO</Link></li>
                         </ul>
                     </div>
                     <div>
                         <h3 className='font-bold text-primary mb-4 uppercase text-xs tracking-widest'>Support</h3>
                         <ul className="space-y-2 text-slate-400">
                             <li><Link href="#" className="hover:text-white transition-colors">Help Center</Link></li>
                             <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                             <li><Link href="#" className="hover:text-white transition-colors">Terms of Use</Link></li>
                         </ul>
                     </div>
                 </div>
                 <div className='border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500'>
                    <p>© 2024 GiveWay. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link href="#" className="hover:text-white transition-colors">Twitter</Link>
                        <Link href="#" className="hover:text-white transition-colors">LinkedIn</Link>
                        <Link href="#" className="hover:text-white transition-colors">Instagram</Link>
                    </div>
                 </div>
            </div>
        </footer>
    </div>
  );
}