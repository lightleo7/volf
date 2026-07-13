import { io, Socket } from "socket.io-client";

export interface VideoState {
    url: string;
    currentTime: number;
    isPlaying: boolean;
}

class SyncService {
    private socket: Socket | null = null;
    private currentUrl: string | null = null;
    public roomCode: string | null = null;
    public ownerToken: string | null = null;

    connect(serverUrl: string = "http://localhost:3000") {
        if (this.socket && this.currentUrl === serverUrl && this.socket.connected) {
            return;
        }

        if (this.socket) {
            this.socket.disconnect();
        }

        this.currentUrl = serverUrl;
        this.socket = io(serverUrl, {
            autoConnect: true,
            transports: ["websocket"],
            forceNew: false
        });

        this.socket.on("connect", () => {
            console.log(`[Sync] Успешно подключено к серверу: ${serverUrl} (ID: ${this.socket?.id})`);
        });
    }

    createRoom(): Promise<{ roomCode: string }> {
        return new Promise((resolve, reject) => {
            if (!this.socket || !this.socket.connected) return reject("Нет активного подключения к серверу");

            this.socket.emit("create_room", (response: { success: boolean; roomCode: string; ownerToken: string; error?: string }) => {
                if (response.success) {
                    this.roomCode = response.roomCode;
                    this.ownerToken = response.ownerToken;
                    localStorage.setItem(`owner_token_${response.roomCode}`, response.ownerToken);
                    resolve({ roomCode: response.roomCode });
                } else {
                    reject(response.error);
                }
            });
        });
    }

    joinRoom(roomCode: string): Promise<{ videoState: VideoState }> {
        return new Promise((resolve, reject) => {
            if (!this.socket || !this.socket.connected) return reject("Не удалось подключиться к серверу синхронизации(");

            this.socket.emit("join_room", { roomCode }, (response: { success: boolean; videoState: VideoState; error?: string }) => {
                if (response.success) {
                    this.roomCode = roomCode;
                    resolve({ videoState: response.videoState });
                } else {
                    reject(response.error);
                }
            });
        });
    }

    sendCommand(command: Partial<VideoState>) {
        if (!this.socket || !this.socket.connected || !this.roomCode) {
            console.warn("[Sync Warn]: Попытка отправить команду без подключения или комнаты");
            return;
        }
        this.socket.emit("player_command", command);
    }

    onSyncPlayer(callback: (command: Partial<VideoState>) => void) {
        if (!this.socket) return;
        this.socket.off("sync_player");
        this.socket.on("sync_player", callback);
    }

    offSyncPlayer() {
        this.socket?.off("sync_player");
    }

    getSocketId(): string {
        return this.socket?.id || "default";
    }
}

export const syncService = new SyncService();
