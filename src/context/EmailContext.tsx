"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import type { Email, FolderCounts, MailFolder } from "@/types";
import { api } from "@/lib/api";
import { useEmailCache } from "@/store/emailCache";
import { authClient } from "@/lib/auth-client";

interface EmailContextType {
  emails: Email[];
  selectedEmail: Email | null;
  activeFolder: MailFolder;
  folderCounts: FolderCounts;
  isLoading: boolean;
  searchQuery: string;
  composeOpen: boolean;
  draftToEdit: Email | null;
  selectedIds: Set<string>;
  setActiveFolder: (folder: MailFolder) => void;
  setSelectedEmail: (emailOrId: Email | string | null) => void;
  setSearchQuery: (query: string) => void;
  setComposeOpen: (open: boolean) => void;
  setDraftToEdit: (draft: Email | null) => void;
  openComposeWithDraft: (draft: Email) => void;
  openComposeForReply: (email: Email) => void;
  openComposeForForward: (email: Email) => void;
  toggleSelectEmail: (id: string) => void;
  selectAllEmails: () => void;
  clearSelection: () => void;
  toggleStar: (id: string) => void;
  markAsRead: (id: string, read: boolean) => Promise<void>;
  moveToTrash: (id: string) => Promise<void>;
  deleteEmail: (id: string) => Promise<void>;
  refreshEmails: () => void;
  isConnected: boolean;
  isGmailConnected: boolean;
  gmailEmail: string | null;
  connectGmail: () => void;
  disconnectGmail: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
  toggleChat: () => void;
  isAutomationsOpen: boolean;
  setIsAutomationsOpen: (open: boolean) => void;
  toggleAutomations: () => void;
}

const EmailContext = createContext<EmailContextType | undefined>(undefined);

