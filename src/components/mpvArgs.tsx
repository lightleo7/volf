import { Checkbox } from "@/components/ui/checkbox";

interface Preset {
  id: string;
  label: string;
  desc: string;
  flag: string;
}

const PRESETS: Preset[] = [
  {
    id: "immediate",
    label: "Мгновенный запуск",
    desc: "Открывает окно плеера сразу, не дожидаясь буферизации видео-потока",
    flag: "--force-window=immediate"
  },
  {
    id: "savePositionOnQuit",
    label: "Сохранять позицию при выходе",
    desc: "При выходе сохраняет текущее время и номера в плейлисте, при следующем запуске эти данные будут восстановлены",
    flag: "--save-position-on-quit"
  },
  {
    id: "hwdec",
    label: "Аппаратное ускорение",
    desc: "Снижает нагрузку на процессор, используя видеокарту (декодер auto-safe)",
    flag: "--hwdec=auto-safe"
  },
  {
    id: "ipv4",
    label: "Приоритет IPv4",
    desc: "Решает проблему зависания и долгого старта из-за таймаута DNS IPv6",
    flag: "--ytdl-raw-options-append=force-ipv4="
  },
  {
    id: "fullscreen",
    label: "Во весь экран",
    desc: "Запускает плеер сразу в полноэкранном режиме",
    flag: "--fullscreen"
  },
  {
    id: "ontop",
    label: "Поверх всех окон",
    desc: "Плеер закрепляется поверх браузера и других приложений",
    flag: "--ontop"
  },
  {
    id: "disableSSLcheck",
    label: "Отключить проверку SSL сертификата сайтов",
    desc: "Это полезно, если видеоплеер не может воспроизвести видео из-за устаревших или поврежденных корневых сертификатов в вашей системе, либо из-за сетевых экранов.",
    flag: "--ytdl-raw-options-append=no-check-certificates="
  }
];

interface MpvArgsCheckboxesProps {
  mpvArgs: string;
  setMpvArgs: (val: string) => void;
  disabled?: boolean;
}

export function MpvArgsCheckboxes({
  mpvArgs,
  setMpvArgs,
  disabled = false
}: MpvArgsCheckboxesProps) {
  
  const getArgsArray = (str: string): string[] => {
    return str.split(/\s+/).filter(Boolean);
  };

  const handleToggle = (flag: string) => {
    const currentArgs = getArgsArray(mpvArgs);

    if (currentArgs.includes(flag)) {
      const updatedArgs = currentArgs.filter((arg) => arg !== flag);
      setMpvArgs(updatedArgs.join(" "));
    } else {
      currentArgs.push(flag);
      setMpvArgs(currentArgs.join(" "));
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      {PRESETS.map((preset) => {
        const isChecked = getArgsArray(mpvArgs).includes(preset.flag);

        return (
          <div
            key={preset.id}
            onClick={() => !disabled && handleToggle(preset.flag)}
            className={`flex items-start space-x-3 p-4 rounded-xl border transition-all duration-300 cursor-pointer select-none ${
              isChecked
                ? "bg-teal-500/10 border-teal-500/30 shadow-[0_0_15px_rgba(45,212,191,0.05)]"
                : "bg-black/30 border-white/[0.04] hover:border-white/[0.1] hover:bg-white/[0.01]"
            }`}
          >
            <Checkbox
              id={`preset-${preset.id}`}
              checked={isChecked}
              onCheckedChange={() => handleToggle(preset.flag)}
              disabled={disabled}
              className="border-white/[0.2] data-[state=checked]:bg-teal-500 data-[state=checked]:border-teal-500 data-[state=checked]:shadow-[0_0_12px_rgba(45,212,191,0.6)] h-5 w-5 rounded-md mt-0.5 transition-all duration-300"
            />
            <div className="flex flex-col gap-0.5">
              <label
                htmlFor={`preset-${preset.id}`}
                className="text-sm font-semibold text-slate-200 cursor-pointer"
                onClick={(e) => e.preventDefault()}
              >
                {preset.label}
              </label>
              <span className="text-xs text-slate-400 leading-snug">
                {preset.desc}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}