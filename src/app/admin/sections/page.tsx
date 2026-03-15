'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  ChevronUp, 
  ChevronDown, 
  Save, 
  Loader2, 
  Layout,
  Star
} from 'lucide-react';
import Link from 'next/link';

export default function HomeSectionsPage() {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("Section")
        .select("*")
        .order("order", { ascending: true });

      if (error) throw error;
      setSections(data || []);
    } catch (error) {
      console.error("Failed to fetch sections", error);
    } finally {
      setLoading(false);
    }
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newSections = [...sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newSections.length) return;

    [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
    
    // Update order values
    const updatedSections = newSections.map((section, idx) => ({
      ...section,
      order: idx
    }));

    setSections(updatedSections);
    setHasChanges(true);
  };

  const saveOrder = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/sections/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: sections.map(s => ({ id: s.id, order: s.order }))
        })
      });

      const data = await res.json();
      if (data.success) {
        setHasChanges(false);
        alert("Order saved successfully!");
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      alert("Failed to save order: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const syncDefaults = async () => {
    if (!window.confirm("This will ensure all default sections exist. Continue?")) return;
    setLoading(true);
    try {
      await fetch('/api/admin/seed');
      await fetchSections();
      alert("Sections synced with defaults!");
    } catch (error) {
      alert("Failed to sync sections");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Loader2 className="w-10 h-10 text-neon-cyan animate-spin" />
        <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Loading Home Sections...</span>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-black uppercase tracking-tighter">Home Page Tabs</h1>
          <p className="text-white/40 text-sm font-bold uppercase tracking-widest">
            Manage the order of tabs in the featured section
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={syncDefaults}
            className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors"
          >
            Sync Defaults
          </button>
          {hasChanges && (
            <button 
              onClick={saveOrder}
              disabled={saving}
              className="bg-neon-cyan text-black px-8 py-4 rounded-full font-black uppercase tracking-tight hover:bg-cyan-400 transition-all flex items-center gap-2 shadow-xl shadow-neon-cyan/20"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Save Changes
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {sections.map((section, index) => (
          <div 
            key={section.id}
            className="glass p-6 rounded-3xl border border-white/5 flex items-center gap-6 group hover:border-neon-cyan/30 transition-all"
          >
            <div className="flex flex-col gap-1">
              <button 
                onClick={() => moveSection(index, 'up')}
                disabled={index === 0}
                className="p-2 hover:bg-white/10 rounded-xl disabled:opacity-0 transition-all"
              >
                <ChevronUp className="w-6 h-6" />
              </button>
              <button 
                onClick={() => moveSection(index, 'down')}
                disabled={index === sections.length - 1}
                className="p-2 hover:bg-white/10 rounded-xl disabled:opacity-0 transition-all"
              >
                <ChevronDown className="w-6 h-6" />
              </button>
            </div>

            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center shrink-0">
              <Layout className="w-6 h-6 text-white/20" />
            </div>

            <div className="flex-1">
              <h3 className="font-black uppercase tracking-tight text-xl">{section.name}</h3>
              <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest">{section.slug}</p>
            </div>

            <div className="flex items-center gap-3">
              {['featured', 'editors-choice', 'top-games'].includes(section.slug) && (
                <Link 
                  href={`/admin/sections/${section.slug}`}
                  className="px-6 py-3 glass rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2"
                >
                  <Star className="w-4 h-4 text-neon-cyan" />
                  Manage Items
                </Link>
              )}
              <div className="px-6 py-3 rounded-xl border border-white/5 text-[10px] font-black uppercase tracking-widest text-white/20">
                Order: {section.order}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass p-8 rounded-[2.5rem] border border-white/5 space-y-4">
        <h3 className="text-lg font-black uppercase tracking-tight">Tab Configuration Guide</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <p className="text-xs font-bold text-neon-cyan uppercase tracking-widest">Featured &amp; Editor&apos;s Choice</p>
            <p className="text-sm text-white/40">These tabs pull games assigned manually via the &quot;Featured Order&quot; page or the &quot;Editor&apos;s Choice&quot; section management.</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-bold text-neon-cyan uppercase tracking-widest">Top Games &amp; Newly Added</p>
            <p className="text-sm text-white/40">Automatically populated based on play counts and creation date respectively.</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-bold text-neon-cyan uppercase tracking-widest">Continue Playing</p>
            <p className="text-sm text-white/40">Personalized for each user based on their local browser history.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
