import { Mail, MessageSquare, Globe, Send } from "lucide-react";

export const metadata = {
  title: "Contact Us | PlayZ Arcade",
  description: "Get in touch with the PlayZ Arcade team for support, business inquiries, or game submissions.",
};

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-16 py-12">
      <section className="text-center space-y-4">
        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter cyber-text-glow text-neon-magenta">
          Contact <span className="text-white">Support</span>
        </h1>
        <p className="text-white/40 font-mono text-sm tracking-widest uppercase">Establishing Communication Uplink...</p>
      </section>

      <div className="grid md:grid-cols-[1fr_1.5fr] gap-12">
        <div className="space-y-8">
          <div className="glass p-6 rounded-3xl border border-white/5 space-y-4">
            <h2 className="text-sm font-black uppercase tracking-widest text-white/40">Direct Channels</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-neon-magenta/20 transition-colors">
                  <Mail className="w-5 h-5 text-white/40 group-hover:text-neon-magenta" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Email</p>
                  <p className="text-sm font-bold">support@playzarcade.com</p>
                </div>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-neon-cyan/20 transition-colors">
                  <Globe className="w-5 h-5 text-white/40 group-hover:text-neon-cyan" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Business</p>
                  <p className="text-sm font-bold">partners@playzarcade.com</p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass p-6 rounded-3xl border border-white/5">
            <p className="text-xs text-white/40 leading-relaxed font-mono">
              [NOTICE]: Response times may vary based on server load. Typical response window: 24-48 hours.
            </p>
          </div>
        </div>

        <div className="glass p-8 rounded-3xl border border-white/5">
          <form className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Identity</label>
                <input 
                  type="text" 
                  placeholder="Username / Name"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-neon-magenta/50 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Comms Address</label>
                <input 
                  type="email" 
                  placeholder="email@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-neon-magenta/50 transition-colors"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Subject</label>
              <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-neon-magenta/50 transition-colors appearance-none">
                <option>Technical Support</option>
                <option>Game Submission</option>
                <option>Advertising Inquiries</option>
                <option>Abuse Report</option>
                <option>Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Message Payload</label>
              <textarea 
                rows={5}
                placeholder="Describe your inquiry..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-neon-magenta/50 transition-colors resize-none"
              />
            </div>
            <button className="w-full bg-neon-magenta text-black font-black uppercase tracking-widest py-4 rounded-xl hover:bg-neon-magenta/80 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,0,255,0.3)]">
              <Send className="w-4 h-4" />
              Transmit Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
