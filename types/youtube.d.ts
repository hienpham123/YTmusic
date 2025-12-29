// YouTube IFrame API types
declare namespace YT {
  interface PlayerState {
    UNSTARTED: -1;
    ENDED: 0;
    PLAYING: 1;
    PAUSED: 2;
    BUFFERING: 3;
    CUED: 5;
  }

  interface OnStateChangeEvent {
    data: number;
  }

  interface PlayerOptions {
    videoId?: string;
    width?: number | string;
    height?: number | string;
    playerVars?: {
      autoplay?: 0 | 1;
      controls?: 0 | 1 | 2;
      modestbranding?: 0 | 1;
      rel?: 0 | 1;
      showinfo?: 0 | 1;
      iv_load_policy?: 1 | 3;
      cc_load_policy?: 0 | 1;
      fs?: 0 | 1;
      playsinline?: 0 | 1;
      [key: string]: number | string | undefined;
    };
    events?: {
      onReady?: (event: { target: Player }) => void;
      onStateChange?: (event: OnStateChangeEvent & { target?: Player }) => void;
      onError?: (event: { data: number }) => void;
      [key: string]: ((event: any) => void) | undefined;
    };
  }

  class Player {
    constructor(containerId: string | HTMLElement, options: PlayerOptions);
    playVideo(): void;
    pauseVideo(): void;
    stopVideo(): void;
    seekTo(seconds: number, allowSeekAhead?: boolean): void;
    getCurrentTime(): number;
    getDuration(): number;
    getVideoUrl(): string;
    getVideoEmbedCode(): string;
    getPlayerState(): number;
    loadVideoById(videoId: string, startSeconds?: number): void;
    cueVideoById(videoId: string, startSeconds?: number): void;
    setVolume(volume: number): void;
    mute(): void;
    unMute(): void;
    destroy(): void;
  }

  const PlayerState: PlayerState;
}
