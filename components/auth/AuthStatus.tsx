"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "@/contexts/SupabaseContext";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { LogIn, LogOut } from "lucide-react";
import { LoginModal } from "./LoginModal";
import { supabase } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export function AuthStatus() {
  const { user, loading, signOut } = useSupabase();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // Load user profile from users table
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) {
        setUserProfile(null);
        return;
      }

      setIsLoadingProfile(true);
      try {
        const { data, error } = await supabase
          .from("users")
          .select("id, email, name, avatar")
          .eq("id", user.id)
          .single();

        if (error && error.code !== "PGRST116") {
          console.error("Error loading user profile:", error);
        }

        if (data && typeof data === "object" && "id" in data) {
          setUserProfile({
            id: (data as any).id,
            email: (data as any).email || user.email || "",
            name:
              (data as any).name ||
              user.user_metadata?.full_name ||
              user.user_metadata?.name ||
              user.email?.split("@")[0] ||
              "User",
            avatar:
              (data as any).avatar ||
              user.user_metadata?.avatar_url ||
              user.user_metadata?.picture,
          });
        } else {
          // Fallback to auth user data
          setUserProfile({
            id: user.id,
            email: user.email || "",
            name:
              user.user_metadata?.full_name ||
              user.user_metadata?.name ||
              user.email?.split("@")[0] ||
              "User",
            avatar:
              user.user_metadata?.avatar_url || user.user_metadata?.picture,
          });
        }
      } catch (error) {
        console.error("Error loading user profile:", error);
        // Fallback to auth user data
        setUserProfile({
          id: user.id,
          email: user.email || "",
          name:
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email?.split("@")[0] ||
            "User",
          avatar: user.user_metadata?.avatar_url || user.user_metadata?.picture,
        });
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadUserProfile();
  }, [user]);

  if (loading || isLoadingProfile) {
    return <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />;
  }

  if (user && userProfile) {
    const initials = userProfile.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    return (
      <Popover>
        <PopoverTrigger asChild>
          <button className="h-10 w-10 rounded-full overflow-hidden border-2 border-border hover:border-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background cursor-pointer">
            {userProfile.avatar ? (
              <Avatar className="h-full w-full">
                <AvatarImage src={userProfile.avatar} alt={userProfile.name} />
                <AvatarFallback className="text-base">
                  {initials}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="h-full w-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-base">
                {initials}
              </div>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
          <div className="p-4">
            <div className="flex items-center gap-3 mb-4">
              {userProfile.avatar ? (
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={userProfile.avatar}
                    alt={userProfile.name}
                  />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              ) : (
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                  {initials}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">
                  {userProfile.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {userProfile.email}
                </p>
              </div>
            </div>
            <Separator className="my-2" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut()}
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 h-11 sm:h-9 text-base sm:text-sm touch-manipulation"
            >
              <LogOut className="h-5 w-5 sm:h-4 sm:w-4 mr-2" />
              Đăng xuất
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsLoginOpen(true)}
        className="h-9 sm:h-8 px-3 sm:px-3 touch-manipulation"
      >
        <LogIn className="h-4 w-4 mr-1" />
        <span className="hidden sm:inline">Đăng nhập</span>
        <span className="sm:hidden">Đăng nhập</span>
      </Button>
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
}
