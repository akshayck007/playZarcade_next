import { Info, Target, Users, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "About Us | PlayZ Arcade",
  description: "Learn more about PlayZ Arcade, the ultimate destination for high-performance browser gaming.",
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-16 py-12">
      <section className="text-center space-y-4">
        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter cyber-text-glow text-neon-cyan">
          About <span className="text-white">PlayZ</span>
        </h1>
        <p className="text-white/40 font-mono text-sm tracking-widest uppercase">Initializing Platform History...</p>
      </section>

      <div className="grid gap-12">
        <div className="glass p-8 rounded-3xl border border-white/5 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-neon-cyan/10 rounded-2xl flex items-center justify-center">
              <Target className="w-6 h-6 text-neon-cyan" />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tight">Our Mission</h2>
          </div>
          <p className="text-white/60 leading-relaxed">
            PlayZ Arcade was founded with a single goal: to provide the fastest, most accessible, and highest quality browser gaming experience on the web. We believe that gaming should be instant, free, and available to everyone, regardless of their hardware.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="glass p-8 rounded-3xl border border-white/5 space-y-4">
            <div className="w-10 h-10 bg-neon-magenta/10 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-neon-magenta" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight text-neon-magenta">Community First</h3>
            <p className="text-sm text-white/50 leading-relaxed">
              We listen to our players. Our library is curated based on what you love to play, ensuring the trending section always reflects the pulse of the gaming community.
            </p>
          </div>
          <div className="glass p-8 rounded-3xl border border-white/5 space-y-4">
            <div className="w-10 h-10 bg-neon-lime/10 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-neon-lime" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight text-neon-lime">Safe & Secure</h3>
            <p className="text-sm text-white/50 leading-relaxed">
              No downloads means no viruses. We strictly vet every game on our platform to ensure a safe environment for gamers of all ages.
            </p>
          </div>
        </div>

        <div className="prose prose-invert max-w-none font-mono text-sm text-white/40 bg-white/5 p-8 rounded-3xl border border-white/5">
          <p>
            [SYSTEM_LOG]: PlayZ Arcade utilizes cutting-edge HTML5 technology to bypass traditional gaming barriers. By leveraging edge computing and high-performance rendering, we deliver a console-like experience directly in your browser. Our platform is optimized for both desktop and mobile devices, ensuring your progress and favorite games are always just a click away.
          </p>
        </div>
      </div>
    </div>
  );
}
