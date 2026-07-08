import { YouTubeParser } from "@/services/parsers/youtube";
import { RutubeParser } from "@/services/parsers/rutube";
import { BaseVideoParser } from "./base"; 
import { SearchSettings, getSearchSettings } from "@/utils/config";

const parsersList: Record<string, BaseVideoParser> = {
  youtube: new YouTubeParser(),
  rutube: new RutubeParser(),
};

export async function search(query: string) {
  const search_settings = await getSearchSettings();

  // 1. Получаем массив только тех парсеров, которые включены в настройках
  const activeParsers = Object.values(parsersList).filter((parser) => {
    const providerKey = parser.sourceIdentifier as keyof SearchSettings;
    return search_settings[providerKey] === true;
  });

  // 2. Запускаем запросы ТОЛЬКО для активных парсеров
  const promises = activeParsers.map((parser) => parser.search(query));

  // 3. Ждем выполнения только нужных запросов
  const resultsArray = await Promise.all(promises);
  const allVideos = resultsArray.flat();

  // Оставляем только видео с уникальным составным ключом
  const seen = new Set();
  return allVideos.filter(video => {
    const uniqueKey = `${video.sourceIdentifier}-${video.id}`;
    if (seen.has(uniqueKey)) {
      return false;
    }
    seen.add(uniqueKey);
    return true;
  });
}
