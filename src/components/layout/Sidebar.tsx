"use client";

import { useEmail } from "@/context/EmailContext";
import { cn } from "@/lib/utils";
import type { MailFolder } from "@/types";
import {
  Inbox,
  Star,
  Clock,
  Send,
  ShoppingBag,
  ChevronUp,
  Bookmark,
  CalendarClock,
  FileText,
  Mail,
  AlertCircle,
  Trash2,
  Settings,
  Plus,
  Pencil,
  Archive, // Fallback for All Mail
  Mailbox,
  MailSearch,
  ChevronDown
} from "lucide-react";
import { useState } from "react";

export default function Sidebar() {
  const { activeFolder, setActiveFolder, setComposeOpen, folderCounts } = useEmail();
  const [isExpanded, setIsExpanded] = useState(true);

  const mainNavItems = [
    { title: "Inbox", id: "inbox", icon: Inbox, count: folderCounts["inbox_unread"] || folderCounts["inbox"] },
    { title: "Starred", id: "starred", icon: Star, count: folderCounts["starred"] },
    { title: "Snoozed", id: "snoozed", icon: Clock },
    { title: "Sent", id: "sent", icon: Send, count: folderCounts["sent"] },
    { title: "Purchases", id: "purchases", icon: ShoppingBag, count: folderCounts["purchases"] },
  ];

  const expandedNavItems = [
    { title: "Important", id: "important", icon: Bookmark, count: folderCounts["important"] },
    { title: "Scheduled", id: "scheduled", icon: CalendarClock },
    { title: "Drafts", id: "drafts", icon: FileText, count: folderCounts["drafts"] },
    { title: "All Mail", id: "all_mail", icon: Mailbox },
    { title: "Bin", id: "trash", icon: Trash2, count: folderCounts["trash"] },
  ];

  const renderNavItem = (item: any, isNested: boolean = false) => (
    <button
      key={item.id}
      onClick={() => {
        if (!item.isAction) setActiveFolder(item.id as MailFolder);
      }}
      className={cn(
        "w-full flex items-center justify-between py-[7px] rounded-r-full text-[14px] transition-colors",
        isNested ? "pl-12 pr-6" : "px-6",
        activeFolder === item.id 
          ? "bg-white/60 text-[#202124] font-bold shadow-sm"
          : "text-[#202124] hover:bg-white/40"
      )}
    >
      <div className="flex items-center gap-4">
        <item.icon 
          className={cn(
            "h-5 w-5", 
            activeFolder === item.id ? "text-[#202124] fill-current opacity-80" : "text-[#5f6368]"
          )} 
          strokeWidth={activeFolder === item.id ? 2.5 : 2} 
        />
        <span className={activeFolder === item.id ? "font-bold text-[15px]" : "font-normal text-[15px]"}>
          {item.title}
        </span>
      </div>
      {item.count > 0 && (
        <span className={cn("text-xs", activeFolder === item.id ? "font-bold text-[#202124]" : "font-medium text-[#5f6368]")}>
          {item.count}
        </span>
      )}
    </button>
  );

  return (
    <div className="w-[256px] shrink-0 flex flex-col h-full bg-transparent pt-4 pb-4">
      {/* New Email Button */}
      <div className="px-4 mb-4">
        <button
          onClick={() => setComposeOpen(true)}
          className="w-[145px] h-14 bg-white hover:bg-gray-50 text-[#3c4043] rounded-2xl flex items-center gap-4 px-4 shadow-sm border border-gray-200 transition-all ml-1"
        >
          <Pencil className="h-[22px] w-[22px] text-[#5f6368] fill-current" strokeWidth={1.5} />
          <span className="text-[15px] font-medium tracking-wide">Compose</span>
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-0 pr-4 mt-2">
        {mainNavItems.map(item => renderNavItem(item))}

        {/* Toggle Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center gap-4 px-6 py-[7px] rounded-r-full text-[14px] text-[#202124] hover:bg-white/40 transition-colors"
        >
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-[#5f6368]" strokeWidth={2} />
          ) : (
            <ChevronDown className="h-5 w-5 text-[#5f6368]" strokeWidth={2} />
          )}
          <span className="font-normal text-[15px]">{isExpanded ? "Less" : "More"}</span>
        </button>

        {/* Expanded Items */}
        {isExpanded && expandedNavItems.map(item => renderNavItem(item, true))}
      </div>
    </div>
  );
}