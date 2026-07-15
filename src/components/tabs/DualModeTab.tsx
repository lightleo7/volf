import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Server, LogOut, Copy, Play } from "lucide-react";

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
    <div className="max-w-5xl w-full mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-500" /> Совместный просмотр
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Смотрите видео одновременно с друзьями и управляйте плеером синхронно.
          </p>
        </div>

        {currentRoom && (
          <Button
            onClick={onLeaveRoom}
            variant="outline"
            className="border-slate-800 bg-transparent text-rose-400 hover:bg-rose-950/20 hover:text-rose-300 border-rose-900/40 flex items-center gap-2 cursor-pointer h-10 transition"
          >
            <LogOut className="w-4 h-4" /> Покинуть комнату
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
            <Server className="w-4 h-4 text-slate-400" /> Адрес сервера синхронизации
          </label>
          <div className="flex items-center gap-3">
            <Input
              type="text"
              placeholder="http://localhost:3000"
              value={serverUrl}
              onChange={(e) => onServerUrlChange(e.target.value)}
              disabled={!!currentRoom || isConnecting}
              className="w-full bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 h-10 font-mono text-sm"
            />
          </div>
        </div>

        {!currentRoom ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
            <div className="flex flex-col gap-3 p-5 bg-slate-950/40 border border-slate-800/80 rounded-xl justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Стать хостом комнаты</h3>
                <p className="text-xs text-slate-400 mt-1">Создайте новую сессию и пригласите друзей.</p>
              </div>
              <Button onClick={onCreateRoom} disabled={isConnecting} className="bg-emerald-600 mt-4 w-full h-10">
                {isConnecting ? "Подключение..." : "Создать новую комнату"}
              </Button>
            </div>

            <div className="flex flex-col gap-3 p-5 bg-slate-950/40 border border-slate-800/80 rounded-xl justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Присоединиться к сессии</h3>
                <p className="text-xs text-slate-400 mt-1">Введите уникальный 5-значный код друга.</p>
              </div>
              <div className="flex items-center gap-3 mt-4">
                <Input
                  type="text"
                  maxLength={5}
                  placeholder="КОД"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  className="w-28 bg-slate-950 text-center font-mono font-bold tracking-widest text-emerald-400"
                />
                <Button onClick={onJoinRoom} disabled={inputCode.length !== 5 || isConnecting} className="flex-1 h-10">
                  {isConnecting ? "Вход..." : "Войти по коду"}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6 w-full mt-2">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <div className="text-xs font-bold text-emerald-400 bg-emerald-950/50 rounded-full px-2.5 py-0.5 w-fit">
                  ПОДКЛЮЧЕНО К СЕССИИ
                </div>
              </div>
              <div
                onClick={() => navigator.clipboard.writeText(currentRoom)}
                className="text-2xl font-black text-emerald-400 tracking-widest font-mono bg-slate-900 border rounded-lg py-2 px-5 cursor-pointer flex items-center gap-3"
              >
                {currentRoom}
                <Copy className="w-4 h-4 text-slate-500" />
              </div>
            </div>

            <div className="flex flex-col gap-3 bg-slate-950/20 border border-slate-800 rounded-xl p-5">
              <Input
                type="text"
                placeholder="Вставьте ссылку"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full bg-slate-950 font-mono text-sm"
              />
              <div className="flex gap-2">
                <Button onClick={onLaunchMpv} disabled={!videoUrl.trim()} variant="outline" className="h-10">
                  <Play className="w-4 h-4 text-emerald-500 mr-2" /> Открыть MPV
                </Button>
                <Button onClick={onSendVideo} disabled={!videoUrl.trim()} className="bg-emerald-600 h-10">
                  Синхронизировать у всех
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}