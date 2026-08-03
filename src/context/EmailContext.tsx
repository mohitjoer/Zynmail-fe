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

interface EmailContextType {
  emails: Email[];
  selectedEmail: Email | null;
  activeFolder: MailFolder;
  folderCounts: FolderCounts;
  isLoading: boolean;
  searchQuery: string;
  composeOpen: boolean;
  selectedIds: Set<string>;
  setActiveFolder: (folder: MailFolder) => void;
  setSelectedEmail: (emailOrId: Email | string | null) => void;
  setSearchQuery: (query: string) => void;
  setComposeOpen: (open: boolean) => void;
  toggleSelectEmail: (id: string) => void;
  selectAllEmails: () => void;
  clearSelection: () => void;
  toggleStar: (id: string) => void;
  markAsRead: (id: string, read: boolean) => Promise<void>;
  moveToTrash: (id: string) => Promise<void>;
  deleteEmail: (id: string) => Promise<void>;
  refreshEmails: () => void;
  isConnected: boolean;
  connectGmail: () => void;
  checkAuthStatus: () => Promise<void>;
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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isInitialized, setIsInitialized] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAutomationsOpen, setIsAutomationsOpen] = useState(false);

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
        folder: activeFolder,
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
      const res = await fetch('http://localhost:8000/api/auth/status');
      const data = await res.json();
      setIsConnected(data.connected);
      if (data.connected) {
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

  // Background sync every 2 minutes
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

  const refreshEmails = useCallback(() => {
    if (!isConnected) return;
    fetchEmails();
    fetchCounts();
  }, [fetchEmails, fetchCounts, isConnected]);

  const connectGmail = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:8000/api/auth/google/url');
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Failed to get Google Auth URL:", err);
      alert("Failed to connect to Gmail. Ensure the backend is running.");
    }
  }, []);

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
        selectedIds,
        setActiveFolder,
        setSelectedEmail,
        setSearchQuery,
        setComposeOpen,
        toggleSelectEmail,
        selectAllEmails,
        clearSelection,
        toggleStar,
        markAsRead,
        moveToTrash,
        deleteEmail,
        refreshEmails,
        isConnected,
        connectGmail,
        checkAuthStatus,
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
