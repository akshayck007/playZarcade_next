'use client';

import React, { useEffect, useState, use } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  GripVertical, 
  ChevronUp, 
  ChevronDown, 
  Save, 
  Loader2, 
  Star,
  ExternalLink,
  Trash2,
  Plus,
  Search,
  X
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function SectionOrderPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [items, setItems] = useState<any[]>([]);
  const [sectionName, setSectionName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [allGames, setAllGames] = useState<any[]>([]);
  const [gameSearchQuery, setGameSearchQuery] = useState('');
  const [loadingGames, setLoadingGames] = useState(false);
  const [sectionId, setSectionId] = useState<string | null>(null);

  const fetchSectionItems = React.useCallback(async () => {
    setLoading(true);
    try {
      const { data: section } = await supabase
        .from("Section")
        .select("id, name")
        .eq("slug", slug)
        .single();
 
      if (section) {
        setSectionId(section.id);
        setSectionName(section.name);
        const { data, error } = await supabase
          .from("SectionItem")
          .select("*, Game(*)")
          .eq("sectionId", section.id)
          .order("order", { ascending: true });
 
        if (error) throw error;
        setItems(data || []);
      }
    } catch (error) {
      console.error("Failed to fetch section items", error);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  const fetchAllGames = async () => {
    setLoadingGames(true);
    try {
      const { data } = await supabase
        .from("Game")
        .select("*")
        .eq("isPublished", true)
        .order("title");
      setAllGames(data || []);
    } catch (error) {
      console.error("Failed to fetch games", error);
    } finally {
      setLoadingGames(false);
    }
  };

  useEffect(() => {
    if (showAddModal && allGames.length === 0) {
      fetchAllGames();
    }
  }, [showAddModal, allGames.length]);

  const addItem = async (game: any) => {
    if (!sectionId) return;

    // Check if already in section
    if (items.find(i => i.gameId === game.id)) {
      alert("Game is already in this section");
      return;
    }

    try {
      const newOrder = items.length;
      const { data, error } = await supabase
        .from("SectionItem")
        .insert([{
          sectionId,
          gameId: game.id,
          order: newOrder
        }])
        .select("*, Game(*)")
        .single();

      if (error) throw error;

      // If it's the featured section, also update the Game table flag
      if (slug === 'featured') {
        await supabase.from("Game").update({ isFeatured: true }).eq("id", game.id);
      }

      setItems([...items, data]);
      setShowAddModal(false);
    } catch (error) {
      alert("Failed to add game to section");
    }
  };

  useEffect(() => {
    fetchSectionItems();
  }, [fetchSectionItems]);

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
    if (!window.confirm(`Remove this game from ${sectionName}?`)) return;

    try {
      // Remove from SectionItem
      await supabase.from("SectionItem").delete().eq("id", itemId);
      
      // If it's the featured section, also update the Game table flag
      if (slug === 'featured') {
        await supabase.from("Game").update({ isFeatured: false }).eq("id", gameId);
      }
      
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
          <h1 className="text-4xl font-black uppercase tracking-tighter">{sectionName} Order</h1>
          <p className="text-white/40 text-sm font-bold uppercase tracking-widest">
            Drag and drop or use arrows to set the order of games in this section
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-white/5 text-white px-6 py-4 rounded-full font-black uppercase tracking-tight hover:bg-white/10 transition-all flex items-center gap-2 border border-white/5"
          >
            <Plus className="w-5 h-5" />
            Add Game
          </button>
          
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
      </div>

      {/* Add Game Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <div className="glass w-full max-w-2xl rounded-[2.5rem] border border-white/10 overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-8 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-2xl font-black uppercase tracking-tighter">Add Game to {sectionName}</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-8 space-y-6 flex-1 overflow-hidden flex flex-col">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                <input 
                  type="text"
                  value={gameSearchQuery}
                  onChange={(e) => setGameSearchQuery(e.target.value)}
                  placeholder="Search games by title..."
                  className="w-full glass py-4 pl-12 pr-6 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {loadingGames ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Fetching Games...</span>
                  </div>
                ) : allGames.filter(g => g.title.toLowerCase().includes(gameSearchQuery.toLowerCase())).length === 0 ? (
                  <div className="text-center py-20">
                    <p className="text-white/20 font-black uppercase tracking-widest text-sm">No games found</p>
                  </div>
                ) : (
                  allGames
                    .filter(g => g.title.toLowerCase().includes(gameSearchQuery.toLowerCase()))
                    .map(game => {
                      const isInSection = items.find(i => i.gameId === game.id);
                      return (
                        <div key={game.id} className="flex items-center justify-between p-4 glass rounded-2xl border border-white/5 hover:border-white/10 transition-all group">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl overflow-hidden relative bg-white/5">
                              <Image src={game.thumbnail} alt="" fill className="object-cover" referrerPolicy="no-referrer" unoptimized />
                            </div>
                            <div>
                              <p className="font-bold text-sm">{game.title}</p>
                              <p className="text-[10px] font-mono text-white/20">{game.slug}</p>
                            </div>
                          </div>
                          <button 
                            disabled={!!isInSection}
                            onClick={() => addItem(game)}
                            className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                              isInSection 
                                ? 'bg-white/5 text-white/20 cursor-not-allowed' 
                                : 'bg-emerald-500 text-black hover:bg-emerald-400'
                            }`}
                          >
                            {isInSection ? 'Added' : 'Add to Section'}
                          </button>
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="glass rounded-[2.5rem] p-20 flex flex-col items-center justify-center text-center space-y-6 border border-white/5">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
            <Star className="w-10 h-10 text-white/10" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black uppercase tracking-tight">No Games in {sectionName}</h3>
            <p className="text-white/40 text-sm font-bold uppercase tracking-widest max-w-xs mx-auto">
              Go to the Game Library to add some games to this section.
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
                  unoptimized
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
