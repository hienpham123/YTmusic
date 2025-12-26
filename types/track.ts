export type Mood = "Chill" | "Sad" | "Night" | "Focus" | "Unknown";

export interface Track {
  id: string;
  youtubeVideoId: string;
  title: string;
  thumbnail: string;
  channelName: string;
  duration: string;
  mood: Mood;
  createdAt?: Date;
}

export interface TrackMetadata {
  videoId: string;
  title: string;
  thumbnail: string;
  channelName: string;
  duration: string;
}

