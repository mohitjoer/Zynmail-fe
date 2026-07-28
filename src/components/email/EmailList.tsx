"use client";

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
  Inbox,
  Tags,
  Users,
  Info,
  Trash2
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function EmailList() {
  const { emails, isLoading, selectedIds, clearSelection, toggleSelectEmail, selectAllEmails, activeFolder, folderCounts, refreshEmails, moveToTrash, isConnected, connectGmail } = useEmail();

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
    <div className="flex-1 flex flex-col w-full h-full bg-transparent text-[#202124]">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <button onClick={handleToggleSelectAll} className="p-2 hover:bg-black/5 rounded-full text-[#444746]">
            {isAllSelected ? (
              <CheckSquare className="h-[18px] w-[18px] text-[#0b57d0]" />
            ) : isSomeSelected ? (
              <MinusSquare className="h-[18px] w-[18px] text-[#0b57d0]" />
            ) : (
              <Square className="h-[18px] w-[18px]" />
            )}
          </button>
          <button onClick={refreshEmails} className="p-2 hover:bg-black/5 rounded-full text-[#444746]" title="Refresh">
            <RotateCw className="h-[18px] w-[18px]" />
          </button>
          {selectedIds.size > 0 && (
            <button onClick={handleDeleteSelected} className="p-2 hover:bg-black/5 rounded-full text-[#444746]" title="Delete selected">
              <Trash2 className="h-[18px] w-[18px]" />
            </button>
          )}
          <button className="p-2 hover:bg-black/5 rounded-full text-[#444746]">
            <MoreVertical className="h-[18px] w-[18px]" />
          </button>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#5f6368] font-medium">
          <span className="px-2">
            {emails.length > 0 ? `1-${emails.length} of ${folderCounts[activeFolder] || folderCounts["inbox"] || emails.length}` : ""}
          </span>
          <button className="p-2 hover:bg-black/5 rounded-full disabled:opacity-50">
            <ChevronLeft className="h-[18px] w-[18px]" />
          </button>
          <button className="p-2 hover:bg-black/5 rounded-full disabled:opacity-50">
            <ChevronRight className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      {activeFolder === 'inbox' && (
        <div className="flex items-center px-4 border-b border-gray-100">
          <button className="flex items-center gap-4 px-4 py-3 border-b-2 border-[#0b57d0] text-[#0b57d0] min-w-[200px]">
            <Inbox className="h-5 w-5" />
            <span className="text-sm font-semibold tracking-wide">Primary</span>
          </button>
          <button className="flex items-center gap-4 px-4 py-3 border-b-2 border-transparent hover:bg-black/5 text-[#444746] min-w-[200px] transition-colors">
            <Tags className="h-5 w-5" />
            <span className="text-sm font-medium tracking-wide">Promotions</span>
          </button>
          <button className="flex items-center gap-4 px-4 py-3 border-b-2 border-transparent hover:bg-black/5 text-[#444746] min-w-[200px] transition-colors">
            <Users className="h-5 w-5" />
            <span className="text-sm font-medium tracking-wide">Social</span>
          </button>
          <button className="flex items-center gap-4 px-4 py-3 border-b-2 border-transparent hover:bg-black/5 text-[#444746] min-w-[200px] transition-colors">
            <Info className="h-5 w-5" />
            <span className="text-sm font-medium tracking-wide">Updates</span>
          </button>
        </div>
      )}

      {/* Email List */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {isLoading ? (
          <div className="flex flex-col">
            {Array.from({ length: 30 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-[6px] h-10 border-b border-gray-100">
                <Skeleton className="h-[18px] w-[18px] rounded-sm bg-gray-200/60" />
                <Skeleton className="h-[18px] w-[18px] rounded bg-gray-200/60" />
                <Skeleton className="h-4 w-32 bg-gray-200/60 rounded-full" />
                <Skeleton className="h-4 flex-1 bg-gray-200/60 rounded-full" />
                <Skeleton className="h-4 w-12 bg-gray-200/60 rounded-full" />
              </div>
            ))}
          </div>
        ) : emails.length === 0 ? (
          <div className="p-4 text-gray-500 text-sm text-center mt-10">No emails found.</div>
        ) : (
          emails.map((email) => (
            <EmailRow
              key={email.id}
              email={email}
              isSelected={selectedIds.has(email.id)}
              onSelect={() => toggleSelectEmail(email.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}