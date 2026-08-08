"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEmail } from "@/context/EmailContext";
import { cn } from "@/lib/utils";
import type { MailFolder } from "@/types";
import {
  Inbox,
  Send,
  ShoppingBag,
  Bookmark,
  CalendarClock,
  FileText,
  Trash2,
  Settings,
  Mailbox,
  ChevronRight,
  Zap,
  Search,
  X,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type NavItemConfig = {
  id: string;
  title: string;
  icon: React.ElementType;
  badge?: number | string;
  shortcut?: string;
  href?: string;
  folderId?: MailFolder;
  onClick?: () => void;
  children?: NavItemConfig[];
};

type NavGroupConfig = {
  heading?: string;
  items: NavItemConfig[];
};

// ─── NavItem ──────────────────────────────────────────────────────────────────

function NavItem({
  item,
  activeId,
  onSelect,
  level = 0,
}: {
  item: NavItemConfig;
  activeId: string;
  onSelect: (item: NavItemConfig) => void;
  level?: number;
}) {
  const isActive = activeId === item.id;
  const hasChildren = !!item.children?.length;
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    if (hasChildren) {
      setIsOpen(!isOpen);
    } else {
      onSelect(item);
    }
  };

  return (
    <div className="flex flex-col w-full">
      <div
        className={cn(
          "group flex items-center justify-between py-[7px] rounded-[6px] cursor-pointer transition-all duration-150 select-none",
          isActive
            ? "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 font-medium"
            : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground/90"
        )}
        style={{ paddingLeft: `${level * 12 + 10}px`, paddingRight: "10px" }}
        onClick={handleClick}
      >
        <div className="flex items-center gap-2.5">
          <item.icon
            className={cn(
              "w-[16px] h-[16px] shrink-0 transition-colors",
              isActive
                ? "text-blue-600 dark:text-blue-400"
                : "text-muted-foreground/70 group-hover:text-foreground/70"
            )}
            strokeWidth={1.5}
          />
          <span className="text-[13px] tracking-wide truncate">
            {item.title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {item.shortcut && (
            <kbd className="hidden group-hover:inline-flex items-center justify-center h-5 px-1.5 text-[10px] font-medium font-mono text-muted-foreground/60 bg-background/80 border border-border/50 rounded-[4px]">
              {item.shortcut}
            </kbd>
          )}
          {typeof item.badge === "number" && item.badge > 0 && (
            <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-medium rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400">
              {item.badge}
            </span>
          )}
          {typeof item.badge === "string" && (
            <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-orange-100 text-orange-700">
              {item.badge}
            </span>
          )}
          {hasChildren && (
            <ChevronRight
              className={cn(
                "w-3.5 h-3.5 text-muted-foreground/50 transition-transform duration-200",
                isOpen ? "rotate-90" : ""
              )}
              strokeWidth={2}
            />
          )}
        </div>
      </div>

      {hasChildren && (
        <div
          className={cn(
            "grid transition-[grid-template-rows,opacity] duration-300 ease-in-out",
            isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          )}
        >
          <div className="overflow-hidden min-h-0 relative flex flex-col gap-0.5 mt-0.5">
            <div
              className="absolute top-0 bottom-0 border-l border-black/5 dark:border-white/5"
              style={{ left: `${level * 12 + 17.5}px` }}
            />
            {item.children!.map((child) => (
              <NavItem
                key={child.id}
                item={child}
                activeId={activeId}
                onSelect={onSelect}
                level={level + 1}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    activeFolder,
    setActiveFolder,
    folderCounts,
    searchQuery,
    setSearchQuery,
  } = useEmail();

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Global keyboard shortcuts: ⌘K for search, ⌘, for settings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === ",") {
        e.preventDefault();
        router.push("/settings");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  const isAutomationsActive = pathname === "/automations";
  const isSettingsActive = pathname === "/settings";
  const activeId = isSettingsActive ? "settings" : isAutomationsActive ? "automations" : activeFolder;

  const handleSelect = (item: NavItemConfig) => {
    if (item.onClick) {
      item.onClick();
      return;
    }
    if (item.href) {
      router.push(item.href);
      return;
    }
    if (item.folderId) {
      setActiveFolder(item.folderId);
      if (pathname !== "/home") router.push("/home");
    }
  };

  const navGroups: NavGroupConfig[] = [
    {
      items: [
        {
          id: "inbox",
          title: "Inbox",
          icon: Inbox,
          folderId: "inbox",
          badge: folderCounts["inbox_unread"] || folderCounts["inbox"],
        },
        {
          id: "sent",
          title: "Sent",
          icon: Send,
          folderId: "sent",
          badge: folderCounts["sent"],
        },
      ],
    },
    {
      heading: "Folders",
      items: [
        {
          id: "mail-folders",
          title: "All Folders",
          icon: Mailbox,
          children: [
            { id: "important", title: "Important", icon: Bookmark, folderId: "important", badge: folderCounts["important"] },
            { id: "scheduled", title: "Scheduled", icon: CalendarClock, folderId: "scheduled" },
            { id: "drafts", title: "Drafts", icon: FileText, folderId: "drafts", badge: folderCounts["drafts"] },
            { id: "purchases", title: "Purchases", icon: ShoppingBag, folderId: "purchases", badge: folderCounts["purchases"] },
            { id: "all_mail", title: "All Mail", icon: Mailbox, folderId: "all_mail" },
            { id: "trash", title: "Bin", icon: Trash2, folderId: "trash", badge: folderCounts["trash"] },
          ],
        },
      ],
    },
    {
      heading: "Tools",
      items: [
        {
          id: "automations",
          title: "Automations",
          icon: Zap,
          href: "/automations",
        },
      ],
    },
  ];

  const bottomItems: NavItemConfig[] = [
    {
      id: "settings",
      title: "Settings",
      icon: Settings,
      shortcut: "⌘,",
      href: "/settings",
    },
  ];

  return (
    <div className="w-[240px] xl:w-[256px] shrink-0 flex flex-col h-full bg-card border-r border-border pt-3 pb-4">
      {/* Search Input Box */}
      <div className="px-3 mb-2">
        <div className="group relative flex items-center h-[34px] rounded-lg bg-muted/60 hover:bg-muted/90 focus-within:bg-card focus-within:ring-1 focus-within:ring-border border border-border/50 px-2.5 transition-all">
          <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0 group-focus-within:text-foreground transition-colors" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (pathname !== "/home") router.push("/home");
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setSearchQuery("");
                searchInputRef.current?.blur();
              }
            }}
            placeholder="Search mail..."
            className="w-full bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none pl-2 pr-1"
          />
          {searchQuery ? (
            <button
              onClick={() => {
                setSearchQuery("");
                searchInputRef.current?.focus();
              }}
              className="p-0.5 text-muted-foreground hover:text-foreground rounded-sm transition-colors cursor-pointer"
              title="Clear search (Esc)"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center justify-center h-4 px-1 text-[9.5px] font-medium font-mono text-muted-foreground/60 bg-background/80 border border-border/60 rounded-[3px] pointer-events-none select-none">
              ⌘K
            </kbd>
          )}
        </div>
      </div>

      {/* Nav Groups */}
      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] flex flex-col gap-4 px-3 pt-2">
        {navGroups.map((group, idx) => (
          <div key={idx} className="flex flex-col gap-0.5">
            {group.heading && (
              <span className="px-2.5 mb-1 text-[10px] font-semibold tracking-wider text-muted-foreground/50 uppercase">
                {group.heading}
              </span>
            )}
            {group.items.map((item) => (
              <NavItem
                key={item.id}
                item={item}
                activeId={activeId}
                onSelect={handleSelect}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Bottom Items */}
      <div className="mt-auto pt-3 border-t border-border flex flex-col gap-0.5 px-3">
        {bottomItems.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            activeId={activeId}
            onSelect={handleSelect}
          />
        ))}
      </div>
    </div>
  );
}