"use client";

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import EmailList from "@/components/email/EmailList";
import EmailDetail from "@/components/email/EmailDetail";
import ComposeModal from "@/components/email/ComposeModal";
import { useEmail } from "@/context/EmailContext";
import { useTheme } from "@/context/ThemeContext";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { selectedEmail, refreshEmails, checkAuthStatus, isConnected, isLoading } = useEmail();
  const { resolvedTheme } = useTheme();
  const [isSyncing, setIsSyncing] = useState(false);
  const authAttempted = React.useRef(false);
  const router = useRouter();

  useEffect(() => {
    const handleGoogleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      
      if (code && !authAttempted.current) {
        authAttempted.current = true;
        setIsSyncing(true);
        try {
          const authRes = await fetch('http://localhost:8000/api/auth/google/callback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code })
          });
          
          window.history.replaceState({}, document.title, window.location.pathname);
          
          if (!authRes.ok) {
            const errorText = await authRes.text();
            console.error(`Auth failed: ${errorText}`);
            alert("Authentication failed. The code may have expired. Redirecting to clear it, please click 'Connect Gmail' again!");
            window.location.href = window.location.pathname;
            return;
          }
          
          const syncRes = await fetch('http://localhost:8000/api/emails/sync', { method: 'POST' });
          if (!syncRes.ok) {
             console.error("Sync failed, but auth might have succeeded.");
          }
          
          checkAuthStatus();
        } catch (error) {
          console.error("Error during Google Auth flow:", error);
        } finally {
          setIsSyncing(false);
        }
      }
    };
    
    handleGoogleCallback();
  }, [checkAuthStatus]);

  useEffect(() => {
    // If not loading and not connected, and we aren't currently trying to authenticate via a callback code, redirect
    if (!isLoading && !isConnected) {
      const urlParams = new URLSearchParams(window.location.search);
      if (!urlParams.get('code')) {
        router.push('/onboarding');
      }
    }
  }, [isLoading, isConnected, router]);

  return (
    <div
      className="flex flex-col h-screen w-full text-[#1f1f1f] overflow-hidden font-sans"
      style={{ backgroundImage: "url('/background.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}
      suppressHydrationWarning
    >
      <Header />
      <div className="flex flex-1 overflow-hidden p-4 pt-2">
        <div className="flex flex-1 bg-white/90 backdrop-blur-md rounded-2xl overflow-hidden shadow-sm">
          <Sidebar />
          
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 p-2">
            <div className="flex-1 flex flex-col min-w-0 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {selectedEmail ? (
                <EmailDetail />
              ) : (
                <EmailList />
              )}
            </div>
          </div>
        </div>
      </div>
      <ComposeModal />
    </div>
  );
}