export function EmailProvider({ children }: { children: ReactNode }) {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmailState] = useState<Email | null>(null);
  const [activeFolder, setActiveFolderState] = useState<MailFolder>("inbox");
  const [folderCounts, setFolderCounts] = useState<FolderCounts>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [composeOpen, setComposeOpen] = useState(false);
  const [draftToEdit, setDraftToEdit] = useState<Email | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isInitialized, setIsInitialized] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isGmailConnected, setIsGmailConnected] = useState(false);
  const [gmailEmail, setGmailEmail] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAutomationsOpen, setIsAutomationsOpen] = useState(false);

  const openComposeWithDraft = useCallback((draft: Email) => {
    setDraftToEdit(draft);
    setComposeOpen(true);
  }, []);

  const openComposeForReply = useCallback((email: Email) => {
    const replySubject = email.subject?.toLowerCase().startsWith("re:")
      ? email.subject
      : `Re: ${email.subject || ""}`;
    const senderName = email.from_contact?.name || email.from_contact?.email || "Sender";
    const quotedBody = `\n\nOn ${new Date(email.timestamp).toLocaleString()}, ${senderName} <${email.from_contact?.email}> wrote:\n> ${(email.body || "").replace(/\n/g, "\n> ")}`;
    
    setDraftToEdit({
      id: "",
      from_contact: email.from_contact,
      to: [email.from_contact],
      cc: [],
      subject: replySubject,
      body: quotedBody,
      body_html: "",
      snippet: "",
      folder: "drafts",
      labels: ["DRAFT"],
      is_read: true,
      is_starred: false,
      has_attachments: false,
      attachments: [],
      thread_id: email.thread_id || null,
      in_reply_to: email.id,
      timestamp: new Date().toISOString(),
    });
    setComposeOpen(true);
  }, []);

  const openComposeForForward = useCallback((email: Email) => {
    const forwardSubject = email.subject?.toLowerCase().startsWith("fwd:")
      ? email.subject
      : `Fwd: ${email.subject || ""}`;
    const quotedBody = `\n\n---------- Forwarded message ---------\nFrom: ${email.from_contact?.name} <${email.from_contact?.email}>\nDate: ${new Date(email.timestamp).toLocaleString()}\nSubject: ${email.subject}\nTo: ${(email.to || []).map(t => `${t.name || t.email} <${t.email}>`).join(", ")}\n\n${email.body || ""}`;

    setDraftToEdit({
      id: "",
      from_contact: email.from_contact,
      to: [],
      cc: [],
      subject: forwardSubject,
      body: quotedBody,
      body_html: "",
      snippet: "",
      folder: "drafts",
      labels: ["DRAFT"],
      is_read: true,
      is_starred: false,
      has_attachments: false,
      attachments: email.attachments || [],
      thread_id: email.thread_id || null,
      in_reply_to: email.id,
      timestamp: new Date().toISOString(),
    });
    setComposeOpen(true);
  }, []);

  const toggleChat = useCallback(() => {
    setIsChatOpen(prev => !prev);
  }, []);

  const toggleAutomations = useCallback(() => {
    setIsAutomationsOpen(prev => !prev);
  }, []);

  useEffect(() => {
    const validFolders = [
      "inbox", "starred", "snoozed", "sent", "drafts", 
      "purchases", "important", "scheduled", "all_mail", "trash"
    ];

    // Check initial hash on mount
    const initialHash = window.location.hash.replace("#", "");
    const [hFolder, hEmailId] = initialHash.split("/");
    
    if (validFolders.includes(hFolder)) {
      setActiveFolderState(hFolder as MailFolder);
    }
    setIsInitialized(true);

    if (hEmailId) {
      api.emails.get(hEmailId).then(fullEmail => {
        setSelectedEmailState(fullEmail);
      }).catch(err => {
        console.error("Failed to fetch initial email", err);
      });
    }

    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      const [newFolder, newEmailId] = hash.split("/");
      
      if (validFolders.includes(newFolder)) {
        setActiveFolderState(prev => prev === newFolder ? prev : (newFolder as MailFolder));
      }
      
      if (!newEmailId) {
        setSelectedEmailState(null);
      } else {
        api.emails.get(newEmailId).then(fullEmail => {
          setSelectedEmailState(fullEmail);
        }).catch(console.error);
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const fetchEmails = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.emails.list({
        folder: activeFolder === 'inbox' ? 'all_mail' : activeFolder,
        search: searchQuery || undefined,
      });
      setEmails(data.emails);
    } catch (err) {
      console.error("Failed to fetch emails:", err);
      setEmails([]);
    } finally {
      setIsLoading(false);
    }
  }, [activeFolder, searchQuery]);

  const fetchCounts = useCallback(async () => {
    try {
      const counts = await api.emails.counts();
      setFolderCounts(counts);
    } catch (err) {
      console.error("Failed to fetch counts:", err);
    }
  }, []);

  const checkAuthStatus = useCallback(async () => {
    try {
      const session = await authClient.getSession();
      const user = session?.data?.user;
      const isAuth = !!user;
      setIsConnected(isAuth);
      
      try {
        const res = await fetch('/api/auth/status');
        if (res.ok) {
          const data = await res.json();
          setIsGmailConnected(!!data.gmail_connected);
          setGmailEmail(data.gmail_email || user?.email || null);
        } else if (user) {
          setGmailEmail(user.email || null);
        }
      } catch {
        if (user) {
          setGmailEmail(user.email || null);
        }
      }

      if (isAuth) {
        fetchEmails();
        fetchCounts();
      } else {
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Failed to check auth status:", err);
      setIsLoading(false);
    }
  }, [fetchEmails, fetchCounts]);

  useEffect(() => {
    if (isInitialized) {
      checkAuthStatus();
    }
  }, [checkAuthStatus, isInitialized]);

  // Automatically re-fetch emails whenever folder or search query changes
  useEffect(() => {
    if (!isInitialized || !isConnected) return;
    const timer = setTimeout(() => {
      fetchEmails();
    }, searchQuery ? 250 : 0);

    return () => clearTimeout(timer);
  }, [activeFolder, searchQuery, isInitialized, isConnected, fetchEmails]);

  // Background sync every 30 seconds
  useEffect(() => {
    if (!isInitialized) return;
    
    const intervalId = setInterval(async () => {
      try {
        await api.emails.sync();
        fetchEmails();
        fetchCounts();
      } catch (err) {
        console.error("Background sync failed:", err);
      }
    }, 30 * 1000); // 30 seconds

    return () => clearInterval(intervalId);
  }, [isInitialized, fetchEmails, fetchCounts]);

  const setSelectedEmail = useCallback(async (emailOrId: Email | string | null) => {
    if (!emailOrId) {
      setSelectedEmailState(null);
      if (typeof window !== "undefined") {
        const currentHash = window.location.hash.replace("#", "");
        if (currentHash.includes("/")) {
          window.history.pushState(null, "", `#${activeFolder}`);
        }
      }
      return;
    }

    const id = typeof emailOrId === "string" ? emailOrId : emailOrId.id;

    if (typeof window !== "undefined") {
      window.history.pushState(null, "", `#${activeFolder}/${id}`);
    }

    // Check Zustand Cache FIRST
    const cached = useEmailCache.getState().getCachedEmail(id);
    if (cached) {
      setSelectedEmailState(cached);
      return;
    }

    if (typeof emailOrId !== "string") {
      // Set optimistic basic data (no body)
      setSelectedEmailState(emailOrId);
    }
    
    // Fetch full data with body
    try {
      const fullEmail = await api.emails.get(id);
      useEmailCache.getState().setCachedEmail(id, fullEmail);
      setSelectedEmailState(fullEmail);
    } catch (err) {
      console.error("Failed to fetch full email:", err);
    }
  }, [activeFolder]);

  const setActiveFolder = useCallback((folder: MailFolder) => {
    setActiveFolderState(folder);
    setSelectedEmailState(null);
    setSelectedIds(new Set());
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", `#${folder}`);
    }
  }, []);

  const toggleSelectEmail = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAllEmails = useCallback(() => {
    setSelectedIds(new Set(emails.map((e) => e.id)));
  }, [emails]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const toggleStar = useCallback(
    async (id: string) => {
      const email = emails.find((e) => e.id === id);
      if (!email) return;
      const newStarred = !email.is_starred;

      setEmails((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, is_starred: newStarred } : e
        )
      );
      if (selectedEmail?.id === id) {
        setSelectedEmailState({ ...selectedEmail, is_starred: newStarred });
      }

      try {
        await api.emails.update(id, { is_starred: newStarred });
        fetchCounts();
      } catch {
        setEmails((prev) =>
          prev.map((e) =>
            e.id === id ? { ...e, is_starred: !newStarred } : e
          )
        );
      }
    },
    [emails, selectedEmail, fetchCounts]
  );

  const markAsRead = useCallback(
    async (id: string, read: boolean) => {
      setEmails((prev) =>
        prev.map((e) => (e.id === id ? { ...e, is_read: read } : e))
      );
      try {
        await api.emails.update(id, { is_read: read });
        fetchCounts();
      } catch (err) {
        console.error("Failed to mark as read:", err);
      }
    },
    [fetchCounts]
  );

  const deleteEmail = useCallback(
    async (id: string) => {
      setEmails((prev) => prev.filter((e) => e.id !== id));
      if (selectedEmail?.id === id) setSelectedEmail(null);
      try {
        await api.emails.delete(id);
        fetchCounts();
      } catch (err) {
        console.error("Failed to delete email:", err);
      }
    },
    [selectedEmail, setSelectedEmail, fetchCounts]
  );

  const moveToTrash = useCallback(
    async (id: string) => {
      if (activeFolder === "trash") {
        return deleteEmail(id);
      }
      setEmails((prev) => prev.filter((e) => e.id !== id));
      if (selectedEmail?.id === id) setSelectedEmail(null);
      try {
        await api.emails.update(id, { folder: "trash" });
        fetchCounts();
      } catch (err) {
        console.error("Failed to move to trash:", err);
      }
    },
    [activeFolder, deleteEmail, selectedEmail, setSelectedEmail, fetchCounts]
  );

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const res = await authClient.signIn.email({
        email,
        password,
      });
      if (res.error) {
        return { success: false, error: res.error.message || "Invalid email or password." };
      }
      setIsConnected(true);
      await fetchEmails();
      await fetchCounts();
      return { success: true };
    } catch (err: unknown) {
      console.error("Sign in failed:", err);
      const msg = err instanceof Error ? err.message : "Failed to sign in. Please check your credentials.";
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  }, [fetchEmails, fetchCounts]);

  const signUp = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const name = email.split("@")[0] || "User";
      const res = await authClient.signUp.email({
        email,
        password,
        name,
      });
      if (res.error) {
        return { success: false, error: res.error.message || "Failed to create account." };
      }
      setIsConnected(true);
      await fetchEmails();
      await fetchCounts();
      return { success: true };
    } catch (err: unknown) {
      console.error("Sign up failed:", err);
      const msg = err instanceof Error ? err.message : "Failed to create account.";
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  }, [fetchEmails, fetchCounts]);

  const signOut = useCallback(async () => {
    try {
      await authClient.signOut();
      try {
        await api.auth.logout();
      } catch {}
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setIsConnected(false);
      setEmails([]);
      setSelectedEmailState(null);
      setFolderCounts({});
      if (typeof window !== "undefined") {
        window.location.href = "/signin";
      }
    }
  }, []);

  const connectGmail = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/google/url');
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Failed to get Google Auth URL:", err);
      alert("Failed to connect to Gmail. Ensure the backend is running.");
    }
  }, []);

  const disconnectGmail = useCallback(async () => {
    try {
      await api.auth.disconnectGmail();
      setIsGmailConnected(false);
      setGmailEmail(null);
      await checkAuthStatus();
    } catch (err) {
      console.error("Failed to disconnect Gmail:", err);
      throw err;
    }
  }, [checkAuthStatus]);

  const refreshEmails = useCallback(async () => {
    if (!isConnected) {
      connectGmail();
      return;
    }
    try {
      await api.emails.sync();
    } catch (err) {
      console.error("Manual Gmail sync error:", err);
    }
    await fetchEmails();
    await fetchCounts();
  }, [fetchEmails, fetchCounts, isConnected, connectGmail]);

  return (
    <EmailContext.Provider
      value={{
        emails,
        selectedEmail,
        activeFolder,
        folderCounts,
        isLoading,
        searchQuery,
        composeOpen,
        draftToEdit,
        selectedIds,
        setActiveFolder,
        setSelectedEmail,
        setSearchQuery,
        setComposeOpen,
        setDraftToEdit,
        openComposeWithDraft,
        openComposeForReply,
        openComposeForForward,
        toggleSelectEmail,
        selectAllEmails,
        clearSelection,
        toggleStar,
        markAsRead,
        moveToTrash,
        deleteEmail,
        refreshEmails,
        isConnected,
        isGmailConnected,
        gmailEmail,
        connectGmail,
        disconnectGmail,
        checkAuthStatus,
        signIn,
        signUp,
        signOut,
        isChatOpen,
        setIsChatOpen,
        toggleChat,
        isAutomationsOpen,
        setIsAutomationsOpen,
        toggleAutomations,
      }}
    >
      {children}
    </EmailContext.Provider>
  );
}

export function useEmail() {
  const context = useContext(EmailContext);
  if (!context) {
    throw new Error("useEmail must be used within an EmailProvider");
  }
  return context;
}
