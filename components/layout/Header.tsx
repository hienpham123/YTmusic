"use client";

import { AuthStatus } from "@/components/auth/AuthStatus";
import { Menu, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { useSidebar } from "@/contexts/SidebarContext";
import { useRouter, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Home, Library, Heart, History } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { toggleSidebar, isCollapsed } = useSidebar();

  const handleMenuClick = () => {
    // Check if mobile
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setMobileMenuOpen(true);
    } else {
      toggleSidebar();
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to home page with search query
      router.push(`/?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearchResults(false);
      if (searchInputRef.current) {
        searchInputRef.current.blur();
      }
    }
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSearchResults(false);
      }
    };

    if (showSearchResults) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSearchResults]);

  return (
    <>
      <header className="border-b border-border bg-card/80 backdrop-blur-md fixed top-0 left-0 right-0 z-40 safe-area-top">
        <div className="flex items-center h-14 sm:h-16 px-3 sm:px-4 gap-2 sm:gap-4">
          {/* Left: Menu + Logo */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleMenuClick}
              className="h-11 w-11 sm:h-10 sm:w-10 touch-manipulation -ml-1 sm:ml-0"
              title={isCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
            >
              <Menu className="h-5 w-5 sm:h-5 sm:w-5" />
            </Button>
            <Link
              href="/"
              className="flex items-center gap-2 min-w-0 touch-manipulation"
            >
              <span className="text-base sm:text-lg md:text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent whitespace-nowrap">
                🎧 YT Music
              </span>
            </Link>
          </div>

          {/* Center: Search Bar - Hidden on mobile */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-4">
            <form onSubmit={handleSearch} className="relative w-full">
              <div className="relative flex items-center">
                <Input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchResults(e.target.value.trim().length > 0);
                  }}
                  onFocus={() => {
                    if (searchQuery.trim().length > 0) {
                      setShowSearchResults(true);
                    }
                  }}
                  placeholder="Tìm kiếm video YouTube..."
                  className="h-10 pr-10 rounded-l-full rounded-r-none border-r-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="h-10 w-12 rounded-l-none rounded-r-full border-l-0"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>

          {/* Mobile: Search Button */}
          <div className="md:hidden flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setMobileSearchOpen(true);
                setTimeout(() => {
                  searchInputRef.current?.focus();
                }, 100);
              }}
              className="h-11 w-11 touch-manipulation"
              title="Tìm kiếm"
            >
              <Search className="h-5 w-5" />
            </Button>
          </div>

          {/* Right: Auth - Always on the right */}
          <div className="flex-shrink-0 ml-auto">
            <AuthStatus />
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 md:hidden bg-black/50"
              onClick={() => setMobileMenuOpen(false)}
            />
            {/* Sidebar */}
            <motion.div
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-72 sm:w-64 bg-card border-r border-border z-50 md:hidden safe-area-left"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with close button */}
              <div className="flex items-center justify-between px-4 h-14 sm:h-16 border-b border-border">
                <div className="flex items-center gap-2">
                  <Image
                    src="/icon.svg"
                    alt="YT Music"
                    width={24}
                    height={24}
                    className="w-6 h-6"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(false)}
                  className="h-10 w-10 touch-manipulation"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 flex flex-col pt-4 pb-4 overflow-y-auto px-3 space-y-1">
                {[
                  { name: "Khám Phá", href: "/", icon: Home },
                  { name: "Thư Viện", href: "/library", icon: Library },
                  { name: "Yêu Thích", href: "/favorites", icon: Heart },
                  { name: "Lịch Sử", href: "/history", icon: History },
                ].map((item, index) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/" && pathname?.startsWith(item.href));
                  return (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "group flex items-center px-4 py-3.5 text-base font-medium rounded-lg transition-colors touch-manipulation min-h-[48px]",
                          isActive
                            ? "bg-primary/10 text-primary border-l-2 border-primary"
                            : "text-muted-foreground active:bg-accent active:text-foreground"
                        )}
                      >
                        <item.icon
                          className={cn(
                            "mr-4 h-6 w-6 flex-shrink-0",
                            isActive
                              ? "text-primary"
                              : "text-muted-foreground group-active:text-foreground"
                          )}
                        />
                        {item.name}
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Search Modal */}
      <AnimatePresence>
        {mobileSearchOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 md:hidden bg-black/50"
              onClick={() => setMobileSearchOpen(false)}
            />
            {/* Search Bar */}
            <motion.div
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 right-0 z-50 md:hidden bg-card border-b border-border p-4 safe-area-top"
              onClick={(e) => e.stopPropagation()}
            >
              <form
                onSubmit={(e) => {
                  handleSearch(e);
                  setMobileSearchOpen(false);
                }}
                className="flex items-center gap-2"
              >
                <Input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchResults(e.target.value.trim().length > 0);
                  }}
                  placeholder="Tìm kiếm video YouTube..."
                  className="flex-1 h-12 text-base"
                  autoFocus
                />
                <Button
                  type="submit"
                  size="icon"
                  className="h-12 w-12 flex-shrink-0 touch-manipulation"
                >
                  <Search className="h-5 w-5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setMobileSearchOpen(false);
                    setSearchQuery("");
                    setShowSearchResults(false);
                  }}
                  className="h-12 w-12 flex-shrink-0 touch-manipulation"
                >
                  <X className="h-5 w-5" />
                </Button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
