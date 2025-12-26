"use client";

import { useState, FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { isValidYouTubeUrl, extractVideoId } from "@/lib/youtube";
import { Loader2 } from "lucide-react";

interface PasteLinkInputProps {
  onPaste: (videoId: string) => void;
  isLoading?: boolean;
}

export function PasteLinkInput({ onPaste, isLoading = false }: PasteLinkInputProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!url.trim()) {
      setError("Vui lòng nhập link YouTube");
      return;
    }

    if (!isValidYouTubeUrl(url)) {
      setError("Link YouTube không hợp lệ. Vui lòng thử lại.");
      return;
    }

    const videoId = extractVideoId(url);
    if (videoId) {
      onPaste(videoId);
      setUrl("");
    } else {
      setError("Không thể lấy video ID từ link này.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-4">
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Dán link YouTube vào đây..."
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setError("");
          }}
          className="flex-1 text-lg h-14 px-4"
          disabled={isLoading}
        />
        <Button
          type="submit"
          size="lg"
          className="h-14 px-8"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang tải...
            </>
          ) : (
            "Tìm"
          )}
        </Button>
      </div>
      {error && (
        <p className="text-sm text-destructive text-center animate-in fade-in">
          {error}
        </p>
      )}
    </form>
  );
}

