"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bot,
  ArrowRight,
  Star,
  CheckCircle2,
  Sparkles,
  Inbox,
  Zap,
  Tag,
  Clock,
  Shield,
  Search,
  ChevronRight,
  Paperclip,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DemoEmail {
  id: string;
  from: string;
  avatar: string;
  subject: string;
  snippet: string;
  time: string;
  tag: string;
  threadCount?: number;
  isStarred?: boolean;
  priorityScore: number;
}

const DEMO_EMAILS: DemoEmail[] = [
  {
    id: "1",
    from: "Elena Rostova",
    avatar: "ER",
    subject: "Strategic Partnership Agreement — Revised Terms & Scope",
    snippet: "I've reviewed the updated licensing clauses. Everything looks aligned except section 4.2 regarding telemetry...",
    time: "2m ago",
    tag: "Needs Reply",
    threadCount: 4,
    isStarred: true,
    priorityScore: 98,
  },
  {
    id: "2",
    from: "Cloudflare Security",
    avatar: "CS",
    subject: "[URGENT] New DNS record propagation confirmation required",
    snippet: "Your verification token expires in 15 minutes. Click to authorize SSL origin certificates...",
    time: "14m ago",
    tag: "Urgent",
    priorityScore: 95,
  },
  {
    id: "3",
    from: "GitHub Auth",
    avatar: "GH",
    subject: "Your single-use login code is 849-204",
    snippet: "Use this one-time code to complete sign in. This code is valid for 10 minutes.",
    time: "32m ago",
    tag: "Verification",
    priorityScore: 82,
  },
  {
    id: "4",
    from: "Marcus Vance",
    avatar: "MV",
    subject: "Q3 Product Architecture & Sprint Plan",
    snippet: "Attaching the final LangGraph state machine designs for team review. Let me know if you want any edits...",
    time: "2h ago",
    tag: "VIP",
    threadCount: 2,
    isStarred: true,
    priorityScore: 89,
  },
  {
    id: "5",
    from: "Stripe Billing",
    avatar: "SB",
    subject: "Invoice #INV-2026-088 for Enterprise Workspace Plan",
    snippet: "Your monthly invoice has been processed. Receipt and tax breakdown attached...",
    time: "5h ago",
    tag: "Receipt",
    priorityScore: 60,
  },
];

