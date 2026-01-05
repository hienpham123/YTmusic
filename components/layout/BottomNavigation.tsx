"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Library, Heart, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { usePlayerContext } from "@/contexts/PlayerContext";

const navigation = [
  { name: "Khám Phá", href: "/", icon: Home },
  { name: "Thư Viện", href: "/library", icon: Library },
  { name: "Yêu Thích", href: "/favorites", icon: Heart },
  { name: "Lịch Sử", href: "/history", icon: History },
];

export function BottomNavigation() {
  const pathname = usePathname();
  const { currentTrack } = usePlayerContext();
  const hasPlayer = !!currentTrack;

  return (
    <nav
      className={cn(
        "fixed left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border md:hidden safe-area-bottom transition-transform duration-300",
        hasPlayer ? "bottom-20" : "bottom-0"
      )}
      style={{ zIndex: 30 }}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 h-full touch-manipulation relative",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground active:text-foreground"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-b-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <item.icon
                className={cn(
                  "h-6 w-6 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              />
              <span
                className={cn(
                  "text-[10px] font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
