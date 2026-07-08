import { Store } from "@tauri-apps/plugin-store";
import { VideoItem } from "@/types";

const HISTORY_PATH = "history.json";
const SETTINGS_PATH = "settings.json";

export interface SettingsData {
  mpvArgs: string;
}

const DEFAULT_SETTINGS: SettingsData = {
  mpvArgs: ""
};


export interface SearchSettings {
  rutube: boolean;
  youtube: boolean;
}

const DEFAULT_SEARCH_SETTINGS: SearchSettings = {
  rutube: true,
  youtube: true
};


async function getStoreInstance(path: string): Promise<Store> {
  return await Store.load(path);
}

export async function saveSettings(settings: SettingsData): Promise<void> {
  try {
    const store = await getStoreInstance(SETTINGS_PATH);
    await store.set("settings_data", settings);
    await store.save();
    console.log("[Config]: Настройки успешно сохранены");
  } catch (error) {
    console.error("[Config Error]: Не удалось сохранить настройки:", error);
  }
}

export async function getSettings(): Promise<SettingsData> {
  try {
    const store = await getStoreInstance(SETTINGS_PATH);
    const saved = await store.get<SettingsData>("settings_data");
    return saved || DEFAULT_SETTINGS;
  } catch (error) {
    console.error("[Config Error]: Не удалось загрузить настройки:", error);
    return DEFAULT_SETTINGS;
  }
}

export async function saveSearchSettings(settings: SearchSettings): Promise<void> {
  try {
    const store = await getStoreInstance(SETTINGS_PATH);
    await store.set("search_settings", settings);
    await store.save();
    console.log("[Config]: Настройки успешно сохранены");
  } catch (error) {
    console.error("[Config Error]: Не удалось сохранить настройки:", error);
  }
}

export async function getSearchSettings(): Promise<SearchSettings> {
  try {
    const store = await getStoreInstance(SETTINGS_PATH);
    const saved = await store.get<SearchSettings>("search_settings");
    return saved || DEFAULT_SEARCH_SETTINGS;
  } catch (error) {
    console.error("[Config Error]: Не удалось загрузить настройки:", error);
    return DEFAULT_SEARCH_SETTINGS;
  }
}

export async function resetSettings(): Promise<SettingsData> {
  try {
    const store = await getStoreInstance(SETTINGS_PATH);
    await store.set("settings_data", DEFAULT_SETTINGS);
    await store.save();
    console.log("[Config]: Настройки сброшены");
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error("[Config Error]: Не удалось сбросить настройки:", error);
    return DEFAULT_SETTINGS;
  }
}

export async function addToHistory(video: VideoItem): Promise<void> {
  try {
    const store = await getStoreInstance(HISTORY_PATH);
    const currentHistory = (await store.get<VideoItem[]>("history")) || [];

    const filteredHistory = currentHistory.filter((item) => item.id !== video.id);
    const updatedHistory = [video, ...filteredHistory].slice(0, 100);

    await store.set("history", updatedHistory);
    await store.save();
    
    console.log("[Config]: История успешно обновлена");
  } catch (error) {
    console.error("[Config Error]: Не удалось сохранить историю:", error);
  }
}

export async function getHistory(): Promise<VideoItem[]> {
  try {
    const store = await getStoreInstance(HISTORY_PATH);
    return (await store.get<VideoItem[]>("history")) || [];
  } catch (error) {
    console.error("[Config Error]: Не удалось загрузить историю:", error);
    return [];
  }
}

export async function clearHistory(): Promise<void> {
  try {
    const store = await getStoreInstance(HISTORY_PATH);
    await store.set("history", []);
    await store.save();
  } catch (error) {
    console.error("[Config Error]: Не удалось очистить историю:", error);
  }
}
