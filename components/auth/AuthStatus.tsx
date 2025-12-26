"use client";

import { useState } from "react";
import { useSupabase } from "@/hooks/useSupabase";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut } from "lucide-react";
import { LoginModal } from "./LoginModal";

export function AuthStatus() {
  const { user, loading, signOut } = useSupabase();
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  if (loading) {
    return (
      <div className="text-sm text-muted-foreground">
        Đang kiểm tra đăng nhập...
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground hidden sm:inline">
          {user.email}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => signOut()}
          className="h-8"
        >
          <LogOut className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">Đăng xuất</span>
        </Button>
      </div>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsLoginOpen(true)}
        className="h-8"
      >
        <LogIn className="h-4 w-4 mr-1" />
        Đăng nhập
      </Button>
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />
    </>
  );
}

