import { useState, useEffect } from "react";
import {
  getSettings,
  saveSettings,
  resetSettings,
  getSearchSettings,
  saveSearchSettings
} from "@/utils/config";

export function useSettings() {
  const [mpvArgs, setMpvArgs] = useState("");
  const [rutubeEnabled, setRutubeEnabled] = useState(true);
  const [youtubeEnabled, setYoutubeEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await saveSettings({ mpvArgs });
      await saveSearchSettings({
        rutube: rutubeEnabled,
        youtube: youtubeEnabled
      });
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

  return {
    mpvArgs,
    setMpvArgs,
    rutubeEnabled,
    setRutubeEnabled,
    youtubeEnabled,
    setYoutubeEnabled,
    isSaving,
    handleSaveSettings,
    handleResetSettings,
  };
}