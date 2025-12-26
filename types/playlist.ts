import { Track } from "./track";

export interface Playlist {
  id: string;
  userId: string;
  name: string;
  tracks: Track[];
  createdAt: Date;
}

