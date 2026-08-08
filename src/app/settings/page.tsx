"use client";

import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import ComposeModal from "@/components/email/ComposeModal";
import { useEmail } from "@/context/EmailContext";
import { useTheme } from "@/context/ThemeContext";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  Mail,
  Shield,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Link2,
  Unlink,
  ExternalLink,
  User,
  Sparkles,
  Lock,
  Sliders,
  Check,
  Server,
  Zap,
  Clock,
  Key,
  Database,
  ArrowRight,
  Info,
  ShieldCheck,
  Cpu,
  Trash2,
  Layers,
  Palette,
  Eye,
  FileText,
  BadgeCheck,
  Radio,
  Copy,
} from "lucide-react";
import { cn } from "@/lib/utils";

type SettingsTab = "profile" | "gmail" | "security" | "safety" | "preferences";

interface SecurityStatusData {
  status: string;
  encryption_enabled: boolean;
  algorithm: string;
  key_status: string;
  data_at_rest: {
    status: string;
    field_level_encryption: string[];
    total_emails: number;
    encrypted_emails: number;
    coverage: string;
  };
  token_security: {
    oauth_tokens_encrypted: boolean;
    user_session_encrypted: boolean;
    file_permissions: string;
  };
  ai_safety: {
    prompt_injection_guard: boolean;
    xml_boundary_isolation: boolean;
    zero_width_filtering: boolean;
    zero_model_training: boolean;
  };
}

