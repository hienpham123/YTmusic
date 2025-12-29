"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Library, Heart, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/contexts/SidebarContext";
import { motion, AnimatePresence } from "framer-motion";

const navigation = [
  { name: "Khám Phá", href: "/", icon: Home },
  { name: "Thư Viện", href: "/library", icon: Library },
  { name: "Yêu Thích", href: "/favorites", icon: Heart },
  { name: "Lịch Sử", href: "/history", icon: History },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed } = useSidebar();

  return (
    <aside
      className={cn(
        "hidden md:flex md:flex-col md:fixed md:left-0 md:top-16 md:bottom-0 md:z-30 border-r border-border bg-card/80 backdrop-blur-sm transition-all duration-300",
        isCollapsed ? "md:w-16" : "md:w-64"
      )}
    >
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <nav className="flex-1 px-3 space-y-1">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center rounded-lg transition-colors relative",
                  isCollapsed ? "px-3 py-3 justify-center" : "px-3 py-2",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
                title={isCollapsed ? item.name : undefined}
              >
                <item.icon
                  className={cn(
                    "h-6 w-6 flex-shrink-0",
                    isCollapsed ? "" : "mr-3",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="text-sm font-medium whitespace-nowrap overflow-hidden"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isActive && !isCollapsed && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
