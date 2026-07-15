import { BaseVideoParser } from "./base";
import { VideoItem } from "@/types";
import { fetch } from "@tauri-apps/plugin-http";

export class RutubeParser extends BaseVideoParser {
  private isWarmedUp = false;

  get sourceName(): string {
    return "Rutube";
  }

  get sourceIdentifier() : string {
    return "rutube";
  }

  private headers: Record<string, string> = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
    "Referer": "https://rutube.ru",
    "Origin": "https://rutube.ru"
  };

  private async warmUp(): Promise<void> {
    if (this.isWarmedUp) return;
    
    try {
      await fetch("https://rutube.ru", {
        method: "GET",
        headers: this.headers,
        credentials: "include",
      });
      this.isWarmedUp = true;
      console.log("[Rutube Parser]: Сессия успешно инициализирована");
    } catch (e) {
      console.error("[Rutube Parser]: Не удалось прогреть сессию", e);
    }
  }

  async search(query: string): Promise<VideoItem[]> {
    if (!query || !query.trim()) {
      return [];
    }

    await this.warmUp();

    const url = "https://rutube.ru/api/search/combined/video_playlist";
    const params = new URLSearchParams({
      query: query.trim(),
      client: "wdp",
      page: "1",
      per_page: "20",
    });

    try {
      await fetch("https://rutube.ru", {
        method: "GET",
        headers: this.headers,
        credentials: "include",
      });

      const response = await fetch(`${url}?${params}`, {
        method: "GET",
        headers: this.headers,
        credentials: "include",
      });

      if (!response.ok) {
        console.error(`[Rutube Parser]: Ошибка HTTP ${response.status}`);
        return [];
      }

      const data = (await response.json()) as any;
      const results = data.results || [];
      const videos: VideoItem[] = [];

      for (const item of results) {
        const itemId = item.id;
        if (!itemId) continue;

        const contentType = item.content_type || "video";
        const isPlaylist = contentType == "playlist";
        let videoUrl = "";

        if (isPlaylist) {
          videoUrl = item.video_url || `https://rutube.ru/plst/${itemId}/`;
        } else {
          videoUrl = item.video_url || `https://rutube.ru/video/${itemId}/`;
        }

        const authorData = item.author || {};
        const authorName = authorData.name || "Неизвестный автор";
        const imgUrl = item.thumbnail_url || item.picture || "";

        const videoCount = item.videos_count || 0;

        videos.push({
          id: itemId.toString(),
          title: item.title || "Без названия",
          url: videoUrl,
          image: imgUrl,
          author: authorName,
          source: this.sourceName,
          sourceIdentifier: this.sourceIdentifier,
          isPlaylist: isPlaylist,
          videoCount: isPlaylist ? Number(videoCount) : undefined,
        });
      }

      return videos;

    } catch (error) {
      console.error("[Rutube Search Error]:", error);
      return [];
    }
  }
}
