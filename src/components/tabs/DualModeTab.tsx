import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Server, LogOut, Copy, Play, ArrowRight } from "lucide-react";

interface DualModeTabProps {
  serverUrl: string;
  currentRoom: string | null;
  inputCode: string;
  videoUrl: string;
  isConnecting: boolean;
  setInputCode: (val: string) => void;
  setVideoUrl: (val: string) => void;
  onServerUrlChange: (url: string) => void;
  onCreateRoom: () => void;
  onJoinRoom: () => void;
  onLaunchMpv: () => void;
  onSendVideo: () => void;
  onLeaveRoom: () => void;
}

export function DualModeTab({
  serverUrl,
  currentRoom,
  inputCode,
  videoUrl,
  isConnecting,
  setInputCode,
  setVideoUrl,
  onServerUrlChange,
  onCreateRoom,
  onJoinRoom,
  onLaunchMpv,
  onSendVideo,
  onLeaveRoom,
}: DualModeTabProps) {
  return (
    <div className="max-w-5xl w-full mx-auto flex flex-col gap-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/[0.06] pb-6 gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 flex items-center gap-3 drop-shadow-[0_0_15px_rgba(168,85,247,0.3)]">
            <Users className="w-8 h-8 text-purple-400" /> СОВМЕСТНЫЙ ПРОСМОТР
          </h1>
          <p className="text-slate-400 text-xs tracking-widest uppercase">Синхронизация медиаплееров в реальном времени</p>
        </div>

        {currentRoom && (
          <Button
            onClick={onLeaveRoom}
            variant="outline"
            className="border-rose-900/40 bg-rose-950/10 text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 hover:border-rose-500/40 flex items-center gap-2 cursor-pointer h-11 px-5 rounded-xl transition-all duration-300"
          >
            <LogOut className="w-4 h-4" /> Покинуть комнату
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-6">
        {/* Сервер */}
        <div className="flex flex-col gap-3 bg-white/[0.01] border border-white/[0.04] p-5 rounded-2xl backdrop-blur-sm">
          <label className="text-xs font-bold text-slate-400 tracking-widest uppercase flex items-center gap-2">
            <Server className="w-4 h-4 text-purple-400" /> Хостинг-Сервер синхронизации
          </label>
          <div className="flex items-center gap-3">
            <Input
              type="text"
              placeholder="http://localhost:3000"
              value={serverUrl}
              onChange={(e) => onServerUrlChange(e.target.value)}
              disabled={!!currentRoom || isConnecting}
              className="w-full bg-black/40 border-white/[0.06] text-purple-300 placeholder:text-slate-700 h-11 font-mono text-sm rounded-xl px-4"
            />
          </div>
        </div>

        {!currentRoom ? (
          /* Две интерактивные карты с эффектом свечения */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Создание комнаты */}
            <div className="group flex flex-col gap-4 p-6 bg-gradient-to-b from-white/[0.02] to-transparent border border-white/[0.05] hover:border-purple-500/30 rounded-2xl justify-between transition-all duration-500 hover:shadow-[0_0_30px_rgba(168,85,247,0.1)]">
              <div className="flex flex-col gap-1.5">
                <h3 className="text-lg font-bold text-slate-100 group-hover:text-purple-300 transition-colors">Создать сессию просмотра</h3>
                <p className="text-xs text-slate-400 leading-relaxed">Создайте выделенную комнату для просмотра. Вы станете хостом и сможете раздать пригласительный код друзьям.</p>
              </div>
              <Button
                onClick={onCreateRoom}
                disabled={isConnecting}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold h-11 w-full rounded-xl transition-all duration-300 shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_25px_rgba(168,85,247,0.5)] cursor-pointer mt-4"
              >
                {isConnecting ? "ПОДКЛЮЧЕНИЕ..." : "ЗАПУСТИТЬ КОМНАТУ"}
              </Button>
            </div>

            {/* Подключение по коду */}
            <div className="group flex flex-col gap-4 p-6 bg-gradient-to-b from-white/[0.02] to-transparent border border-white/[0.05] hover:border-pink-500/30 rounded-2xl justify-between transition-all duration-500 hover:shadow-[0_0_30px_rgba(244,63,94,0.1)]">
              <div className="flex flex-col gap-1.5">
                <h3 className="text-lg font-bold text-slate-100 group-hover:text-pink-300 transition-colors">Присоединиться к другу</h3>
                <p className="text-xs text-slate-400 leading-relaxed">Если сессия уже запущена вашим другом, введите предоставленный им 5-значный уникальный ключ доступа.</p>
              </div>
              <div className="flex items-center gap-3 mt-4">
                <Input
                  type="text"
                  maxLength={5}
                  placeholder="КОД"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  disabled={isConnecting}
                  className="w-32 bg-black/50 border-white/[0.08] text-pink-400 placeholder:text-slate-800 focus-visible:ring-pink-500 focus-visible:border-pink-500/50 h-11 text-center font-mono font-extrabold tracking-widest text-lg rounded-xl transition-all"
                />
                <Button
                  onClick={onJoinRoom}
                  disabled={inputCode.length !== 5 || isConnecting}
                  className="flex-1 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-pink-500/30 text-slate-300 hover:text-white font-bold h-11 rounded-xl transition-all"
                >
                  {isConnecting ? "ВХОД..." : "ВОЙТИ"}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Интерфейс внутри комнаты */
          <div className="flex flex-col gap-6 w-full animate-fade-in">
            {/* Огромная светящаяся карточка с кодом */}
            <div className="bg-gradient-to-r from-purple-950/20 via-black/40 to-indigo-950/20 border border-purple-500/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl backdrop-blur-md">
              <div className="text-left flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-[10px] font-extrabold text-emerald-400 bg-emerald-950/50 border border-emerald-500/30 rounded-full px-3 py-1 w-fit select-none shadow-[0_0_15px_rgba(52,211,153,0.15)] animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  ПОДКЛЮЧЕНО К СЕССИИ
                </div>
                <p className="text-xs text-slate-400 font-medium">Кликните на код справа, чтобы скопировать ключ друзьям.</p>
              </div>

              <div
                onClick={() => navigator.clipboard.writeText(currentRoom)}
                className="text-3xl font-black text-purple-300 tracking-widest select-all font-mono bg-purple-950/20 hover:bg-purple-950/40 border border-purple-500/30 hover:border-purple-400/60 rounded-xl py-3 px-8 cursor-pointer flex items-center gap-4 transition-all duration-300 group shadow-[0_0_25px_rgba(168,85,247,0.15)] hover:shadow-[0_0_35px_rgba(168,85,247,0.3)] hover:scale-105 active:scale-95"
              >
                {currentRoom}
                <Copy className="w-5 h-5 text-slate-500 group-hover:text-purple-400 transition-colors" />
              </div>
            </div>

            {/* Контроль потока */}
            <div className="flex flex-col gap-4 bg-white/[0.01] border border-white/[0.05] rounded-2xl p-6 shadow-xl">
              <label className="text-sm font-semibold text-slate-300 tracking-wide uppercase">
                Транслировать медиапоток
              </label>

              <div className="flex flex-col lg:flex-row gap-4">
                <Input
                  type="text"
                  placeholder="Вставьте ссылку на Rutube/YouTube"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="flex-1 bg-black/40 border-white/[0.06] text-purple-300 placeholder:text-slate-700 focus-visible:ring-purple-500 focus-visible:border-purple-500/40 h-11 text-sm font-mono rounded-xl px-4 transition-all"
                />

                <div className="flex items-center gap-3 flex-shrink-0">
                  <Button
                    onClick={onLaunchMpv}
                    disabled={!videoUrl.trim()}
                    variant="outline"
                    className="border-white/[0.06] bg-white/[0.02] text-slate-200 hover:bg-white/[0.06] hover:text-white flex items-center gap-2 h-11 px-5 rounded-xl transition-all"
                    title="Запустить локальный MPV"
                  >
                    <Play className="w-4 h-4 text-purple-400 fill-purple-400" />
                    Запустить MPV
                  </Button>

                  <Button
                    onClick={onSendVideo}
                    disabled={!videoUrl.trim()}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold flex items-center gap-2 cursor-pointer h-11 px-6 rounded-xl transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_25px_rgba(168,85,247,0.5)]"
                  >
                    Синхронизировать
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="text-xs text-slate-500 leading-relaxed bg-white/[0.01] border border-white/[0.02] p-4 rounded-xl mt-2">
                <span className="text-purple-400 font-bold">1 шаг:</span> Вставьте линк и зажмите <span className="text-slate-300 font-semibold">«Синхронизировать»</span>, чтобы отправить медиасессию всем подключившимся. <br />
                <span className="text-purple-400 font-bold">2 шаг:</span> Нажмите <span className="text-slate-300 font-semibold">«Запустить MPV»</span>, чтобы открыть ваш локальный плеер и начать совместный сеанс!
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}