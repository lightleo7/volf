import { useState, useEffect } from "react";
import { ActiveTab, VideoItem } from "@/types";
import { Layout } from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Tv, Loader2, Save, RotateCcw, Users, Server, LogOut, Copy, Share2, Play } from "lucide-react";
import { search } from "@/services/parsers/parsers";
import { openInMpv } from "@/utils/player";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import {
  addToHistory,
  getHistory,
  saveSettings,
  getSettings,
  resetSettings,
  getSearchSettings,
  saveSearchSettings
} from "@/utils/config";
import { syncService } from "@/services/sync";
import { mpvIpcService } from "@/services/mpv";

const initialServerUrl = localStorage.getItem("custom_sync_server") || "http://localhost:3000";
syncService.connect(initialServerUrl);

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [videosHistory, setVideosHistory] = useState<VideoItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [mpvArgs, setMpvArgs] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [rutubeEnabled, setRutubeEnabled] = useState(true);
  const [youtubeEnabled, setYoutubeEnabled] = useState(true);

  const [serverUrl, setServerUrl] = useState(() => {
    return localStorage.getItem("custom_sync_server") || "http://localhost:3000";
  });
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [inputCode, setInputCode] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);


  const handleShareToRoom = (e: React.MouseEvent, video: any) => {
    e.stopPropagation();
    setVideoUrl(video.url);
    setActiveTab("dualMode");
  };

  const handleCreateRoom = async () => {
    try {
      setIsConnecting(true);

      syncService.connect(serverUrl);

      const res = await syncService.createRoom();
      setCurrentRoom(res.roomCode);
      console.log("[Sync]: Комната создана:", res.roomCode);
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
      console.log("[Sync]: Успешный вход в комнату:", inputCode);
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
      console.log("[MPV]: Плеер запущен, сокет:", socketPath);

      await invoke("start_mpv_monitor", { socketPath });
      console.log("[MPV Monitor]: Фоновый поток опроса успешно активирован");

    } catch (err) {
      alert("Не удалось запустить MPV или монитор: " + err);
    }
  };

  const handleServerUrlChange = (newUrl: string) => {
    setServerUrl(newUrl);
    localStorage.setItem("custom_sync_server", newUrl);
    syncService.connect(newUrl);
  };

  const handleSendVideoToRoom = () => {
    if (!videoUrl.trim()) return;
    syncService.sendCommand({
      url: videoUrl.trim(),
      isPlaying: true,
      currentTime: 0
    });
    console.log("[Sync]: Ссылка отправлена всем участникам:", videoUrl);
  };

  useEffect(() => {
    syncService.onSyncPlayer(async (command) => {
      console.log("[Sync Ресивер]: Получена команда от соседа!", command);
      const myUniqueSuffix = syncService.getSocketId();

      if (command.url) {
        setVideoUrl(command.url);
        try {
          // Uncomment for autostart player than client gets new link
          // const socketPath = mpvIpcService.getSocketPath(myUniqueSuffix);
          // const baseArgs = mpvArgs.trim() ? mpvArgs.trim().split(/\s+/) : [];
          // const finalArgs = [
          //   ...baseArgs,
          //   `--input-ipc-server=${socketPath}`,
          //   `--no-resume-playback`
          // ];

          // await invoke("launch_mpv", { url: command.url, args: finalArgs });
          // await invoke("start_mpv_monitor", { socketPath });
        } catch (err) {
          console.error("Ошибка автозапуска:", err);
        }
      }

      if (command.isPlaying !== undefined) {
        await mpvIpcService.setPause(myUniqueSuffix, !command.isPlaying);
      }
      if (command.currentTime !== undefined) {
        await mpvIpcService.seekTo(myUniqueSuffix, command.currentTime);
      }
    });

    const unlistenPromise = listen("mpv_state_changed", (event: any) => {
      const { isPlaying, currentTime } = event.payload;
      console.log("[Tauri Event]: Локальный плеер изменился! Отправляем друзьям...", event.payload);

      syncService.sendCommand({ isPlaying, currentTime });
    });

    return () => {
      syncService.offSyncPlayer();
      unlistenPromise.then((unlisten) => unlisten());
    };
  }, [mpvArgs]);

  useEffect(() => {
    const initSettings = async () => {
      const savedSettings = await getSettings();
      setMpvArgs(savedSettings.mpvArgs);

      const savedSearchSettings = await getSearchSettings();
      setRutubeEnabled(savedSearchSettings.rutube);
      setYoutubeEnabled(savedSearchSettings.youtube);
    };
    initSettings();
  }, []);

  useEffect(() => {
    if (activeTab === "history") {
      const loadHistory = async () => {
        const historyData = await getHistory();
        setVideosHistory(historyData);
      };
      loadHistory();
    }
  }, [activeTab]);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await saveSettings({
        mpvArgs
      });
      await saveSearchSettings({
        rutube: rutubeEnabled,
        youtube: youtubeEnabled
      })
    } catch (error) {
      console.error("Ошибка сохранения настроек:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetSettings = async () => {
    setIsSaving(true);
    try {
      const defaulted = await resetSettings();
      setMpvArgs(defaulted.mpvArgs);
    } catch (error) {
      console.error("Ошибка сброса настроек:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const results = await search(searchQuery);
      setVideos(results);
    } catch (error) {
      console.error("Ошибка при поиске:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handlePlay = async (video: VideoItem) => {
    await openInMpv(video.url);
    await addToHistory(video);

    if (activeTab === "history") {
      const updatedHistory = await getHistory();
      setVideosHistory(updatedHistory);
    }
  };

  return (
    <Layout currentTab={activeTab} onTabChange={setActiveTab}>
      <div className="p-6 flex flex-col h-full overflow-y-auto">

        {activeTab === "search" && (
          <div className="flex flex-col gap-6 max-w-5xl w-full mx-auto">
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Tv className="w-6 h-6 text-emerald-400" /> Поиск видео
            </h1>

            <div className="flex items-center gap-3">
              <Input
                type="text"
                placeholder="Введите запрос для Rutube..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                className="bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-500 focus-visible:ring-emerald-500 h-11"
              />
              <Button
                onClick={handleSearch}
                disabled={isLoading}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white px-6 h-11 font-medium cursor-pointer flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Поиск...
                  </>
                ) : (
                  "Найти"
                )}
              </Button>
            </div>

            {videos.length > 0 ? (
              <div className="flex flex-col gap-3 mt-2">
                {videos.map((video) => (
                  <Card
                    key={`${video.sourceIdentifier}-${video.id}`}
                    onClick={() => handlePlay(video)}
                    className="flex flex-row items-center bg-slate-950 border-slate-800 hover:border-emerald-500/50 transition-all cursor-pointer overflow-hidden group shadow-lg h-24 sm:h-28"
                  >
                    <div className="relative aspect-video h-full flex-shrink-0 overflow-hidden bg-slate-900">
                      <img
                        src={video.image || "https://unsplash.com"}
                        alt={video.title}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>

                    <div className="flex flex-col justify-between h-full py-3 overflow-hidden flex-grow pl-4 pr-2">
                      <div className="overflow-hidden">
                        <h3 className="text-sm font-medium text-slate-200 truncate group-hover:text-emerald-400 transition-colors">
                          {video.title}
                        </h3>
                        <p className="text-xs text-slate-400 truncate mt-0.5">{video.author}</p>
                      </div>

                      <div className="flex items-center gap-2 mt-auto">
                        <span className="text-[10px] text-green-400 bg-green-950/20 border-green-900/50 font-medium px-2 py-0.5 rounded border uppercase tracking-wider">
                          {video.source}
                        </span>

                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${video.isPlaylist
                          ? "text-amber-400 bg-amber-950/20 border-amber-900/50"
                          : "text-blue-400 bg-blue-950/20 border-blue-900/50"
                          }`}>
                          {video.isPlaylist ? "Плейлист" : "Видео"}
                        </span>
                        {video.isPlaylist && (
                          <span className="text-[10px] bg-slate-900/90 border border-slate-800 font-medium px-2 py-0.5 rounded border uppercase tracking-wider">
                            Видео: {video.videoCount || 0}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 pr-4 pl-2 flex-shrink-0">
                      <button
                        onClick={(e) => handleShareToRoom(e, video)}
                        className="p-2 text-slate-500 hover:text-emerald-400 bg-slate-900/50 hover:bg-slate-900 border border-transparent hover:border-slate-800 rounded-lg transition-all"
                        title="Поделиться в совместный просмотр"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>

                      <div className="text-slate-600 group-hover:text-emerald-500 transition-colors">
                        <svg xmlns="http://w3.org" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                          <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
                        </svg>
                      </div>

                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              !isLoading && (
                <div className="text-center text-slate-500 mt-12 text-sm">
                  Введите запрос, чтобы начать поиск по площадкам.
                </div>
              )
            )}
          </div>
        )}

        {activeTab === "history" && (
          <div className="max-w-5xl w-full mx-auto">
            <h1 className="text-2xl font-bold text-white mb-4">История просмотров</h1>
            {videosHistory.length > 0 ? (
              <div className="flex flex-col gap-3 mt-2">
                {videosHistory.map((video) => (
                  <Card
                    key={`${video.sourceIdentifier}-${video.id}-history`}
                    onClick={() => handlePlay(video)}
                    className="flex flex-row items-center bg-slate-950 border-slate-800 hover:border-emerald-500/50 transition-all cursor-pointer overflow-hidden group shadow-lg h-24 sm:h-28"
                  >
                    <div className="relative aspect-video h-full flex-shrink-0 overflow-hidden bg-slate-900">
                      <img
                        src={video.image || "https://unsplash.com"}
                        alt={video.title}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>

                    <div className="flex flex-col justify-between h-full py-3 overflow-hidden flex-grow pl-4 pr-2">
                      <div className="overflow-hidden">
                        <h3 className="text-sm font-medium text-slate-200 truncate group-hover:text-emerald-400 transition-colors">
                          {video.title}
                        </h3>
                        <p className="text-xs text-slate-400 truncate mt-0.5">{video.author}</p>
                      </div>

                      <div className="flex items-center gap-2 mt-auto">
                        <span className="text-[10px] text-green-400 bg-green-950/20 border-green-900/50 font-medium px-2 py-0.5 rounded border uppercase tracking-wider">
                          {video.source}
                        </span>

                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${video.isPlaylist
                          ? "text-amber-400 bg-amber-950/20 border-amber-900/50"
                          : "text-blue-400 bg-blue-950/20 border-blue-900/50"
                          }`}>
                          {video.isPlaylist ? "Плейлист" : "Видео"}
                        </span>
                        {video.isPlaylist && (
                          <span className="text-[10px] bg-slate-900/90 border border-slate-800 font-medium px-2 py-0.5 rounded border uppercase tracking-wider">
                            Видео: {video.videoCount || 0}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 pr-4 pl-2 flex-shrink-0">

                      <button
                        onClick={(e) => handleShareToRoom(e, video)}
                        className="p-2 text-slate-500 hover:text-emerald-400 bg-slate-900/50 hover:bg-slate-900 border border-transparent hover:border-slate-800 rounded-lg transition-all"
                        title="Поделиться в совместный просмотр"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>

                      <div className="text-slate-600 group-hover:text-emerald-500 transition-colors">
                        <svg xmlns="http://w3.org" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                          <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
                        </svg>
                      </div>

                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-sm">Здесь будут отображаться запущенные ранее видео.</p>
            )}
          </div>
        )}

        {activeTab === "settings" && (
          <div className="max-w-5xl w-full mx-auto flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h1 className="text-2xl font-bold text-white">Настройки плеера</h1>
                <p className="text-slate-400 text-sm mt-1">Параметры запуска и конфигурация mpv.</p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleResetSettings}
                  disabled={isSaving}
                  variant="outline"
                  className="border-slate-800 bg-transparent text-slate-300 hover:bg-slate-900 hover:text-white flex items-center gap-2 cursor-pointer h-10"
                >
                  <RotateCcw className="w-4 h-4" />
                  Сбросить
                </Button>
                <Button
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white font-medium flex items-center gap-2 cursor-pointer h-10 min-w-[120px]"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Сохранение...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Сохранить
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-300">
                  Параметры запуска (аргументы командной строки)
                </label>
                <Input
                  type="text"
                  placeholder="Например, --fs --ontop --volume=50"
                  value={mpvArgs}
                  onChange={(e) => setMpvArgs(e.target.value)}
                  disabled={isSaving}
                  className="w-full bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 focus-visible:ring-emerald-500 h-10 font-mono text-sm"
                />
                <p className="text-xs text-slate-500">
                  Продвинутые пользователи могут указать необязательные параметры запуска для MPV через пробел.
                </p>
              </div>

              <div className="flex flex-col gap-4 mt-2">
                <label className="text-sm font-medium text-slate-300">
                  Поиск по площадкам
                </label>
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="youtube-enabled"
                    checked={youtubeEnabled}
                    onCheckedChange={(checked) => setYoutubeEnabled(!!checked)}
                    disabled={isSaving}
                    className="border-slate-700 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                  />
                  <label
                    htmlFor="cache-enabled"
                    className="text-sm font-medium text-slate-300 cursor-pointer select-none leading-none"
                  >
                    YouTube
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="hw-decoding"
                    checked={rutubeEnabled}
                    onCheckedChange={(checked) => setRutubeEnabled(!!checked)}
                    disabled={isSaving}
                    className="border-slate-700 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                  />
                  <label
                    htmlFor="hw-decoding"
                    className="text-sm font-medium text-slate-300 cursor-pointer select-none leading-none"
                  >
                    Rutube
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "dualMode" && (
          <div className="max-w-5xl w-full mx-auto flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Users className="w-6 h-6 text-emerald-500" />
                  Совместный просмотр
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                  Смотрите видео одновременно с друзьями и управляйте плеером синхронно.
                </p>
              </div>

              {currentRoom && (
                <Button
                  onClick={() => {
                    setCurrentRoom(null);
                  }}
                  variant="outline"
                  className="border-slate-800 bg-transparent text-rose-400 hover:bg-rose-950/20 hover:text-rose-300 border-rose-900/40 flex items-center gap-2 cursor-pointer h-10 transition"
                >
                  <LogOut className="w-4 h-4" />
                  Покинуть комнату
                </Button>
              )}
            </div>

            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Server className="w-4 h-4 text-slate-400" />
                  Адрес сервера синхронизации
                </label>
                <div className="flex items-center gap-3">
                  <Input
                    type="text"
                    placeholder="http://localhost:3000"
                    value={serverUrl}
                    onChange={(e) => handleServerUrlChange(e.target.value)}
                    disabled={!!currentRoom || isConnecting}
                    className="w-full bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 focus-visible:ring-emerald-500 h-10 font-mono text-sm disabled:opacity-50"
                  />
                  {serverUrl !== "http://localhost:3000" && !currentRoom && (
                    <Button
                      onClick={() => {
                        setServerUrl("http://localhost:3000");
                        localStorage.setItem("custom_sync_server", "http://localhost:3000");
                      }}
                      variant="outline"
                      className="border-slate-800 bg-transparent text-slate-400 hover:bg-slate-900 hover:text-white h-10 text-xs font-medium"
                    >
                      Сбросить
                    </Button>
                  )}
                </div>
              </div>

              {!currentRoom ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                  <div className="flex flex-col gap-3 p-5 bg-slate-950/40 border border-slate-800/80 rounded-xl justify-between">
                    <div className="flex flex-col gap-1">
                      <h3 className="text-sm font-semibold text-white">Стать хостом комнаты</h3>
                      <p className="text-xs text-slate-400 leading-normal">
                        Создайте новую сессию. Вы автоматически станете её владельцем и сможете пригласить друзей, передав им сгенерированный код.
                      </p>
                    </div>
                    <Button
                      onClick={handleCreateRoom}
                      disabled={isConnecting}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex items-center justify-center gap-2 cursor-pointer h-10 w-full mt-4"
                    >
                      {isConnecting ? "Подключение..." : "Создать новую комнату"}
                    </Button>
                  </div>

                  <div className="flex flex-col gap-3 p-5 bg-slate-950/40 border border-slate-800/80 rounded-xl justify-between">
                    <div className="flex flex-col gap-1">
                      <h3 className="text-sm font-semibold text-white">Присоединиться к сессии</h3>
                      <p className="text-xs text-slate-400 leading-normal">
                        Если ваш друг уже создал комнату совместного просмотра, введите полученный от него уникальный 5-значный код.
                      </p>
                    </div>

                    <div className="flex items-center gap-3 mt-4">
                      <Input
                        type="text"
                        maxLength={5}
                        placeholder="КОД"
                        value={inputCode}
                        onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                        disabled={isConnecting}
                        className="w-28 bg-slate-950 border-slate-800 text-emerald-400 placeholder:text-slate-700 focus-visible:ring-emerald-500 h-10 text-center font-mono font-bold tracking-widest text-base"
                      />
                      <Button
                        onClick={handleJoinRoom}
                        disabled={inputCode.length !== 5 || isConnecting}
                        className="flex-1 bg-slate-800 border border-slate-700 hover:bg-slate-700 active:bg-slate-800 text-slate-200 hover:text-white disabled:opacity-30 disabled:hover:bg-slate-800 font-medium h-10"
                      >
                        {isConnecting ? "Вход..." : "Войти по коду"}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-6 w-full mt-2">
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
                    <div className="text-left">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-900/50 rounded-full px-2.5 py-0.5 w-fit mb-1.5 select-none">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 anonymity animate-pulse" />
                        ПОДКЛЮЧЕНО К СЕССИИ
                      </div>
                      <p className="text-xs text-slate-400">Нажмите на код справа, чтобы скопировать его и отправить друзьям.</p>
                    </div>

                    <div
                      onClick={() => navigator.clipboard.writeText(currentRoom)}
                      className="text-2xl font-black text-emerald-400 tracking-widest select-all font-mono bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg py-2 px-5 cursor-pointer flex items-center gap-3 transition group"
                    >
                      {currentRoom}
                      <Copy className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 bg-slate-950/20 border border-slate-800 rounded-xl p-5">
                    <label className="text-sm font-medium text-slate-300">
                      Управление медиапотоком сессии
                    </label>

                    <div className="flex flex-col lg:flex-row gap-3">
                      <Input
                        type="text"
                        placeholder="Вставьте ссылку вручную или нажмите кнопку 'Поделиться' на карточке видео"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        className="flex-1 bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 focus-visible:ring-emerald-500 h-10 text-sm font-mono"
                      />

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          onClick={handleLaunchMpv}
                          disabled={!videoUrl.trim()}
                          variant="outline"
                          className="border-slate-800 bg-slate-900 text-slate-200 hover:bg-slate-800 hover:text-white flex items-center gap-2 h-10 px-4"
                          title="Открыть плеер MPV на своем компьютере"
                        >
                          <Play className="w-4 h-4 text-emerald-500 fill-emerald-500" />
                          Открыть MPV
                        </Button>

                        <Button
                          onClick={handleSendVideoToRoom}
                          disabled={!videoUrl.trim()}
                          className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white font-medium flex items-center gap-2 cursor-pointer h-10 px-5"
                        >
                          Синхронизировать у всех
                        </Button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 leading-normal">
                      Шаг 1: Нажмите <span className="text-slate-300 font-medium">«Синхронизировать у всех»</span>, чтобы отправить эту ссылку друзьям. <br />
                      Шаг 2: Каждый участник (включая вас) нажимает <span className="text-slate-300 font-medium">«Открыть MPV»</span> для запуска своего локального плеера.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
