"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useEmail } from "@/context/EmailContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  Star,
  Reply,
  Forward,
  Trash2,
  Archive,
  MoreVertical,
  Paperclip,
  AlertOctagon,
  Mail,
  Clock,
  CheckCircle2,
  FolderInput,
  Tag,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Printer,
  ExternalLink,
  Pen,
  MessageSquare,
  CornerDownRight,
  Send,
} from "lucide-react";
import { getInitials, stringToColor, formatFileSize } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import SafeEmailRenderer from "@/components/email/SafeEmailRenderer";
import { api } from "@/lib/api";
import type { Email } from "@/types";

export default function EmailDetail() {
  const {
    selectedEmail,
    setSelectedEmail,
    toggleStar,
    moveToTrash,
    deleteEmail,
    emails,
    setComposeOpen,
    openComposeWithDraft,
    openComposeForReply,
    openComposeForForward,
  } = useEmail();

  const [threadEmails, setThreadEmails] = useState<Email[]>([]);
  const [isThreadLoading, setIsThreadLoading] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [unsubscribeOpen, setUnsubscribeOpen] = useState(false);
  const [unsubscribeEmail, setUnsubscribeEmail] = useState<Email | null>(null);

  // When selectedEmail changes, fetch its full conversation thread
  useEffect(() => {
    if (!selectedEmail) {
      setThreadEmails([]);
      setExpandedIds(new Set());
      return;
    }

    // Immediately show the selected email while loading thread
    setThreadEmails([selectedEmail]);
    setExpandedIds(new Set([selectedEmail.id]));
    setIsThreadLoading(true);

    let isMounted = true;

    api.emails
      .getThread(selectedEmail.id)
      .then((threadRes) => {
        if (!isMounted) return;
        if (threadRes?.emails && threadRes.emails.length > 0) {
          setThreadEmails(threadRes.emails);
          // Expand the newest (last) email by default; if single email, expand it
          const lastEmail = threadRes.emails[threadRes.emails.length - 1];
          setExpandedIds(new Set([lastEmail.id]));
        }
      })
      .catch((err) => {
        console.warn("Failed to load email thread:", err);
      })
      .finally(() => {
        if (isMounted) setIsThreadLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedEmail?.id]);

  if (!selectedEmail) return null;

  const isDraft =
    selectedEmail.folder === "drafts" ||
    selectedEmail.labels?.includes("DRAFT");

  const currentIndex = emails.findIndex((e) => e.id === selectedEmail.id);
  const totalEmails = emails.length;

  const hasNewer = currentIndex > 0;
  const hasOlder = currentIndex >= 0 && currentIndex < emails.length - 1;

  const goNewer = () => {
    if (hasNewer) setSelectedEmail(emails[currentIndex - 1]);
  };

  const goOlder = () => {
    if (hasOlder) setSelectedEmail(emails[currentIndex + 1]);
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        // Only collapse if there are multiple emails
        if (next.size > 1 || threadEmails.length > 1) {
          next.delete(id);
        }
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const allExpanded =
    threadEmails.length > 0 &&
    threadEmails.every((em) => expandedIds.has(em.id));

  const toggleExpandAll = () => {
    if (allExpanded) {
      // Keep only the latest email expanded
      const lastEmail = threadEmails[threadEmails.length - 1];
      setExpandedIds(new Set([lastEmail.id]));
    } else {
      // Expand all
      setExpandedIds(new Set(threadEmails.map((em) => em.id)));
    }
  };

  const latestEmail =
    threadEmails.length > 0
      ? threadEmails[threadEmails.length - 1]
      : selectedEmail;

  const handleAction = (actionName: string) => {
    toast.success(`${actionName} action performed successfully`);
  };

  const IconButton = ({
    icon: Icon,
    onClick,
    tooltip,
    className,
    disabled,
  }: {
    icon: React.ComponentType<{ className?: string }>;
    onClick?: () => void;
    tooltip?: string;
    className?: string;
    disabled?: boolean;
  }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          disabled={disabled}
          className={cn(
            "h-8 w-8 text-muted-foreground hover:bg-muted/70 hover:text-foreground transition-colors",
            className
          )}
          onClick={onClick || (() => handleAction(tooltip || "Action"))}
        >
          <Icon className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      {tooltip && <TooltipContent>{tooltip}</TooltipContent>}
    </Tooltip>
  );

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-transparent">
      {/* Top Toolbar */}
      <div className="flex h-12 items-center justify-between px-3 shrink-0 border-b border-border/40 backdrop-blur-sm bg-background/50">
        <div className="flex items-center gap-1">
          <IconButton
            icon={ArrowLeft}
            onClick={() => setSelectedEmail(null)}
            tooltip="Back to inbox"
          />
          <div className="w-1" />
          {isDraft && (
            <Button
              size="sm"
              variant="default"
              onClick={() => openComposeWithDraft(selectedEmail)}
              className="h-7 gap-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-md mr-1"
            >
              <Pen className="h-3 w-3" />
              Edit Draft
            </Button>
          )}
          <IconButton icon={Archive} tooltip="Archive" />
          <IconButton
            icon={Trash2}
            onClick={() => moveToTrash(selectedEmail.id)}
            tooltip="Delete conversation"
          />
          <div className="w-2 border-r h-4 border-border mx-1" />
          <IconButton icon={Mail} tooltip="Mark as unread" />
          <IconButton icon={Clock} tooltip="Snooze" />
          <IconButton icon={CheckCircle2} tooltip="Add to tasks" />
          <div className="w-2 border-r h-4 border-border mx-1" />
          <IconButton icon={FolderInput} tooltip="Move to" />
          <IconButton icon={Tag} tooltip="Labels" />
          <IconButton icon={MoreVertical} tooltip="More" />
        </div>

        <div className="flex items-center gap-2 pr-2 text-xs text-muted-foreground font-medium">
          {threadEmails.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleExpandAll}
              className="h-7 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1.5 border border-border/50"
            >
              <ChevronsUpDown className="h-3.5 w-3.5" />
              {allExpanded ? "Collapse all" : "Expand all"}
            </Button>
          )}
          <span>
            {currentIndex >= 0 ? `${currentIndex + 1} of ${totalEmails}` : ""}
          </span>
          <div className="flex">
            <IconButton
              icon={ChevronLeft}
              onClick={goNewer}
              disabled={!hasNewer}
            />
            <IconButton
              icon={ChevronRight}
              onClick={goOlder}
              disabled={!hasOlder}
            />
          </div>
        </div>
      </div>

      {/* Main Thread Content */}
      <div className="flex-1 overflow-y-auto min-h-0 px-6 py-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Draft Notice Banner */}
          {isDraft && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-300 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[11px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-900 dark:text-amber-200 uppercase tracking-wider">
                  Draft
                </span>
                <span>This message has not been sent yet.</span>
              </div>
              <Button
                size="sm"
                onClick={() => openComposeWithDraft(selectedEmail)}
                className="bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs h-7 rounded-lg"
              >
                Continue editing
              </Button>
            </div>
          )}

          {/* Thread Header / Subject Row */}
          <div className="flex items-start justify-between pb-2 border-b border-border/40">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl text-foreground font-semibold tracking-tight">
                  {selectedEmail.subject || "(no subject)"}
                </h1>
                <Badge
                  variant="secondary"
                  className="text-[11px] uppercase font-semibold bg-muted/80 text-muted-foreground hover:bg-muted py-0.5 px-2 rounded-md"
                >
                  {isDraft ? "Draft" : "Inbox"}
                </Badge>
                {selectedEmail.ai_category && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[11px] font-medium py-0.5 px-2 rounded-md",
                      selectedEmail.ai_category.toLowerCase() === "verification"
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                        : selectedEmail.ai_category.toLowerCase() === "social"
                        ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30"
                        : selectedEmail.ai_category.toLowerCase() === "promotions"
                        ? "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/30"
                        : selectedEmail.ai_category.toLowerCase() === "needs reply"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                        : selectedEmail.ai_category.toLowerCase() === "vip"
                        ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30"
                        : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30"
                    )}
                  >
                    {selectedEmail.ai_category}
                  </Badge>
                )}
                {threadEmails.length > 1 && (
                  <Badge
                    variant="outline"
                    className="text-[11px] font-medium py-0.5 px-2 rounded-md bg-muted/40 text-muted-foreground border-border flex items-center gap-1"
                  >
                    <MessageSquare className="h-3 w-3" />
                    {threadEmails.length} messages in conversation
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex gap-1 shrink-0 mt-0.5">
              <IconButton icon={Printer} tooltip="Print all" />
              <IconButton icon={ExternalLink} tooltip="In new window" />
            </div>
          </div>

          {/* Conversation Thread Stream */}
          <div className="space-y-3 pt-1">
            {threadEmails.map((msg, index) => {
              const isExpanded = expandedIds.has(msg.id);
              const avatarColor = stringToColor(msg.from_contact?.email || "");
              const emailDate = new Date(msg.timestamp);
              const formattedDate = !isNaN(emailDate.getTime())
                ? emailDate.toLocaleString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : msg.timestamp;
              const timeAgo = !isNaN(emailDate.getTime())
                ? formatDistanceToNow(emailDate, { addSuffix: true })
                : "";

              if (!isExpanded) {
                // Collapsed Message Card Row
                return (
                  <div
                    key={msg.id || index}
                    onClick={() => toggleExpand(msg.id)}
                    className="group flex items-center justify-between px-4 py-2.5 rounded-xl border border-border/60 bg-card/60 hover:bg-card/90 dark:bg-card/40 dark:hover:bg-card/70 backdrop-blur-sm cursor-pointer transition-all duration-150 shadow-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1 pr-4">
                      <Avatar className="h-7 w-7 shrink-0 ring-1 ring-border/50">
                        <AvatarFallback
                          style={{ backgroundColor: avatarColor }}
                          className="text-white text-xs font-semibold"
                        >
                          {getInitials(msg.from_contact?.name || "User")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-semibold text-sm text-foreground shrink-0 max-w-[160px] truncate">
                        {msg.from_contact?.name || msg.from_contact?.email}
                      </span>
                      <span className="text-xs text-muted-foreground truncate flex-1">
                        {msg.snippet || msg.body?.slice(0, 100) || "(no text)"}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 text-xs text-muted-foreground">
                      {msg.has_attachments && (
                        <Paperclip className="h-3.5 w-3.5 text-muted-foreground/70" />
                      )}
                      <span className="font-medium">{timeAgo || formattedDate}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStar(msg.id);
                        }}
                        className="p-1 hover:bg-muted rounded-full transition-colors"
                      >
                        <Star
                          className={cn(
                            "h-4 w-4",
                            msg.is_starred
                              ? "fill-[#f4b400] text-[#f4b400]"
                              : "text-muted-foreground/40 hover:text-muted-foreground"
                          )}
                        />
                      </button>
                      <ChevronDown className="h-4 w-4 text-muted-foreground/60 group-hover:text-foreground transition-transform duration-150" />
                    </div>
                  </div>
                );
              }

              // Expanded Message Card
              return (
                <div
                  key={msg.id || index}
                  className="rounded-xl border border-border/80 bg-card/85 dark:bg-card/65 backdrop-blur-md p-5 shadow-sm space-y-4 transition-all"
                >
                  {/* Message Sender Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3.5">
                      <Avatar className="h-10 w-10 shrink-0 ring-1 ring-border/60">
                        <AvatarFallback
                          style={{ backgroundColor: avatarColor }}
                          className="text-white text-sm font-semibold"
                        >
                          {getInitials(msg.from_contact?.name || "User")}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-foreground">
                            {msg.from_contact?.name || "Unknown"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            &lt;{msg.from_contact?.email}&gt;
                          </span>
                          {msg.unsubscribe_link && (
                            <span
                              onClick={() => {
                                setUnsubscribeEmail(msg);
                                setUnsubscribeOpen(true);
                              }}
                              className="text-xs text-blue-600 dark:text-blue-400 font-medium cursor-pointer hover:underline"
                            >
                              Unsubscribe
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                          <span>
                            to{" "}
                            {msg.to && msg.to.length > 0
                              ? msg.to.map((t) => t.name || t.email).join(", ")
                              : "me"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-muted-foreground mr-1">
                        {formattedDate} {timeAgo ? `(${timeAgo})` : ""}
                      </span>

                      <div className="flex items-center gap-0.5">
                        <IconButton
                          icon={Star}
                          onClick={() => toggleStar(msg.id)}
                          tooltip={msg.is_starred ? "Unstar" : "Star"}
                          className={
                            msg.is_starred
                              ? "text-yellow-400 fill-yellow-400 hover:text-yellow-500"
                              : ""
                          }
                        />
                        <IconButton
                          icon={Reply}
                          onClick={() => openComposeForReply(msg)}
                          tooltip="Reply"
                        />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:bg-muted"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => openComposeForReply(msg)}
                            >
                              <Reply className="h-4 w-4 mr-2" /> Reply
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openComposeForForward(msg)}
                            >
                              <Forward className="h-4 w-4 mr-2" /> Forward
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => moveToTrash(msg.id)}
                              className="text-red-600 focus:bg-red-50 dark:focus:bg-red-950/40"
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Delete message
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        {threadEmails.length > 1 && (
                          <IconButton
                            icon={ChevronUp}
                            onClick={() => toggleExpand(msg.id)}
                            tooltip="Collapse message"
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Message Body */}
                  <div className="pt-2 pb-2 min-h-[80px]">
                    {!msg.body && !msg.body_html ? (
                      <div className="space-y-3 pt-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-4 w-4/6" />
                      </div>
                    ) : (
                      <SafeEmailRenderer
                        htmlContent={msg.body_html}
                        plainText={msg.body}
                      />
                    )}
                  </div>

                  {/* Attachments for this message */}
                  {msg.has_attachments &&
                    msg.attachments &&
                    msg.attachments.length > 0 && (
                      <div className="pt-4 border-t border-border/60">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="font-semibold text-xs text-foreground">
                            {msg.attachments.length} attachment
                            {msg.attachments.length !== 1 ? "s" : ""}
                          </span>
                          <span className="text-muted-foreground text-xs">•</span>
                          <span className="text-muted-foreground text-xs">
                            Scanned by Gmail
                          </span>
                          <AlertOctagon className="h-3 w-3 text-muted-foreground" />
                        </div>
                        <div className="flex flex-wrap gap-3">
                          {msg.attachments.map((att, i) => {
                            const downloadUrl = att.attachment_id
                              ? `/api/emails/${msg.id}/attachments/${att.attachment_id}`
                              : "#";

                            let typeStr = "FILE";
                            let colorClass = "bg-slate-500";
                            if (att.mime_type?.includes("pdf")) {
                              typeStr = "PDF";
                              colorClass = "bg-red-500";
                            } else if (att.mime_type?.includes("image")) {
                              typeStr = "IMG";
                              colorClass = "bg-blue-500";
                            } else if (
                              att.mime_type?.includes("word") ||
                              att.filename?.endsWith(".doc") ||
                              att.filename?.endsWith(".docx")
                            ) {
                              typeStr = "DOC";
                              colorClass = "bg-indigo-500";
                            } else if (
                              att.mime_type?.includes("excel") ||
                              att.filename?.endsWith(".xls") ||
                              att.filename?.endsWith(".xlsx")
                            ) {
                              typeStr = "XLS";
                              colorClass = "bg-green-600";
                            } else if (
                              att.mime_type?.includes("zip") ||
                              att.filename?.endsWith(".zip")
                            ) {
                              typeStr = "ZIP";
                              colorClass = "bg-yellow-600";
                            }

                            return (
                              <a
                                key={i}
                                href={downloadUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="relative flex flex-col w-[180px] border border-border/80 rounded-xl overflow-hidden bg-card hover:shadow-md transition-shadow group"
                                style={{
                                  height: att.mime_type?.includes("pdf")
                                    ? "150px"
                                    : "100px",
                                }}
                              >
                                <div className="flex-1 w-full bg-white relative overflow-hidden flex flex-col items-center justify-start opacity-80 group-hover:opacity-100 transition-opacity">
                                  {att.mime_type?.startsWith("image/") ? (
                                    <img
                                      src={downloadUrl}
                                      alt={att.filename}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : att.mime_type?.includes("pdf") ? (
                                    <div
                                      style={{
                                        position: "absolute",
                                        inset: 2,
                                        bottom: 2,
                                        overflow: "hidden",
                                        background: "white",
                                        pointerEvents: "none",
                                        borderRadius: "8px",
                                        display: "flex",
                                        justifyContent: "center",
                                      }}
                                    >
                                      <iframe
                                        src={`${downloadUrl}#toolbar=0&navpanes=0&scrollbar=0&page=1&zoom=page-fit`}
                                        title="PDF Preview"
                                        scrolling="no"
                                        style={{
                                          border: "none",
                                          width: "816px",
                                          height: "1056px",
                                          transform: "scale(0.22)",
                                          transformOrigin: "top center",
                                          pointerEvents: "none",
                                          flexShrink: 0,
                                        }}
                                      />
                                    </div>
                                  ) : (
                                    <div className="w-full space-y-1.5 p-3">
                                      <div className="w-1/3 h-1.5 bg-slate-200 rounded-full mx-auto mb-2"></div>
                                      <div className="w-full h-1 bg-slate-100 rounded-full"></div>
                                      <div className="w-5/6 h-1 bg-slate-100 rounded-full"></div>
                                      <div className="w-2/3 h-1 bg-slate-100 rounded-full"></div>
                                    </div>
                                  )}
                                </div>

                                <div className="h-9 bg-muted/60 dark:bg-muted border-t border-border/80 flex items-center px-2.5 z-10">
                                  <div className="flex items-center gap-2 w-full">
                                    <div
                                      className={cn(
                                        "w-5 h-5 rounded flex items-center justify-center shrink-0",
                                        colorClass
                                      )}
                                    >
                                      <span className="text-[8.5px] text-white font-bold">
                                        {typeStr}
                                      </span>
                                    </div>
                                    <span className="text-xs font-medium text-foreground truncate">
                                      {att.filename}
                                    </span>
                                  </div>
                                </div>
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}

                  {/* Message Bottom Action Chips */}
                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      onClick={() => openComposeForReply(msg)}
                      variant="outline"
                      size="sm"
                      className="rounded-full h-8 px-3.5 gap-1.5 text-xs font-medium border-border/80 hover:bg-muted"
                    >
                      <Reply className="h-3.5 w-3.5 text-muted-foreground" /> Reply
                    </Button>
                    <Button
                      onClick={() => openComposeForForward(msg)}
                      variant="outline"
                      size="sm"
                      className="rounded-full h-8 px-3.5 gap-1.5 text-xs font-medium border-border/80 hover:bg-muted"
                    >
                      <Forward className="h-3.5 w-3.5 text-muted-foreground" /> Forward
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Reply Box at bottom of Conversation Thread */}
          {threadEmails.length > 0 && !isDraft && (
            <div
              onClick={() => openComposeForReply(latestEmail)}
              className="flex items-center gap-3 p-4 rounded-xl border border-border/70 bg-card/60 hover:bg-card/90 dark:bg-card/40 dark:hover:bg-card/70 backdrop-blur-sm cursor-pointer transition-all duration-150 group shadow-xs mt-4"
            >
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">
                  <Reply className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-xs text-muted-foreground group-hover:text-foreground transition-colors flex items-center justify-between">
                <span>
                  Reply to{" "}
                  <strong className="font-semibold text-foreground">
                    {latestEmail.from_contact?.name ||
                      latestEmail.from_contact?.email}
                  </strong>
                  ...
                </span>
                <span className="text-[11px] px-2 py-1 rounded bg-muted/60 text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  Click to reply
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Unsubscribe Dialog */}
      <Dialog open={unsubscribeOpen} onOpenChange={setUnsubscribeOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Unsubscribe</DialogTitle>
            <DialogDescription className="py-4 text-sm text-muted-foreground">
              Are you sure you want to stop receiving messages from{" "}
              <span className="font-bold text-foreground">
                {unsubscribeEmail?.from_contact?.name ||
                  selectedEmail.from_contact?.name}
              </span>
              ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setUnsubscribeOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => {
                const target = unsubscribeEmail || selectedEmail;
                setUnsubscribeOpen(false);
                toast.success(
                  `Unsubscribed from ${target.from_contact?.name}`
                );
                if (target.unsubscribe_link) {
                  if (target.unsubscribe_link.startsWith("http")) {
                    window.open(target.unsubscribe_link, "_blank");
                  } else {
                    window.location.href = target.unsubscribe_link;
                  }
                }
              }}
            >
              Unsubscribe
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}