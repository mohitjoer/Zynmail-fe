"use client";

import { useEmail } from "@/context/EmailContext";
import { cn } from "@/lib/utils";
import type { Email } from "@/types";
import { Star, Square, CheckSquare, Archive, Trash2, Mail, MailOpen, Clock } from "lucide-react";

export default function EmailRow({
  email,
  threadCount = 1,
  isSelected,
  onSelect,
}: {
  email: Email;
  threadCount?: number;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const { setSelectedEmail, toggleStar, markAsRead, moveToTrash, activeFolder, openComposeWithDraft } = useEmail();

  const isDraft = activeFolder === "drafts" || email.folder === "drafts" || email.labels?.includes("DRAFT");

  const handleClick = () => {
    if (isDraft) {
      openComposeWithDraft(email);
      return;
    }
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
        "group flex items-center px-4 py-[6px] border-b border-border cursor-pointer text-sm w-full transition-colors",
        showUnread
          ? "bg-card font-bold"
          : "bg-background/60 font-medium text-muted-foreground",
        "hover:bg-muted/50 relative"
      )}
    >
      <div className="flex items-center gap-3 mr-4">
        <button
          onClick={(e) => { e.stopPropagation(); onSelect(); }}
          className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-sm text-muted-foreground"
        >
          {isSelected ? (
            <CheckSquare className="h-[18px] w-[18px] text-blue-600" />
          ) : (
            <Square className="h-[18px] w-[18px] text-muted-foreground/50" />
          )}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleStar(email.id);
          }}
          className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-full"
        >
          <Star className={cn("h-[18px] w-[18px]", email.is_starred ? "fill-[#f4b400] text-[#f4b400]" : "text-muted-foreground/40")} />
        </button>
      </div>

      {/* Sender & Thread Count */}
      <div className={cn(
        "w-[175px] shrink-0 truncate pr-4 flex items-center",
        isDraft ? "text-red-600 dark:text-red-400 font-semibold" : (showUnread ? "font-bold text-foreground" : "font-medium text-foreground/80")
      )}>
        {isDraft ? (
          <span className="flex items-center gap-1.5 truncate">
            <span>Draft</span>
            {email.to && email.to.length > 0 && email.to[0].email && (
              <span className="text-muted-foreground font-normal text-xs truncate">
                to {email.to[0].name || email.to[0].email}
              </span>
            )}
          </span>
        ) : (
          <span className="truncate flex items-center">
            <span className="truncate">{email.from_contact?.name || email.from_contact?.email}</span>
            {threadCount > 1 && (
              <span className="text-[12px] text-muted-foreground font-normal ml-1 shrink-0">
                ({threadCount})
              </span>
            )}
          </span>
        )}
      </div>

      {/* Subject and Snippet */}
      <div className="flex-1 min-w-0 flex items-center pr-4">
        <div className="flex items-center w-full text-[14px]">
          {email.ai_category && (
            <span className={cn(
              "w-[86px] h-[22px] inline-flex items-center justify-center text-[11.5px] font-medium rounded whitespace-nowrap mr-3 shrink-0 text-center select-none",
              email.ai_category.toLowerCase() === "verification"  ? "bg-amber-100  dark:bg-amber-900/30 text-amber-800  dark:text-amber-300  border border-amber-200/70  dark:border-amber-700/40" :
              email.ai_category.toLowerCase() === "social"        ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-700/40" :
              email.ai_category.toLowerCase() === "promotions" || email.ai_category.toLowerCase() === "promotion"
                                                                  ? "bg-pink-100   dark:bg-pink-900/30   text-pink-700   dark:text-pink-300   border border-pink-200/70   dark:border-pink-700/40" :
              email.ai_category.toLowerCase() === "needs reply"   ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-700/40" :
              email.ai_category.toLowerCase() === "vip"           ? "bg-purple-100 dark:bg-purple-900/30  text-purple-700 dark:text-purple-300 border border-purple-200/70 dark:border-purple-700/40" :
              "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200/70 dark:border-blue-700/40"
            )}>
              {email.ai_category}
            </span>
          )}
          <span className={cn("truncate shrink", showUnread ? "text-foreground font-bold" : "text-foreground/80 font-medium")}>
            {email.subject || "(no subject)"}
          </span>
          <span className="text-muted-foreground font-normal mx-2 shrink-0">-</span>
          <span className="text-muted-foreground font-normal truncate">
            {email.snippet || "(no text)"}
          </span>
        </div>
      </div>

      {/* Date & Hover Actions */}
      <div className="relative w-[120px] h-full flex items-center justify-end shrink-0 text-xs pr-4">
        {/* Date */}
        <div className={cn(
          "absolute right-4 transition-opacity duration-200 group-hover:opacity-0",
          showUnread ? "font-bold text-foreground" : "font-medium text-muted-foreground"
        )}>
          {timeStr}
        </div>

        {/* Hover Actions */}
        <div className="absolute right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-card dark:bg-card shadow-[-12px_0_10px_var(--card)] pl-2">
          <button className="p-2 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground" title="Archive">
            <Archive className="h-[18px] w-[18px]" />
          </button>
          <button
            className="p-2 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground"
            title="Delete"
            onClick={(e) => {
              e.stopPropagation();
              moveToTrash(email.id);
            }}
          >
            <Trash2 className="h-[18px] w-[18px]" />
          </button>
          <button
            className="p-2 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground"
            title={email.is_read ? "Mark as unread" : "Mark as read"}
            onClick={(e) => {
              e.stopPropagation();
              markAsRead(email.id, !email.is_read);
            }}
          >
            {email.is_read ? <Mail className="h-[18px] w-[18px]" /> : <MailOpen className="h-[18px] w-[18px]" />}
          </button>
          <button className="p-2 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground" title="Snooze">
            <Clock className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>
    </div>
  );
}