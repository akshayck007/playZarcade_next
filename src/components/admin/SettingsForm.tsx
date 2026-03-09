'use client';

import { useState } from "react";
import { Save, Globe, Shield, Code, Database } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { SettingToggle } from "@/components/admin/SettingToggle";

interface SettingsFormProps {
  initialSettings: any;
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

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
          </div>

          {/* SEO & Ads */}
          <div className="glass p-8 rounded-3xl space-y-6 border border-white/5">
            <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
              <Code className="w-5 h-5 text-emerald-500" />
              SEO & Monetization
            </h2>
            <div className="space-y-4">
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
