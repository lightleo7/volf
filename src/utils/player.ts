import { invoke } from "@tauri-apps/api/core";
import { getSettings } from "./config";

export async function openInMpv(url: string): Promise<void> {
  if (!url || !url.trim()) {
    console.warn("[Player]: Попытка вызвать MPV с пустой ссылкой");
    return;
  }
  const savedSettings = await getSettings();
  const parsedArgs = savedSettings.mpvArgs.trim() 
    ? savedSettings.mpvArgs.trim().split(/\s+/) 
    : [];

  try {
    console.log(`[Player]: Запрос к Rust на запуск MPV для: ${url}`);
    
    await invoke("launch_mpv", { url: url, args: parsedArgs });
    
    console.log(`[Player]: Команда успешно передана в ОС`);
  } catch (error) {
    console.error(
      "[Player Error]: Не удалось запустить MPV через бэкенд.",
      error
    );
  }
}
