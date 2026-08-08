"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useEmail } from "@/context/EmailContext";

export default function OnboardingPage() {
  const { isConnected, isLoading } = useEmail();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isConnected) {
        router.push("/home");
      } else {
        router.push("/signin");
      }
    }
  }, [isLoading, isConnected, router]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0a0a]">
      <div className="animate-pulse text-white/40 text-sm">Redirecting...</div>
    </div>
  );
}
