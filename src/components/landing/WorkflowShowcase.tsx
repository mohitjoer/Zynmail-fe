"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Workflow,
  Sparkles,
  Zap,
  Bot,
  Mail,
  ArrowRight,
  CheckCircle2,
  Sliders,
  Send,
  Tag,
  CornerDownRight,
  Layers,
  Cpu,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function WorkflowShowcase() {
  const [activeStep, setActiveStep] = useState<number>(1);

  const steps = [
    {
      id: 0,
      title: "1. Trigger Condition",
      subtitle: "Gmail Ingestion",
      desc: "Monitors real-time incoming messages via Google push notifications or scheduled 30-second polling.",
      icon: Mail,
      color: "blue",
    },
    {
      id: 1,
      title: "2. LangGraph AI Evaluator",
      subtitle: "Llama 3.1 70B Engine",
      desc: "Evaluates message intent, sender authority, sentiment, and contractual terms against natural language criteria.",
      icon: Cpu,
      color: "violet",
    },
    {
      id: 2,
      title: "3. Autonomous Dispatch",
      subtitle: "Draft, Tag & Route",
      desc: "Automatically drafts contextual replies with user signature, routes attachments, and notifies team channels.",
      icon: Zap,
      color: "amber",
    },
  ];

  return (
    <section id="workflow" className="relative z-10 w-full max-w-6xl mx-auto px-4 mb-28 scroll-mt-28">
      
      {/* Section Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-semibold mb-3">
          <Workflow className="w-3.5 h-3.5" />
          <span>Visual Automation Studio</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
          Turn your inbox into an autonomous engine
        </h2>
        <p className="text-neutral-400 text-sm sm:text-base mt-3 max-w-2xl mx-auto leading-relaxed">
          Design multi-node AI workflows with intuitive DAG nodes. No messy code, no fragile regex rules — just describe what you want in plain English.
        </p>
      </div>

      {/* Interactive Studio Preview Card */}
      <div className="relative rounded-3xl border border-neutral-800 bg-black/70 backdrop-blur-2xl p-6 sm:p-8 lg:p-10 shadow-2xl shadow-black/80 overflow-hidden">
        
        {/* Top Glow Accent */}
        <div className="absolute top-0 right-1/4 w-96 h-48 bg-violet-600/15 blur-3xl rounded-full pointer-events-none" />

        {/* Step Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
          {steps.map((step) => {
            const Icon = step.icon;
            const isActive = activeStep === step.id;
            return (
              <button
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                className={cn(
                  "flex items-start gap-3.5 p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer",
                  isActive
                    ? "bg-violet-950/30 border-violet-500/50 shadow-lg shadow-violet-500/10 scale-[1.01]"
                    : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10"
                )}
              >
                <div
                  className={cn(
                    "h-9 w-9 rounded-xl flex items-center justify-center shrink-0 border",
                    isActive
                      ? "bg-violet-600/20 border-violet-500/40 text-violet-400"
                      : "bg-neutral-800 border-neutral-700 text-neutral-400"
                  )}
                >
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className={cn("text-xs font-bold", isActive ? "text-white" : "text-neutral-300")}>
                    {step.title}
                  </p>
                  <p className="text-[11px] text-violet-400/90 font-mono mt-0.5">{step.subtitle}</p>
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed line-clamp-2">
                    {step.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Visual DAG Canvas Simulation */}
        <div className="relative rounded-2xl border border-neutral-800/80 bg-neutral-950/90 p-6 sm:p-8 overflow-hidden min-h-[300px] flex flex-col justify-center">
          
          {/* Grid lines background */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
          />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 max-w-4xl mx-auto w-full">
            
            {/* Node 1: Trigger */}
            <div className="w-full lg:w-64 p-4 rounded-xl border border-blue-500/30 bg-blue-950/20 shadow-lg shadow-blue-500/5">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-6 w-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-white">Trigger: Incoming Email</span>
              </div>
              <p className="text-[11px] text-neutral-400 font-mono bg-black/40 p-2 rounded border border-neutral-800">
                folder: &quot;INBOX&quot;<br />
                has_attachment: true
              </p>
            </div>

            {/* Connection Arrow */}
            <div className="flex items-center text-violet-400">
              <div className="hidden lg:block h-0.5 w-8 bg-gradient-to-r from-blue-500 to-violet-500" />
              <ArrowRight className="w-4 h-4 animate-pulse" />
            </div>

            {/* Node 2: AI Evaluator */}
            <div className="w-full lg:w-72 p-4 rounded-xl border border-violet-500/40 bg-violet-950/30 shadow-lg shadow-violet-500/10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg bg-violet-500/20 text-violet-400 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-white">LangGraph AI Evaluator</span>
                </div>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300">
                  Llama 3.1
                </span>
              </div>
              <p className="text-[11px] text-neutral-300 font-mono bg-black/40 p-2 rounded border border-neutral-800 leading-relaxed">
                &quot;Is the sender requesting legal contract execution or billing adjustments?&quot;
              </p>
            </div>

            {/* Connection Arrow */}
            <div className="flex items-center text-emerald-400">
              <div className="hidden lg:block h-0.5 w-8 bg-gradient-to-r from-violet-500 to-emerald-500" />
              <ArrowRight className="w-4 h-4 animate-pulse" />
            </div>

            {/* Node 3: Action */}
            <div className="w-full lg:w-64 p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 shadow-lg shadow-emerald-500/5 space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-white">Action: Auto-Draft & Tag</span>
              </div>
              <div className="text-[11px] text-neutral-400 font-mono bg-black/40 p-2 rounded border border-neutral-800 space-y-1">
                <p className="text-emerald-400">✓ Apply tag &quot;Needs Reply&quot;</p>
                <p className="text-violet-400">✓ Generate AI Reply Draft</p>
              </div>
            </div>

          </div>

          {/* Bottom Bar in Simulator */}
          <div className="mt-6 pt-4 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Full LangGraph persistence • Real-time dry run simulation supported</span>
            </div>
            <Link
              href="/automations"
              className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs transition-all shadow-md shadow-violet-500/25 flex items-center gap-1.5"
            >
              <span>Launch Workflow Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>

      </div>

    </section>
  );
}
