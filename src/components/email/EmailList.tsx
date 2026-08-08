"use client";

import { useMemo } from "react";
import { useEmail } from "@/context/EmailContext";
import EmailRow from "./EmailRow";
import {
  Square,
  CheckSquare,
  MinusSquare,
  RotateCw,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Trash2
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function EmailList() {
  const {
    emails,
    isLoading,
    selectedIds,
    clearSelection,
    toggleSelectEmail,
    selectAllEmails,
    activeFolder,
    folderCounts,
    refreshEmails,
    moveToTrash,
    searchQuery,
    setSearchQuery,
  } = useEmail();

  const threadCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const email of emails) {
      if (email.thread_id) {
        counts.set(email.thread_id, (counts.get(email.thread_id) || 0) + 1);
      }
    }
    return counts;
  }, [emails]);

  const isAllSelected = emails.length > 0 && selectedIds.size === emails.length;
  const isSomeSelected = selectedIds.size > 0 && selectedIds.size < emails.length;

  const handleToggleSelectAll = () => {
    if (isAllSelected || isSomeSelected) {
      clearSelection();
    } else {
      selectAllEmails();
    }
  };

  const handleDeleteSelected = () => {
    Array.from(selectedIds).forEach(id => moveToTrash(id));
    clearSelection();
  };

  return (
    <div className="flex-1 flex flex-col w-full h-full bg-transparent text-foreground">
      {/* Search Query Filter Notice */}
      {searchQuery && (
        <div className="flex items-center justify-between px-4 py-2 bg-blue-50/70 dark:bg-blue-950/30 border-b border-border text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">
              Search results for &ldquo;{searchQuery}&rdquo;
            </span>
            <span>({emails.length} email{emails.length === 1 ? "" : "s"})</span>
          </div>
          <button
            onClick={() => setSearchQuery("")}
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium cursor-pointer"
          >
            Clear search
          </button>
        </div>
      )}

      {/* Top Action Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <div className="flex items-center gap-4">
          <button onClick={handleToggleSelectAll} className="p-2 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground">
            {isAllSelected ? (
              <CheckSquare className="h-[18px] w-[18px] text-blue-600" />
            ) : isSomeSelected ? (
              <MinusSquare className="h-[18px] w-[18px] text-blue-600" />
            ) : (
              <Square className="h-[18px] w-[18px]" />
            )}
          </button>
          <button onClick={refreshEmails} className="p-2 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground" title="Refresh">
            <RotateCw className="h-[18px] w-[18px]" />
          </button>
          {selectedIds.size > 0 && (
            <button onClick={handleDeleteSelected} className="p-2 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground" title="Delete selected">
              <Trash2 className="h-[18px] w-[18px]" />
            </button>
          )}
          <button className="p-2 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground">
            <MoreVertical className="h-[18px] w-[18px]" />
          </button>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
          <span className="px-2">
            {emails.length > 0 ? `1-${emails.length} of ${folderCounts[activeFolder] || folderCounts["inbox"] || emails.length}` : ""}
          </span>
          <button className="p-2 hover:bg-muted rounded-full disabled:opacity-50">
            <ChevronLeft className="h-[18px] w-[18px]" />
          </button>
          <button className="p-2 hover:bg-muted rounded-full disabled:opacity-50">
            <ChevronRight className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>

      {/* Email List */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {isLoading ? (
          <div className="flex flex-col">
            {Array.from({ length: 30 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-[6px] h-10 border-b border-border">
                <Skeleton className="h-[18px] w-[18px] rounded-sm" />
                <Skeleton className="h-[18px] w-[18px] rounded" />
                <Skeleton className="h-4 w-32 rounded-full" />
                <Skeleton className="h-4 flex-1 rounded-full" />
                <Skeleton className="h-4 w-12 rounded-full" />
              </div>
            ))}
          </div>
        ) : emails.length === 0 ? (
          <div className="p-4 text-muted-foreground text-sm text-center mt-10">No emails found.</div>
        ) : (
          emails.map((email) => (
            <EmailRow
              key={email.id}
              email={email}
              threadCount={email.thread_id ? (threadCounts.get(email.thread_id) || 1) : 1}
              isSelected={selectedIds.has(email.id)}
              onSelect={() => toggleSelectEmail(email.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}