"use client";

import { MessageSquare, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEmail } from "@/context/EmailContext";
import { cn } from "@/lib/utils";

export default function ChatBox() {
  const { isChatOpen, toggleChat } = useEmail();

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <Button
        onClick={toggleChat}
        className={cn(
          "h-12 px-4 rounded-full shadow-lg transition-all duration-200 flex items-center gap-2 font-medium cursor-pointer",
          isChatOpen
            ? "bg-gray-900 text-white hover:bg-gray-800"
            : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/25 hover:scale-105"
        )}
      >
        {isChatOpen ? (
          <>
            <X className="h-4 w-4" />
            <span className="text-xs">Close AI Panel</span>
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4 text-yellow-300 animate-pulse" />
            <span className="text-xs">Ask Zyn AI</span>
          </>
        )}
      </Button>
    </div>
  );
}
