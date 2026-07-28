"use client";

import { Calendar, CheckSquare, Lightbulb, User, Plus, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const sidebarItems = [
  { icon: Calendar, label: "Calendar", color: "text-blue-500", bg: "bg-blue-500/10" },
  { icon: Lightbulb, label: "Keep", color: "text-amber-500", bg: "bg-amber-500/10" },
  { icon: CheckSquare, label: "Tasks", color: "text-green-500", bg: "bg-green-500/10" },
  { icon: User, label: "Contacts", color: "text-purple-500", bg: "bg-purple-500/10" },
] as const;

export default function RightSidebar() {
  return (
    <aside className={cn(
      "w-14 min-w-[56px] flex flex-col items-center py-3 gap-2 bg-sidebar border-l border-border/40 shrink-0 transition-colors"
    )}>
      {sidebarItems.map(({ icon: Icon, label, color, bg }) => (
        <Tooltip key={label}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-10 w-10 rounded-full hover:bg-accent transition-colors",
                color,
                "hover:bg-accent"
              )}
              aria-label={label}
            >
              <Icon className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">{label}</TooltipContent>
        </Tooltip>
      ))}

      <div className="w-8 h-px bg-border my-2" />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full text-muted-foreground hover:bg-accent"
            aria-label="Get add-ons"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">Get add-ons</TooltipContent>
      </Tooltip>
    </aside>
  );
}