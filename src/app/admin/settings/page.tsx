import { supabase } from "@/lib/supabase";
import { Save, Globe, Shield, Code, Database, Bell } from "lucide-react";
import { SettingToggle } from "@/components/admin/SettingToggle";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const { data: settings } = await supabase
    .from("Settings")
    .select("*")
    .eq("id", "global")
    .single();

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-black uppercase tracking-tighter">Site Settings</h1>
          <p className="text-white/40 text-sm font-bold uppercase tracking-widest">Global configuration & Platform preferences</p>
        </div>
        <button className="bg-emerald-500 text-black px-8 py-3 rounded-full font-black uppercase tracking-tight hover:bg-emerald-400 transition-colors flex items-center gap-2">
          <Save className="w-5 h-5" />
          Save Changes
        </button>
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
                  defaultValue={settings?.siteName || "PlayZ Arcade"} 
                  className="w-full glass p-4 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Default Theme</label>
                <select className="w-full glass p-4 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none">
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
                  rows={4}
                  defaultValue={settings?.adsTxt || "gamepix.com, ZA727, DIRECT, f08c47fec0942fa0"} 
                  className="w-full glass p-4 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Google Search Console Tag</label>
                <input 
                  type="text" 
                  placeholder="google-site-verification=..." 
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
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">Maintenance Mode</span>
                <div className="w-10 h-5 bg-white/10 rounded-full relative">
                  <div className="absolute left-1 top-1 w-3 h-3 bg-white/20 rounded-full"></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">Public Registration</span>
                <div className="w-10 h-5 bg-emerald-500/20 rounded-full relative">
                  <div className="absolute right-1 top-1 w-3 h-3 bg-emerald-500 rounded-full"></div>
                </div>
              </div>
              <SettingToggle 
                id="autoBoostTrending"
                label="Auto-Boost Trending"
                description="Boost game scores based on mined trends"
                initialValue={settings?.autoBoostTrending ?? true}
                field="autoBoostTrending"
              />
              <SettingToggle 
                id="autoCreateShadowGames"
                label="Auto-Shadow Generation"
                description="Create shadow pages for missing games"
                initialValue={settings?.autoCreateShadowGames ?? true}
                field="autoCreateShadowGames"
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
