import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RotateCcw, Save, Loader2, Settings } from "lucide-react";
import { MpvArgsCheckboxes } from "@/components/mpvArgs"; // Импортируем новый компонент

interface SettingsTabProps {
  mpvArgs: string;
  setMpvArgs: (val: string) => void;
  rutubeEnabled: boolean;
  setRutubeEnabled: (val: boolean) => void;
  youtubeEnabled: boolean;
  setYoutubeEnabled: (val: boolean) => void;
  isSaving: boolean;
  onSave: () => void;
  onReset: () => void;
}

export function SettingsTab({
  mpvArgs,
  setMpvArgs,
  rutubeEnabled,
  setRutubeEnabled,
  youtubeEnabled,
  setYoutubeEnabled,
  isSaving,
  onSave,
  onReset
}: SettingsTabProps) {
  return (
    <div className="max-w-5xl w-full mx-auto flex flex-col gap-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/[0.06] pb-6 gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 flex items-center gap-3 drop-shadow-[0_0_15px_rgba(45,212,191,0.3)]">
            <Settings className="w-8 h-8 text-teal-400" /> НАСТРОЙКИ СИСТЕМЫ
          </h1>
          <p className="text-slate-400 text-xs tracking-widest uppercase">Конфигурация параметров MPV и парсеров</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            onClick={onReset}
            disabled={isSaving}
            variant="outline"
            className="border-white/[0.08] bg-transparent text-slate-300 hover:bg-white/[0.03] hover:text-white flex items-center gap-2 cursor-pointer h-11 px-5 rounded-xl transition-all duration-300"
          >
            <RotateCcw className="w-4 h-4" />
            Сбросить
          </Button>
          <Button
            onClick={onSave}
            disabled={isSaving}
            className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 disabled:from-teal-800 disabled:to-blue-900 text-white font-bold flex items-center gap-2 cursor-pointer h-11 px-6 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:shadow-[0_0_30px_rgba(45,212,191,0.5)] active:scale-95"
          >
            {isSaving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Сохранение...</>
            ) : (
              <><Save className="w-4 h-4" /> Сохранить</>
            )}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-8 bg-white/[0.01] border border-white/[0.05] p-6 rounded-2xl backdrop-blur-md shadow-xl">
        <div className="flex flex-col gap-3">
          <label className="text-sm font-semibold text-slate-300 tracking-wide uppercase">
            Аргументы командной строки MPV
          </label>
          
          <Input
            type="text"
            placeholder="Например, --fs --ontop --volume=50"
            value={mpvArgs}
            onChange={(e) => setMpvArgs(e.target.value)}
            disabled={isSaving}
            className="w-full bg-black/40 border-white/[0.06] text-teal-300 placeholder:text-slate-600 focus-visible:ring-teal-500 focus-visible:border-teal-500/50 h-11 font-mono text-sm rounded-xl px-4 transition-all duration-300"
          />
          <p className="text-xs text-slate-500 leading-normal">
            Продвинутые параметры воспроизведения локального плеера. Будут добавлены к каждому запуску.
          </p>

          <div className="mt-4 border-t border-white/[0.04] pt-4">
            <span className="text-sm font-semibold text-slate-300 uppercase tracking-wider block mb-3">
              Быстрые настройки
            </span>
            <MpvArgsCheckboxes 
              mpvArgs={mpvArgs} 
              setMpvArgs={setMpvArgs} 
              disabled={isSaving} 
            />
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-white/[0.04] pt-6">
          <label className="text-sm font-semibold text-slate-300 tracking-wide uppercase">
            Источники поиска контента
          </label>
          
          <div className="flex flex-col gap-3">
            <div onClick={() => !isSaving && setYoutubeEnabled(!youtubeEnabled)} className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/[0.02] border border-transparent hover:border-white/[0.03] transition-all">
              <Checkbox
                id="youtube-enabled"
                checked={youtubeEnabled}
                onCheckedChange={(checked) => setYoutubeEnabled(!!checked)}
                disabled={isSaving}
                onClick={(e) => e.stopPropagation()} 
                className="border-white/[0.2] data-[state=checked]:bg-teal-500 data-[state=checked]:border-teal-500 data-[state=checked]:shadow-[0_0_12px_rgba(45,212,191,0.6)] h-6 w-6 rounded-md transition-all duration-300"
              />
              <label htmlFor="youtube-enabled" className="text-sm font-medium text-slate-200 cursor-pointer select-none">
                YouTube
              </label>
            </div>

            <div onClick={() => !isSaving && setRutubeEnabled(!rutubeEnabled)} className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/[0.02] border border-transparent hover:border-white/[0.03] transition-all">
              <Checkbox
                id="rutube-enabled"
                checked={rutubeEnabled}
                onCheckedChange={(checked) => setRutubeEnabled(!!checked)}
                disabled={isSaving}
                onClick={(e) => e.stopPropagation()} 
                className="border-white/[0.2] data-[state=checked]:bg-teal-500 data-[state=checked]:border-teal-500 data-[state=checked]:shadow-[0_0_12px_rgba(45,212,191,0.6)] h-6 w-6 rounded-md transition-all duration-300"
              />
              <label htmlFor="rutube-enabled" className="text-sm font-medium text-slate-200 cursor-pointer select-none">
                Rutube
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}