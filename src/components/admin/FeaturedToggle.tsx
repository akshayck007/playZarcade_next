'use client';

import React, { useState } from 'react';
import { Star, Loader2 } from 'lucide-react';

interface FeaturedToggleProps {
  gameId: string;
  isFeatured: boolean;
}

export function FeaturedToggle({ gameId, isFeatured: initialIsFeatured }: FeaturedToggleProps) {
  const [isFeatured, setIsFeatured] = useState(initialIsFeatured);
  const [loading, setLoading] = useState(false);

  const toggleFeatured = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/games/featured', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId, isFeatured: !isFeatured })
      });
      const data = await res.json();
      if (data.success) {
        setIsFeatured(!isFeatured);
      } else {
        alert(data.error || "Failed to update featured status");
      }
    } catch (error) {
      alert("Failed to update featured status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={toggleFeatured}
      disabled={loading}
      className={`p-2 glass rounded-lg transition-all ${
        isFeatured 
          ? 'bg-amber-500/20 text-amber-500 border-amber-500/50' 
          : 'text-white/20 hover:text-amber-500 hover:bg-amber-500/10'
      }`}
      title={isFeatured ? "Unfeature Game" : "Feature Game"}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Star className={`w-4 h-4 ${isFeatured ? 'fill-current' : ''}`} />
      )}
    </button>
  );
}
