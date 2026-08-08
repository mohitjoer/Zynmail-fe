"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useEmail } from "@/context/EmailContext";
import { Mail, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

export default function SignInPage() {
  const { signIn, isConnected, isLoading: contextLoading } = useEmail();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!contextLoading && isConnected) {
      router.push("/home");
    }
  }, [contextLoading, isConnected, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setIsSubmitting(true);
    const result = await signIn(email.trim(), password);
    setIsSubmitting(false);

    if (result.success) {
      router.push("/home");
    } else {
      setError(result.error || "Invalid email or password.");
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const res = await fetch("/api/auth/google/url");
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError("Failed to connect to Google. Please try again.");
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center bg-[#0a0a0a]"
      style={{
        backgroundImage: "url('/background.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark overlay with blur */}
      <div className="absolute inset-0 bg-black/65 backdrop-blur-md" />

      {/* Ambient floating orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute rounded-full bg-blue-600/15 blur-[120px] animate-pulse"
          style={{ top: "10%", left: "15%", width: "35vw", height: "35vw" }}
        />
        <div
          className="absolute rounded-full bg-purple-600/12 blur-[120px] animate-pulse"
          style={{
            bottom: "5%",
            right: "10%",
            width: "40vw",
            height: "40vw",
            animationDelay: "3s",
          }}
        />
        <div
          className="absolute rounded-full bg-indigo-500/10 blur-[100px] animate-pulse"
          style={{
            top: "50%",
            left: "55%",
            width: "25vw",
            height: "25vw",
            animationDelay: "1.5s",
          }}
        />
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-[440px] mx-4">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="h-11 w-11 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-white/10">
            <Mail className="h-6 w-6 text-[#1a1a2e]" />
          </div>
          <span className="text-[26px] font-bold text-white tracking-tight">
            Zynmail
          </span>
        </div>

        {/* Glass card */}
        <div className="bg-white/[0.06] backdrop-blur-xl rounded-2xl border border-white/[0.08] shadow-2xl shadow-black/40 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-white mb-2">
              Welcome back
            </h1>
            <p className="text-[15px] text-gray-400">
              Sign in to your Zynmail account
            </p>
          </div>

          {/* Error display */}
          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center animate-in fade-in slide-in-from-top-2 duration-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email field */}
            <div>
              <label
                htmlFor="signin-email"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Email
              </label>
              <input
                id="signin-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                placeholder="you@example.com"
                autoComplete="email"
                autoFocus
                className="w-full h-12 px-4 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white placeholder:text-gray-500 text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
              />
            </div>

            {/* Password field */}
            <div>
              <label
                htmlFor="signin-password"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="signin-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full h-12 px-4 pr-12 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white placeholder:text-gray-500 text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-[18px] w-[18px]" />
                  ) : (
                    <Eye className="h-[18px] w-[18px]" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 mt-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold text-[15px] transition-all duration-300 shadow-lg shadow-blue-600/25 hover:shadow-blue-500/40 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-[18px] w-[18px] animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="h-[18px] w-[18px]" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-white/[0.08]" />
            <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">
              or
            </span>
            <div className="flex-1 h-px bg-white/[0.08]" />
          </div>

          {/* Google Sign-In */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full h-12 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-white font-medium text-[14px] transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>

          {/* Sign up link */}
          <p className="mt-6 text-center text-[14px] text-gray-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              Create one
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-gray-600">
          Email that thinks before you do.
        </p>
      </div>
    </div>
  );
}
