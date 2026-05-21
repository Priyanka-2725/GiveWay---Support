import { memo } from 'react';
import { NgoCard } from '@/components/ngo-card';
import type { NGO } from '@/types';

interface LazyNgoCardProps {
  ngo: NGO;
  index?: number;
}

export const LazyNgoCard = memo(function LazyNgoCard({ ngo, index = 0 }: LazyNgoCardProps) {
  // For now, just render the regular NGO card
  // In a production app, you might want to implement intersection observer
  // for true lazy loading when cards come into viewport
  return <NgoCard ngo={ngo} />;
});
