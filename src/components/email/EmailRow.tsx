"use client";

import { useEmail } from "@/context/EmailContext";
import { cn } from "@/lib/utils";
import type { Email } from "@/types";
import { Star, Square, CheckSquare, Archive, Trash2, Mail, MailOpen, Clock } from "lucide-react";

export default function EmailRow({ email, isSelected, onSelect }: { email: Email, isSelected: boolean, onSelect: () => void }) {
  const { setSelectedEmail, selectedEmail, toggleStar, markAsRead, moveToTrash } = useEmail();

  const handleClick = () => {
    if (!email.is_read) {
      markAsRead(email.id, true);
    }
    setSelectedEmail(email);
  };

  // Format time
  const emailDate = new Date(email.timestamp);
  let timeStr = "";
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - emailDate.getTime()) / (1000 * 3600 * 24));
  if (diffDays === 0) {
    timeStr = emailDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (diffDays === 1) {
    timeStr = "Yesterday";
  } else {
    timeStr = emailDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }

  const showUnread = !email.is_read;

  return (
    <div
      onClick={handleClick}
      className={cn(
        "group flex items-center px-4 py-[6px] border-b border-gray-100 cursor-pointer text-sm w-full",
        showUnread ? "bg-white font-bold" : "bg-[#f2f6fc] font-medium text-[#5f6368]",
        "hover:shadow-[inset_1px_0_0_#dadce0,inset_-1px_0_0_#dadce0,0_1px_2px_0_rgba(60,64,67,.3),0_1px_3px_1px_rgba(60,64,67,.15)] z-10 hover:z-20 relative"
      )}
    >
      <div className="flex items-center gap-3 mr-4">
        <button 
          onClick={(e) => { e.stopPropagation(); onSelect(); }}
          className="p-1.5 hover:bg-black/5 rounded-sm text-[#444746]"
        >
          {isSelected ? (
            <CheckSquare className="h-[18px] w-[18px] text-[#0b57d0]" />
          ) : (
            <Square className="h-[18px] w-[18px] text-[#444746]/50" />
          )}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleStar(email.id);
          }}
          className="p-1 hover:bg-black/5 rounded-full text-[#444746]"
        >
          <Star className={cn("h-[18px] w-[18px]", email.is_starred ? "fill-[#f4b400] text-[#f4b400]" : "text-[#444746]/50")} />
        </button>
      </div>

      {/* Sender - Fixed width */}
      <div className={cn(
        "w-[168px] shrink-0 truncate pr-4 text-[#202124]",
        showUnread ? "font-bold text-[#202124]" : "font-medium text-[#202124]"
      )}>
        {email.from_contact.name}
      </div>

      {/* Subject and Snippet - Flexible width */}
      <div className="flex-1 min-w-0 flex items-center pr-4">
        <div className="flex items-center w-full text-[14px]">
          {email.ai_category && (
            <span className={cn(
              "w-[86px] h-[22px] inline-flex items-center justify-center text-[11.5px] font-medium rounded whitespace-nowrap mr-3 shrink-0 text-center select-none",
              email.ai_category.toLowerCase() === "verification" ? "bg-[#fef3c7] text-[#92400e] border border-amber-200/70" :
              email.ai_category.toLowerCase() === "social" ? "bg-[#e0e7ff] text-[#4338ca] border border-indigo-200/70" :
              email.ai_category.toLowerCase() === "promotions" || email.ai_category.toLowerCase() === "promotion" ? "bg-[#fce7f3] text-[#9d174d] border border-pink-200/70" :
              email.ai_category.toLowerCase() === "needs reply" ? "bg-[#e8faee] text-[#1b8b4a] border border-emerald-200/70" :
              email.ai_category.toLowerCase() === "vip" ? "bg-[#eae2fa] text-[#693db8] border border-purple-200/70" :
              email.ai_category.toLowerCase() === "linear" ? "bg-[#fae9e1] text-[#c7542d] border border-orange-200/70" :
              "bg-[#def3fc] text-[#195687] border border-blue-200/70" // Default
            )}>
              {email.ai_category}
            </span>
          )}
          <span className={cn("truncate shrink", showUnread ? "text-[#202124] font-bold" : "text-[#202124] font-medium")}>
            {email.subject || "(no subject)"}
          </span>
          <span className="text-[#5f6368] font-normal mx-2 shrink-0">-</span>
          <span className="text-[#5f6368] font-normal truncate">
            {email.snippet}
          </span>
        </div>
      </div>

      {/* Date & Hover Actions */}
      <div className="relative w-[120px] h-full flex items-center justify-end shrink-0 text-xs pr-4">
        {/* Date (hidden on hover) */}
        <div className={cn(
          "absolute right-4 transition-opacity duration-200 group-hover:opacity-0",
          showUnread ? "font-bold text-[#202124]" : "font-medium text-[#5f6368]"
        )}>
          {timeStr}
        </div>

        {/* Hover Actions (visible on hover) */}
        <div className="absolute right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white shadow-[-12px_0_10px_white] pl-2">
          <button className="p-2 hover:bg-black/5 rounded-full text-[#444746]" title="Archive">
            <Archive className="h-[18px] w-[18px]" />
          </button>
          <button 
            className="p-2 hover:bg-black/5 rounded-full text-[#444746]" 
            title="Delete"
            onClick={(e) => {
              e.stopPropagation();
              moveToTrash(email.id);
            }}
          >
            <Trash2 className="h-[18px] w-[18px]" />
          </button>
          <button 
            className="p-2 hover:bg-black/5 rounded-full text-[#444746]" 
            title={email.is_read ? "Mark as unread" : "Mark as read"}
            onClick={(e) => {
              e.stopPropagation();
              markAsRead(email.id, !email.is_read);
            }}
          >
            {email.is_read ? <Mail className="h-[18px] w-[18px]" /> : <MailOpen className="h-[18px] w-[18px]" />}
          </button>
          <button className="p-2 hover:bg-black/5 rounded-full text-[#444746]" title="Snooze">
            <Clock className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>
    </div>
  );
}