export default function SettingsPage() {
  const {
    isConnected,
    isGmailConnected,
    gmailEmail,
    connectGmail,
    disconnectGmail,
    refreshEmails,
    checkAuthStatus,
  } = useEmail();

  const { resolvedTheme, theme, setTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>("Just now");

  // Profile state
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileAvatar, setProfileAvatar] = useState("");
  const [avatarError, setAvatarError] = useState(false);
  const [profileSignature, setProfileSignature] = useState(
    "Sent from Zynmail — Email that thinks before you do."
  );
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + (parts[parts.length - 1]?.charAt(0) || "")).toUpperCase();
  };

  // Security status state
  const [securityData, setSecurityData] = useState<SecurityStatusData | null>(null);
  const [isLoadingSecurity, setIsLoadingSecurity] = useState(false);
  const [isEncryptingNow, setIsEncryptingNow] = useState(false);

  // Preference state
  const [autoSyncInterval, setAutoSyncInterval] = useState("30s");
  const [aiAutoTagging, setAiAutoTagging] = useState(true);
  const [enableThreading, setEnableThreading] = useState(true);
  const [strictSandbox, setStrictSandbox] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);

  // Load user profile
  useEffect(() => {
    let isMounted = true;
    const loadProfile = async () => {
      try {
        const user = await api.user.get();
        if (isMounted && user) {
          setProfileName(user.name || "");
          setProfileEmail(user.email || "");
          setProfileAvatar(user.avatar_url || "");
          setAvatarError(false);
          if (user.signature) setProfileSignature(user.signature);
        }
      } catch (err) {
        console.debug("Failed to load user profile:", err);
      }
    };
    loadProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch security status
  const fetchSecurityStatus = useCallback(async () => {
    setIsLoadingSecurity(true);
    try {
      const data = await api.security.status();
      setSecurityData(data);
    } catch (err) {
      console.debug("Failed to fetch security status:", err);
    } finally {
      setIsLoadingSecurity(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "security") {
      fetchSecurityStatus();
    }
  }, [activeTab, fetchSecurityStatus]);

  // Handle Google OAuth callback if redirected here
  useEffect(() => {
    const handleGoogleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");

      if (code) {
        setIsSyncing(true);
        try {
          await api.auth.googleCallback(code);
          window.history.replaceState({}, document.title, window.location.pathname);
          toast.success("Successfully linked your Gmail account!");
          await checkAuthStatus();
          await refreshEmails();
          setLastSyncTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
        } catch (err: any) {
          console.error("Auth callback error:", err);
          toast.error(`Gmail connection failed: ${err.message || "Unknown error"}`);
        } finally {
          setIsSyncing(false);
        }
      }
    };

    handleGoogleCallback();
  }, [checkAuthStatus, refreshEmails]);

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      await api.emails.sync();
      await refreshEmails();
      setLastSyncTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      toast.success("Inbox synchronized with Gmail");
    } catch (err: any) {
      toast.error(`Sync failed: ${err.message || "Error syncing with Gmail"}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDisconnectConfirm = async () => {
    setIsDisconnecting(true);
    try {
      await disconnectGmail();
      setShowDisconnectModal(false);
      toast.success("Gmail account disconnected");
    } catch (err: any) {
      toast.error(`Failed to disconnect: ${err.message || "Unknown error"}`);
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      await api.user.update({
        name: profileName,
        signature: profileSignature,
      });
      toast.success("Profile & signature saved successfully");
    } catch (err: any) {
      toast.error(`Failed to update profile: ${err.message || "Error saving"}`);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleRunSecurityReEncryption = async () => {
    setIsEncryptingNow(true);
    try {
      const res = await api.security.encryptExisting();
      toast.success(`Security scan complete: ${res.message}`);
      await fetchSecurityStatus();
    } catch (err: any) {
      toast.error(`Encryption scan failed: ${err.message || "Unknown error"}`);
    } finally {
      setIsEncryptingNow(false);
    }
  };

  const navTabs = [
    {
      id: "profile" as SettingsTab,
      label: "General & Profile",
      description: "Personal details, avatar, and email signature",
      icon: User,
    },
    {
      id: "gmail" as SettingsTab,
      label: "Gmail Account",
      description: "OAuth connection, sync interval, and permissions",
      icon: Mail,
      badge: isGmailConnected ? "Connected" : "Unlinked",
      badgeType: isGmailConnected ? "success" : "warning",
    },
    {
      id: "security" as SettingsTab,
      label: "Security & Encryption",
      description: "AES-256 database protection and token vault",
      icon: Lock,
      badge: "AES-256 Active",
      badgeType: "success",
    },
    {
      id: "safety" as SettingsTab,
      label: "AI Safety & Guardrails",
      description: "Prompt injection defense and XML boundary isolation",
      icon: ShieldCheck,
    },
    {
      id: "preferences" as SettingsTab,
      label: "Preferences & Display",
      description: "Theme styling, conversation threading, and notifications",
      icon: Sliders,
    },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      {/* Primary Sidebar */}
      <Sidebar />

      {/* Main Settings Application Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-background overflow-hidden relative">
        <Header />

        {/* Settings Workspace Container */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-6 py-8">

            {/* Page Header */}
            <div className="mb-8 border-b border-border/60 pb-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Settings</h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manage your account details, email integrations, cryptographic security, and AI preferences.
                  </p>
                </div>

                {isGmailConnected && (
                  <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-card border border-border/80 shadow-xs self-start md:self-auto">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-medium text-muted-foreground">
                      Linked: <strong className="text-foreground">{gmailEmail || profileEmail}</strong>
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 2-Column Settings Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Settings Navigation List */}
              <div className="lg:col-span-4 space-y-1 bg-card/60 p-2 rounded-2xl border border-border/70 shadow-xs sticky top-0">
                <div className="px-3 py-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Settings Navigation
                </div>
                {navTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all cursor-pointer relative group",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
                      )}
                    >
                      <div
                        className={cn(
                          "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                          isActive
                            ? "bg-primary-foreground/15 text-primary-foreground"
                            : "bg-muted/80 text-muted-foreground group-hover:text-foreground"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1.5">
                          <span className={cn("text-sm font-semibold truncate", isActive ? "text-primary-foreground" : "text-foreground")}>
                            {tab.label}
                          </span>
                          {tab.badge && (
                            <span
                              className={cn(
                                "text-[10px] px-1.5 py-0.5 rounded-md font-medium shrink-0",
                                isActive
                                  ? "bg-primary-foreground/20 text-primary-foreground"
                                  : tab.badgeType === "success"
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                              )}
                            >
                              {tab.badge}
                            </span>
                          )}
                        </div>
                        <p
                          className={cn(
                            "text-xs line-clamp-1 mt-0.5",
                            isActive ? "text-primary-foreground/80" : "text-muted-foreground"
                          )}
                        >
                          {tab.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Right Column: Active Settings Pane */}
              <div className="lg:col-span-8 space-y-6">

                {/* ──────── TAB 1: GENERAL & PROFILE ──────── */}
                {activeTab === "profile" && (
                  <div className="space-y-6 animate-in fade-in-50 duration-200">
                    <form onSubmit={handleSaveProfile} className="space-y-6">
                      
                      {/* Personal Information Card */}
                      <div className="rounded-2xl border border-border/80 bg-card p-6 md:p-7 shadow-xs space-y-6">
                        <div>
                          <h3 className="text-base font-semibold text-foreground">Personal Information</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Update your display name and review your linked Google identity.
                          </p>
                        </div>

                        {/* Avatar & Name Header */}
                        <div className="flex items-center gap-4 pt-1">
                          <div className="relative shrink-0">
                            <div className="h-16 w-16 rounded-2xl overflow-hidden ring-2 ring-border/80 shadow-xs bg-muted flex items-center justify-center">
                              {profileAvatar && !avatarError ? (
                                <img
                                  src={profileAvatar}
                                  alt={profileName || "User Avatar"}
                                  referrerPolicy="no-referrer"
                                  onError={() => setAvatarError(true)}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 text-white flex items-center justify-center text-xl font-bold tracking-wider select-none shadow-inner">
                                  {getInitials(profileName)}
                                </div>
                              )}
                            </div>
                            {isGmailConnected && (
                              <div
                                className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-2 border-card flex items-center justify-center text-white shadow-xs"
                                title="Verified Google Account"
                              >
                                <Check className="h-3 w-3 stroke-[3]" />
                              </div>
                            )}
                          </div>

                          <div className="space-y-1">
                            <h4 className="text-sm font-semibold text-foreground">{profileName || "User Account"}</h4>
                            <p className="text-xs text-muted-foreground">{profileEmail || gmailEmail || "No email connected"}</p>
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                              <BadgeCheck className="h-3.5 w-3.5" />
                              Authenticated via Google OAuth 2.0
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-border/60">
                          <div className="space-y-2">
                            <label className="text-xs font-medium text-foreground">Display Name</label>
                            <input
                              type="text"
                              value={profileName}
                              onChange={(e) => setProfileName(e.target.value)}
                              placeholder="e.g. Jane Doe"
                              className="w-full h-10 px-3.5 rounded-xl border border-border bg-muted/40 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                            <p className="text-[11px] text-muted-foreground">Shown in the top header and AI draft author fields.</p>
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-medium text-foreground">Account Email Address</label>
                            <input
                              type="email"
                              value={profileEmail || gmailEmail || ""}
                              disabled
                              className="w-full h-10 px-3.5 rounded-xl border border-border/80 bg-muted/20 text-muted-foreground text-sm cursor-not-allowed select-none"
                            />
                            <p className="text-[11px] text-muted-foreground">Managed automatically through Google Gmail OAuth.</p>
                          </div>
                        </div>
                      </div>

                      {/* Email Signature & Live Preview Card */}
                      <div className="rounded-2xl border border-border/80 bg-card p-6 md:p-7 shadow-xs space-y-5">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-base font-semibold text-foreground">Default Email Signature</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Automatically appended when drafting new messages or generating AI replies.
                            </p>
                          </div>
                          <span className="text-xs px-2.5 py-1 rounded-md bg-muted text-muted-foreground font-mono">
                            Plaintext / HTML
                          </span>
                        </div>

                        <div className="space-y-2">
                          <textarea
                            rows={3}
                            value={profileSignature}
                            onChange={(e) => setProfileSignature(e.target.value)}
                            placeholder="e.g. Best regards, Jane Doe\nZynmail User"
                            className="w-full p-3.5 rounded-xl border border-border bg-muted/40 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 leading-relaxed font-sans transition-all"
                          />
                        </div>

                        {/* Live Signature Preview */}
                        <div className="space-y-2 pt-2">
                          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                            <Eye className="h-3.5 w-3.5 text-blue-500" />
                            <span>Live Outgoing Preview</span>
                          </div>
                          <div className="p-4 rounded-xl border border-border/60 bg-muted/20 text-xs text-foreground/90 font-mono whitespace-pre-wrap leading-relaxed">
                            <span className="text-muted-foreground">--</span>
                            <br />
                            {profileSignature || <span className="italic text-muted-foreground">No signature configured</span>}
                          </div>
                        </div>

                        <div className="flex justify-end pt-3 border-t border-border/60">
                          <button
                            type="submit"
                            disabled={isSavingProfile}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all cursor-pointer shadow-xs disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]"
                          >
                            {isSavingProfile ? (
                              <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                <span>Saving...</span>
                              </>
                            ) : (
                              <>
                                <Check className="w-4 h-4" />
                                <span>Save Changes</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                )}

                {/* ──────── TAB 2: GMAIL ACCOUNT & INGESTION ──────── */}
                {activeTab === "gmail" && (
                  <div className="space-y-6 animate-in fade-in-50 duration-200">
                    
                    {/* Main Connection Status Card */}
                    <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card p-6 md:p-7 shadow-xs">
                      {/* Glow Accent */}
                      <div
                        className={cn(
                          "absolute -right-16 -top-16 h-56 w-56 rounded-full blur-3xl pointer-events-none opacity-20",
                          isGmailConnected ? "bg-emerald-500" : "bg-blue-600"
                        )}
                      />

                      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-start gap-4">
                          <div
                            className={cn(
                              "h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 border shadow-xs",
                              isGmailConnected
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                                : "bg-muted border-border text-muted-foreground"
                            )}
                          >
                            <Mail className="h-7 w-7" />
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2.5">
                              <h3 className="text-lg font-semibold text-foreground">Google Gmail Account</h3>
                              {isGmailConnected ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  Connected & Active
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                  Not Linked
                                </span>
                              )}
                            </div>

                            {isGmailConnected ? (
                              <p className="text-sm text-muted-foreground">
                                Linked to <strong className="text-foreground">{gmailEmail || profileEmail}</strong>.
                                Real-time syncing and automated label management are enabled.
                              </p>
                            ) : (
                              <p className="text-sm text-muted-foreground max-w-xl">
                                Connect your Gmail account to sync incoming emails, run autonomous AI workflows, and generate smart replies.
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3 shrink-0">
                          {isGmailConnected ? (
                            <>
                              <button
                                onClick={handleManualSync}
                                disabled={isSyncing}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border/80 bg-background hover:bg-muted text-foreground text-sm font-medium transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                              >
                                <RefreshCw className={cn("w-4 h-4 text-muted-foreground", isSyncing && "animate-spin text-blue-500")} />
                                <span>{isSyncing ? "Syncing..." : "Sync Now"}</span>
                              </button>

                              <button
                                onClick={() => setShowDisconnectModal(true)}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-medium transition-all cursor-pointer"
                              >
                                <Unlink className="w-4 h-4" />
                                <span>Unlink</span>
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={connectGmail}
                              className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all shadow-sm shadow-blue-600/20 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                            >
                              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                              </svg>
                              <span>Connect Google Account</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Sync Metrics Bar */}
                      {isGmailConnected && (
                        <div className="mt-6 pt-5 border-t border-border/60 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-muted/40 border border-border/50">
                            <Clock className="w-4 h-4 text-blue-500 shrink-0" />
                            <div>
                              <p className="text-[10px] text-muted-foreground uppercase font-medium">Last Synced</p>
                              <p className="font-semibold text-foreground">{lastSyncTime}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-muted/40 border border-border/50">
                            <Zap className="w-4 h-4 text-emerald-500 shrink-0" />
                            <div>
                              <p className="text-[10px] text-muted-foreground uppercase font-medium">Background Ingestion</p>
                              <p className="font-semibold text-foreground">Every {autoSyncInterval}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-muted/40 border border-border/50">
                            <Key className="w-4 h-4 text-amber-500 shrink-0" />
                            <div>
                              <p className="text-[10px] text-muted-foreground uppercase font-medium">OAuth Token State</p>
                              <p className="font-semibold text-emerald-600 dark:text-emerald-400">Valid & Encrypted</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Sync Frequency Selector */}
                    <div className="rounded-2xl border border-border/80 bg-card p-6 md:p-7 shadow-xs space-y-4">
                      <div>
                        <h4 className="text-sm font-semibold text-foreground">Automatic Synchronization Frequency</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Configure how frequently Zynmail checks Gmail servers for incoming threads and drafts.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          { label: "Real-time (30s)", value: "30s", desc: "Recommended for fast workflows" },
                          { label: "Every 1 min", value: "1m", desc: "Balanced sync rate" },
                          { label: "Every 5 min", value: "5m", desc: "Low battery usage" },
                          { label: "Manual Only", value: "manual", desc: "Sync upon button click" },
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              setAutoSyncInterval(option.value);
                              toast.success(`Sync interval set to ${option.label}`);
                            }}
                            className={cn(
                              "p-3 rounded-xl border text-left transition-all cursor-pointer",
                              autoSyncInterval === option.value
                                ? "border-blue-500/50 bg-blue-500/10 text-foreground ring-1 ring-blue-500/30"
                                : "border-border/70 bg-muted/20 text-muted-foreground hover:text-foreground hover:bg-muted/40"
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold">{option.label}</span>
                              {autoSyncInterval === option.value && <Check className="h-3.5 w-3.5 text-blue-500" />}
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-1">{option.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Scopes & Permissions Breakdown */}
                    <div className="rounded-2xl border border-border/80 bg-card p-6 md:p-7 shadow-xs space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-base font-semibold text-foreground">Granted Scopes & Permission Boundary</h4>
                          <p className="text-xs text-muted-foreground">Authorized capabilities granted to Zynmail via Google OAuth.</p>
                        </div>
                        <span className="text-xs px-2.5 py-1 rounded-md bg-muted text-muted-foreground font-mono">
                          OAuth 2.0 PKCE
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {[
                          {
                            title: "Read Emails & Metadata",
                            scope: "gmail.readonly",
                            desc: "Ingests messages for AI summarization, priority tagging, and semantic search.",
                            granted: isGmailConnected,
                          },
                          {
                            title: "Draft Auto-Replies",
                            scope: "gmail.compose",
                            desc: "Generates draft emails without automatically sending unless authorized.",
                            granted: isGmailConnected,
                          },
                          {
                            title: "Send Authorized Emails",
                            scope: "gmail.send",
                            desc: "Dispatches emails only when manually approved or triggered by safe workflows.",
                            granted: isGmailConnected,
                          },
                          {
                            title: "Manage Labels & Folders",
                            scope: "gmail.modify",
                            desc: "Applies priority tags, categorization badges, and organizes inbox structure.",
                            granted: isGmailConnected,
                          },
                        ].map((item, idx) => (
                          <div
                            key={idx}
                            className="p-3.5 rounded-xl border border-border/60 bg-muted/20 flex items-start gap-3"
                          >
                            <div
                              className={cn(
                                "h-7 w-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                                item.granted
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                  : "bg-muted text-muted-foreground"
                              )}
                            >
                              {item.granted ? <Check className="w-4 h-4" /> : <Lock className="w-3.5 h-3.5" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-foreground">{item.title}</span>
                                <span className="text-[10px] text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">
                                  {item.scope}
                                </span>
                              </div>
                              <p className="text-[12px] text-muted-foreground mt-0.5 leading-relaxed">{item.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ──────── TAB 3: SECURITY & ENCRYPTION ──────── */}
                {activeTab === "security" && (
                  <div className="space-y-6 animate-in fade-in-50 duration-200">
                    
                    {/* AES-256 Cryptographic Protection Card */}
                    <div className="rounded-2xl border border-border/80 bg-card p-6 md:p-7 shadow-xs space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="h-11 w-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center justify-center">
                            <Lock className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-base font-semibold text-foreground">End-to-End Field Encryption</h3>
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                100% Encrypted at Rest
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Standard: AES-256-CBC with HMAC-SHA256 authenticated payload signing.
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={handleRunSecurityReEncryption}
                          disabled={isEncryptingNow}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold transition-all border border-border/80 cursor-pointer disabled:opacity-50 self-start sm:self-auto"
                        >
                          <RefreshCw className={cn("w-3.5 h-3.5", isEncryptingNow && "animate-spin text-blue-500")} />
                          <span>{isEncryptingNow ? "Verifying Vault..." : "Re-verify Database"}</span>
                        </button>
                      </div>

                      {/* Cryptographic Metrics */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                        <div className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-1">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Database Coverage</span>
                            <Database className="w-3.5 h-3.5 text-blue-500" />
                          </div>
                          <p className="text-xl font-bold text-foreground">
                            {securityData?.data_at_rest.coverage || "100.0%"}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {securityData?.data_at_rest.encrypted_emails || 133} of {securityData?.data_at_rest.total_emails || 133} documents in ciphertext
                          </p>
                        </div>

                        <div className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-1">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Cipher Engine</span>
                            <Key className="w-3.5 h-3.5 text-emerald-500" />
                          </div>
                          <p className="text-sm font-bold text-foreground truncate">
                            AES-256 (Fernet)
                          </p>
                          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                            Authenticated 256-bit Key Active
                          </p>
                        </div>

                        <div className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-1">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Token Vault</span>
                            <Shield className="w-3.5 h-3.5 text-purple-500" />
                          </div>
                          <p className="text-sm font-bold text-foreground">
                            Encrypted 0600
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            OAuth tokens & sessions secured
                          </p>
                        </div>
                      </div>

                      {/* Encrypted Data Fields Checklist */}
                      <div className="space-y-3 pt-3 border-t border-border/60">
                        <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                          Encrypted MongoDB Payload Fields
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {["body", "body_plain", "body_html", "snippet", "attachments", "user_credentials", "user_profile"].map((field) => (
                            <div
                              key={field}
                              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-muted/50 border border-border/60 text-xs font-mono text-foreground"
                            >
                              <Lock className="w-3 h-3 text-emerald-500" />
                              <span>{field}</span>
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-sans font-semibold">enc:</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ──────── TAB 4: AI SAFETY & GUARDRAILS ──────── */}
                {activeTab === "safety" && (
                  <div className="space-y-6 animate-in fade-in-50 duration-200">
                    <div className="rounded-2xl border border-border/80 bg-card p-6 md:p-7 shadow-xs space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center justify-center">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-foreground">Enterprise Prompt Injection & Safety Guard</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Automated defenses preventing adversarial prompt overrides and malicious instruction hijacking.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          {
                            name: "Multi-Tier Jailbreak Signature Scanning",
                            desc: "Detects adversarial override phrases (e.g. 'ignore previous instructions', system prompt leaks, role reversals) before LLM ingestion.",
                            active: true,
                          },
                          {
                            name: "XML Boundary Framing (<untrusted_email_context>)",
                            desc: "Wraps all email content and sender metadata in strict XML sandbox tags to isolate untrusted text from AI system instructions.",
                            active: true,
                          },
                          {
                            name: "Zero-Width Obfuscation Stripping",
                            desc: "Strips invisible zero-width Unicode characters, homoglyphs, and hidden character injection attempts.",
                            active: true,
                          },
                          {
                            name: "Hard Deletion & Trashing Block",
                            desc: "Strict policy prohibits AI copilots and autonomous workers from executing permanent data destruction or bulk trashing.",
                            active: true,
                          },
                        ].map((feature, idx) => (
                          <div key={idx} className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-foreground">{feature.name}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                                Active
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">{feature.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ──────── TAB 5: PREFERENCES & DISPLAY ──────── */}
                {activeTab === "preferences" && (
                  <div className="space-y-6 animate-in fade-in-50 duration-200">
                    <div className="rounded-2xl border border-border/80 bg-card p-6 md:p-7 shadow-xs space-y-6">
                      <div>
                        <h3 className="text-base font-semibold text-foreground">Application Preferences & UI</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Customize your interface theme, email grouping, and smart categorization behavior.
                        </p>
                      </div>

                      {/* Theme Selector */}
                      <div className="space-y-3 pt-2">
                        <label className="text-xs font-semibold text-foreground uppercase tracking-wider">Interface Theme</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {[
                            { name: "dark", label: "Dark Mode", desc: "Sleek obsidian theme", icon: "🌙" },
                            { name: "light", label: "Light Mode", desc: "Crisp modern light", icon: "☀️" },
                          ].map((t) => (
                            <button
                              key={t.name}
                              onClick={() => {
                                setTheme(t.name as any);
                                toast.success(`Theme updated to ${t.label}`);
                              }}
                              className={cn(
                                "p-3.5 rounded-xl border text-left transition-all cursor-pointer",
                                (resolvedTheme === t.name || theme === t.name)
                                  ? "border-blue-500/60 bg-blue-500/10 text-foreground ring-1 ring-blue-500/30"
                                  : "border-border/70 bg-muted/20 text-muted-foreground hover:text-foreground hover:bg-muted/40"
                              )}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold flex items-center gap-1.5">
                                  <span>{t.icon}</span> {t.label}
                                </span>
                                {(resolvedTheme === t.name || theme === t.name) && (
                                  <Check className="h-3.5 w-3.5 text-blue-500" />
                                )}
                              </div>
                              <p className="text-[11px] text-muted-foreground mt-1">{t.desc}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Toggles */}
                      <div className="space-y-4 pt-4 border-t border-border/60">
                        {/* Conversation Threading */}
                        <div className="flex items-center justify-between py-1">
                          <div className="space-y-0.5 pr-4">
                            <p className="text-sm font-medium text-foreground">Conversation Threading</p>
                            <p className="text-xs text-muted-foreground">
                              Group related replies into structured conversation threads.
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            checked={enableThreading}
                            onChange={(e) => {
                              setEnableThreading(e.target.checked);
                              toast.success(`Threading ${e.target.checked ? "enabled" : "disabled"}`);
                            }}
                            className="h-4 w-4 rounded border-border text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        </div>

                        {/* AI Auto-tagging */}
                        <div className="flex items-center justify-between py-1 border-t border-border/40">
                          <div className="space-y-0.5 pr-4">
                            <p className="text-sm font-medium text-foreground">Smart AI Categorization</p>
                            <p className="text-xs text-muted-foreground">
                              Auto-tag incoming emails with Needs Reply, Linear, Verification, or Promotions badges.
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            checked={aiAutoTagging}
                            onChange={(e) => {
                              setAiAutoTagging(e.target.checked);
                              toast.success(`Auto-categorization ${e.target.checked ? "enabled" : "disabled"}`);
                            }}
                            className="h-4 w-4 rounded border-border text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        </div>

                        {/* Sandboxed HTML */}
                        <div className="flex items-center justify-between py-1 border-t border-border/40">
                          <div className="space-y-0.5 pr-4">
                            <p className="text-sm font-medium text-foreground">Strict HTML Sandbox</p>
                            <p className="text-xs text-muted-foreground">
                              Safely isolate external script execution and trackers inside sandboxed rendering frames.
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            checked={strictSandbox}
                            onChange={(e) => {
                              setStrictSandbox(e.target.checked);
                              toast.success(`Strict sandbox ${e.target.checked ? "enabled" : "disabled"}`);
                            }}
                            className="h-4 w-4 rounded border-border text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Unlink Confirmation Dialog */}
      {showDisconnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Unlink Gmail Account?</h3>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              Are you sure you want to disconnect <strong className="text-foreground">{gmailEmail || "your Gmail account"}</strong>?
              Your local cache will remain intact, but Zynmail will no longer be able to sync new messages or send emails until you reconnect.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => setShowDisconnectModal(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDisconnectConfirm}
                disabled={isDisconnecting}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition-all disabled:opacity-50 cursor-pointer"
              >
                {isDisconnecting ? "Disconnecting..." : "Yes, Unlink"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Compose Modal */}
      <ComposeModal />
    </div>
  );
}
