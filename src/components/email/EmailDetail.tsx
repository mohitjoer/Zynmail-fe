"use client";

import { useState } from "react";

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
  Printer,
  ExternalLink,
  Smile,
} from "lucide-react";
import { getInitials, stringToColor, formatTimestamp, formatFileSize } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

export default function EmailDetail() {
  const { selectedEmail, setSelectedEmail, toggleStar, moveToTrash, emails, setComposeOpen } = useEmail();
  const [unsubscribeOpen, setUnsubscribeOpen] = useState(false);

  if (!selectedEmail) return null;

  const currentIndex = emails.findIndex(e => e.id === selectedEmail.id);
  const totalEmails = emails.length;
  
  const hasNewer = currentIndex > 0;
  const hasOlder = currentIndex >= 0 && currentIndex < emails.length - 1;

  const goNewer = () => {
    if (hasNewer) setSelectedEmail(emails[currentIndex - 1]);
  };

  const goOlder = () => {
    if (hasOlder) setSelectedEmail(emails[currentIndex + 1]);
  };

  const e = selectedEmail;
  const avatarColor = stringToColor(e.from_contact.email);

  // Parse date for detailed view
  const emailDate = new Date(e.timestamp);
  const formattedDate = emailDate.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  const timeAgo = formatDistanceToNow(emailDate, { addSuffix: true });

  const handleAction = (actionName: string) => {
    toast.success(`${actionName} action performed successfully`);
  };

  const IconButton = ({ icon: Icon, onClick, tooltip, className, disabled }: any) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          disabled={disabled}
          className={cn("h-8 w-8 text-[#5f6368] hover:bg-black/5 dark:hover:bg-white/10", className)} 
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
      {/* Top toolbar */}
      <div className="flex h-12 items-center justify-between px-2 shrink-0">
        <div className="flex items-center gap-1">
          <IconButton icon={ArrowLeft} onClick={() => setSelectedEmail(null)} tooltip="Back to inbox" />
          <div className="w-2" />
          <IconButton icon={Archive} tooltip="Archive" />
          <IconButton icon={Trash2} onClick={() => moveToTrash(e.id)} tooltip="Delete" />
          <div className="w-2 border-r h-5 border-border mx-1" />
          <IconButton icon={Mail} tooltip="Mark as unread" />
          <IconButton icon={Clock} tooltip="Snooze" />
          <IconButton icon={CheckCircle2} tooltip="Add to tasks" />
          <div className="w-2 border-r h-5 border-border mx-1" />
          <IconButton icon={FolderInput} tooltip="Move to" />
          <IconButton icon={Tag} tooltip="Labels" />
          <IconButton icon={MoreVertical} tooltip="More" />
        </div>
        
        <div className="flex items-center gap-2 pr-2 text-xs text-[#5f6368] font-medium">
          <span>{currentIndex >= 0 ? `${currentIndex + 1} of ${totalEmails}` : ""}</span>
          <div className="flex">
            <IconButton icon={ChevronLeft} onClick={goNewer} disabled={!hasNewer} />
            <IconButton icon={ChevronRight} onClick={goOlder} disabled={!hasOlder} />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 px-8 py-4">
        <div className="max-w-full space-y-6">
          
          {/* Subject Row */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl text-[#202124] font-normal">
                {e.subject}
              </h1>
              <Badge variant="secondary" className="text-[10px] uppercase font-medium bg-muted text-muted-foreground dark:text-white hover:bg-muted py-0 h-5 px-1.5 flex items-center gap-1">
                Inbox
                <span className="text-[14px] leading-none mb-[2px] cursor-pointer hover:text-foreground dark:hover:text-gray-300">×</span>
              </Badge>
            </div>
            <div className="flex gap-1 shrink-0 mt-1">
              <IconButton icon={Printer} />
              <IconButton icon={ExternalLink} />
            </div>
          </div>

          {/* Sender Row */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarFallback
                  style={{ backgroundColor: avatarColor }}
                  className="text-white text-base font-medium"
                >
                  {getInitials(e.from_contact.name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex flex-col">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm text-[#202124]">{e.from_contact.name}</span>
                  <span className="text-xs text-[#5f6368]">&lt;{e.from_contact.email}&gt;</span>
                  {e.unsubscribe_link && (
                    <span onClick={() => setUnsubscribeOpen(true)} className="text-xs text-blue-600 dark:text-blue-400 font-medium cursor-pointer hover:underline">Unsubscribe</span>
                  )}
                </div>
                <div className="text-xs text-[#5f6368] mt-0.5 flex items-center gap-1 cursor-pointer w-fit">
                  to me <span className="text-[8px]">▼</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-[#5f6368] mr-2">
                {formattedDate} ({timeAgo})
              </span>
              <div className="flex -mr-2">
                <IconButton 
                  icon={Star} 
                  onClick={() => toggleStar(e.id)} 
                  tooltip={e.is_starred ? "Unstar" : "Star"}
                  className={e.is_starred ? "text-yellow-400 fill-yellow-400 hover:text-yellow-500" : ""}
                />
                <IconButton icon={Reply} onClick={() => setComposeOpen(true)} tooltip="Reply" />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-[#5f6368] hover:bg-black/5 dark:hover:bg-white/10">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setComposeOpen(true)}>Reply</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setComposeOpen(true)}>Forward</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => moveToTrash(e.id)} className="text-red-600 focus:bg-red-50">Delete message</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="pt-2 pb-6 min-h-[200px]">
            <div className="text-sm text-[#202124] leading-relaxed overflow-hidden">
              {!e.body && !e.body_html ? (
                <div className="space-y-3 pt-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : e.body_html ? (
                <iframe 
                  srcDoc={e.body_html} 
                  sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin"
                  className="w-full min-h-[600px] border-none bg-white rounded-md"
                  title="Email content"
                  onLoad={(e) => {
                    const iframe = e.currentTarget;
                    try {
                      if (iframe.contentWindow) {
                        iframe.style.height = iframe.contentWindow.document.documentElement.scrollHeight + 50 + 'px';
                        
                        // Force links to open in new tab and inject basic body margin if missing
                        const style = iframe.contentWindow.document.createElement('style');
                        style.textContent = 'body { margin: 0; padding: 16px; font-family: sans-serif; } a { target: _blank; }';
                        iframe.contentWindow.document.head.appendChild(style);
                      }
                    } catch (err) {
                      console.error("Iframe load error", err);
                    }
                  }}
                />
              ) : (
                <div className="whitespace-pre-wrap">{e.body}</div>
              )}
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex gap-2 pt-2">
            <Button onClick={() => setComposeOpen(true)} variant="outline" className="rounded-full h-9 px-4 gap-2 text-sm font-medium border-border/80">
              <Reply className="h-4 w-4 text-[#5f6368]" /> Reply
            </Button>
            <Button onClick={() => setComposeOpen(true)} variant="outline" className="rounded-full h-9 px-4 gap-2 text-sm font-medium border-border/80">
              <Forward className="h-4 w-4 text-[#5f6368]" /> Forward
            </Button>
          </div>

          {/* Attachments */}
          {e.has_attachments && e.attachments.length > 0 && (
            <div className="pt-6 border-t border-border mt-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="font-bold text-[13px] text-[#202124]">
                  {e.attachments.length} attachment{e.attachments.length !== 1 ? 's' : ''}
                </span>
                <span className="text-[#5f6368] text-xs">•</span>
                <span className="text-[#5f6368] text-[13px]">Scanned by Gmail</span>
                <AlertOctagon className="h-3.5 w-3.5 text-[#5f6368]" />
              </div>
              <div className="flex flex-wrap gap-4">
                {e.attachments.map((att, i) => {
                  const downloadUrl = att.attachment_id ? `/api/emails/${e.id}/attachments/${att.attachment_id}` : '#';
                  
                  // Simple mime to icon logic
                  let typeStr = "FILE";
                  let colorClass = "bg-slate-500";
                  if (att.mime_type.includes('pdf')) { typeStr = "PDF"; colorClass = "bg-red-500"; }
                  else if (att.mime_type.includes('image')) { typeStr = "IMG"; colorClass = "bg-red-500"; }
                  else if (att.mime_type.includes('word') || att.filename.endsWith('.doc') || att.filename.endsWith('.docx')) { typeStr = "DOC"; colorClass = "bg-blue-500"; }
                  else if (att.mime_type.includes('excel') || att.filename.endsWith('.xls') || att.filename.endsWith('.xlsx')) { typeStr = "XLS"; colorClass = "bg-green-600"; }
                  else if (att.mime_type.includes('zip') || att.filename.endsWith('.zip')) { typeStr = "ZIP"; colorClass = "bg-yellow-600"; }

                  return (
                  <a
                    key={i}
                    href={downloadUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="relative flex flex-col w-[190px] border border-border rounded-xl overflow-hidden bg-white hover:shadow-md transition-shadow group"
                    style={{ height: att.mime_type.includes('pdf') ? '160px' : '110px' }}
                  >
                    {/* Thumbnail Area */}
                    <div className="flex-1 w-full bg-white relative overflow-hidden flex flex-col items-center justify-start opacity-70 group-hover:opacity-100 transition-opacity">
                      {att.mime_type.startsWith('image/') ? (
                        <img src={downloadUrl} alt={att.filename} className="w-full h-full object-cover rounded-sm" />
                      ) : att.mime_type.includes('pdf') ? (
                        // Container sized to show full scaled A4 page: 1056 * 0.2328 ≈ 246px
                        <div style={{ position: 'absolute', inset: 2, bottom: 2, overflow: 'hidden', background: 'white', pointerEvents: 'none', borderRadius: '10px', display: 'flex', justifyContent: 'center' }}>
                           <iframe 
                             src={`${downloadUrl}#toolbar=0&navpanes=0&scrollbar=0&page=1&zoom=page-fit`} 
                             title="PDF Preview"
                             scrolling="no"
                             style={{
                               border: 'none',
                               width: '816px',
                               height: '1056px',
                               transform: 'scale(0.2328)',
                               transformOrigin: 'top center',
                               pointerEvents: 'none',
                               flexShrink: 0,
                             }}
                           />
                        </div>
                      ) : (
                        <div className="w-full  space-y-1.5 relative z-0">
                          <div className="w-1/3 h-1.5 bg-slate-200 rounded-full mx-auto mb-3"></div>
                          <div className="w-full h-1 bg-slate-100 rounded-full"></div>
                          <div className="w-5/6 h-1 bg-slate-100 rounded-full"></div>
                          <div className="w-full h-1 bg-slate-100 rounded-full"></div>
                          <div className="w-2/3 h-1 bg-slate-100 rounded-full"></div>
                        </div>
                      )}
                    </div>
                    
                    {/* Bottom Bar */}
                    <div className="h-10 bg-[#f1f3f4] dark:bg-muted border-t border-border flex items-center px-2 z-10">
                      <div className="flex items-center gap-2 w-full">
                        <div className={cn("w-6 h-6 rounded-[3px] flex items-center justify-center shrink-0", colorClass)}>
                          <span className="text-[9px] text-white font-bold">{typeStr}</span>
                        </div>
                        <span className="text-[13px] font-medium text-slate-700 dark:text-slate-300 truncate">{att.filename}</span>
                      </div>
                    </div>
                  </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog open={unsubscribeOpen} onOpenChange={setUnsubscribeOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Unsubscribe</DialogTitle>
            <DialogDescription className="py-4 text-sm text-[#5f6368]">
              Are you sure you want to stop receiving similar messages from <span className="font-bold text-[#202124]">{e.from_contact.name}</span>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setUnsubscribeOpen(false)}>Cancel</Button>
            <Button className="bg-[#0b57d0] hover:bg-[#0842a0] text-white" onClick={() => {
              setUnsubscribeOpen(false);
              toast.success(`Unsubscribed from ${e.from_contact.name}`);
              if (e.unsubscribe_link) {
                if (e.unsubscribe_link.startsWith('http')) {
                  window.open(e.unsubscribe_link, '_blank');
                } else {
                  window.location.href = e.unsubscribe_link;
                }
              }
            }}>Unsubscribe</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}