import { useState, useEffect } from "react";
import { syncService } from "@/services/sync";
import { mpvIpcService } from "@/services/mpv";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

export function useMpvSync(mpvArgs: string) {
  const [serverUrl, setServerUrl] = useState(() => {
    return localStorage.getItem("custom_sync_server") || "http://localhost:3000";
  });
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [inputCode, setInputCode] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);

  const handleServerUrlChange = (newUrl: string) => {
    setServerUrl(newUrl);
    localStorage.setItem("custom_sync_server", newUrl);
    syncService.connect(newUrl);
  };

  const handleCreateRoom = async () => {
    try {
      setIsConnecting(true);
      syncService.connect(serverUrl);
      const res = await syncService.createRoom();
      setCurrentRoom(res.roomCode);
    } catch (err) {
      alert("Ошибка создания комнаты: " + err);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleJoinRoom = async () => {
    try {
      setIsConnecting(true);
      syncService.connect(serverUrl);
      const res = await syncService.joinRoom(inputCode);
      setCurrentRoom(inputCode);
      if (res.videoState && res.videoState.url) {
        setVideoUrl(res.videoState.url);
      }
    } catch (err) {
      alert("Не удалось войти в комнату: " + err);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleLaunchMpv = async () => {
    if (!videoUrl.trim()) return;
    try {
      const myUniqueSuffix = syncService.getSocketId();
      const socketPath = mpvIpcService.getSocketPath(myUniqueSuffix);
      const baseArgs = mpvArgs.trim() ? mpvArgs.trim().split(/\s+/) : [];
      const finalArgs = [
        ...baseArgs,
        `--input-ipc-server=${socketPath}`,
        `--no-resume-playback`
      ];

      await invoke("launch_mpv", { url: videoUrl.trim(), args: finalArgs });
      
      setTimeout(async () => {
        await invoke("start_mpv_monitor", { socketPath });
      }, 400);
    } catch (err) {
      alert("Не удалось запустить MPV или монитор: " + err);
    }
  };

  const handleSendVideoToRoom = () => {
    if (!videoUrl.trim()) return;
    syncService.sendCommand({
      url: videoUrl.trim(),
      isPlaying: true,
      currentTime: 0,
      playlistPosition: 0
    });
  };

  const leaveRoom = () => {
    setCurrentRoom(null);
  };

  useEffect(() => {
    syncService.onSyncPlayer(async (command) => {
      const myUniqueSuffix = syncService.getSocketId();
      if (command.url) {
        setVideoUrl(command.url);
      }
      if (command.isPlaying !== undefined) {
        await mpvIpcService.setPause(myUniqueSuffix, !command.isPlaying);
      }
      if (command.currentTime !== undefined) {
        await mpvIpcService.seekTo(myUniqueSuffix, command.currentTime);
      }
      if (command.playlistPosition !== undefined) {
        await mpvIpcService.setPlaylistPos(myUniqueSuffix, command.playlistPosition);
      }
    });

    const unlistenPromise = listen("mpv_state_changed", (event: any) => {
      const { isPlaying, currentTime, playlistPosition } = event.payload;
      syncService.sendCommand({ isPlaying, currentTime, playlistPosition });
    });

    return () => {
      syncService.offSyncPlayer();
      unlistenPromise.then((unlisten) => unlisten());
    };
  }, [mpvArgs]);

  return {
    serverUrl,
    currentRoom,
    inputCode,
    videoUrl,
    isConnecting,
    setInputCode,
    setVideoUrl,
    handleServerUrlChange,
    handleCreateRoom,
    handleJoinRoom,
    handleLaunchMpv,
    handleSendVideoToRoom,
    leaveRoom,
  };
}