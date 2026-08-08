"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useEmail } from "@/context/EmailContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  X,
  Minus,
  Maximize2,
  Minimize2,
  Paperclip,
  Link,
  Smile,
  Trash2,
  ChevronDown,
  Type,
  Triangle,
  Image as ImageIcon,
  Lock,
  Pen,
  MoreVertical,
  AlertCircle,
} from "lucide-react";
import { api } from "@/lib/api";

// Simple, permissive email check — good enough for client-side gating,
// real validation still happens server-side.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseRecipients(value: string) {
  return value
    .split(/[,;]/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function toRecipientObjects(rawList: string[]) {
  return rawList.map((email) => ({
    name: email.split("@")[0],
    email,
  }));
}

export default function ComposeModal() {
  const {
    composeOpen,
    setComposeOpen,
    draftToEdit,
    setDraftToEdit,
    refreshEmails,
    deleteEmail,
  } = useEmail();

  const [to, setTo] = useState("");
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const [isSending, setIsSending] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const toInputRef = useRef<HTMLInputElement>(null);

  // Initialize or populate with draft data when opened
  useEffect(() => {
    if (composeOpen) {
      setError(null);
      setTouched(false);

      if (draftToEdit) {
        setTo(draftToEdit.to?.map((t) => t.email || t.name).join(", ") || "");
        setCc(draftToEdit.cc?.map((c) => c.email || c.name).join(", ") || "");
        setShowCc(Boolean(draftToEdit.cc && draftToEdit.cc.length > 0));
        setSubject(draftToEdit.subject || "");
        setBody(draftToEdit.body || "");
      }

      const id = requestAnimationFrame(() => toInputRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
  }, [composeOpen, draftToEdit]);

  if (!composeOpen) return null;

  const recipients = parseRecipients(to);
  const invalidRecipients = recipients.filter((r) => !EMAIL_REGEX.test(r));
  const hasValidRecipient = recipients.length > 0 && invalidRecipients.length === 0;

  const resetForm = () => {
    setTo("");
    setCc("");
    setBcc("");
    setShowCc(false);
    setShowBcc(false);
    setSubject("");
    setBody("");
    setError(null);
    setTouched(false);
    setDraftToEdit(null);
  };

  const handleClose = async () => {
    // If there is meaningful draft content, save/update as draft before closing
    const hasContent = to.trim() || subject.trim() || body.trim();
    if (hasContent) {
      try {
        setIsSavingDraft(true);
        if (draftToEdit?.id) {
          await api.emails.update(draftToEdit.id, {
            to: toRecipientObjects(recipients),
            cc: toRecipientObjects(parseRecipients(cc)),
            bcc: toRecipientObjects(parseRecipients(bcc)),
            subject: subject.trim() || "(no subject)",
            body,
            folder: "drafts",
            labels: ["DRAFT"],
          });
        } else {
          await api.emails.create({
            to: toRecipientObjects(recipients),
            cc: toRecipientObjects(parseRecipients(cc)),
            bcc: toRecipientObjects(parseRecipients(bcc)),
            subject: subject.trim() || "(no subject)",
            body,
            body_html: "",
            is_draft: true,
            thread_id: draftToEdit?.thread_id || null,
            in_reply_to: draftToEdit?.in_reply_to || null,
          });
        }
        refreshEmails();
      } catch (err) {
        console.error("Failed to auto-save draft:", err);
      } finally {
        setIsSavingDraft(false);
      }
    }

    resetForm();
    setComposeOpen(false);
    setIsFullscreen(false);
    setIsMinimized(false);
  };

  const handleDiscard = async () => {
    if (draftToEdit?.id) {
      try {
        await deleteEmail(draftToEdit.id);
        refreshEmails();
      } catch (err) {
        console.error("Failed to discard draft:", err);
      }
    }
    resetForm();
    setComposeOpen(false);
    setIsFullscreen(false);
    setIsMinimized(false);
  };

  const handleSend = async () => {
    setTouched(true);

    if (recipients.length === 0) {
      setError("Add at least one recipient.");
      return;
    }
    if (invalidRecipients.length > 0) {
      setError(`Check the recipient address: ${invalidRecipients[0]}`);
      return;
    }
    if (!subject.trim() && !body.trim()) {
      setError("Add a subject or message before sending.");
      return;
    }

    setError(null);
    setIsSending(true);
    try {
      await api.emails.create({
        to: toRecipientObjects(recipients),
        cc: toRecipientObjects(parseRecipients(cc)),
        bcc: toRecipientObjects(parseRecipients(bcc)),
        subject: subject.trim(),
        body,
        body_html: "",
        is_draft: false,
        thread_id: draftToEdit?.thread_id || null,
        in_reply_to: draftToEdit?.in_reply_to || null,
      });

      // If we were editing a draft, delete the old draft record
      if (draftToEdit?.id) {
        try {
          await api.emails.delete(draftToEdit.id);
        } catch {
          // Non-blocking if already sent
        }
      }

      resetForm();
      setComposeOpen(false);
      refreshEmails();
    } catch (err) {
      console.error("Failed to send email:", err);
      setError("Couldn't send your message. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      handleClose();
      return;
    }
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
    setIsMinimized(false);
  };

  const toggleMinimize = () => {
    setIsMinimized((prev) => !prev);
    setIsFullscreen(false);
  };

  const showInlineError = touched && error;

  return (
    <div
      className="fixed bottom-0 right-6 z-50 animate-in slide-in-from-bottom-4 duration-300"
      role="dialog"
      aria-label={draftToEdit ? "Edit draft" : "New message"}
      onKeyDown={handleKeyDown}
    >
      <div
        className={cn(
          "rounded-t-xl border border-border bg-white dark:bg-card shadow-2xl shadow-black/20 dark:shadow-black/50 flex flex-col overflow-hidden transition-all duration-300",
          isFullscreen && "w-full max-w-3xl h-[calc(100vh-4rem)] right-0",
          isMinimized && "w-[280px]",
          !isFullscreen && !isMinimized && "w-[500px] rounded-t-xl"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#f2f6fc] dark:bg-muted border-b border-transparent shrink-0">
          <div className="flex items-center gap-2 truncate">
            <span className="text-[14px] font-medium text-slate-800 dark:text-slate-200 truncate">
              {draftToEdit ? (subject.trim() || "Edit Draft") : (subject.trim() || "New Message")}
            </span>
            {isSavingDraft && (
              <span className="text-[11px] text-muted-foreground animate-pulse">
                Saving…
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700"
              onClick={toggleMinimize}
              aria-label={isMinimized ? "Restore" : "Minimize"}
            >
              <Minus className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? "Exit full screen" : "Full screen"}
            >
              {isFullscreen ? (
                <Minimize2 className="h-3.5 w-3.5" />
              ) : (
                <Maximize2 className="h-3.5 w-3.5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700"
              onClick={handleClose}
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Fields */}
            <div className="flex flex-col bg-white dark:bg-card shrink-0">
              <div className="flex items-center border-b border-slate-100 dark:border-border px-4 py-1 relative">
                <label htmlFor="compose-to" className="text-sm text-slate-600 dark:text-slate-400 min-w-[40px] pt-0.5">
                  To
                </label>
                <input
                  ref={toInputRef}
                  type="text"
                  value={to}
                  onChange={(e) => {
                    setTo(e.target.value);
                    if (error) setError(null);
                  }}
                  onBlur={() => setTouched(true)}
                  className="flex-1 border-0 shadow-none focus-visible:ring-0 focus:outline-none h-8 text-sm px-2 bg-transparent rounded-none font-sans"
                  id="compose-to"
                  placeholder="Recipients"
                  aria-invalid={touched && !hasValidRecipient}
                  autoComplete="off"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-600 dark:text-slate-400 flex gap-2 bg-white dark:bg-card pl-2">
                  <button
                    type="button"
                    className={cn(
                      "cursor-pointer opacity-90 hover:opacity-100",
                      showCc && "text-[#0b57d0] opacity-100"
                    )}
                    onClick={() => setShowCc((v) => !v)}
                  >
                    Cc
                  </button>
                  <button
                    type="button"
                    className={cn(
                      "cursor-pointer opacity-90 hover:opacity-100",
                      showBcc && "text-[#0b57d0] opacity-100"
                    )}
                    onClick={() => setShowBcc((v) => !v)}
                  >
                    Bcc
                  </button>
                </div>
              </div>

              {showCc && (
                <div className="flex items-center border-b border-slate-100 dark:border-border px-4 py-1">
                  <label htmlFor="compose-cc" className="text-sm text-slate-600 dark:text-slate-400 min-w-[40px] pt-0.5">
                    Cc
                  </label>
                  <input
                    type="text"
                    value={cc}
                    onChange={(e) => setCc(e.target.value)}
                    className="flex-1 border-0 shadow-none focus-visible:ring-0 focus:outline-none h-8 text-sm px-2 bg-transparent rounded-none font-sans"
                    id="compose-cc"
                    autoComplete="off"
                  />
                </div>
              )}

              {showBcc && (
                <div className="flex items-center border-b border-slate-100 dark:border-border px-4 py-1">
                  <label htmlFor="compose-bcc" className="text-sm text-slate-600 dark:text-slate-400 min-w-[40px] pt-0.5">
                    Bcc
                  </label>
                  <input
                    type="text"
                    value={bcc}
                    onChange={(e) => setBcc(e.target.value)}
                    className="flex-1 border-0 shadow-none focus-visible:ring-0 focus:outline-none h-8 text-sm px-2 bg-transparent rounded-none font-sans"
                    id="compose-bcc"
                    autoComplete="off"
                  />
                </div>
              )}

              <div className="flex items-center border-b border-slate-100 dark:border-border px-4 py-1">
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="flex-1 border-0 shadow-none focus-visible:ring-0 focus:outline-none h-8 text-sm px-0 bg-transparent rounded-none placeholder:text-slate-500 font-sans"
                  placeholder="Subject"
                  id="compose-subject"
                  autoComplete="off"
                />
              </div>
            </div>

            {/* Body */}
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className={cn(
                "flex-1 min-h-[300px] px-4 py-3 text-sm leading-relaxed resize-none bg-white dark:bg-card focus:outline-none placeholder:text-muted-foreground/50 text-foreground font-sans",
                isFullscreen && "min-h-[calc(100%-200px)]"
              )}
              id="compose-body"
              placeholder="Write your message..."
            />

            {/* Inline error */}
            {showInlineError && (
              <div className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 shrink-0">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-card shrink-0">
              <div className="flex items-center gap-2">
                {/* Send Button Group */}
                <div className="flex rounded-full overflow-hidden bg-[#0b57d0] hover:bg-[#0842a0] shadow-sm transition-colors text-white mr-2 h-9">
                  <button
                    className="px-5 text-sm font-medium h-full flex items-center justify-center border-r border-[#ffffff40] disabled:opacity-60 disabled:cursor-not-allowed"
                    onClick={handleSend}
                    disabled={isSending}
                    id="send-btn"
                  >
                    {isSending ? "Sending…" : "Send"}
                  </button>
                  <button
                    className="px-2 h-full flex items-center justify-center"
                    aria-label="Send options"
                    disabled={isSending}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>

                {/* Toolbar Icons */}
                <div className="flex items-center text-slate-600 dark:text-slate-400 gap-0.5 ml-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full" aria-label="Formatting options">
                    <Type className="h-[18px] w-[18px]" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full" aria-label="Attach files">
                    <Paperclip className="h-[18px] w-[18px]" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full" aria-label="Insert link">
                    <Link className="h-[18px] w-[18px]" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full" aria-label="Insert emoji">
                    <Smile className="h-[18px] w-[18px]" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full" aria-label="Insert file using Drive">
                    <Triangle className="h-[18px] w-[18px]" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full" aria-label="Insert photo">
                    <ImageIcon className="h-[18px] w-[18px]" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full" aria-label="Toggle confidential mode">
                    <Lock className="h-[18px] w-[18px]" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full" aria-label="Insert signature">
                    <Pen className="h-[18px] w-[18px]" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full" aria-label="More options">
                    <MoreVertical className="h-[18px] w-[18px]" />
                  </Button>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
                onClick={handleDiscard}
                title="Discard draft"
                aria-label="Discard draft"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}