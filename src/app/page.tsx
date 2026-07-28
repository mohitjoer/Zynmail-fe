import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Zynmail — AI-Powered Email for Modern Teams",
  description:
    "Zynmail is a next-generation AI-powered mailing platform that makes email intelligent, fast, and beautiful. Experience the future of email.",
  openGraph: {
    title: "Zynmail — AI-Powered Email for Modern Teams",
    description:
      "Zynmail is a next-generation AI-powered mailing platform that makes email intelligent, fast, and beautiful.",
    type: "website",
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-medium tracking-tight text-foreground">Zynmail</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link href="/home" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Sign In
            </Link>
            <Link
              href="/home"
              className="rounded-full bg-zynmail px-5 py-2 text-sm font-semibold text-zynmail-foreground hover:bg-zynmail/90 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col">
        <section className="relative flex-1 flex items-center justify-center pt-16 pb-20 px-4">
          <div className="mx-auto max-w-5xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              Now with AI-powered email intelligence
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight text-foreground leading-tight mb-6">
              Email,{" "}
              <span className="text-zynmail">reimagined</span>
              {" "}
              with AI
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Zynmail is a next-generation email platform that uses AI to organize, prioritize,
              and draft your emails. Focus on what matters while we handle the noise.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link
                href="/home"
                className="w-full sm:w-auto rounded-full bg-zynmail px-8 py-3.5 text-base font-semibold text-zynmail-foreground hover:bg-zynmail/90 transition-all shadow-lg shadow-zynmail/25"
              >
                Start Free — No Credit Card Required
              </Link>
              <Link
                href="#features"
                className="w-full sm:w-auto rounded-full border border-border bg-background px-8 py-3.5 text-base font-medium text-foreground hover:bg-accent transition-all"
              >
                Explore Features
              </Link>
            </div>

            <p className="text-sm text-muted-foreground/70">
              Trusted by 10,000+ teams at companies like{" "}
              <span className="font-medium text-foreground">Acme Corp</span>{", "}
              <span className="font-medium text-foreground">TechStart</span>{", "}
              <span className="font-medium text-foreground">GlobalTech</span>
            </p>
          </div>

          {/* Floating email preview */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 hidden lg:block">
            <div className="relative w-[600px] max-w-full">
              <div className="bg-card border border-border rounded-2xl shadow-2xl shadow-black/10 overflow-hidden">
                <div className="flex items-center gap-1.5 px-4 py-3 bg-muted/50 border-b border-border">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/60" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                    <div className="w-3 h-3 rounded-full bg-green-500/60" />
                  </div>
                  <div className="flex-1 text-center text-xs text-muted-foreground font-mono">
                    inbox@zynmail.com
                  </div>
                </div>
                <div className="p-6 space-y-4 max-h-[300px] overflow-hidden">
                  <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-xl border border-primary/10">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zynmail text-zynmail-foreground font-bold text-sm shrink-0">
                      AI
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">AI Summary</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        3 new emails summarized: Project update from Sarah, Q3 budget approval needed, Team lunch
                        scheduling.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 hover:bg-accent/50 rounded-xl transition-colors border border-border/50">
                    <button className="p-1 rounded-full hover:bg-accent transition-colors">
                      <svg className="h-5 w-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </button>
                    <div className="flex-1">
                      <p className="font-medium text-sm text-foreground">Sarah Chen</p>
                      <p className="text-sm text-muted-foreground">Project Alpha — Weekly Update & Next Steps</p>
                    </div>
                    <span className="text-xs text-muted-foreground">2 min ago</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 hover:bg-accent/50 rounded-xl transition-colors border border-border/50">
                    <button className="p-1 rounded-full hover:bg-accent transition-colors">
                      <svg className="h-5 w-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </button>
                    <div className="flex-1">
                      <p className="font-medium text-sm text-foreground">Finance Team</p>
                      <p className="text-sm text-muted-foreground">Q3 Budget Review — Action Required by Friday</p>
                    </div>
                    <span className="text-xs text-muted-foreground">1 hour ago</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 hover:bg-accent/50 rounded-xl transition-colors border border-border/50">
                    <button className="p-1 rounded-full hover:bg-accent transition-colors">
                      <svg className="h-5 w-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </button>
                    <div className="flex-1">
                      <p className="font-medium text-sm text-foreground">Team Calendar</p>
                      <p className="text-sm text-muted-foreground">Team Lunch — Thursday 12:30 PM (Please RSVP)</p>
                    </div>
                    <span className="text-xs text-muted-foreground">Yesterday</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-4 bg-muted/30">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground mb-4">
                Built for the way you work
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Powerful features that help you reclaim your inbox and focus on what matters.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: (
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.734-.988-2.386l-.548-.547z" />
                    </svg>
                  ),
                  title: "AI-Powered Prioritization",
                  description:
                    "Smart algorithms learn your habits and automatically surface important emails while filtering noise to a separate tab.",
                },
                {
                  icon: (
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  ),
                  title: "Instant Summaries",
                  description:
                    "Get AI-generated summaries of long threads and newsletters. Understand the key points in seconds, not minutes.",
                },
                {
                  icon: (
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                  ),
                  title: "Smart Compose",
                  description:
                    "AI-assisted writing that suggests complete responses based on context. Write emails in a fraction of the time.",
                },
                {
                  icon: (
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  ),
                  title: "Enterprise Security",
                  description:
                    "End-to-end encryption, SSO/SAML support, and advanced admin controls. Your data stays yours.",
                },
                {
                  icon: (
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  ),
                  title: "Lightning Fast",
                  description:
                    "Built on modern architecture with instant search, offline support, and sub-100ms interactions.",
                },
                {
                  icon: (
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  ),
                  title: "Team Collaboration",
                  description:
                    "Shared inboxes, comments on emails, and delegated access. Work together without forwarding chains.",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="group p-6 bg-card border border-border rounded-2xl hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground mb-4">
              Ready to transform your inbox?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of teams who have already switched to Zynmail. Start your free
              14-day trial today.
            </p>
            <Link
              href="/home"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-zynmail px-8 py-3.5 text-base font-semibold text-zynmail-foreground hover:bg-zynmail/90 transition-all shadow-lg shadow-zynmail/25"
            >
              Get Started Free
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-12 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl font-medium tracking-tight text-foreground">Zynmail</span>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-powered email for modern teams. Focus on what matters.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition-colors">Features</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Pricing</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Integrations</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">API Docs</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Careers</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition-colors">Help Center</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Community</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Security</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Privacy</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Zynmail. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Twitter">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="GitHub">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="LinkedIn">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}