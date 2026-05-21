
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Logo from './logo';
import { UserNav } from './user-nav';
import NotificationBell from './notification-bell';
import { useAuth } from '@/contexts/auth-context';
import { ShieldCheck, Crown, LayoutDashboard } from 'lucide-react';

const Header = () => {
  const { user } = useAuth();
  const [role, setRole] = useState<string>('user');

  useEffect(() => {
    if (user) {
      setRole(user.role);
    } else {
      setRole('user');
    }
  }, [user]);

  const isAdminAccess = role === 'admin' || role === 'superadmin';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 max-w-screen-2xl items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <Logo />
        </Link>
        <div className='flex items-center gap-4 md:gap-8'>
          <nav className="hidden lg:flex items-center space-x-6 text-sm font-semibold">
              <Link href="/discover" className="text-foreground/80 transition-colors hover:text-primary uppercase tracking-wider">Discover</Link>
              <Link href="/my-feed" className="text-foreground/80 transition-colors hover:text-primary uppercase tracking-wider">My Feed</Link>
              
              {user && role === 'ngo_admin' && (
                <Link href="/ngo-dashboard" className="text-accent font-bold transition-colors hover:text-accent/80 uppercase tracking-wider flex items-center gap-1">
                  <LayoutDashboard className="h-4 w-4" />
                  NGO Hub
                </Link>
              )}
              
              {user && !isAdminAccess && role !== 'ngo_admin' && (
                <Link href="/dashboard" className="text-foreground/80 transition-colors hover:text-primary uppercase tracking-wider">Impact</Link>
              )}

              {isAdminAccess && (
                <Link href="/admin" className="text-destructive font-bold flex items-center gap-1 uppercase tracking-wider animate-in fade-in">
                  {role === 'superadmin' ? <Crown className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                  {role === 'superadmin' ? 'SuperAdmin' : 'Admin'}
                </Link>
              )}
          </nav>
          
          <div className="flex items-center gap-2 md:gap-4">
            {user && <NotificationBell />}
            <UserNav />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
