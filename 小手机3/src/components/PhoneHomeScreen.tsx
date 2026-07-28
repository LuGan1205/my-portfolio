import React, { useState, useEffect } from "react";
import { AppId, PhoneSettings, CharacterCard, WorldBook, ApiConfig } from "../types";
import { ProfileWidget } from "./widgets/ProfileWidget";
import socialIcon from "../assets/app-icons/social-phone.png";
import worldBookIcon from "../assets/app-icons/worldbook-globe.png";
import studioIcon from "../assets/app-icons/studio-bow.png";
import galleryIcon from "../assets/app-icons/gallery-camera.png";
import gameIcon from "../assets/app-icons/game-console.png";
import settingsIcon from "../assets/app-icons/settings-console.png";
import {
  MessageSquareText,
  BookOpen,
  Settings,
  Sparkles,
  Image as ImageIcon,
  Search,
  CloudSun,
  ShieldCheck,
  Globe,
  Sliders,
  ChevronRight,
} from "lucide-react";

const homeApps: Array<{ id: AppId; label: string; icon: string }> = [
  { id: "social", label: "QQ", icon: socialIcon },
  { id: "worldbook", label: "世界书", icon: worldBookIcon },
  { id: "studio", label: "角色工坊", icon: studioIcon },
  { id: "gallery", label: "治愈相册", icon: galleryIcon },
  { id: "game", label: "游戏中心", icon: gameIcon },
  { id: "settings", label: "设置", icon: settingsIcon },
];

const dockApps = homeApps.filter(({ id }) =>
  ["social", "worldbook", "studio", "settings"].includes(id)
);

interface PhoneHomeScreenProps {
  settings: PhoneSettings;
  characters: CharacterCard[];
  worldBooks: WorldBook[];
  apiConfig: ApiConfig;
  onOpenApp: (appId: AppId) => void;
}

export const PhoneHomeScreen: React.FC<PhoneHomeScreenProps> = ({
  settings,
  characters,
  worldBooks,
  apiConfig,
  onOpenApp,
}) => {
  const [timeStr, setTimeStr] = useState<string>("");
  const [dateStr, setDateStr] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString("zh-CN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      );
      setDateStr(
        now.toLocaleDateString("zh-CN", {
          month: "long",
          day: "numeric",
          weekday: "long",
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 5000);
    return () => clearInterval(timer);
  }, []);

  const totalUnread = characters.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
  const totalEntries = worldBooks.reduce((sum, b) => sum + b.entries.length, 0);

  return (
    <div
      className="relative flex-1 w-full h-full flex flex-col justify-between p-4 bg-gradient-to-b from-rose-50 via-pink-50/50 to-purple-50/40 overflow-y-auto overflow-x-hidden space-y-3.5 text-slate-800 scrollbar-none"
      style={{ backgroundImage: `url(${settings.wallpaper})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      {/* Soft light tint layer for crisp readability */}
      <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] pointer-events-none" />

      {/* Top Section: Profile Widget */}
      <div className="relative z-10 pt-1 flex flex-col space-y-2">
        {/* Custom Profile Card Widget */}
        <ProfileWidget />
      </div>

      {/* Middle Section: Pastel 3D App Grid */}
      <div className="relative z-10 grid grid-cols-4 gap-y-4 gap-x-2 my-auto pt-2">
        {homeApps.map((app) => (
          <div key={app.id} className="flex flex-col items-center">
            <button
              onClick={() => onOpenApp(app.id)}
              className="group relative w-[72px] h-[72px] flex items-center justify-center rounded-[24px] transition-transform duration-200 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-300/80"
              title={app.label}
              aria-label={`打开${app.label}`}
            >
              <img
                src={app.icon}
                alt=""
                aria-hidden="true"
                draggable={false}
                className="w-full h-full object-contain drop-shadow-[0_7px_7px_rgba(127,104,144,0.22)] transition-transform duration-300 group-hover:-translate-y-0.5"
              />
            </button>
            <span className="mt-0.5 rounded-full border border-white/70 bg-white/55 px-2 py-0.5 text-[11px] font-semibold text-[#6f6078] shadow-[0_2px_7px_rgba(138,115,149,0.12)] backdrop-blur-md">
              {app.label}
            </span>
          </div>
        ))}
      </div>

      {/* Bottom Fixed Dock Bar */}
      <div className="relative z-10 w-full bg-white/55 backdrop-blur-xl border border-white/80 rounded-3xl p-2 flex justify-around items-center transition-all shadow-lg shadow-[#c8b6d2]/25">
        {dockApps.map((app) => (
          <button
            key={app.id}
            onClick={() => onOpenApp(app.id)}
            className="group w-13 h-13 rounded-2xl flex items-center justify-center hover:scale-110 active:scale-90 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-300/80"
            title={app.label}
            aria-label={`打开${app.label}`}
          >
            <img
              src={app.icon}
              alt=""
              aria-hidden="true"
              draggable={false}
              className="w-full h-full object-contain drop-shadow-[0_5px_5px_rgba(127,104,144,0.2)] transition-transform duration-300 group-hover:-translate-y-0.5"
            />
          </button>
        ))}
      </div>
    </div>
  );
};
