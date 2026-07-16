import { useState } from "react";
import { VideoItem } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tv, Loader2, Share2, Play } from "lucide-react";
import { search } from "@/services/parsers/parsers";

interface SearchTabProps {
  onPlay: (video: VideoItem) => void;
  onShare: (video: VideoItem) => void;
}

export function SearchTab({ onPlay, onShare }: SearchTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="flex flex-col gap-8 max-w-5xl w-full mx-auto animate-fade-in">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400 flex items-center gap-3 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">
          <Tv className="w-8 h-8 text-emerald-400 animate-pulse" /> ПОИСК ВИДЕО
        </h1>
        <p className="text-slate-400 text-xs tracking-widest uppercase">Поток медиа-контента из облака</p>
      </div>

      <div className="relative group flex items-center gap-3 p-2 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl shadow-2xl transition-all duration-300 focus-within:border-emerald-500/50 focus-within:shadow-[0_0_30px_rgba(16,185,129,0.15)]">
        <Input
          type="text"
          placeholder="Что хотите посмотреть сегодня?"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          className="bg-transparent border-0 text-slate-100 placeholder:text-slate-500 focus-visible:ring-0 focus-visible:ring-offset-0 h-12 text-base flex-1 pl-4"
        />
        <Button
          onClick={handleSearch}
          disabled={isLoading}
          className="relative overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold px-8 h-12 rounded-xl transition-all duration-300 cursor-pointer flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(52,211,153,0.5)] active:scale-95"
        >
          {isLoading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> ПОИСК...</>
          ) : (
            "НАЙТИ"
          )}
        </Button>
      </div>

      {videos.length > 0 ? (
        <div className="flex flex-col gap-4 mt-2">
          {videos.map((video) => (
            <Card
              key={`${video.sourceIdentifier}-${video.id}`}
              onClick={() => onPlay(video)}
              className="group relative flex flex-row items-center bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.05] hover:border-emerald-500/40 transition-all duration-500 cursor-pointer overflow-hidden rounded-2xl shadow-xl hover:shadow-[0_0_25px_rgba(16,185,129,0.12)] h-28"
            >
              <div className="relative aspect-video h-full flex-shrink-0 overflow-hidden bg-slate-950">
                <img
                  src={video.image || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400"}
                  alt={video.title}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
              </div>

              <div className="flex flex-col justify-between h-full py-4 overflow-hidden flex-grow pl-5 pr-2">
                <div className="overflow-hidden">
                  <h3 className="text-base font-semibold text-slate-200 truncate group-hover:text-emerald-300 transition-colors duration-300">
                    {video.title}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium truncate mt-1">{video.author}</p>
                </div>

                <div className="flex items-center gap-2 mt-auto">
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/30 border-emerald-500/30 font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-widest shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                    {video.source}
                  </span>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-widest ${
                    video.isPlaylist
                      ? "text-amber-400 bg-amber-950/30 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.1)]"
                      : "text-indigo-400 bg-indigo-950/30 border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.1)]"
                  }`}>
                    {video.isPlaylist ? "Плейлист" : "Видео"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 pr-6 pl-2 flex-shrink-0 z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onShare(video);
                  }}
                  className="p-3 text-slate-400 hover:text-emerald-400 bg-white/[0.02] hover:bg-emerald-500/10 border border-white/[0.04] hover:border-emerald-500/30 rounded-xl transition-all duration-300 shadow-md hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                  title="Поделиться в совместный просмотр"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                <div className="p-3 rounded-full bg-white/[0.02] group-hover:bg-emerald-500/20 border border-white/[0.04] group-hover:border-emerald-500/40 text-slate-400 group-hover:text-emerald-400 transition-all duration-300 shadow-md group-hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                  <Play className="w-5 h-5 fill-current" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        !isLoading && (
          <div className="text-center text-slate-500 mt-20 text-sm tracking-wide bg-white/[0.01] border border-white/[0.02] py-12 rounded-2xl">
            Введите поисковый запрос выше, чтобы запустить сканирование медиа-пространства.
          </div>
        )
      )}
    </div>
  );
}