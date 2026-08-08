"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Mail, Workflow, Sparkles, Shield, ArrowRight, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300 px-4 sm:px-8 lg:px-16",
        scrolled
          ? "h-16 bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-2xl shadow-black/50"
          : "h-20 bg-transparent border-b border-white/5"
      )}
    >
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/25 transition-transform group-hover:scale-105">
            <div className="h-full w-full bg-black/40 rounded-[10px] flex items-center justify-center backdrop-blur-xs">
              <Mail className="h-4 w-4 text-white" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white font-bold tracking-tight text-xl">Zynmail</span>
            <span className="hidden sm:inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              v2.4 Live
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link
            href="#features"
            className="text-neutral-300 hover:text-white transition-colors duration-200"
          >
            Features
          </Link>
          <Link
            href="#preview"
            className="text-neutral-300 hover:text-white transition-colors duration-200"
          >
            Live Preview
          </Link>
          <Link
            href="#workflow"
            className="text-neutral-300 hover:text-white transition-colors duration-200 flex items-center gap-1.5"
          >
            <Workflow className="h-3.5 w-3.5 text-indigo-400" />
            <span>Automations</span>
          </Link>
          <Link
            href="#security"
            className="text-neutral-300 hover:text-white transition-colors duration-200 flex items-center gap-1.5"
          >
            <Shield className="h-3.5 w-3.5 text-emerald-400" />
            <span>AI Guard</span>
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/signin"
            className="px-4 py-2 text-sm font-medium text-neutral-300 hover:text-white transition-colors rounded-lg hover:bg-white/5"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold transition-all shadow-lg shadow-indigo-500/25 active:scale-95 hover:shadow-indigo-500/40"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Get Started</span>
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-black/95 border-b border-white/10 backdrop-blur-2xl px-6 py-6 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-3 text-sm font-medium">
            <Link
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="text-neutral-300 hover:text-white transition-colors py-2"
            >
              Features
            </Link>
            <Link
              href="#preview"
              onClick={() => setMobileMenuOpen(false)}
              className="text-neutral-300 hover:text-white transition-colors py-2"
            >
              Live Preview
            </Link>
            <Link
              href="#workflow"
              onClick={() => setMobileMenuOpen(false)}
              className="text-neutral-300 hover:text-white transition-colors py-2 flex items-center gap-2"
            >
              <Workflow className="h-4 w-4 text-indigo-400" />
              Automations
            </Link>
            <Link
              href="#security"
              onClick={() => setMobileMenuOpen(false)}
              className="text-neutral-300 hover:text-white transition-colors py-2 flex items-center gap-2"
            >
              <Shield className="h-4 w-4 text-emerald-400" />
              AI Guard & Safety
            </Link>
          </nav>
          
          <div className="pt-4 border-t border-white/10 flex flex-col gap-2.5">
            <Link
              href="/signin"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 text-center text-sm font-medium text-neutral-300 hover:text-white bg-white/5 rounded-xl border border-white/10"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 text-center text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl shadow-lg shadow-indigo-500/25"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
