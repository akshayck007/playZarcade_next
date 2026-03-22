'use client';

import { supabase } from "@/lib/supabase";
import { Plus, Edit, Trash2, Gamepad2, Layers, Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cleaning, setCleaning] = useState(false);
  const [recategorizing, setRecategorizing] = useState(false);
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [categoryForm, setCategoryForm] = useState({ name: "", slug: "" });

  const fetchCategories = async () => {
    setLoading(true);
    const { data: categoriesRaw } = await supabase
      .from("Category")
      .select("*, Game(id)")
      .order("name", { ascending: true });

    const processed = (categoriesRaw || []).map(cat => ({
      ...cat,
      _count: { games: cat.Game?.length || 0 }
    }));
    setCategories(processed);
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenModal = (category: any = null) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({ name: category.name, slug: category.slug });
    } else {
      setEditingCategory(null);
      setCategoryForm({ name: "", slug: "" });
    }
    setIsModalOpen(true);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    setCategoryForm({ name, slug });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingCategory) {
        const { error } = await supabase
          .from("Category")
          .update(categoryForm)
          .eq("id", editingCategory.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("Category")
          .insert([{ ...categoryForm, id: crypto.randomUUID() }]);
        if (error) throw error;
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      alert(err.message || "Failed to save category");
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const { error } = await supabase.from("Category").delete().eq("id", id);
      if (error) throw error;
      fetchCategories();
    } catch (err: any) {
      alert(err.message || "Failed to delete category");
    }
  };

  const handleCleanup = async () => {
    if (!confirm("This will merge duplicate categories (Action, Puzzle, etc.) and remove empty ones. Continue?")) return;
    
    setCleaning(true);
    try {
      const res = await fetch('/api/admin/categories/cleanup');
      const data = await res.json();
      if (data.success) {
        alert("Cleanup successful!");
        fetchCategories();
      } else {
        alert("Cleanup failed: " + data.error);
      }
    } catch (err) {
      alert("An error occurred during cleanup");
    } finally {
      setCleaning(false);
    }
  };

  const handleRecategorize = async () => {
    if (!confirm("This will find all games with 'multiplayer' in the title and move them to the Multiplayer category. Continue?")) return;
    
    setRecategorizing(true);
    try {
      const res = await fetch('/api/admin/games/re-categorize');
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchCategories();
      } else {
        alert("Re-categorization failed: " + data.error);
      }
    } catch (err) {
      alert("An error occurred during re-categorization");
    } finally {
      setRecategorizing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-black uppercase tracking-tighter">Categories</h1>
          <p className="text-white/40 text-sm font-bold uppercase tracking-widest">Organize your games into {categories.length} segments</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleRecategorize}
            disabled={recategorizing}
            className="bg-white/5 text-white/60 px-6 py-3 rounded-full font-black uppercase tracking-tight hover:bg-white/10 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {recategorizing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Gamepad2 className="w-5 h-5 text-emerald-500" />}
            Fix Multiplayer
          </button>
          <button 
            onClick={handleCleanup}
            disabled={cleaning}
            className="bg-white/5 text-white/60 px-6 py-3 rounded-full font-black uppercase tracking-tight hover:bg-white/10 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {cleaning ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 text-emerald-500" />}
            Cleanup Duplicates
          </button>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-emerald-500 text-black px-6 py-3 rounded-full font-black uppercase tracking-tight hover:bg-emerald-400 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Category
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div key={cat.id} className="glass p-8 rounded-3xl space-y-6 border border-white/5 hover:border-emerald-500/30 transition-all group">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
                <Layers className="w-6 h-6 text-emerald-500 group-hover:text-black transition-colors" />
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleOpenModal(cat)}
                  className="p-2 glass rounded-lg hover:bg-white/10 transition-colors"
                >
                  <Edit className="w-4 h-4 text-white/40" />
                </button>
                <button 
                  onClick={() => handleDelete(cat.id, cat.name)}
                  className="p-2 glass rounded-lg hover:bg-red-500/20 transition-colors group/del"
                >
                  <Trash2 className="w-4 h-4 text-white/40 group-hover/del:text-red-500" />
                </button>
              </div>
            </div>
            
            <div className="space-y-1">
              <h3 className="text-2xl font-black uppercase tracking-tighter">{cat.name}</h3>
              <p className="text-[10px] text-white/30 font-mono uppercase tracking-widest">Slug: {cat.slug}</p>
            </div>

            <div className="pt-6 border-t border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gamepad2 className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold">{cat._count.games} Games</span>
              </div>
              <Link href={`/${cat.slug}`} target="_blank" className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-emerald-500 transition-colors">
                View Page
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass p-8 rounded-3xl max-w-md w-full space-y-6 border border-white/10">
            <h2 className="text-2xl font-black uppercase tracking-tighter">
              {editingCategory ? "Edit Category" : "New Category"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Category Name</label>
                <input 
                  required
                  type="text" 
                  value={categoryForm.name}
                  onChange={handleNameChange}
                  placeholder="e.g. Action"
                  className="w-full glass p-4 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Slug</label>
                <input 
                  required
                  type="text" 
                  value={categoryForm.slug}
                  onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                  placeholder="action"
                  className="w-full glass p-4 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 glass py-4 rounded-xl font-black uppercase tracking-tight hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-emerald-500 text-black py-4 rounded-xl font-black uppercase tracking-tight hover:bg-emerald-400 transition-colors"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
