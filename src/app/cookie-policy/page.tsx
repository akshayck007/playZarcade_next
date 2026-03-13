export const metadata = {
  title: "Cookie Policy | PlayZ Arcade",
  description: "Cookie Policy for PlayZ Arcade. Learn how we use cookies to improve your gaming experience.",
};

export default function CookiePolicyPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 space-y-12">
      <section className="space-y-4">
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter cyber-text-glow text-neon-magenta">
          Cookie <span className="text-white">Policy</span>
        </h1>
        <p className="text-white/40 font-mono text-xs uppercase tracking-widest">Last Updated: March 13, 2026</p>
      </section>

      <div className="glass p-8 md:p-12 rounded-3xl border border-white/5 prose prose-invert max-w-none prose-sm md:prose-base">
        <p>
          This is the Cookie Policy for PlayZ Arcade, accessible from playzarcade.com.
        </p>

        <h2 className="text-neon-magenta uppercase tracking-tight">1. What Are Cookies</h2>
        <p>
          As is common practice with almost all professional websites this site uses cookies, which are tiny files that are downloaded to your computer, to improve your experience. This page describes what information they gather, how we use it and why we sometimes need to store these cookies. We will also share how you can prevent these cookies from being stored however this may downgrade or &apos;break&apos; certain elements of the sites functionality.
        </p>

        <h2 className="text-neon-magenta uppercase tracking-tight">2. How We Use Cookies</h2>
        <p>
          We use cookies for a variety of reasons detailed below. Unfortunately in most cases there are no industry standard options for disabling cookies without completely disabling the functionality and features they add to this site. It is recommended that you leave on all cookies if you are unsure whether you need them or not in case they are used to provide a service that you use.
        </p>

        <h2 className="text-neon-magenta uppercase tracking-tight">3. Disabling Cookies</h2>
        <p>
          You can prevent the setting of cookies by adjusting the settings on your browser (see your browser Help for how to do this). Be aware that disabling cookies will affect the functionality of this and many other websites that you visit. Disabling cookies will usually result in also disabling certain functionality and features of the this site. Therefore it is recommended that you do not disable cookies.
        </p>

        <h2 className="text-neon-magenta uppercase tracking-tight">4. The Cookies We Set</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Account related cookies:</strong> If you create an account with us then we will use cookies for the management of the signup process and general administration. These cookies will usually be deleted when you log out however in some cases they may remain afterwards to remember your site preferences when logged out.
          </li>
          <li>
            <strong>Login related cookies:</strong> We use cookies when you are logged in so that we can remember this fact. This prevents you from having to log in every single time you visit a new page. These cookies are typically removed or cleared when you log out to ensure that you can only access restricted features and areas when logged in.
          </li>
          <li>
            <strong>Site preferences cookies:</strong> In order to provide you with a great experience on this site we provide the functionality to set your preferences for how this site runs when you use it. In order to remember your preferences we need to set cookies so that this information can be called whenever you interact with a page is affected by your preferences.
          </li>
        </ul>

        <h2 className="text-neon-magenta uppercase tracking-tight">5. Third Party Cookies</h2>
        <p>
          In some special cases we also use cookies provided by trusted third parties. The following section details which third party cookies you might encounter through this site.
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            This site uses Google Analytics which is one of the most widespread and trusted analytics solution on the web for helping us to understand how you use the site and ways that we can improve your experience. These cookies may track things such as how long you spend on the site and the pages that you visit so we can continue to produce engaging content.
          </li>
          <li>
            The Google AdSense service we use to serve advertising uses a DoubleClick cookie to serve more relevant ads across the web and limit the number of times that a given ad is shown to you.
          </li>
        </ul>

        <h2 className="text-neon-magenta uppercase tracking-tight">6. More Information</h2>
        <p>
          Hopefully that has clarified things for you and as was previously mentioned if there is something that you aren&apos;t sure whether you need or not it&apos;s usually safer to leave cookies enabled in case it does interact with one of the features you use on our site.
        </p>
        <p>
          If you are still looking for more information then you can contact us through one of our preferred contact methods:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Email: support@playzarcade.com</li>
        </ul>
      </div>
    </div>
  );
}
