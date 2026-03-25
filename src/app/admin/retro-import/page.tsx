'use client';

import React, { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Gamepad2, Upload, Loader2, CheckCircle2, AlertCircle, Trash2, Plus, Info, Layers } from 'lucide-react';
import { useRouter } from 'next/navigation';

const CONSOLES = [
  { id: 'nes', name: 'NES' },
  { id: 'snes', name: 'SNES' },
  { id: 'gba', name: 'Game Boy Advance' },
  { id: 'gbc', name: 'Game Boy Color' },
  { id: 'gb', name: 'Game Boy' },
  { id: 'n64', name: 'Nintendo 64' },
  { id: 'genesis', name: 'Sega Genesis' },
  { id: 'mame', name: 'Arcade (MAME)' },
  { id: 'psx', name: 'PlayStation 1' },
  { id: 'psp', name: 'PSP' },
  { id: 'play', name: 'PlayStation 2' },
];

const LIBRETRO_SYSTEMS: Record<string, string> = {
  'nes': 'Nintendo_-_Nintendo_Entertainment_System',
  'snes': 'Nintendo_-_Super_Nintendo_Entertainment_System',
  'gba': 'Nintendo_-_Game_Boy_Advance',
  'gbc': 'Nintendo_-_Game_Boy_Color',
  'gb': 'Nintendo_-_Game_Boy',
  'n64': 'Nintendo_-_Nintendo_64',
  'genesis': 'Sega_-_Mega_Drive_-_Genesis',
  'mame': 'MAME',
  'psx': 'Sony_-_PlayStation',
  'psp': 'Sony_-_PlayStation_Portable',
  'play': 'Sony_-_PlayStation_2',
};

const cleanTitle = (filename: string) => {
  return filename.split('.')[0]
    .replace(/\(.*\)/g, '') // Remove (USA), (Europe), etc.
    .replace(/\[.*\]/g, '') // Remove [!], [T-En], etc.
    .replace(/v\d+(\.\d+)*/g, '') // Remove v1.0, v2, etc.
    .replace(/Beta \d+/g, '') // Remove Beta 1
    .replace(/Rev \d+/g, '') // Remove Rev 1
    .replace(/\s+/g, ' ') // Collapse spaces
    .trim();
};

const getThumbnailUrl = (title: string, consoleId: string) => {
  const system = LIBRETRO_SYSTEMS[consoleId];
  if (!system) return `https://picsum.photos/seed/${title}/400/600`;
  
  // Libretro uses exact matching with .png extension
  // Note: Libretro filenames use spaces, but in a URL they must be encoded.
  // We use the title as provided, which should be the uncleaned filename for better matching.
  const encodedTitle = encodeURIComponent(title);
  return `https://raw.githubusercontent.com/libretro-thumbnails/${system}/master/Named_Boxarts/${encodedTitle}.png`;
};

