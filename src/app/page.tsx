
'use client';
import { NGO } from '@/types';
import NgoDiscoveryClient from '@/components/ngo-discovery-client';
import apiClient from '@/lib/api-client';
import { Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Home() {
  const [ngos, setNgos] = useState<NGO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNgos = async () => {
      try {
        const res = await apiClient.getNgos({ limit: 20 });
        setNgos(res.ngos || []);
      } catch (err) {
        console.error('Failed to load NGOs:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNgos();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  return <NgoDiscoveryClient ngos={ngos} />;
}
