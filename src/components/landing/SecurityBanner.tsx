"use client";

import React from "react";
import {
  ShieldCheck,
  Lock,
  EyeOff,
  KeyRound,
  FileCheck,
  ServerOff,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function SecurityBanner() {
  const securityPillars = [
    {
      icon: ShieldCheck,
      title: "Enterprise Prompt Guard",
      desc: "Multi-tier heuristic scanner prevents adversarial prompt injection and override attacks hidden inside email text.",
    },
    {
      icon: Lock,
      title: "XML Context Isolation",
      desc: "All messages are wrapped inside strict <untrusted_email_context> tags before reaching language models.",
    },
    {
      icon: EyeOff,
      title: "Zero Model Training",
      desc: "Your email data and private correspondence are never used to train or fine-tune underlying AI models.",
    },
    {
      icon: KeyRound,
      title: "OAuth 2.0 Direct Access",
      desc: "Credentials remain encrypted using industry-standard Google OAuth with scoped, revocable permissions.",
    },
  ];

  return (
    <section id="security" className="relative z-10 w-full max-w-6xl mx-auto px-4 mb-28 scroll-mt-28">
      <div className="relative rounded-3xl border border-emerald-500/20 bg-gradient-to-b from-emerald-950/20 via-black/80 to-black/90 backdrop-blur-2xl p-8 sm:p-12 overflow-hidden shadow-2xl shadow-emerald-500/5">
        
        {/* Glow Accent */}
        <div className="absolute -top-12 -left-12 w-64 h-64 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />

        <div className="relative z-10">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-8 border-b border-white/10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Security First Architecture</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
                Enterprise-grade safety for your inbox
              </h2>
            </div>
            
            <div className="flex items-center gap-2 self-start sm:self-center px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Prompt Injection Shield: ACTIVE</span>
            </div>
          </div>

          {/* 4 Security Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {securityPillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors space-y-2.5"
                >
                  <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <h3 className="text-sm font-bold text-white">{pillar.title}</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">{pillar.desc}</p>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
