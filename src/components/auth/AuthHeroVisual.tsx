"use client";

import React from "react";

interface AuthHeroVisualProps {
  tagline?: string;
}

export function AuthHeroVisual({
  tagline = "Agents that get better over time.",
}: AuthHeroVisualProps) {
  return (
    <div className="relative hidden lg:flex flex-col items-center justify-between h-full w-full p-12 overflow-hidden bg-gradient-to-br from-[#8050d0] via-[#9965e6] to-[#6035b8]">
      {/* Soft ethereal ambient lighting effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-pink-400/25 blur-[120px]" />
        <div className="absolute top-1/2 -right-20 w-[450px] h-[450px] rounded-full bg-cyan-400/20 blur-[140px]" />
        <div className="absolute -bottom-20 left-1/3 w-80 h-80 rounded-full bg-purple-900/30 blur-[100px]" />
      </div>

      {/* Top Brand Title */}
      <div className="relative z-10 flex flex-col items-center mt-6 text-center select-none">
        <h1 className="text-3xl font-extrabold text-white tracking-[0.25em] drop-shadow-sm font-sans">
          ZYNMAIL
        </h1>
      </div>

      {/* Center Hero Space */}
      <div className="relative z-10 my-auto flex flex-col items-center justify-center text-center max-w-[360px] px-4">
        <div className="w-24 h-1 rounded-full bg-white/25 mb-8 backdrop-blur-sm" />
        <p className="text-white/95 text-2xl font-light tracking-tight leading-relaxed font-sans">
          Intelligent inbox workflows tailored for modern productivity.
        </p>
      </div>

      {/* Bottom Tagline */}
      <div className="relative z-10 mb-4 text-center">
        <p className="text-white/90 text-[15px] font-normal tracking-wide drop-shadow-sm font-sans">
          {tagline}
        </p>
      </div>
    </div>
  );
}