export default function RetroImportPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [selectedConsole, setSelectedConsole] = useState('nes');
  const [romUrls, setRomUrls] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [results, setResults] = useState<{ success: boolean; message: string }[]>([]);
  const [previewGames, setPreviewGames] = useState<{ title: string; romUrl: string; console: string }[]>([]);
  const [activeTab, setActiveTab] = useState<'urls' | 'local' | 'upload'>('urls');
  const [localFiles, setLocalFiles] = useState<{ filename: string; title: string; url: string; extension: string }[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const scanLocalRoms = async () => {
    setIsScanning(true);
    try {
      const res = await fetch('/api/admin/roms');
      const data = await res.json();
      if (data.files) {
        setLocalFiles(data.files);
      }
    } catch (err) {
      console.error('Error scanning local ROMs:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadFiles(Array.from(e.target.files));
    }
  };

  const handlePreview = () => {
    if (activeTab === 'urls') {
      const urls = romUrls.split('\n').filter(url => url.trim().length > 0);
      const games = urls.map(url => {
        const fullFilename = decodeURIComponent(url.split('/').pop() || '');
        const filenameWithoutExt = fullFilename.split('.')[0];
        const title = cleanTitle(fullFilename);
        
        return {
          title,
          thumbnailTitle: filenameWithoutExt,
          romUrl: url.trim(),
          console: selectedConsole
        };
      });
      setPreviewGames(games as any);
    } else if (activeTab === 'local') {
      const games = localFiles.map(file => ({
        title: cleanTitle(file.filename),
        thumbnailTitle: file.filename.split('.')[0],
        romUrl: file.url,
        console: selectedConsole
      }));
      setPreviewGames(games as any);
    } else {
      const games = uploadFiles.map(file => {
        const title = cleanTitle(file.name);
        
        return {
          title,
          thumbnailTitle: file.name.split('.')[0],
          romUrl: 'PENDING_UPLOAD',
          console: selectedConsole,
          file: file
        };
      });
      setPreviewGames(games as any);
    }
  };

  const handleImport = async () => {
    if (previewGames.length === 0) return;
    setIsImporting(true);
    setResults([]);

    const newResults = [];

    for (const game of previewGames) {
      try {
        let finalRomUrl = game.romUrl;

        // If it's a direct upload, upload to Supabase Storage first
        if (finalRomUrl === 'PENDING_UPLOAD' && (game as any).file) {
          const file = (game as any).file;
          const fileExt = file.name.split('.').pop();
          const fileName = `${game.console}/${crypto.randomUUID()}.${fileExt}`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('roms')
            .upload(fileName, file, {
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('roms')
            .getPublicUrl(fileName);
          
          finalRomUrl = publicUrl;
        }

        // 1. Generate unique slug per console
        const baseSlug = game.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const slug = `${baseSlug}-${game.console}`;
        
        // 2. Check if game already exists
        const { data: existing } = await supabase
          .from('Game')
          .select('id')
          .eq('slug', slug)
          .maybeSingle();

        if (existing) {
          newResults.push({ success: false, message: `Skipped: ${game.title} (${game.console.toUpperCase()}) - Already exists` });
          continue;
        }

        // 3. Get Thumbnail
        const thumbnailUrl = getThumbnailUrl((game as any).thumbnailTitle || game.title, game.console);

        // 4. Insert game
        const { error } = await supabase.from('Game').insert({
          id: crypto.randomUUID(),
          title: game.title,
          slug,
          description: `Play the classic ${game.console.toUpperCase()} game ${game.title} online in your browser.`,
          thumbnail: thumbnailUrl,
          thumbnailUrl: thumbnailUrl,
          isPublished: true,
          isRetro: true,
          console: game.console,
          romUrl: finalRomUrl,
          playCount: Math.floor(Math.random() * 1000)
        });

        if (error) throw error;
        newResults.push({ success: true, message: `Imported: ${game.title} (${game.console.toUpperCase()})` });
      } catch (err: any) {
        newResults.push({ success: false, message: `Error importing ${game.title}: ${err.message}` });
      }
    }

    setResults(newResults);
    setIsImporting(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-black uppercase tracking-tighter">Retro Bulk Import</h1>
          <p className="text-white/40 text-sm font-bold uppercase tracking-widest">Import ROM collections from Archive.org</p>
        </div>
        <button 
          onClick={() => router.back()}
          className="px-6 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
        >
          Back to Dashboard
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Configuration */}
        <div className="glass p-8 rounded-3xl space-y-6 border border-white/5">
          <div className="flex p-1 bg-white/5 rounded-2xl border border-white/10">
            <button 
              onClick={() => setActiveTab('urls')}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'urls' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'}`}
            >
              URLs
            </button>
            <button 
              onClick={() => {
                setActiveTab('local');
                scanLocalRoms();
              }}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'local' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'}`}
            >
              Local
            </button>
            <button 
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'upload' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'}`}
            >
              Upload
            </button>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Select Console</label>
            <div className="grid grid-cols-2 gap-2">
              {CONSOLES.map((console) => (
                <button
                  key={console.id}
                  onClick={() => setSelectedConsole(console.id)}
                  className={`px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                    selectedConsole === console.id 
                      ? 'bg-emerald-500 text-black border-emerald-500' 
                      : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20'
                  }`}
                >
                  {console.name}
                </button>
              ))}
            </div>
          </div>

          {activeTab === 'urls' ? (
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40">ROM URLs (One per line)</label>
              <textarea 
                value={romUrls}
                onChange={(e) => setRomUrls(e.target.value)}
                placeholder="https://archive.org/.../game1.nes&#10;https://archive.org/.../game2.nes"
                className="w-full h-64 bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-mono focus:outline-none focus:border-emerald-500/50 transition-all"
              />
            </div>
          ) : activeTab === 'local' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Files in /public/roms/</label>
                <button 
                  onClick={scanLocalRoms}
                  disabled={isScanning}
                  className="text-[10px] font-black uppercase tracking-widest text-emerald-500 hover:text-emerald-400 disabled:opacity-50"
                >
                  {isScanning ? 'Scanning...' : 'Refresh List'}
                </button>
              </div>
              <div className="w-full h-64 bg-white/5 border border-white/10 rounded-2xl p-4 overflow-y-auto space-y-2">
                {localFiles.length > 0 ? (
                  localFiles.map((file, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-white/5 rounded-lg border border-white/5">
                      <div className="flex flex-col min-w-0">
                        <span className="text-[10px] font-bold truncate text-white">{file.filename}</span>
                        <span className="text-[8px] text-white/20 font-mono">{file.extension}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-2 opacity-20">
                    <Info className="w-8 h-8" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">No local ROMs found</p>
                    <p className="text-[8px] font-mono">Upload files to /public/roms/</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Upload ROM Files</label>
              <div className="relative group">
                <input 
                  type="file" 
                  multiple
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="w-full h-64 bg-white/5 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-center p-8 group-hover:border-emerald-500/50 transition-all">
                  <Upload className="w-12 h-12 text-white/20 mb-4 group-hover:text-emerald-500 transition-colors" />
                  <p className="text-xs font-bold uppercase tracking-widest mb-2">Click or Drag ROMs here</p>
                  <p className="text-[10px] text-white/20 font-mono">Supports .nes, .sfc, .gba, .zip, etc.</p>
                  {uploadFiles.length > 0 && (
                    <div className="mt-4 px-4 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                      <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                        {uploadFiles.length} files selected
                      </p>
                    </div>
                  )}
                </div>
              </div>
              {uploadFiles.length > 0 && (
                <div className="max-h-32 overflow-y-auto space-y-1 pr-2">
                  {uploadFiles.map((file, i) => (
                    <div key={i} className="flex items-center justify-between text-[8px] font-mono text-white/40 bg-white/5 p-2 rounded border border-white/5">
                      <span className="truncate">{file.name}</span>
                      <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <button 
            onClick={handlePreview}
            className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2"
          >
            <Gamepad2 className="w-4 h-4" />
            Preview Import
          </button>
        </div>

        {/* Preview & Results */}
        <div className="glass p-8 rounded-3xl space-y-6 border border-white/5 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-widest text-white/40">
              {results.length > 0 ? 'Import Results' : `Preview (${previewGames.length} games)`}
            </h3>
            {previewGames.length > 0 && !isImporting && results.length === 0 && (
              <button 
                onClick={() => setPreviewGames([])}
                className="text-red-500 hover:text-red-400"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-white/10">
            {results.length > 0 ? (
              results.map((res, i) => (
                <div key={i} className={`p-3 rounded-xl border flex items-center gap-3 ${res.success ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                  {res.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  <span className="text-[10px] font-bold uppercase tracking-tight truncate">{res.message}</span>
                </div>
              ))
            ) : previewGames.length > 0 ? (
              previewGames.map((game, i) => (
                <div key={i} className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between gap-4">
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-tight truncate text-white">{game.title}</span>
                    <span className="text-[8px] text-white/20 truncate font-mono">{game.romUrl}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-white/10 text-[8px] font-black uppercase tracking-widest text-white/40 shrink-0">
                    {game.console}
                  </span>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-20">
                <Upload className="w-12 h-12" />
                <p className="text-xs font-bold uppercase tracking-widest">No games to preview</p>
              </div>
            )}
          </div>

          {previewGames.length > 0 && results.length === 0 && (
            <button 
              onClick={handleImport}
              disabled={isImporting}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 text-black rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(16,185,129,0.3)]"
            >
              {isImporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Confirm Import
                </>
              )}
            </button>
          )}

          {results.length > 0 && (
            <button 
              onClick={() => {
                setResults([]);
                setPreviewGames([]);
                setRomUrls('');
              }}
              className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-2xl font-black uppercase tracking-widest text-xs transition-all"
            >
              Clear & Start New
            </button>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="glass p-6 rounded-3xl border border-white/5 flex items-start gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-2xl">
            <Info className="w-6 h-6 text-emerald-500" />
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-black uppercase tracking-tight">How to get ROM URLs?</h4>
            <p className="text-xs text-white/40 leading-relaxed">
              Go to the <a href="https://archive.org/download/retro-roms-best-set" target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:underline">Internet Archive Retro ROMs Set</a>. 
              Right-click on a console .zip file and select &quot;Copy link address&quot;. 
              For individual files, click into the zip and copy the direct link to the .nes, .sfc, or .gba file.
            </p>
          </div>
        </div>

        <div className="glass p-6 rounded-3xl border border-white/5 flex items-start gap-4">
          <div className="p-3 bg-blue-500/10 rounded-2xl">
            <Upload className="w-6 h-6 text-blue-500" />
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-black uppercase tracking-tight">How to use Local ROMs?</h4>
            <p className="text-xs text-white/40 leading-relaxed">
              1. Use the <strong>File Explorer</strong> in AI Studio to upload your ROM files to the <code className="text-blue-400">/public/roms/</code> directory.<br />
              2. Switch to the <strong>Local ROMs</strong> tab above.<br />
              3. Select the correct console and click <strong>Preview Import</strong>.
            </p>
          </div>
        </div>

        <div className="glass p-6 rounded-3xl border border-white/5 flex items-start gap-4">
          <div className="p-3 bg-orange-500/10 rounded-2xl">
            <Layers className="w-6 h-6 text-orange-500" />
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-black uppercase tracking-tight">Supabase Storage Setup</h4>
            <p className="text-xs text-white/40 leading-relaxed">
              To use the <strong>Upload</strong> feature, you must create a public bucket named <code className="text-orange-400">roms</code> in your Supabase project.<br />
              1. Go to <strong>Storage</strong> in Supabase Dashboard.<br />
              2. Click <strong>New Bucket</strong> and name it <code className="text-orange-400">roms</code>.<br />
              3. Make sure to set it to <strong>Public</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
