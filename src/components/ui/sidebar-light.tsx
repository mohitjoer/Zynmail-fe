"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface NavItem {
  title: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  expandedIcon?: React.ComponentType<{ className?: string }>
  items?: NavItem[]
}

interface SidebarLightProps {
  items: NavItem[]
  className?: string
  activePath?: string
  onItemClick?: (item: NavItem) => void
}

// Safe pathname hook that works outside of a Next.js router context.
function useSafePathname(): string {
  const [pathname, setPathname] = React.useState<string>("")
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setPathname(window.location.pathname)
    }
  }, [])
  return pathname
}

interface NavItemRendererProps {
  item: NavItem
  pathname: string
  depth: number
  activePath?: string
  onItemClick?: (item: NavItem) => void
}

import { useSidebar } from "@/components/ui/sidebar"

function NavItemRenderer({ item, pathname, depth, activePath, onItemClick }: NavItemRendererProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const { open } = useSidebar()
  const isCollapsed = !open
  const hasChildren = item.items && item.items.length > 0
  const isActive = activePath ? activePath === item.href : pathname === item.href

  // Parent item with children (section header)
  if (hasChildren) {
    const displayTitle = isOpen && item.title === "More" ? "Less" : item.title
    const Icon = isOpen && item.expandedIcon ? item.expandedIcon : item.icon

    return (
      <div className="space-y-1">
        <div
          className={cn(
            "flex items-center gap-2 text-sm cursor-pointer rounded-md transition-colors hover:bg-muted/50",
            depth === 0 && (isCollapsed ? "justify-center p-2" : "px-3 py-2 font-medium text-foreground"),
            depth > 0 && "px-3 py-1.5 font-medium text-muted-foreground"
          )}
          onClick={() => {
            if (!isCollapsed) setIsOpen(!isOpen)
          }}
          title={isCollapsed ? item.title : undefined}
        >
          {Icon && <Icon className={cn(depth === 0 ? "h-4 w-4" : "h-3.5 w-3.5")} />}
          {!isCollapsed && displayTitle}
        </div>
        {!isCollapsed && isOpen && (
          <div className={cn("ml-4 space-y-1 border-l border-border pl-2")}>
            {item.items!.map((subItem, index) => (
              <NavItemRenderer
                key={subItem.href !== "#" ? subItem.href : `${subItem.title}-${index}`}
                item={subItem}
                pathname={pathname}
                depth={depth + 1}
                activePath={activePath}
                onItemClick={onItemClick}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  // Leaf item (link)
  return (
    <a
      href={item.href}
      onClick={(e) => {
        if (onItemClick) {
          e.preventDefault()
          onItemClick(item)
        }
      }}
      className={cn(
        "flex items-center gap-2 text-sm rounded-md transition-colors",
        depth === 0 && (isCollapsed ? "justify-center p-2" : "px-3 py-2"),
        depth > 0 && "px-3 py-1.5",
        isActive
          ? "bg-muted font-medium text-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
      )}
      title={isCollapsed ? item.title : undefined}
    >
      {item.icon && <item.icon className={cn(depth === 0 ? "h-4 w-4" : "h-3.5 w-3.5")} />}
      {!isCollapsed && item.title}
    </a>
  )
}

function SidebarLight({ items, className, activePath, onItemClick }: SidebarLightProps) {
  const pathname = useSafePathname()

  return (
    <aside className={cn("w-full", className)}>
      <nav className="space-y-1">
        {items.map((item, index) => (
          <NavItemRenderer
            key={item.href !== "#" ? item.href : `${item.title}-${index}`}
            item={item}
            pathname={pathname}
            depth={0}
            activePath={activePath}
            onItemClick={onItemClick}
          />
        ))}
      </nav>
    </aside>
  )
}

export { SidebarLight }
export type { SidebarLightProps }

export default SidebarLight;
