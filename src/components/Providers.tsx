"use client";

import { ThemeProvider } from "@/context/ThemeContext";
import { EmailProvider } from "@/context/EmailContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <TooltipProvider>
        <EmailProvider>
          <SidebarProvider defaultOpen={true}>{children}</SidebarProvider>
        </EmailProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}