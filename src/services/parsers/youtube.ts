import { BaseVideoParser } from "./base";
import { VideoItem } from "@/types";
import { fetch } from "@tauri-apps/plugin-http";

export class YouTubeParser extends BaseVideoParser {
  get sourceName(): string {
    return "YouTube";
  }

  get sourceIdentifier() : string {
    return "youtube";
  }

  private headers: Record<string, string> = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "X-YouTube-Client-Name": "1",
    "X-YouTube-Client-Version": "2.20240501.01.00",
    "Accept": "*/*",
    "Accept-Language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
  };

  async search(query: string): Promise<VideoItem[]> {
    if (!query || !query.trim()) {
      return [];
    }

    const params = new URLSearchParams({
      search_query: query.trim(),
      pbj: "1",
    });

    const url = `https://youtube.com/results?${params}`;

    try {
      // Запрос отправляем через Tauri HTTP, чтобы обходить CORS во фронтенде
      const response = await fetch(url, {
        method: "GET",
        headers: this.headers,
      });

      if (!response.ok) {
        console.error(`[YouTube Parser]: Ошибка HTTP ${response.status}`);
        return [];
      }

      const rawData = await response.json() as any;
      let responseData: any = {};

      if (Array.isArray(rawData)) {
        for (const part of rawData) {
          if (part && "response" in part) {
            responseData = part.response;
            break;
          }
        }
      } else if (typeof rawData === "object" && rawData !== null) {
        responseData = rawData.response || rawData;
      }

      const renderers = this.extractRenderers(responseData, ["videoRenderer", "playlistRenderer"]);
      const videos: VideoItem[] = [];

      for (const { key, value: item } of renderers) {
        if (key === "videoRenderer") {
          const videoId = item.videoId;
          if (!videoId) continue;

          const thumbnails = item.thumbnail?.thumbnails || [];
          const imgUrl = thumbnails.length > 0 ? thumbnails[thumbnails.length - 1].url : "";

          const title = this.getText(item.title);
          const author = this.getText(item.shortBylineText);

          videos.push({
            id: videoId.toString(),
            title: title || "Без названия",
            url: `https://youtube.com/watch?v=${videoId}`,
            image: imgUrl,
            author: author || "Неизвестный автор",
            source: this.sourceName,
            sourceIdentifier: this.sourceIdentifier,
            isPlaylist: false,
            videoCount: 0,
          });
        } 
        
        else if (key === "playlistRenderer") {
          const playlistId = item.playlistId;
          if (!playlistId) continue;

          const playlistThumbnails = item.thumbnails?.[0]?.thumbnails || item.thumbnail?.thumbnails || [];
          const imgUrl = playlistThumbnails.length > 0 ? playlistThumbnails[playlistThumbnails.length - 1].url : "";

          const title = this.getText(item.title);
          const author = this.getText(item.longBylineText);

          const rawCount = item.videoCount || "0";
          const digits = String(rawCount).replace(/\D/g, "");
          const videoCount = digits ? parseInt(digits, 10) : 0;

          videos.push({
            id: playlistId.toString(),
            title: title || "Без названия",
            url: playlistId.startsWith("http") ? playlistId : `https://youtube.com{playlistId}`,
            image: imgUrl,
            author: author || "Неизвестный автор",
            source: this.sourceName,
            sourceIdentifier: this.sourceIdentifier,
            isPlaylist: true,
            videoCount: videoCount,
          });
        }
      }

      return videos;
    } catch (error) {
      console.error("[YouTube Native Parser Error]:", error);
      return [];
    }
  }

  /**
   * Рекурсивно сканирует дерево объектов любой глубины (вместо Python-генератора yield)
   */
  private extractRenderers(data: any, keys: string[]): Array<{ key: string; value: any }> {
    const results: Array<{ key: string; value: any }> = [];

    const traverse = (node: any) => {
      if (!node) return;

      if (typeof node === "object") {
        if (Array.isArray(node)) {
          for (const item of node) {
            traverse(item);
          }
        } else {
          for (const k of Object.keys(node)) {
            if (keys.includes(k)) {
              results.push({ key: k, value: node[k] });
            } else if (typeof node[k] === "object") {
              traverse(node[k]);
            }
          }
        }
      }
    };

    traverse(data);
    return results;
  }

  /**
   * Безопасный разбор текстовых полей формата YouTube
   */
  private getText(node: any): string {
    if (!node || typeof node !== "object") {
      return "";
    }
    if ("simpleText" in node) {
      return String(node.simpleText);
    }
    if ("runs" in node && Array.isArray(node.runs)) {
      return node.runs
        .filter((run: any) => run && typeof run === "object")
        .map((run: any) => run.text || "")
        .join("");
    }
    return "";
  }
}
