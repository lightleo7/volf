import { useState, useEffect } from "react";
import { ActiveTab, VideoItem } from "@/types";
import { Layout } from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Tv, Loader2, Save, RotateCcw } from "lucide-react";
import { search } from "@/services/parsers/parsers";
import { openInMpv } from "@/utils/player";
import { addToHistory, getHistory, saveSettings, getSettings, resetSettings, getSearchSettings, saveSearchSettings } from "@/utils/config";

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

                    <div className="pr-4 pl-2 flex items-center justify-center text-slate-600 group-hover:text-emerald-500 transition-colors flex-shrink-0">
                      <svg xmlns="http://w3.org" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
                      </svg>
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

                    <div className="pr-4 pl-2 flex items-center justify-center text-slate-600 group-hover:text-emerald-500 transition-colors flex-shrink-0">
                      <svg xmlns="http://w3.org" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
                      </svg>
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
          <div className="max-w-5xl w-full mx-auto">
            <h1 className="text-2xl font-bold text-white mb-4">Совместный просмотр</h1>
            <p className="text-slate-400 text-sm">Пока еще в разработке)</p>
          </div>
        )}

      </div>
    </Layout>
  );
}
