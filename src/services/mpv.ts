import { invoke } from "@tauri-apps/api/core";

class MpvIpcService {
  private baseSocketName: string = "mpv-shared-socket";
  private isWindows: boolean = false;

  constructor() {
    this.isWindows = navigator.userAgent.includes("Windows");
  }

  getSocketPath(suffix: string = ""): string {
    const name = suffix ? `${this.baseSocketName}-${suffix}` : this.baseSocketName;
    return this.isWindows 
      ? `\\\\.\\pipe\\${name}` 
      : `/tmp/${name}`;
  }

  async setPause(socketSuffix: string, pause: boolean): Promise<void> {
    try {
      const path = this.getSocketPath(socketSuffix);
      await invoke("set_mpv_pause", { socketPath: path, pause });
      console.log(`[MPV IPC] Пауза: ${pause} (сокет: ${path})`);
    } catch (error) {
      console.error("[MPV IPC Error] Ошибка паузы:", error);
    }
  }

  async seekTo(socketSuffix: string, seconds: number): Promise<void> {
    try {
      const path = this.getSocketPath(socketSuffix);
      await invoke("set_mpv_time", { socketPath: path, seconds });
      console.log(`[MPV IPC] Перемотка на: ${seconds}с (сокет: ${path})`);
    } catch (error) {
      console.error("[MPV IPC Error] Ошибка перемотки:", error);
    }
  }
}

export const mpvIpcService = new MpvIpcService();
