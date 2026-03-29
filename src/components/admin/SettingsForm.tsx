'use client';

import { useState } from "react";
import { Save, Globe, Shield, Code, Database, Image as ImageIcon, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { SettingToggle } from "@/components/admin/SettingToggle";

interface SettingsFormProps {
  initialSettings: any;
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'faviconUrl' | 'logoUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${field}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('assets')
        .getPublicUrl(filePath);

      setSettings({ ...settings, [field]: publicUrl });
    } catch (err: any) {
      console.error(err);
      alert('Error uploading file: ' + err.message);
    }
  };

  const generateAIIcon = async () => {
    setGenerating(true);
    try {
      const response = await fetch('/api/admin/generate-icon', {
        method: 'POST',
      });
      const data = await response.json();
      
      if (!data.success) throw new Error(data.error);

      // Convert base64 to blob
      const byteCharacters = atob(data.base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/png' });

      const fileName = `favicon-ai-${Date.now()}.png`;
      const { error: uploadError } = await supabase.storage
        .from('assets')
        .upload(fileName, blob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('assets')
        .getPublicUrl(fileName);

      setSettings({ ...settings, faviconUrl: publicUrl });
      setMessage({ type: 'success', text: 'AI Icon generated and saved!' });
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: 'AI Generation failed: ' + err.message });
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const { error } = await supabase
        .from("Settings")
        .upsert({
          id: "global",
          ...settings,
          updatedAt: new Date().toISOString(),
        });

      if (error) throw error;
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: err.message || 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-black uppercase tracking-tighter">Site Settings</h1>
          <p className="text-white/40 text-sm font-bold uppercase tracking-widest">Global configuration & Platform preferences</p>
        </div>
        <div className="flex items-center gap-4">
          {message && (
            <span className={`text-xs font-bold uppercase tracking-widest ${message.type === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>
              {message.text}
            </span>
          )}
          <button 
            onClick={handleSave}
            disabled={saving}
            className="bg-emerald-500 text-black px-8 py-3 rounded-full font-black uppercase tracking-tight hover:bg-emerald-400 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <Database className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* General Settings */}
          <div className="glass p-8 rounded-3xl space-y-6 border border-white/5">
            <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
              <Globe className="w-5 h-5 text-emerald-500" />
              General Configuration
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Site Name</label>
                <input 
                  type="text" 
                  value={settings?.siteName || ""} 
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  className="w-full glass p-4 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Default Theme</label>
                <select 
                  value={settings?.theme || "dark"}
                  onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
                  className="w-full glass p-4 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none"
                >
                  <option value="dark">Dark Mode (Default)</option>
                  <option value="light">Light Mode</option>
                  <option value="system">System Preference</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                  <ImageIcon className="w-3 h-3" />
                  Site Logo
                </label>
                <div className="flex items-center gap-4">
                  {settings?.logoUrl && (
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/5 border border-white/10 flex-shrink-0">
                      <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                    </div>
                  )}
                  <div className="flex-grow">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'logoUrl')}
                      className="hidden" 
                      id="logo-upload"
                    />
                    <label 
                      htmlFor="logo-upload"
                      className="block w-full glass p-3 rounded-xl text-xs font-bold text-center cursor-pointer hover:bg-white/5 transition-colors"
                    >
                      {settings?.logoUrl ? 'Change Logo' : 'Upload Logo'}
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                  <Sparkles className="w-3 h-3 text-emerald-500" />
                  Favicon (AI Generated or Upload)
                </label>
                <div className="flex items-center gap-4">
                  {settings?.faviconUrl && (
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/5 border border-white/10 flex-shrink-0">
                      <img src={settings.faviconUrl} alt="Favicon" className="w-full h-full object-contain" />
                    </div>
                  )}
                  <div className="flex-grow flex gap-2">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'faviconUrl')}
                      className="hidden" 
                      id="favicon-upload"
                    />
                    <label 
                      htmlFor="favicon-upload"
                      className="flex-grow glass p-3 rounded-xl text-xs font-bold text-center cursor-pointer hover:bg-white/5 transition-colors"
                    >
                      Upload
                    </label>
                    <button
                      onClick={generateAIIcon}
                      disabled={generating}
                      className="glass p-3 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-emerald-500/10 transition-colors disabled:opacity-50"
                    >
                      {generating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 text-emerald-500" />}
                      AI Gen
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SEO & Ads */}
          <div className="glass p-8 rounded-3xl space-y-6 border border-white/5">
            <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
              <Code className="w-5 h-5 text-emerald-500" />
              SEO & Monetization
            </h2>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Featured Section Mode</label>
                  <select 
                    value={settings?.featuredMode || "manual"}
                    onChange={(e) => setSettings({ ...settings, featuredMode: e.target.value })}
                    className="w-full glass p-4 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none"
                  >
                    <option value="manual">Manual Selection</option>
                    <option value="quality">Top Quality Score (Auto)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Trending Section Mode</label>
                  <select 
                    value={settings?.trendingMode || "manual"}
                    onChange={(e) => setSettings({ ...settings, trendingMode: e.target.value })}
                    className="w-full glass p-4 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none"
                  >
                    <option value="manual">Manual Selection</option>
                    <option value="quality">Top Quality Score (Auto)</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Ads.txt Content</label>
                <textarea 
                  rows={8}
                  value={settings?.adsTxt || ""} 
                  onChange={(e) => setSettings({ ...settings, adsTxt: e.target.value })}
                  placeholder="gamepix.com, ZA727, DIRECT, f08c47fec0942fa0"
                  className="w-full glass p-4 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Google Search Console Tag</label>
                <input 
                  type="text" 
                  value={settings?.googleVerification || ""}
                  onChange={(e) => setSettings({ ...settings, googleVerification: e.target.value })}
                  placeholder="google-site-verification=..." 
                  className="w-full glass p-4 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Google AdSense ID</label>
                <input 
                  type="text" 
                  value={settings?.adsenseId || ""}
                  onChange={(e) => setSettings({ ...settings, adsenseId: e.target.value })}
                  placeholder="ca-pub-XXXXXXXXXXXXXXXX" 
                  className="w-full glass p-4 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Security */}
          <div className="glass p-8 rounded-3xl space-y-6 border border-white/5">
            <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
              <Shield className="w-5 h-5 text-emerald-500" />
              Security
            </h2>
            <div className="space-y-4">
              <SettingToggle 
                id="maintenanceMode"
                label="Maintenance Mode"
                description="Disable public access to the site"
                initialValue={settings?.maintenanceMode ?? false}
                onToggle={(val) => setSettings({ ...settings, maintenanceMode: val })}
              />
              <SettingToggle 
                id="publicRegistration"
                label="Public Registration"
                description="Allow new users to sign up"
                initialValue={settings?.publicRegistration ?? true}
                onToggle={(val) => setSettings({ ...settings, publicRegistration: val })}
              />
              <SettingToggle 
                id="autoBoostTrending"
                label="Auto-Boost Trending"
                description="Boost game scores based on mined trends"
                initialValue={settings?.autoBoostTrending ?? true}
                onToggle={(val) => setSettings({ ...settings, autoBoostTrending: val })}
              />
              <SettingToggle 
                id="autoCreateShadowGames"
                label="Auto-Shadow Generation"
                description="Create shadow pages for missing games"
                initialValue={settings?.autoCreateShadowGames ?? true}
                onToggle={(val) => setSettings({ ...settings, autoCreateShadowGames: val })}
              />
              <SettingToggle 
                id="retroEnabled"
                label="Retro Section"
                description="Enable the retro arcade section"
                initialValue={settings?.retroEnabled ?? true}
                onToggle={(val) => setSettings({ ...settings, retroEnabled: val })}
              />
            </div>
          </div>

          {/* Database Info */}
          <div className="glass p-8 rounded-3xl space-y-6 border border-white/5">
            <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
              <Database className="w-5 h-5 text-emerald-500" />
              System Status
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                <span className="text-white/40">Supabase Client</span>
                <span className="text-emerald-500">Connected</span>
              </div>
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                <span className="text-white/40">Database Size</span>
                <span>12.4 MB</span>
              </div>
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                <span className="text-white/40">Last Backup</span>
                <span>2 hours ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
