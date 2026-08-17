"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEmail } from "@/context/EmailContext";
import { authClient } from "@/lib/auth-client";
import { AuthHeroVisual } from "@/components/auth/AuthHeroVisual";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";

export default function SignInPage() {
  const { signIn, isConnected, isLoading: contextLoading } = useEmail();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

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
      setIsGoogleLoading(true);
      setError("");
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/home",
      });
    } catch (err: unknown) {
      setIsGoogleLoading(false);
      const msg = err instanceof Error ? err.message : "Failed to connect to Google.";
      setError(msg);
    }
  };

  return (
    <main className="min-h-screen w-full flex bg-white text-gray-900 antialiased selection:bg-purple-100 selection:text-purple-900">
      {/* Left Panel: Hero 3D Orb Visual */}
      <div className="hidden lg:block lg:w-1/2 h-screen sticky top-0">
        <AuthHeroVisual tagline="Agents that get better over time." />
      </div>

      {/* Right Panel: Sign In Form */}
      <div className="w-full lg:w-1/2 min-h-screen flex flex-col justify-between p-6 sm:p-12 md:p-16 lg:p-20 bg-white">
        {/* Top spacer / Mobile Header */}
        <div className="lg:hidden flex items-center justify-center mb-6">
          <span className="text-xl font-bold tracking-[0.2em] text-gray-900">
            ZYNMAIL
          </span>
        </div>

        {/* Form Container */}
        <div className="my-auto w-full max-w-[420px] mx-auto">
          <h1 className="text-[32px] sm:text-[34px] font-semibold text-gray-950 tracking-tight mb-8">
            Sign in
          </h1>

          {/* Error alert */}
          {error && (
            <div className="mb-6 flex items-start gap-2.5 p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
              <span className="leading-relaxed font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <label
                htmlFor="signin-email"
                className="block text-[11px] font-bold text-gray-500 tracking-wider uppercase"
              >
                EMAIL
              </label>
              <Input
                id="signin-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                placeholder="name@organization.com"
                autoComplete="email"
                autoFocus
                className="h-12 px-3.5 rounded-xl border-gray-200 bg-white text-gray-900 text-[15px] placeholder:text-gray-400 focus-visible:border-purple-600 focus-visible:ring-3 focus-visible:ring-purple-600/15 shadow-none transition-all"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label
                htmlFor="signin-password"
                className="block text-[11px] font-bold text-gray-500 tracking-wider uppercase"
              >
                PASSWORD
              </label>
              <div className="relative">
                <Input
                  id="signin-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="h-12 px-3.5 pr-11 rounded-xl border-gray-200 bg-white text-gray-900 text-[15px] placeholder:text-gray-400 focus-visible:border-purple-600 focus-visible:ring-3 focus-visible:ring-purple-600/15 shadow-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Device & Forgot Password */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none text-gray-700 font-normal">
                <Checkbox
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(!!checked)}
                  className="rounded border-gray-300 data-checked:bg-[#5b21b6] data-checked:border-[#5b21b6]"
                />
                Remember this device
              </label>

              <button
                type="button"
                onClick={() => setError("Password reset instructions sent if email exists.")}
                className="text-[#5b21b6] hover:text-[#4c1d95] font-medium transition-colors cursor-pointer"
              >
                Forgot password?
              </button>
            </div>

            {/* Continue Primary Button */}
            <Button
              type="submit"
              disabled={isSubmitting || isGoogleLoading}
              className="w-full h-12 mt-4 rounded-xl bg-[#5b21b6] hover:bg-[#4c1d95] active:bg-[#3b0764] text-white font-medium text-[15px] shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Signing in...</span>
                </div>
              ) : (
                "Continue"
              )}
            </Button>

            {/* Google OAuth Alternative */}
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading || isSubmitting}
              className="w-full h-12 mt-2 rounded-xl border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium text-[14px] transition-all flex items-center justify-center gap-3 cursor-pointer"
            >
              {isGoogleLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-[#5b21b6]" />
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 24 24">
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
              )}
              Continue with Google
            </Button>
          </form>

          {/* New to Zynmail links */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-center text-xs text-gray-600">
            <span>New to Zynmail? </span>
            <Link
              href="/signup"
              className="text-[#5b21b6] hover:text-[#4c1d95] font-medium transition-colors"
            >
              Talk to sales
            </Link>
            <span className="mx-1 text-gray-400">·</span>
            <Link
              href="/signup"
              className="text-[#5b21b6] hover:text-[#4c1d95] font-medium transition-colors"
            >
              Sign up
            </Link>
          </div>
        </div>

        {/* Bottom Back Link */}
        <div className="text-center pt-8">
          <Link
            href="/"
            className="text-[11px] font-semibold tracking-wider text-gray-400 hover:text-gray-700 uppercase transition-colors"
          >
            · BACK TO ZYNMAIL.AI
          </Link>
        </div>
      </div>
    </main>
  );
}
