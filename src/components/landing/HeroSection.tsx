"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ArrowUpIcon,
  Sparkles,
  Zap,
  Bot,
  Inbox as InboxIcon,
  PenLine,
  Filter,
  Clock,
  Star,
  Paperclip,
  ShieldCheck,
  Cpu,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AutoResizeProps {
  minHeight: number;
  maxHeight?: number;
}

function useAutoResizeTextarea({ minHeight, maxHeight }: AutoResizeProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      if (reset) {
        textarea.style.height = `${minHeight}px`;
        return;
      }

      textarea.style.height = `${minHeight}px`;
      const newHeight = Math.max(
        minHeight,
        Math.min(textarea.scrollHeight, maxHeight ?? Infinity)
      );
      textarea.style.height = `${newHeight}px`;
    },
    [minHeight, maxHeight]
  );

  useEffect(() => {
    if (textareaRef.current) textareaRef.current.style.height = `${minHeight}px`;
  }, [minHeight]);

  return { textareaRef, adjustHeight };
}

interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  prompt?: string;
  onClick: (prompt: string) => void;
}

function QuickAction({ icon, label, prompt, onClick }: QuickActionProps) {
  return (
    <Button
      variant="outline"
      onClick={() => onClick(prompt || label)}
      className="flex items-center gap-2 rounded-full border-neutral-700/70 bg-black/60 text-neutral-300 hover:text-white hover:bg-neutral-800/80 backdrop-blur-md px-3.5 py-1.5 text-xs font-medium cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
    >
      {icon}
      <span>{label}</span>
    </Button>
  );
}

export default function HeroSection() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 52,
    maxHeight: 160,
  });

  const handleSend = () => {
    if (!message.trim()) return;
    router.push(`/home?q=${encodeURIComponent(message.trim())}`);
  };

  const handleQuickAction = (promptText: string) => {
    setMessage(promptText);
    adjustHeight();
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <section className="relative z-10 w-full flex flex-col items-center pt-28 sm:pt-36 pb-16 px-4 max-w-6xl mx-auto">
      
      {/* Top Pill Announcement */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/15 backdrop-blur-md mb-8 animate-in fade-in-50 duration-700 hover:border-indigo-500/40 transition-colors">
        <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-xs font-medium text-neutral-200">Introducing Zyn AI 3.1 & LangGraph Visual Studio</span>
        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
      </div>

      {/* Main Headline */}
      <div className="text-center max-w-4xl mb-10">
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white drop-shadow-sm leading-[1.08] mb-6">
          Email that{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400">
            thinks
          </span>
          {" "}before you do.
        </h1>
        <p className="text-base sm:text-lg lg:text-xl text-neutral-300 max-w-2xl mx-auto leading-relaxed drop-shadow font-normal">
          Zynmail combines intelligent inbox triage, autonomous multi-step automations, and AI drafting into a blazing-fast mail client.
        </p>
      </div>

      {/* ── Ruixen Moon AI Prompt Box ── */}
      <div className="w-full max-w-3xl mb-8">
        <div className="relative bg-black/70 backdrop-blur-2xl rounded-2xl border border-neutral-700/80 shadow-2xl shadow-black/90 overflow-hidden transition-all duration-300 focus-within:border-indigo-500/80 focus-within:ring-2 focus-within:ring-indigo-500/20">
          {/* Top ambient glow line */}
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/80 to-transparent" />

          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              adjustHeight();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask Zyn anything — summarize my inbox, draft a reply, extract action items, or build a workflow..."
            className={cn(
              "w-full px-5 py-4 resize-none border-none bg-transparent",
              "text-white text-sm sm:text-base leading-relaxed font-sans",
              "focus:outline-none focus:ring-0",
              "placeholder:text-neutral-400 min-h-[56px]"
            )}
            style={{ overflow: "hidden" }}
          />

          {/* Footer Bar */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/10 bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleQuickAction("Summarize all urgent unread emails")}
                className="h-8 w-8 text-neutral-400 hover:text-white hover:bg-neutral-800/80 rounded-lg cursor-pointer"
                title="Example Prompt"
              >
                <Paperclip className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                <span className="hidden sm:inline">Engineered with</span>
                <span className="font-medium text-neutral-200">Zyn AI Copilot</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSend}
                disabled={!message.trim()}
                className={cn(
                  "flex items-center justify-center h-8.5 w-8.5 rounded-xl transition-all duration-200",
                  message.trim()
                    ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/40 cursor-pointer scale-100"
                    : "bg-neutral-800/80 text-neutral-500 cursor-not-allowed"
                )}
                aria-label="Send query"
              >
                <ArrowUpIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Action Prompt Pills */}
        <div className="flex items-center justify-center flex-wrap gap-2 mt-5">
          <QuickAction
            icon={<InboxIcon className="w-3.5 h-3.5 text-indigo-400" />}
            label="Summarize Inbox"
            prompt="Summarize my inbox for today"
            onClick={handleQuickAction}
          />
          <QuickAction
            icon={<PenLine className="w-3.5 h-3.5 text-purple-400" />}
            label="Draft Reply"
            prompt="Help me draft a professional reply to the latest email"
            onClick={handleQuickAction}
          />
          <QuickAction
            icon={<Filter className="w-3.5 h-3.5 text-blue-400" />}
            label="Filter Promotions"
            prompt="Show me non-promotional high priority messages"
            onClick={handleQuickAction}
          />
          <QuickAction
            icon={<Zap className="w-3.5 h-3.5 text-amber-400" />}
            label="Smart Automations"
            prompt="Create an automation to forward receipts to accounting"
            onClick={handleQuickAction}
          />
          <QuickAction
            icon={<Star className="w-3.5 h-3.5 text-yellow-400" />}
            label="VIP Contacts"
            prompt="List all emails from VIP senders"
            onClick={handleQuickAction}
          />
          <QuickAction
            icon={<Clock className="w-3.5 h-3.5 text-emerald-400" />}
            label="Daily Briefing"
            prompt="Give me a 3-bullet morning briefing of pending tasks"
            onClick={handleQuickAction}
          />
          <QuickAction
            icon={<Bot className="w-3.5 h-3.5 text-pink-400" />}
            label="Ask Zyn AI"
            prompt="What are the most urgent action items across my emails?"
            onClick={handleQuickAction}
          />
        </div>
      </div>

      {/* Trust & Performance Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 pt-4 text-center border-t border-white/10 w-full max-w-3xl">
        <div className="space-y-1">
          <p className="text-xl font-bold text-white tracking-tight">Zero-Latency</p>
          <p className="text-xs text-neutral-400">Sub-second sync & search</p>
        </div>
        <div className="space-y-1">
          <p className="text-xl font-bold text-indigo-400 tracking-tight">LangGraph</p>
          <p className="text-xs text-neutral-400">Autonomous DAG engine</p>
        </div>
        <div className="space-y-1">
          <p className="text-xl font-bold text-emerald-400 tracking-tight">AI Guard</p>
          <p className="text-xs text-neutral-400">Prompt injection shielded</p>
        </div>
        <div className="space-y-1">
          <p className="text-xl font-bold text-purple-400 tracking-tight">100% Native</p>
          <p className="text-xs text-neutral-400">Bi-directional Gmail sync</p>
        </div>
      </div>

    </section>
  );
}
