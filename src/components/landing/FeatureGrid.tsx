"use client";

import React from "react";
import {
  Bot,
  Zap,
  Filter,
  PenLine,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  Layers,
  Cpu,
  Lock,
  MessageSquare,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureCard {
  icon: React.ElementType;
  title: string;
  badge?: string;
  description: string;
  tagline: string;
  gradient: string;
  borderHover: string;
}

const FEATURES: FeatureCard[] = [
  {
    icon: Bot,
    title: "Ask Zyn AI Copilot",
    badge: "Llama 3.1 70B",
    tagline: "Natural Language Inbox Intelligence",
    description:
      "Ask complex queries about past receipts, travel itineraries, or meeting times across thousands of emails with instant citation and context.",
    gradient: "from-indigo-500/10 to-indigo-500/0 text-indigo-400 border-indigo-500/20",
    borderHover: "hover:border-indigo-500/50",
  },
  {
    icon: Zap,
    title: "LangGraph Visual Automations",
    badge: "Autonomous DAG",
    tagline: "No-Code Workflow Builder",
    description:
      "Construct visual trigger-evaluation-action pipelines. Auto-classify incoming contracts, draft replies, and route critical alerts in seconds.",
    gradient: "from-violet-500/10 to-violet-500/0 text-violet-400 border-violet-500/20",
    borderHover: "hover:border-violet-500/50",
  },
  {
    icon: Filter,
    title: "Smart AI Categorization",
    badge: "Zero-Lag",
    tagline: "OTP, Social & Promo Isolation",
    description:
      "Real-time evaluation identifies one-time passcodes, newsletters, and urgent action items so your primary inbox stays clean and actionable.",
    gradient: "from-blue-500/10 to-blue-500/0 text-blue-400 border-blue-500/20",
    borderHover: "hover:border-blue-500/50",
  },
  {
    icon: MessageSquare,
    title: "Conversation Threading",
    badge: "Unified Timeline",
    tagline: "Deep Context Grouping",
    description:
      "All replies, quotes, and references collapse neatly into structured conversation cards with one-click expansion and quick reply bars.",
    gradient: "from-fuchsia-500/10 to-fuchsia-500/0 text-fuchsia-400 border-fuchsia-500/20",
    borderHover: "hover:border-fuchsia-500/50",
  },
  {
    icon: ShieldCheck,
    title: "Isolated Safe Rendering",
    badge: "Enterprise Grade",
    tagline: "DOMPurify & Bleach Shield",
    description:
      "Incoming emails are rendered in strict sandbox iframes with pixel-tracker blocking and script neutralization to safeguard your privacy.",
    gradient: "from-emerald-500/10 to-emerald-500/0 text-emerald-400 border-emerald-500/20",
    borderHover: "hover:border-emerald-500/50",
  },
  {
    icon: RefreshCw,
    title: "Live Gmail Bi-Directional Sync",
    badge: "OAuth 2.0 SSL",
    tagline: "Always in Perfect Sync",
    description:
      "Drafts, labels, stars, and read statuses sync instantaneously between Zynmail and Google Workspace without data fragmentation.",
    gradient: "from-teal-500/10 to-teal-500/0 text-teal-400 border-teal-500/20",
    borderHover: "hover:border-teal-500/50",
  },
];

export default function FeatureGrid() {
  return (
    <section id="features" className="relative z-10 w-full max-w-6xl mx-auto px-4 mb-28 scroll-mt-28">
      
      {/* Section Header */}
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Core Capabilities</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
          Engineered for extraordinary velocity
        </h2>
        <p className="text-neutral-400 text-sm sm:text-base mt-3 max-w-xl mx-auto leading-relaxed">
          Every tool, workflow node, and AI model is tuned to turn your inbox into a superpower.
        </p>
      </div>

      {/* 6-Grid Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {FEATURES.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <div
              key={idx}
              className={cn(
                "group relative p-6 sm:p-7 rounded-3xl border border-neutral-800/90 bg-black/60 hover:bg-neutral-900/40 backdrop-blur-xl transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xl shadow-black/40",
                feature.borderHover
              )}
            >
              {/* Subtle top background gradient */}
              <div
                className={cn(
                  "absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl opacity-40 blur-2xl rounded-full pointer-events-none transition-opacity group-hover:opacity-75",
                  feature.gradient
                )}
              />

              <div>
                <div className="flex items-center justify-between mb-5">
                  <div
                    className={cn(
                      "h-11 w-11 rounded-2xl flex items-center justify-center border shadow-inner",
                      feature.gradient
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  {feature.badge && (
                    <span className="text-[11px] font-mono font-medium px-2.5 py-0.5 rounded-full bg-white/[0.05] border border-white/10 text-neutral-300">
                      {feature.badge}
                    </span>
                  )}
                </div>

                <p className="text-xs font-semibold text-indigo-400/90 tracking-wide uppercase mb-1">
                  {feature.tagline}
                </p>
                <h3 className="text-lg font-bold text-white mb-2.5 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Bottom Subtle Bar */}
              <div className="mt-6 pt-4 border-t border-white/5 flex items-center text-xs font-medium text-neutral-400 group-hover:text-white transition-colors">
                <span>Learn more</span>
                <span className="ml-1 text-indigo-400">→</span>
              </div>
            </div>
          );
        })}
      </div>

    </section>
  );
}
