'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  GripVertical, 
  ChevronUp, 
  ChevronDown, 
  Save, 
  Loader2, 
  Star,
  ExternalLink,
  Trash2
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function FeaturedOrderPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchFeaturedItems();
  }, []);

  const fetchFeaturedItems = async () => {
    setLoading(true);
    try {
      const { data: section } = await supabase
        .from("Section")
        .select("id")
        .eq("slug", "featured")
        .single();

      if (section) {
        const { data, error } = await supabase
          .from("SectionItem")
          .select("*, Game(*)")
          .eq("sectionId", section.id)
          .order("order", { ascending: true });

        if (error) throw error;
        setItems(data || []);
      }
    } catch (error) {
      console.error("Failed to fetch featured items", error);
    } finally {
      setLoading(false);
    }
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newItems.length) return;

    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    
    // Update order values
    const updatedItems = newItems.map((item, idx) => ({
      ...item,
      order: idx
    }));

    setItems(updatedItems);
    setHasChanges(true);
  };

  const removeItem = async (itemId: string, gameId: string) => {
    if (!window.confirm("Remove this game from featured?")) return;

    try {
      // Remove from SectionItem
      await supabase.from("SectionItem").delete().eq("id", itemId);
      // Update Game table
      await supabase.from("Game").update({ isFeatured: false }).eq("id", gameId);
      
      setItems(items.filter(i => i.id !== itemId));
    } catch (error) {
      alert("Failed to remove item");
    }
  };

  const saveOrder = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/featured/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({ id: i.id, order: i.order }))
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
        <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Loading Featured Order...</span>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-black uppercase tracking-tighter">Featured Order</h1>
          <p className="text-white/40 text-sm font-bold uppercase tracking-widest">
            Drag and drop or use arrows to set the order of featured games
          </p>
        </div>
        
        {hasChanges && (
          <button 
            onClick={saveOrder}
            disabled={saving}
            className="bg-emerald-500 text-black px-8 py-4 rounded-full font-black uppercase tracking-tight hover:bg-emerald-400 transition-all flex items-center gap-2 shadow-xl shadow-emerald-500/20"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save Changes
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="glass rounded-[2.5rem] p-20 flex flex-col items-center justify-center text-center space-y-6 border border-white/5">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
            <Star className="w-10 h-10 text-white/10" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black uppercase tracking-tight">No Featured Games</h3>
            <p className="text-white/40 text-sm font-bold uppercase tracking-widest max-w-xs mx-auto">
              Go to the Game Library to feature some games first.
            </p>
          </div>
          <Link href="/admin/games" className="text-emerald-500 text-[10px] font-black uppercase tracking-widest hover:underline">
            Go to Game Library
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item, index) => (
            <div 
              key={item.id}
              className="glass p-4 rounded-2xl border border-white/5 flex items-center gap-6 group hover:border-emerald-500/30 transition-all"
            >
              <div className="flex flex-col gap-1">
                <button 
                  onClick={() => moveItem(index, 'up')}
                  disabled={index === 0}
                  className="p-1 hover:bg-white/10 rounded disabled:opacity-0 transition-all"
                >
                  <ChevronUp className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => moveItem(index, 'down')}
                  disabled={index === items.length - 1}
                  className="p-1 hover:bg-white/10 rounded disabled:opacity-0 transition-all"
                >
                  <ChevronDown className="w-5 h-5" />
                </button>
              </div>

              <div className="w-16 h-16 rounded-xl overflow-hidden relative bg-white/5 shrink-0">
                <Image 
                  src={item.Game.thumbnail} 
                  alt="" 
                  fill 
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="flex-1">
                <h3 className="font-black uppercase tracking-tight text-lg">{item.Game.title}</h3>
                <p className="text-[10px] font-mono text-white/40">{item.Game.slug}</p>
              </div>

              <div className="flex items-center gap-3">
                <Link 
                  href={`/game/${item.Game.slug}`} 
                  target="_blank"
                  className="p-3 glass rounded-xl hover:bg-white/10 transition-colors"
                >
                  <ExternalLink className="w-5 h-5 text-white/40" />
                </Link>
                <button 
                  onClick={() => removeItem(item.id, item.Game.id)}
                  className="p-3 glass rounded-xl hover:bg-red-500/20 transition-colors group/del"
                >
                  <Trash2 className="w-5 h-5 text-white/40 group-hover/del:text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
