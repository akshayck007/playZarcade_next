'use client';

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Save, ArrowLeft, Image as ImageIcon, Link as LinkIcon, Type, FileText, Layout, Star, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function EditGamePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    thumbnail: "",
    iframeUrl: "",
    categoryId: "",
    isPublished: true,
    isFeatured: false,
    isRetro: false,
    console: "nes",
    romUrl: "",
    qualityScore: 0.8,
    playCount: 0,
    trendScore: 0,
    contentBody: "",
  });

  const [romFile, setRomFile] = useState<File | null>(null);
  const [uploadingRom, setUploadingRom] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [catRes, gameRes] = await Promise.all([
          supabase.from("Category").select("*").order("name"),
          supabase.from("Game").select("*").eq("id", id).single()
        ]);

        if (catRes.data) setCategories(catRes.data);
        if (gameRes.data) {
          const game = gameRes.data;
          setFormData({
            title: game.title || "",
            slug: game.slug || "",
            description: game.description || "",
            thumbnail: game.thumbnail || game.thumbnailUrl || "",
            iframeUrl: game.iframeUrl || "",
            categoryId: game.categoryId || "",
            isPublished: game.isPublished ?? true,
            isFeatured: game.isFeatured ?? false,
            isRetro: game.isRetro ?? false,
            console: game.console || "nes",
            romUrl: game.romUrl || "",
            qualityScore: game.qualityScore || 0.8,
            playCount: game.playCount || 0,
            trendScore: game.trendScore || 0,
            contentBody: game.contentBody || "",
          });
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    setFormData({ ...formData, title, slug });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let finalRomUrl = formData.romUrl;

      // Upload ROM if provided
      if (formData.isRetro && romFile) {
        setUploadingRom(true);
        const fileExt = romFile.name.split('.').pop();
        const fileName = `${formData.console}/${crypto.randomUUID()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('roms')
          .upload(fileName, romFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('roms')
          .getPublicUrl(fileName);
        
        finalRomUrl = publicUrl;
      }

      const submissionData: any = {
        ...formData,
        romUrl: finalRomUrl,
        categoryId: formData.categoryId === "" ? null : formData.categoryId,
        thumbnailUrl: formData.thumbnail,
      };

      const { error } = await supabase
        .from("Game")
        .update(submissionData)
        .eq("id", id);

      if (error) throw error;
      router.push("/admin/games");
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Failed to update game");
    } finally {
      setSaving(false);
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
    <div className="space-y-10 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/admin/games" className="w-12 h-12 glass rounded-2xl flex items-center justify-center hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="space-y-1">
            <h1 className="text-4xl font-black uppercase tracking-tighter">Edit Game</h1>
            <p className="text-white/40 text-sm font-bold uppercase tracking-widest">Update existing title details</p>
          </div>
        </div>
        <button 
          onClick={handleSubmit}
          disabled={saving}
          className="bg-emerald-500 text-black px-8 py-3 rounded-full font-black uppercase tracking-tight hover:bg-emerald-400 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {saving ? "Saving..." : "Update Game"}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-[1fr_320px] gap-8">
        <div className="space-y-8">
          {/* Basic Info */}
          <div className="glass p-8 rounded-3xl space-y-6 border border-white/5">
            <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
              <Type className="w-5 h-5 text-emerald-500" />
              Core Identity
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Game Title</label>
                <input 
                  required
                  type="text" 
                  value={formData.title}
                  onChange={handleTitleChange}
                  placeholder="e.g. Subway Surfers"
                  className="w-full glass p-4 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40">URL Slug</label>
                <input 
                  required
                  type="text" 
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="subway-surfers"
                  className="w-full glass p-4 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Short Description</label>
              <textarea 
                required
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="A brief overview for search results..."
                className="w-full glass p-4 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>

          {/* Media & Assets */}
          <div className="glass p-8 rounded-3xl space-y-6 border border-white/5">
            <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
              <ImageIcon className="w-5 h-5 text-emerald-500" />
              Assets & Source
            </h2>

            <div className="flex p-1 bg-white/5 rounded-2xl border border-white/10 mb-6">
              <button 
                type="button"
                onClick={() => setFormData({ ...formData, isRetro: false })}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!formData.isRetro ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'}`}
              >
                Web / Iframe Game
              </button>
              <button 
                type="button"
                onClick={() => setFormData({ ...formData, isRetro: true })}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.isRetro ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'}`}
              >
                Retro ROM
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Thumbnail URL</label>
                <div className="flex gap-4">
                  <input 
                    required
                    type="url" 
                    value={formData.thumbnail}
                    onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="flex-1 glass p-4 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                  {formData.thumbnail && (
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-white/5 relative border border-white/10">
                      <img src={formData.thumbnail} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                  )}
                </div>
              </div>

              {!formData.isRetro ? (
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Iframe / Game URL</label>
                  <input 
                    type="url" 
                    value={formData.iframeUrl}
                    onChange={(e) => setFormData({ ...formData, iframeUrl: e.target.value })}
                    placeholder="https://gamepix.com/play/..."
                    className="w-full glass p-4 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Console System</label>
                      <select 
                        value={formData.console}
                        onChange={(e) => setFormData({ ...formData, console: e.target.value })}
                        className="w-full glass p-4 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none"
                      >
                        <option value="nes">NES</option>
                        <option value="snes">SNES</option>
                        <option value="gba">GBA</option>
                        <option value="gbc">GBC</option>
                        <option value="n64">N64</option>
                        <option value="genesis">Genesis</option>
                        <option value="mame">Arcade</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/40">ROM Source</label>
                      <div className="flex gap-2">
                        <button 
                          type="button"
                          onClick={() => setRomFile(null)}
                          className={`flex-1 py-4 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${!romFile ? 'bg-white/10 border-white/20' : 'bg-transparent border-white/5 text-white/40'}`}
                        >
                          URL
                        </button>
                        <label className={`flex-1 py-4 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer text-center ${romFile ? 'bg-white/10 border-white/20' : 'bg-transparent border-white/5 text-white/40'}`}>
                          File
                          <input type="file" className="hidden" onChange={(e) => e.target.files && setRomFile(e.target.files[0])} />
                        </label>
                      </div>
                    </div>
                  </div>

                  {romFile ? (
                    <div className="glass p-4 rounded-xl border border-emerald-500/20 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                          <Save className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white truncate max-w-[200px]">{romFile.name}</p>
                          <p className="text-[10px] text-white/40 font-mono">{(romFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <button type="button" onClick={() => setRomFile(null)} className="text-red-500 text-[10px] font-black uppercase tracking-widest">Remove</button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/40">ROM URL</label>
                      <input 
                        type="url" 
                        value={formData.romUrl}
                        onChange={(e) => setFormData({ ...formData, romUrl: e.target.value })}
                        placeholder="https://archive.org/.../game.nes"
                        className="w-full glass p-4 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Rich Content */}
          <div className="glass p-8 rounded-3xl space-y-6 border border-white/5">
            <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
              <FileText className="w-5 h-5 text-emerald-500" />
              SEO Content (Markdown)
            </h2>
            <textarea 
              rows={12}
              value={formData.contentBody}
              onChange={(e) => setFormData({ ...formData, contentBody: e.target.value })}
              placeholder="# How to Play Subway Surfers..."
              className="w-full glass p-6 rounded-2xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
        </div>

        <aside className="space-y-8">
          {/* Classification */}
          <div className="glass p-8 rounded-3xl space-y-6 border border-white/5">
            <h2 className="text-sm font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
              <Layout className="w-4 h-4" />
              Classification
            </h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Category</label>
                <select 
                  required
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full glass p-4 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-between glass p-4 rounded-xl">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Published</span>
                <input 
                  type="checkbox" 
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="w-5 h-5 accent-emerald-500"
                />
              </div>
              <div className="flex items-center justify-between glass p-4 rounded-xl">
                <div className="flex items-center gap-2">
                  <Star className="w-3 h-3 text-yellow-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Featured</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="w-5 h-5 accent-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Metrics */}
          <div className="glass p-8 rounded-3xl space-y-6 border border-white/5">
            <h2 className="text-sm font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
              <Star className="w-4 h-4" />
              Metrics
            </h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Quality Score (0-1)</label>
                <input 
                  type="number" 
                  step="0.01"
                  min="0"
                  max="1"
                  value={formData.qualityScore}
                  onChange={(e) => setFormData({ ...formData, qualityScore: parseFloat(e.target.value) })}
                  className="w-full glass p-4 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Plays</label>
                <input 
                  type="number" 
                  value={formData.playCount}
                  onChange={(e) => setFormData({ ...formData, playCount: parseInt(e.target.value) })}
                  className="w-full glass p-4 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}
