import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RotateCcw, Save, Loader2 } from "lucide-react";

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
    <div className="max-w-5xl w-full mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Настройки плеера</h1>
          <p className="text-slate-400 text-sm mt-1">Параметры запуска и конфигурация mpv.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={onReset}
            disabled={isSaving}
            variant="outline"
            className="border-slate-800 bg-transparent text-slate-300 hover:bg-slate-900 hover:text-white flex items-center gap-2 cursor-pointer h-10"
          >
            <RotateCcw className="w-4 h-4" />
            Сбросить
          </Button>
          <Button
            onClick={onSave}
            disabled={isSaving}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white font-medium flex items-center gap-2 cursor-pointer h-10 min-w-[120px]"
          >
            {isSaving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Сохранение...</>
            ) : (
              <><Save className="w-4 h-4" /> Сохранить</>
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
        </div>

        <div className="flex flex-col gap-4 mt-2">
          <label className="text-sm font-medium text-slate-300">Поиск по площадкам</label>
          <div className="flex items-center space-x-3">
            <Checkbox
              id="youtube-enabled"
              checked={youtubeEnabled}
              onCheckedChange={(checked) => setYoutubeEnabled(!!checked)}
              disabled={isSaving}
            />
            <label htmlFor="youtube-enabled" className="text-sm font-medium text-slate-300 cursor-pointer">
              YouTube
            </label>
          </div>
          <div className="flex items-center space-x-3">
            <Checkbox
              id="rutube-enabled"
              checked={rutubeEnabled}
              onCheckedChange={(checked) => setRutubeEnabled(!!checked)}
              disabled={isSaving}
            />
            <label htmlFor="rutube-enabled" className="text-sm font-medium text-slate-300 cursor-pointer">
              Rutube
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}