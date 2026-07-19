import { useEffect, useState } from "react";
import { VideoItem } from "@/types";
import { Card } from "@/components/ui/card";
import { getHistory } from "@/utils/config";
import { Share2, Play, History } from "lucide-react";

interface HistoryTabProps {
  onPlay: (video: VideoItem) => void;
  onShare: (video: VideoItem) => void;
}

export function HistoryTab({ onPlay, onShare }: HistoryTabProps) {
  const [videosHistory, setVideosHistory] = useState<VideoItem[]>([]);

  useEffect(() => {
    const loadHistory = async () => {
      const historyData = await getHistory();
      setVideosHistory(historyData);
    };
    loadHistory();
  }, []);

  return (
    <div className="max-w-5xl w-full mx-auto flex flex-col gap-8 animate-fade-in">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 flex items-center gap-3 drop-shadow-[0_0_15px_rgba(168,85,247,0.3)]">
          <History className="w-8 h-8 text-violet-400" /> ИСТОРИЯ ПРОСМОТРОВ
        </h1>
        <p className="text-slate-400 text-xs tracking-widest uppercase">Список ранее запущенных медиапотоков</p>
      </div>

      {videosHistory.length > 0 ? (
        <div className="flex flex-col gap-4 mt-2">
          {videosHistory.map((video) => (
            <Card
              key={`${video.sourceIdentifier}-${video.id}-history`}
              onClick={() => onPlay(video)}
              className="group relative flex flex-row items-center bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.05] hover:border-violet-500/40 transition-all duration-500 cursor-pointer overflow-hidden rounded-2xl shadow-xl hover:shadow-[0_0_25px_rgba(168,85,247,0.12)] h-28"
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
                  <h3 className="text-base font-semibold text-slate-200 truncate group-hover:text-violet-300 transition-colors duration-300">
                    {video.title}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium truncate mt-1">{video.author}</p>
                </div>

                <div className="flex items-center gap-2 mt-auto">
                  <span className="text-[10px] text-violet-400 bg-violet-950/30 border-violet-500/30 font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-widest">
                    {video.source}
                  </span>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-widest ${
                    video.isPlaylist ? "text-amber-400 bg-amber-950/30 border-amber-500/30" : "text-indigo-400 bg-indigo-950/30 border-indigo-500/30"
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
                  className="p-3 text-slate-400 hover:text-violet-400 bg-white/[0.02] hover:bg-violet-500/10 border border-white/[0.04] hover:border-violet-500/30 rounded-xl transition-all duration-300 shadow-md hover:shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                  title="Поделиться в совместный просмотр"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                <div className="p-3 rounded-full bg-white/[0.02] group-hover:bg-violet-500/20 border border-white/[0.04] group-hover:border-violet-500/40 text-slate-400 group-hover:text-violet-400 transition-all duration-300 shadow-md group-hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                  <Play className="w-5 h-5 fill-current" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center text-slate-500 text-sm tracking-wide bg-white/[0.01] border border-white/[0.02] py-12 rounded-2xl">
          Здесь будут отображаться запущенные ранее видео.
        </div>
      )}
    </div>
  );
}