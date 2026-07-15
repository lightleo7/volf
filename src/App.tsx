import { useState } from "react";
import { ActiveTab, VideoItem } from "@/types";
import { Layout } from "@/components/Layout";
import { openInMpv } from "@/utils/player";
import { addToHistory } from "@/utils/config";

// Хуки
import { useSettings } from "@/hooks/useSettings";
import { useMpvSync } from "@/hooks/useMpvSync";

// Компоненты вкладок
import { SearchTab } from "@/components/tabs/SearchTab";
import { HistoryTab } from "@/components/tabs/HistoryTab";
import { SettingsTab } from "@/components/tabs/SettingsTab";
import { DualModeTab } from "@/components/tabs/DualModeTab";

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("search");

  // Подключаем логику настроек
  const settings = useSettings();

  // Подключаем логику синхронизации, передавая актуальные аргументы MPV
  const sync = useMpvSync(settings.mpvArgs);

  const handlePlay = async (video: VideoItem) => {
    await openInMpv(video.url);
    await addToHistory(video);
  };

  const handleShareToRoom = (video: VideoItem) => {
    sync.setVideoUrl(video.url);
    setActiveTab("dualMode");
  };

  return (
    <Layout currentTab={activeTab} onTabChange={setActiveTab}>
      <div className="p-6 flex flex-col h-full overflow-y-auto">
        {activeTab === "search" && (
          <SearchTab onPlay={handlePlay} onShare={handleShareToRoom} />
        )}

        {activeTab === "history" && (
          <HistoryTab onPlay={handlePlay} onShare={handleShareToRoom} />
        )}

        {activeTab === "settings" && (
          <SettingsTab
            mpvArgs={settings.mpvArgs}
            setMpvArgs={settings.setMpvArgs}
            rutubeEnabled={settings.rutubeEnabled}
            setRutubeEnabled={settings.setRutubeEnabled}
            youtubeEnabled={settings.youtubeEnabled}
            setYoutubeEnabled={settings.setYoutubeEnabled}
            isSaving={settings.isSaving}
            onSave={settings.handleSaveSettings}
            onReset={settings.handleResetSettings}
          />
        )}

        {activeTab === "dualMode" && (
          <DualModeTab
            serverUrl={sync.serverUrl}
            currentRoom={sync.currentRoom}
            inputCode={sync.inputCode}
            videoUrl={sync.videoUrl}
            isConnecting={sync.isConnecting}
            setInputCode={sync.setInputCode}
            setVideoUrl={sync.setVideoUrl}
            onServerUrlChange={sync.handleServerUrlChange}
            onCreateRoom={sync.handleCreateRoom}
            onJoinRoom={sync.handleJoinRoom}
            onLaunchMpv={sync.handleLaunchMpv}
            onSendVideo={sync.handleSendVideoToRoom}
            onLeaveRoom={sync.leaveRoom}
          />
        )}
      </div>
    </Layout>
  );
}