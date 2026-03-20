'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Upload, Loader2, CheckCircle2, Image as ImageIcon } from 'lucide-react';

export default function UploadIconPage() {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!previewUrl) return;
    
    setLoading(true);
    try {
      const base64Image = previewUrl.split(',')[1];

      const saveRes = await fetch('/api/dev/save-icon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ base64Image }),
      });

      const saveData = await saveRes.json();
      
      if (saveData.success) {
        setImageUrl(saveData.url);
        alert("Icon uploaded and updated across the site successfully!");
      } else {
        throw new Error(saveData.error || "Failed to save the icon.");
      }
    } catch (err: any) {
      console.error("Icon upload error:", err);
      alert("Error: " + (err.message || "An unexpected error occurred"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="space-y-1">
        <h1 className="text-4xl font-black uppercase tracking-tighter text-neon-cyan">Site Icon Manager</h1>
        <p className="text-white/40 text-sm font-bold uppercase tracking-widest">Upload your custom icon (PWA, Favicon, etc.)</p>
      </div>

      <div className="glass p-12 rounded-3xl border border-white/5 flex flex-col items-center justify-center space-y-8">
        <div className="relative group">
          {previewUrl || imageUrl ? (
            <Image 
              src={previewUrl || imageUrl || ""} 
              alt="Icon Preview" 
              width={256}
              height={256}
              className="w-64 h-64 rounded-3xl border-4 border-neon-cyan shadow-[0_0_50px_rgba(0,243,255,0.3)] object-cover"
              unoptimized
            />
          ) : (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-64 h-64 bg-white/5 rounded-3xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 transition-all group"
            >
              <ImageIcon className="w-12 h-12 text-white/10 group-hover:text-neon-cyan transition-colors mb-4" />
              <p className="text-[10px] font-black uppercase tracking-widest text-white/20 group-hover:text-white/40">Click to Select Image</p>
            </div>
          )}
          
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="bg-white/5 text-white px-8 py-4 rounded-full font-black uppercase tracking-tight hover:bg-white/10 transition-all flex items-center gap-3 border border-white/10"
          >
            <Upload className="w-6 h-6" />
            Select New Image
          </button>

          <button 
            onClick={handleUpload}
            disabled={loading || !previewUrl}
            className="bg-neon-cyan text-black px-8 py-4 rounded-full font-black uppercase tracking-tight hover:bg-white transition-all flex items-center gap-3 disabled:opacity-50 shadow-[0_0_30px_rgba(0,243,255,0.4)]"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <CheckCircle2 className="w-6 h-6" />}
            Apply Icon Everywhere
          </button>
        </div>

        <div className="bg-white/5 p-6 rounded-2xl border border-white/5 max-w-2xl w-full">
          <h3 className="text-xs font-black uppercase tracking-widest text-white/60 mb-3 flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            Nano Banana Prompt (for your reference)
          </h3>
          <p className="text-[11px] text-white/40 leading-relaxed font-mono bg-black/40 p-4 rounded-xl border border-white/5 select-all">
            A playful cyberpunk gaming icon featuring the letters &apos;Pz&apos; in a vibrant, neon-lit font. The aesthetic is futuristic yet fun, with bright cyan and magenta accents, sharp digital edges, and a high-tech arcade feel. The background is a deep, textured black to make the neon pop. Professional logo design, square format, centered.
          </p>
        </div>

        <p className="text-[10px] text-white/20 font-mono uppercase tracking-widest text-center max-w-md">
          Note: This will overwrite icon-192.png, icon-512.png, favicon.ico, and favicon.png. Changes may take a moment to reflect due to browser caching.
        </p>
      </div>
    </div>
  );
}
