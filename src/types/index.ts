export type ActiveTab = "search" | "history" | "settings" | "dualMode";

export interface VideoItem {
  id: string;
  title: string;
  url: string;
  image: string;
  author: string;
  source: string;
  sourceIdentifier: string;
  isPlaylist: boolean; 
  videoCount?: number;
}
