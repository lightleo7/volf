import { useEffect, useState } from "react";
import { VideoItem } from "@/types";
import { Card } from "@/components/ui/card";
import { getHistory } from "@/utils/config";
import { Share2 } from "lucide-react";

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
    <div className="max-w-5xl w-full mx-auto">
      <h1 className="text-2xl font-bold text-white mb-4">История просмотров</h1>
      {videosHistory.length > 0 ? (
        <div className="flex flex-col gap-3 mt-2">
          {videosHistory.map((video) => (
            <Card
              key={`${video.sourceIdentifier}-${video.id}-history`}
              onClick={() => onPlay(video)}
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
                </div>
              </div>

              <div className="flex items-center gap-1.5 pr-4 pl-2 flex-shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onShare(video);
                  }}
                  className="p-2 text-slate-500 hover:text-emerald-400 bg-slate-900/50 hover:bg-slate-900 border border-transparent hover:border-slate-800 rounded-lg transition-all"
                  title="Поделиться в совместный просмотр"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <div className="text-slate-600 group-hover:text-emerald-500 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
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
  );
}