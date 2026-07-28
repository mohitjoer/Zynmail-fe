import { Menu, Search, SlidersHorizontal, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";

export default function Header() {
  const [user, setUser] = useState<{name: string, avatar_url: string} | null>(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/user/me')
      .then(res => res.json())
      .then(data => {
        if (data.name) setUser(data);
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

  return (
    <div className="flex items-center justify-between px-4 py-2 w-full h-[64px] bg-transparent shrink-0">
      {/* Left section: Hamburger and Logo */}
      <div className="flex items-center gap-3 w-[238px] pl-2">
        <span className="text-[24px] text-white font-bold tracking-tight px-3 drop-shadow-sm">Zynmail</span>
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
      <div className="flex items-center gap-1 w-[238px] justify-end pr-2">
        <div className="pl-2">
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
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}