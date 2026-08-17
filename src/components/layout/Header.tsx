import { LogOut, Settings, Sparkles, Pencil, Sun, Moon, RefreshCw } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEmail } from "@/context/EmailContext";
import { useTheme } from "@/context/ThemeContext";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { authClient } from "@/lib/auth-client";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { isChatOpen, toggleChat, setComposeOpen, isConnected, connectGmail, refreshEmails, gmailEmail } = useEmail();
  const { data: session } = authClient.useSession();
  const { resolvedTheme, toggleTheme } = useTheme();
  const [user, setUser] = useState<{name: string, email: string, avatar_url: string, signature: string} | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [signature, setSignature] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    if (!isConnected) {
      connectGmail();
      return;
    }
    setIsSyncing(true);
    toast.info("Syncing latest emails from Gmail...");
    try {
      await refreshEmails();
      toast.success("Inbox synced!");
    } catch (err) {
      toast.error("Failed to sync emails");
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    api.user.me()
      .then(data => {
        if (isMounted && data && data.name) {
          setUser({
            name: data.name,
            email: data.email || "",
            avatar_url: data.avatar_url || "",
            signature: data.signature || "Sent from Zynmail"
          });
          setSignature(data.signature || "Sent from Zynmail");
        }
      })
      .catch(err => {
        // Silently handle initial network fetch fallback
        console.debug("User profile fetch notice:", err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = async () => {
    try {
      await api.auth.logout();
      window.location.href = '/signin';
    } catch (err) {
      console.error('Logout failed', err);
      window.location.href = '/signin';
    }
  };

  const handleSaveProfile = async () => {
    try {
      await api.user.update({ signature });
      setUser(prev => prev ? { ...prev, signature } : null);
      setProfileOpen(false);
      toast.success("Profile settings saved!");
    } catch (err) {
      toast.error("Failed to save profile");
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 w-full h-[64px] shrink-0 z-30 bg-card border-b border-border shadow-2xs">
      {/* Left section: Logo and Compose */}
      <div className="flex items-center gap-3 w-[238px] pl-2">
        <span className="text-[22px] font-bold tracking-tight px-3 text-foreground">
          Zynmail
        </span>
        <button
          onClick={() => setComposeOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-background hover:bg-muted text-foreground rounded-full border border-border shadow-xs transition-all cursor-pointer text-[13px] font-medium whitespace-nowrap"
        >
          <Pencil className="h-[14px] w-[14px] text-muted-foreground fill-current shrink-0" strokeWidth={1.5} />
          Compose
        </button>
      </div>


      {/* Right section: Sync, Theme toggle, Ask Zyn, Profile */}
      <div className="flex items-center gap-2 justify-end pr-2">
        {!isConnected ? (
          <button
            onClick={connectGmail}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all cursor-pointer"
          >
            Connect Gmail
          </button>
        ) : (
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="p-2 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer disabled:opacity-50"
            title="Sync latest emails from Gmail"
          >
            <RefreshCw className={cn("h-[16px] w-[16px]", isSyncing && "animate-spin text-blue-500")} />
          </button>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          title={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {resolvedTheme === 'dark' ? (
            <Sun className="h-[18px] w-[18px]" />
          ) : (
            <Moon className="h-[18px] w-[18px]" />
          )}
        </button>

        {/* Ask Zyn - Hidden on Settings page */}
        {!pathname?.startsWith("/settings") && (
          <button
            onClick={toggleChat}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all shadow-sm cursor-pointer",
              isChatOpen
                ? "bg-blue-600 text-white shadow-blue-500/25 ring-2 ring-blue-400"
                : "bg-card hover:bg-muted text-foreground border border-border"
            )}
            title={isChatOpen ? "Close AI Side Panel" : "Open AI Side Panel"}
          >
            <Sparkles className={cn("h-3.5 w-3.5", isChatOpen ? "text-yellow-300 animate-pulse" : "text-blue-500")} />
            <span className="font-semibold">Ask Zyn</span>
          </button>
        )}

        {/* Profile Dropdown */}
        <div className="pl-1">
          <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-none rounded-full">
              <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-transparent hover:ring-border transition-all">
                {user?.avatar_url && <AvatarImage src={user.avatar_url} alt={user.name} referrerPolicy="no-referrer" />}
                <AvatarFallback className="bg-blue-600 text-white text-sm font-medium">
                  {(session?.user?.name || user?.name || gmailEmail || "U").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold leading-none truncate">{session?.user?.name || user?.name || 'My Account'}</p>
                    <p className="text-xs text-muted-foreground leading-none truncate">{gmailEmail || session?.user?.email || user?.email || ''}</p>
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/settings")} className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Profile Settings</DialogTitle>
            <DialogDescription>
              Update your account details and email signature.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                {user?.avatar_url && <AvatarImage src={user.avatar_url} />}
                <AvatarFallback className="bg-blue-600 text-white text-2xl font-medium">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-semibold text-lg">{user?.name}</span>
                <span className="text-sm text-muted-foreground">{user?.email}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 mt-2">
              <label className="text-sm font-medium">Email Signature</label>
              <textarea
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Sent from Zynmail"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProfileOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveProfile} className="bg-blue-600 hover:bg-blue-700 text-white">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}