"use client";

import React from "react";
import Link from "next/link";
import { Mail, Shield, Sparkles, Heart } from "lucide-react";

export default function LandingFooter() {
  return (
    <footer className="relative z-10 w-full border-t border-white/10 bg-black/60 backdrop-blur-xl text-neutral-400 text-xs">
      <div className="max-w-7xl mx-auto px-6 lg:px-16 py-14">
        
        {/* Main Columns */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          
          {/* Brand Col */}
          <div className="col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <Mail className="h-4 w-4" />
              </div>
              <span className="text-white font-bold text-lg tracking-tight">Zynmail</span>
            </Link>

            <p className="text-neutral-400 text-xs sm:text-sm max-w-sm leading-relaxed">
              Email that thinks before you do. Combining autonomous AI agent workflows with enterprise privacy and instant Gmail sync.
            </p>

            <div className="flex items-center gap-2 text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full w-fit">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>All Systems Operational • OAuth SSL</span>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <p className="text-white font-semibold text-xs uppercase tracking-wider">Product</p>
            <ul className="space-y-2">
              <li>
                <Link href="#features" className="hover:text-white transition-colors">
                  AI Inbox Copilot
                </Link>
              </li>
              <li>
                <Link href="/automations" className="hover:text-white transition-colors">
                  Workflow Studio
                </Link>
              </li>
              <li>
                <Link href="#preview" className="hover:text-white transition-colors">
                  Live Preview
                </Link>
              </li>
              <li>
                <Link href="/settings" className="hover:text-white transition-colors">
                  Gmail Integration
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-3">
            <p className="text-white font-semibold text-xs uppercase tracking-wider">Resources</p>
            <ul className="space-y-2">
              <li>
                <Link href="/home" className="hover:text-white transition-colors">
                  Web Client
                </Link>
              </li>
              <li>
                <Link href="/signin" className="hover:text-white transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-white transition-colors">
                  Create Account
                </Link>
              </li>
              <li>
                <Link href="#security" className="hover:text-white transition-colors">
                  Security Guard
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Trust */}
          <div className="space-y-3">
            <p className="text-white font-semibold text-xs uppercase tracking-wider">Trust & Safety</p>
            <ul className="space-y-2">
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  Privacy Policy
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  Terms of Service
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  Prompt Guard Spec
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  DOMPurify Sandbox
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500">
          <p>© {new Date().getFullYear()} Zynmail Inc. Engineered for intelligent communication.</p>
          <div className="flex items-center gap-6">
            <Link href="/signin" className="hover:text-neutral-300 transition-colors">
              Sign In
            </Link>
            <Link href="/signup" className="hover:text-neutral-300 transition-colors">
              Sign Up
            </Link>
            <Link href="/settings" className="hover:text-neutral-300 transition-colors">
              Settings
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
