'use client';

import React, { useState } from 'react';
import { Loader2, Check } from 'lucide-react';

interface SettingToggleProps {
  id: string;
  label: string;
  description: string;
  initialValue: boolean;
  field: string;
}

export function SettingToggle({ id, label, description, initialValue, field }: SettingToggleProps) {
  const [value, setValue] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    setIsLoading(true);
    const newValue = !value;
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: newValue })
      });
      if (res.ok) {
        setValue(newValue);
      }
    } catch (error) {
      alert("Failed to update setting");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <span className="text-xs font-bold block">{label}</span>
        <span className="text-[10px] text-white/30 block">{description}</span>
      </div>
      <button 
        onClick={handleToggle}
        disabled={isLoading}
        className={`w-10 h-5 ${value ? 'bg-emerald-500/20' : 'bg-white/10'} rounded-full relative transition-colors`}
      >
        {isLoading ? (
          <Loader2 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 animate-spin text-white/40" />
        ) : (
          <div className={`absolute ${value ? 'right-1' : 'left-1'} top-1 w-3 h-3 ${value ? 'bg-emerald-500' : 'bg-white/20'} rounded-full transition-all`}></div>
        )}
      </button>
    </div>
  );
}
