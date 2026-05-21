'use client';

import { useState, useMemo, useEffect } from 'react';
import { NgoCard } from '@/components/ngo-card';
import { NGO } from '@/types';
import DiscoverFilters from '@/components/discover-filters';
import { Loader2, FilterX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import apiClient from '@/lib/api-client';
import { NgoCardSkeleton } from '@/components/skeletons/ngo-card-skeleton';

export default function DiscoverPage() {
  const [filters, setFilters] = useState<{ cause: string; state: string; verifiedOnly: boolean }>({
    cause: 'all',
    state: 'all',
    verifiedOnly: false,
  });

  // Use real API data
  const [ngos, setNgos] = useState<NGO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNgos = async () => {
      try {
        const res = await apiClient.getNgos({ limit: 50 });
        setNgos(res.ngos || []);
      } catch (err) {
        console.error('Failed to load NGOs:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNgos();
  }, []);

  const filteredNgos = useMemo(() => {
    let filtered = ngos;
    
    if (filters.cause !== 'all') {
      filtered = filtered.filter(ngo => ngo.cause === filters.cause);
    }
    
    if (filters.state !== 'all') {
      filtered = filtered.filter(ngo => ngo.state === filters.state);
    }
    
    if (filters.verifiedOnly) {
      filtered = filtered.filter(ngo => ngo.verified);
    }
    
    return filtered;
  }, [ngos, filters]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-3xl border bg-card p-6 shadow-sm">
          <div className="h-8 w-64 rounded bg-muted animate-pulse" />
          <div className="mt-3 h-4 w-full max-w-2xl rounded bg-muted animate-pulse" />
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <NgoCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] border bg-gradient-to-br from-background via-background to-primary/5 p-6 shadow-sm md:p-8">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center rounded-full border bg-background px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Discover verified nonprofits
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-5xl">Discover NGOs</h1>
            <p className="mt-3 text-sm text-muted-foreground md:text-base">
              Find and support non-profits making a difference in your community.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-3xl border bg-card p-5 shadow-sm md:p-6">
        <DiscoverFilters
          filters={filters}
          onFiltersChange={setFilters}
          availableCauses={[...new Set(ngos.map((ngo) => ngo.cause))].filter(Boolean)}
          availableStates={[...new Set(ngos.map((ngo) => ngo.state))].filter(Boolean)}
          topCause={null}
        />
      </section>

      <div className="mt-8 flex items-center justify-between gap-3 text-sm text-muted-foreground">
        <p>{filteredNgos.length} NGOs found</p>
        <p>Showing verified, impact-focused organizations first</p>
      </div>

      {filteredNgos.length === 0 ? (
        <div className="mt-6 rounded-3xl border border-dashed bg-muted/20 px-6 py-20 text-center">
          <FilterX className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-xl font-medium text-muted-foreground">No NGOs found matching your criteria.</p>
          <Button
            variant="link"
            onClick={() => setFilters({ cause: 'all', state: 'all', verifiedOnly: false })}
            className="mt-2"
          >
            Clear all filters
          </Button>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 animate-in fade-in duration-700">
          {filteredNgos.map((ngo) => (
            <NgoCard key={ngo.id} ngo={ngo} />
          ))}
        </div>
      )}
    </div>
  );
}