export default function InteractiveInboxPreview() {
  const [activeFilter, setActiveFilter] = useState<"all" | "priority" | "threads">("all");
  const [selectedId, setSelectedId] = useState<string>("1");

  const filteredEmails = DEMO_EMAILS.filter((email) => {
    if (activeFilter === "priority") return email.tag === "Needs Reply" || email.tag === "Urgent";
    if (activeFilter === "threads") return (email.threadCount || 0) > 1;
    return true;
  });

  return (
    <section id="preview" className="relative z-10 w-full max-w-5xl mx-auto px-4 mb-28 scroll-mt-28">
      
      {/* Section Title */}
      <div className="text-center mb-10">
        <span className="text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-2 block">
          Experience the Difference
        </span>
        <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
          A living, breathing inbox interface
        </h2>
        <p className="text-neutral-400 text-sm sm:text-base mt-2 max-w-xl mx-auto">
          Intelligent thread clustering, AI briefings, and sandboxed rendering working in perfect harmony.
        </p>
      </div>

      {/* Preview Container */}
      <div className="relative">
        
        {/* Ambient Glow */}
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-xl opacity-75" />

        <div className="relative bg-black/80 border border-neutral-700/80 rounded-2xl overflow-hidden backdrop-blur-2xl shadow-2xl shadow-black/90">
          
          {/* Top Window Chrome */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-500/70 hover:opacity-80 transition-opacity" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/70 hover:opacity-80 transition-opacity" />
                <div className="h-3 w-3 rounded-full bg-green-500/70 hover:opacity-80 transition-opacity" />
              </div>
              <span className="text-xs font-medium text-neutral-400 ml-3 hidden sm:inline">
                Zynmail Studio v2.4
              </span>
            </div>

            {/* Simulated Search bar */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-900/80 border border-neutral-800 text-neutral-400 text-xs w-64 sm:w-80">
              <Search className="w-3.5 h-3.5" />
              <span>Search subjects, senders, AI tags...</span>
              <span className="ml-auto font-mono text-[10px] bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-400">
                ⌘K
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/home"
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <span>Launch Live</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* AI Morning Briefing Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 border-b border-indigo-500/20 bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-transparent">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0 text-indigo-400 shadow-xs">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-indigo-300">Zyn AI Daily Briefing</p>
                  <span className="text-[10px] px-2 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
                    Synthesized 2m ago
                  </span>
                </div>
                <p className="text-xs text-neutral-300 mt-0.5">
                  1 contract needs approval from Elena, 1 DNS emergency from Cloudflare, and 2 threads grouped.
                </p>
              </div>
            </div>
            <Link
              href="/home"
              className="self-start sm:self-center px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/40 border border-indigo-500/40 text-indigo-200 text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3 h-3 text-indigo-400" />
              <span>Review All (3)</span>
            </Link>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-2 px-5 py-2.5 border-b border-white/5 bg-white/[0.01]">
            <button
              onClick={() => setActiveFilter("all")}
              className={cn(
                "px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer",
                activeFilter === "all"
                  ? "bg-white/10 text-white"
                  : "text-neutral-400 hover:text-neutral-200"
              )}
            >
              All Messages ({DEMO_EMAILS.length})
            </button>
            <button
              onClick={() => setActiveFilter("priority")}
              className={cn(
                "px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer",
                activeFilter === "priority"
                  ? "bg-white/10 text-white"
                  : "text-neutral-400 hover:text-neutral-200"
              )}
            >
              Needs Reply & Urgent (2)
            </button>
            <button
              onClick={() => setActiveFilter("threads")}
              className={cn(
                "px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer",
                activeFilter === "threads"
                  ? "bg-white/10 text-white"
                  : "text-neutral-400 hover:text-neutral-200"
              )}
            >
              Conversations (2)
            </button>
          </div>

          {/* Email Rows List */}
          <div className="divide-y divide-white/5">
            {filteredEmails.map((email) => {
              const isSelected = selectedId === email.id;
              return (
                <div
                  key={email.id}
                  onClick={() => setSelectedId(email.id)}
                  className={cn(
                    "flex items-start sm:items-center gap-3.5 px-5 py-3.5 transition-all duration-150 cursor-pointer group",
                    isSelected
                      ? "bg-indigo-950/25 border-l-2 border-l-indigo-500"
                      : "hover:bg-white/[0.03]"
                  )}
                >
                  {/* Sender Avatar */}
                  <div className="h-8.5 w-8.5 rounded-full bg-gradient-to-br from-indigo-500/30 to-violet-500/30 border border-white/10 flex items-center justify-center shrink-0 text-xs font-bold text-white shadow-xs">
                    {email.avatar}
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <span className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {email.from}
                      </span>

                      {email.threadCount && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300 font-mono border border-neutral-700">
                          {email.threadCount} msgs
                        </span>
                      )}

                      {/* Tag Badge */}
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded text-[9.5px] font-bold uppercase tracking-wider",
                          email.tag === "Needs Reply"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : email.tag === "Urgent"
                            ? "bg-red-500/20 text-red-300 border border-red-500/30"
                            : email.tag === "Verification"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : email.tag === "VIP"
                            ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                            : "bg-neutral-800 text-neutral-300 border border-neutral-700"
                        )}
                      >
                        {email.tag}
                      </span>

                      <span className="ml-auto text-[11px] text-neutral-500 shrink-0">
                        {email.time}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <p className="text-xs font-medium text-neutral-200 truncate">
                        {email.subject}
                      </p>
                      <span className="text-neutral-600 hidden sm:inline">—</span>
                      <p className="text-xs text-neutral-400 truncate hidden sm:block">
                        {email.snippet}
                      </p>
                    </div>
                  </div>

                  {/* Hover Quick Actions */}
                  <div className="hidden md:flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link
                      href={`/home`}
                      className="p-1.5 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
                      title="Open Thread"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Preview Info */}
          <div className="px-5 py-3 border-t border-white/10 bg-black/40 flex items-center justify-between text-xs text-neutral-400">
            <div className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Isolated DOMPurify Sandbox Active</span>
            </div>
            <Link
              href="/signup"
              className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
            >
              <span>Connect your inbox to try</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

        </div>
      </div>

    </section>
  );
}
