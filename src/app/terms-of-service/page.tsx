export const metadata = {
  title: "Terms of Service | PlayZ Arcade",
  description: "Terms of Service for PlayZ Arcade. Please read these terms carefully before using our platform.",
};

export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto py-12 space-y-12">
      <section className="space-y-4">
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter cyber-text-glow text-neon-lime">
          Terms of <span className="text-white">Service</span>
        </h1>
        <p className="text-white/40 font-mono text-xs uppercase tracking-widest">Last Updated: March 13, 2026</p>
      </section>

      <div className="glass p-8 md:p-12 rounded-3xl border border-white/5 prose prose-invert max-w-none prose-sm md:prose-base">
        <h2 className="text-neon-lime uppercase tracking-tight">1. Terms</h2>
        <p>
          By accessing the website at playzarcade.com, you are agreeing to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws. If you do not agree with any of these terms, you are prohibited from using or accessing this site. The materials contained in this website are protected by applicable copyright and trademark law.
        </p>

        <h2 className="text-neon-lime uppercase tracking-tight">2. Use License</h2>
        <p>
          Permission is granted to temporarily download one copy of the materials (information or software) on PlayZ Arcade&apos;s website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>modify or copy the materials;</li>
          <li>use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
          <li>attempt to decompile or reverse engineer any software contained on PlayZ Arcade&apos;s website;</li>
          <li>remove any copyright or other proprietary notations from the materials; or</li>
          <li>transfer the materials to another person or &quot;mirror&quot; the materials on any other server.</li>
        </ul>
        <p>
          This license shall automatically terminate if you violate any of these restrictions and may be terminated by PlayZ Arcade at any time. Upon terminating your viewing of these materials or upon the termination of this license, you must destroy any downloaded materials in your possession whether in electronic or printed format.
        </p>

        <h2 className="text-neon-lime uppercase tracking-tight">3. Disclaimer</h2>
        <p>
          The materials on PlayZ Arcade&apos;s website are provided on an &apos;as is&apos; basis. PlayZ Arcade makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
        </p>
        <p>
          Further, PlayZ Arcade does not warrant or make any representations concerning the accuracy, likely results, or reliability of the use of the materials on its website or otherwise relating to such materials or on any sites linked to this site.
        </p>

        <h2 className="text-neon-lime uppercase tracking-tight">4. Limitations</h2>
        <p>
          In no event shall PlayZ Arcade or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on PlayZ Arcade&apos;s website, even if PlayZ Arcade or a PlayZ Arcade authorized representative has been notified orally or in writing of the possibility of such damage. Because some jurisdictions do not allow limitations on implied warranties, or limitations of liability for consequential or incidental damages, these limitations may not apply to you.
        </p>

        <h2 className="text-neon-lime uppercase tracking-tight">5. Accuracy of materials</h2>
        <p>
          The materials appearing on PlayZ Arcade&apos;s website could include technical, typographical, or photographic errors. PlayZ Arcade does not warrant that any of the materials on its website are accurate, complete or current. PlayZ Arcade may make changes to the materials contained on its website at any time without notice. However PlayZ Arcade does not make any commitment to update the materials.
        </p>

        <h2 className="text-neon-lime uppercase tracking-tight">6. Links</h2>
        <p>
          PlayZ Arcade has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by PlayZ Arcade of the site. Use of any such linked website is at the user&apos;s own risk.
        </p>

        <h2 className="text-neon-lime uppercase tracking-tight">7. Modifications</h2>
        <p>
          PlayZ Arcade may revise these terms of service for its website at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service.
        </p>

        <h2 className="text-neon-lime uppercase tracking-tight">8. Governing Law</h2>
        <p>
          These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which PlayZ Arcade operates and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
        </p>
      </div>
    </div>
  );
}
