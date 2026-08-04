import { Menu, Search, SlidersHorizontal, LogOut, Settings, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEmail } from "@/context/EmailContext";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
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

export default function Header() {
  const pathname = usePathname();
  const { isChatOpen, toggleChat } = useEmail();
  const [user, setUser] = useState<{name: string, email: string, avatar_url: string, signature: string} | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [signature, setSignature] = useState("");

  const isSolidPage = pathname === "/automations";

  useEffect(() => {
    fetch('http://localhost:8000/api/user/me')
      .then(res => res.json())
      .then(data => {
        if (data.name) {
          setUser(data);
          setSignature(data.signature || "Sent from Zynmail");
        }
      })
      .catch(console.error);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:8000/api/auth/logout', { method: 'POST' });
      window.location.href = '/onboarding';
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await fetch('http://localhost:8000/api/user/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signature })
      });
      setUser(prev => prev ? { ...prev, signature } : null);
      setProfileOpen(false);
      toast.success("Profile settings saved!");
    } catch (err) {
      toast.error("Failed to save profile");
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 w-full h-[64px] shrink-0 z-30 bg-white border-b border-gray-200 shadow-2xs">
      {/* Left section: Hamburger and Logo */}
      <div className="flex items-center gap-3 w-[238px] pl-2">
        <span className="text-[24px] font-bold tracking-tight px-3 text-[#202124]">
          Zynmail
        </span>
      </div>

      {/* Middle section: Search Bar */}
      <div className="flex-1 max-w-[720px] px-2">
        <div className="flex items-center bg-[#f0f4f9]/90 backdrop-blur-sm focus-within:bg-white focus-within:shadow-md transition-all rounded-full px-4 h-12 w-full">
          <button className="p-2 text-[#444746] rounded-full hover:bg-black/5">
            <Search className="h-5 w-5" />
          </button>
          <input 
            type="text" 
            placeholder="Search mail" 
            className="flex-1 bg-transparent border-none focus:outline-none px-2 text-[#1f1f1f] text-base placeholder:text-[#444746]"
          />
          <button className="p-2 text-[#444746] rounded-full hover:bg-black/5">
            <SlidersHorizontal className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Right section: Icons and Profile */}
      <div className="flex items-center gap-2 w-[238px] justify-end pr-2">
        <button
          onClick={toggleChat}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all shadow-sm cursor-pointer",
            isChatOpen 
              ? "bg-blue-600 text-white shadow-blue-500/25 ring-2 ring-blue-400" 
              : "bg-white/80 hover:bg-white text-gray-700 hover:text-blue-600 backdrop-blur-sm"
          )}
          title={isChatOpen ? "Close AI Side Panel" : "Open AI Side Panel"}
        >
          <Sparkles className={cn("h-3.5 w-3.5", isChatOpen ? "text-yellow-300 animate-pulse" : "text-blue-600")} />
          <span className="font-semibold">Ask Zyn</span>
        </button>

        <div className="pl-1">
          <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-none rounded-full">
              <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-transparent hover:ring-black/10 transition-all">
                {user?.avatar_url && <AvatarImage src={user.avatar_url} alt={user.name} />}
                <AvatarFallback className="bg-[#006FEE] text-white text-sm font-medium">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "You"}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name || 'My Account'}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setProfileOpen(true)} className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Profile Settings</span>
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
                <AvatarFallback className="bg-[#006FEE] text-white text-2xl font-medium">
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
            <Button onClick={handleSaveProfile} className="bg-[#006FEE] hover:bg-[#005bc4] text-white">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}