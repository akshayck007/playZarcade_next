'use client';

import React, { useState, useEffect } from 'react';
import { Star, Loader2, Award } from 'lucide-react';

interface SectionToggleProps {
  gameId: string;
  sectionSlug: string;
  initialInSection?: boolean;
}

export function SectionToggle({ gameId, sectionSlug, initialInSection = false }: SectionToggleProps) {
  const [inSection, setInSection] = useState(initialInSection);
  const [loading, setLoading] = useState(false);

  const toggleSection = async () => {
    setLoading(true);
    try {
      const action = inSection ? 'remove' : 'add';
      const res = await fetch('/api/admin/sections/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId, sectionSlug, action })
      });
      const data = await res.json();
      if (data.success) {
        setInSection(!inSection);
      } else {
        alert(data.error || `Failed to update ${sectionSlug} status`);
      }
    } catch (error) {
      alert(`Failed to update ${sectionSlug} status`);
    } finally {
      setLoading(false);
    }
  };

  const isEditorsChoice = sectionSlug === 'editors-choice';

  return (
    <button 
      onClick={toggleSection}
      disabled={loading}
      className={`p-2 glass rounded-lg transition-all flex items-center gap-2 ${
        inSection 
          ? isEditorsChoice ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/50' : 'bg-amber-500/20 text-amber-500 border-amber-500/50' 
          : 'text-white/20 hover:text-emerald-500 hover:bg-emerald-500/10'
      }`}
      title={inSection ? `Remove from ${sectionSlug}` : `Add to ${sectionSlug}`}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        isEditorsChoice ? (
          <Award className={`w-4 h-4 ${inSection ? 'fill-current' : ''}`} />
        ) : (
          <Star className={`w-4 h-4 ${inSection ? 'fill-current' : ''}`} />
        )
      )}
      <span className="text-[8px] font-black uppercase tracking-widest">
        {isEditorsChoice ? "Editor's Choice" : "Featured"}
      </span>
    </button>
  );
}
