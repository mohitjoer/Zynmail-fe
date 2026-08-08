"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, Mail, ArrowRight, CheckCircle2, Shield } from "lucide-react";

export default function CTASection() {
  return (
    <section className="relative z-10 w-full max-w-4xl mx-auto px-4 mb-24">
      <div className="relative p-8 sm:p-14 rounded-3xl border border-indigo-500/30 bg-gradient-to-b from-indigo-950/40 via-purple-950/20 to-black/90 backdrop-blur-2xl shadow-2xl shadow-indigo-500/10 overflow-hidden text-center">
        
        {/* Top ambient glow line */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-400 to-transparent" />

        {/* Ambient background orbs */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/20 blur-3xl rounded-full pointer-events-none" />

        <div className="relative z-10 space-y-6">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/15 text-neutral-200 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Join Hundreds of Power Users</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.1]">
            Take back control of your inbox today
          </h2>

          <p className="text-neutral-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Eliminate email fatigue with autonomous LangGraph workflows, AI triage, and contextual auto-replies.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm sm:text-base transition-all shadow-xl shadow-indigo-500/30 active:scale-95 flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/signin"
              className="w-full sm:w-auto px-7 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium text-sm sm:text-base transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Mail className="w-4 h-4 text-neutral-400" />
              <span>Sign In to Workspace</span>
            </Link>
          </div>

          {/* Trust Guarantees */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs text-neutral-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Instant Google OAuth 2.0 sync</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% Private & Protected</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
