import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface PresetOption {
  label: string;
  value: string;
}

interface Preset {
  id: string;
  label: string;
  desc: string;
  flag?: string;
  type?: "select" | "input";
  options?: PresetOption[];
  placeholder?: string;
  matchPattern?: RegExp;
  buildFlag?: (value: string) => string;
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
    desc: "При выходе сохраняет текущее время и номер серии в плейлисте",
    flag: "--save-position-on-quit"
  },
  {
    id: "hwdec",
    label: "Аппаратное ускорение",
    desc: "Снижает нагрузку на процессор, используя видеокарту",
    flag: "--hwdec=auto-safe"
  },
  {
    id: "ipv4",
    label: "Приоритет IPv4",
    desc: "Решает проблему зависания и долгого старта из-за таймаута DNS IPv6",
    flag: "--ytdl-raw-options-append=force-ipv4="
  },
  {
    id: "quality",
    label: "Ограничение качества",
    desc: "Максимальное разрешение воспроизводимого видео (высокие значения могут вызвать подвисания на слабых устройствах)",
    type: "select",
    matchPattern: /--ytdl-format="?bestvideo\[height<=\d+\]\+bestaudio\/best"?/,
    buildFlag: (height) => `--ytdl-format=bestvideo[height<=${height}]+bestaudio/best`,
    options: [
      { label: "4320p (8K)", value: "4320" },
      { label: "2160p (4K / UltraHD)", value: "2160" },
      { label: "1440p (2K)", value: "1440" },
      { label: "1080p (Full HD)", value: "1080" },
      { label: "720p (HD)", value: "720" },
      { label: "480p", value: "480" },
      { label: "360p", value: "360" },
      { label: "240p", value: "240" },
      { label: "144p", value: "144" }
    ]
  },
  {
    id: "proxy",
    label: "HTTP/SOCKS Прокси",
    desc: "Маршрутизация трафика (например, http://127.0.0.1:10809 или socks5://127.0.0.1:1080)",
    type: "input",
    matchPattern: /--ytdl-raw-options-append=proxy=[^\s]+/,
    buildFlag: (url) => `--ytdl-raw-options-append=proxy=${url}`,
    placeholder: "http://127.0.0.1:10809"
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
    label: "Отключить проверку SSL",
    desc: "Полезно при проблемах с сертификатами или сетевых экранах",
    flag: "--ytdl-raw-options-append=no-check-certificates="
  },
  {
    id: "disableConf",
    label: "Отключить mpv.conf",
    desc: "Отключает загрузку конфига из mpv.conf, если он настроен",
    flag: "--no-config"
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

  const getPresetState = (preset: Preset): { isChecked: boolean; value: string } => {
    if (preset.flag) {
      return { isChecked: mpvArgs.includes(preset.flag), value: "" };
    }

    if (preset.matchPattern) {
      const match = mpvArgs.match(preset.matchPattern);
      if (match) {
        const fullMatch = match[0];
        if (preset.id === "quality") {
          const height = fullMatch.match(/height<=(\d+)/)?.[1] || "1080";
          return { isChecked: true, value: height };
        }
        if (preset.id === "proxy") {
          const url = fullMatch.split("proxy=")[1] || "";
          return { isChecked: true, value: url };
        }
      }
    }

    return { isChecked: false, value: "" };
  };

  const toggleStaticFlag = (flag: string) => {
    const argsArray = mpvArgs.split(/\s+/).filter(Boolean);
    if (argsArray.includes(flag)) {
      setMpvArgs(argsArray.filter((a) => a !== flag).join(" "));
    } else {
      argsArray.push(flag);
      setMpvArgs(argsArray.join(" "));
    }
  };

  const toggleDynamicPreset = (preset: Preset) => {
    const { isChecked } = getPresetState(preset);
    let newArgs = mpvArgs;

    if (preset.matchPattern) {
      newArgs = newArgs.replace(preset.matchPattern, "").replace(/\s+/g, " ").trim();
    }

    if (!isChecked) {
      const defaultValue = preset.options ? preset.options[3].value : (preset.placeholder || "http://127.0.0.1:10809");
      if (preset.buildFlag) {
        const flag = preset.buildFlag(defaultValue);
        newArgs = newArgs ? `${newArgs} ${flag}` : flag;
      }
    }

    setMpvArgs(newArgs);
  };

  const updateDynamicValue = (preset: Preset, newValue: string) => {
    let newArgs = mpvArgs;

    if (preset.matchPattern) {
      newArgs = newArgs.replace(preset.matchPattern, "").replace(/\s+/g, " ").trim();
    }

    if (newValue.trim() && preset.buildFlag) {
      const flag = preset.buildFlag(newValue.trim());
      newArgs = newArgs ? `${newArgs} ${flag}` : flag;
    }

    setMpvArgs(newArgs);
  };

  const handleCardClick = (preset: Preset) => {
    if (disabled) return;
    if (preset.flag) {
      toggleStaticFlag(preset.flag);
    } else {
      toggleDynamicPreset(preset);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      {PRESETS.map((preset) => {
        const { isChecked, value } = getPresetState(preset);

        return (
          <div
            key={preset.id}
            onClick={() => handleCardClick(preset)}
            className={`flex flex-col gap-3 p-4 rounded-xl border transition-all duration-300 cursor-pointer select-none ${
              isChecked
                ? "bg-teal-500/10 border-teal-500/30 shadow-[0_0_15px_rgba(45,212,191,0.05)]"
                : "bg-black/30 border-white/[0.04] hover:border-white/[0.1] hover:bg-white/[0.01]"
            }`}
          >
            <div className="flex items-start space-x-3">
              <Checkbox
                id={`preset-${preset.id}`}
                checked={isChecked}
                onCheckedChange={() => handleCardClick(preset)}
                disabled={disabled}
                onClick={(e) => e.stopPropagation()}
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

            {isChecked && preset.type === "select" && preset.options && (
              <div
                className="pl-7 flex items-center gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                <select
                  value={value || preset.options[0].value}
                  onChange={(e) => updateDynamicValue(preset, e.target.value)}
                  disabled={disabled}
                  className="bg-black/60 border border-white/[0.1] text-teal-300 w-full text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-teal-500/50 cursor-pointer transition-all"
                >
                  {preset.options.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-200">
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {isChecked && preset.type === "input" && (
              <div
                className="pl-8 pt-1"
                onClick={(e) => e.stopPropagation()}
              >
                <Input
                  type="text"
                  placeholder={preset.placeholder}
                  value={value}
                  onChange={(e) => updateDynamicValue(preset, e.target.value)}
                  disabled={disabled}
                  className="h-8 bg-black/60 border-white/[0.1] text-teal-300 placeholder:text-slate-600 focus-visible:ring-teal-500 text-xs rounded-lg font-mono px-3 cursor-text"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}