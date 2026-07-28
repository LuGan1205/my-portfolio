import React, { useState, useEffect } from "react";
import { PhoneSettings, AppId } from "../types";
import { Wifi, Battery, Signal, Home, ChevronLeft, Power, Lock } from "lucide-react";

interface PhoneContainerProps {
  settings: PhoneSettings;
  onUpdateSettings: (newSettings: Partial<PhoneSettings>) => void;
  activeApp: AppId;
  onNavigate: (appId: AppId) => void;
  children: React.ReactNode;
}

export const PhoneContainer: React.FC<PhoneContainerProps> = ({
  settings,
  onUpdateSettings,
  activeApp,
  onNavigate,
  children,
}) => {
  const [timeStr, setTimeStr] = useState<string>("");
  const [dateStr, setDateStr] = useState<string>("");
  const [batteryLevel] = useState<number>(92);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      setTimeStr(`${hours}:${minutes}`);

      const options: Intl.DateTimeFormatOptions = {
        month: "short",
        day: "numeric",
        weekday: "short",
      };
      setDateStr(now.toLocaleDateString("zh-CN", options));
    };

    updateClock();
    const interval = setInterval(updateClock, 10000);
    return () => clearInterval(interval);
  }, []);

  const [volume, setVolume] = useState<number>(80);
  const [showVolumeToast, setShowVolumeToast] = useState<boolean>(false);

  const handleVolumeUp = () => {
    setVolume((v) => Math.min(100, v + 10));
    setShowVolumeToast(true);
    setTimeout(() => setShowVolumeToast(false), 1500);
  };

  const handleVolumeDown = () => {
    setVolume((v) => Math.max(0, v - 10));
    setShowVolumeToast(true);
    setTimeout(() => setShowVolumeToast(false), 1500);
  };

  return (
    <div className="flex h-full min-h-0 items-center justify-center bg-transparent p-0 select-none font-sans text-slate-800">
      {/* Outer Phone Frame - Fixed Sleek Matte Black */}
      <div
        className="relative w-full max-w-[430px] h-[880px] rounded-[52px] border-[12px] border-neutral-900 bg-neutral-950 ring-1 ring-neutral-800 overflow-hidden flex flex-col transition-all duration-300"
      >
        {/* Physical Side Buttons Simulation */}
        {/* Volume Up Key */}
        <div
          onClick={handleVolumeUp}
          className="absolute -left-[16px] top-28 w-[5px] h-12 bg-neutral-700 hover:bg-neutral-500 rounded-l-md opacity-90 cursor-pointer transition-colors shadow-sm active:translate-x-0.5"
          title="音量 + (Volume Up)"
        />
        {/* Volume Down Key */}
        <div
          onClick={handleVolumeDown}
          className="absolute -left-[16px] top-44 w-[5px] h-12 bg-neutral-700 hover:bg-neutral-500 rounded-l-md opacity-90 cursor-pointer transition-colors shadow-sm active:translate-x-0.5"
          title="音量 - (Volume Down)"
        />
        {/* Power / Lock Screen Key */}
        <div
          onClick={() => onUpdateSettings({ isLocked: !settings.isLocked })}
          className="absolute -right-[16px] top-36 w-[5px] h-16 bg-neutral-700 hover:bg-rose-500 rounded-r-md opacity-90 cursor-pointer transition-colors shadow-sm active:-translate-x-0.5"
          title="电源键 / 锁屏关机 (Power Button)"
        />

        {/* Volume Toast Indicator */}
        {showVolumeToast && (
          <div className="absolute top-12 left-1/2 -translate-x-1/2 z-50 bg-neutral-900/90 text-white text-xs px-3 py-1.5 rounded-full shadow-lg border border-neutral-700 backdrop-blur-md animate-fadeIn flex items-center space-x-1.5">
            <span>🔊 音量: {volume}%</span>
          </div>
        )}

        {/* Dynamic Island / Top Speaker Notch */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-50 flex items-center justify-between px-3 border border-neutral-800 shadow-inner">
          <div className="w-2.5 h-2.5 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-blue-900/60" />
          </div>
          <div className="w-3 h-3 rounded-full bg-neutral-900/90 border border-neutral-800" />
        </div>

        {/* Top Status Bar - Seamless & Modern Mobile Header */}
        <div className="relative z-40 h-9 px-6 flex items-center justify-between text-xs font-medium text-slate-700 bg-white/50 backdrop-blur-md border-b border-slate-200/30 tracking-tight pointer-events-none">
          <div className="flex items-center space-x-1 pl-1">
            <span className="text-[11px] font-semibold text-slate-800">
              {timeStr || "12:00"}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-[11px] pr-1 text-slate-700">
            <Signal className="w-3.5 h-3.5 text-slate-700" />
            <span className="font-mono text-[10px] text-slate-700 font-semibold">5G</span>
            <Wifi className="w-3.5 h-3.5 text-slate-700" />
            <div className="flex items-center space-x-1 text-slate-800">
              <span className="text-[11px] font-mono font-medium">{batteryLevel}%</span>
              <Battery className="w-4 h-4 text-slate-700 fill-slate-700/20" />
            </div>
          </div>
        </div>

        {/* Main Phone Display Viewport */}
        <div className="relative flex-1 w-full overflow-hidden flex flex-col bg-white">
          {/* Lock Screen Overlay */}
          {settings.isLocked ? (
            <div
              className="absolute inset-0 z-50 flex flex-col justify-between p-8 bg-cover bg-center text-white backdrop-blur-sm transition-all"
              style={{ backgroundImage: `url(${settings.wallpaper})` }}
            >
              <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
              <div className="relative z-10 pt-12 flex flex-col items-center">
                <Lock className="w-6 h-6 mb-2 text-white/90 animate-pulse" />
                <div className="text-6xl font-light tracking-tight drop-shadow-md">{timeStr}</div>
                <div className="text-sm font-medium opacity-90 mt-1">{dateStr}</div>
              </div>

              <div className="relative z-10 flex flex-col items-center space-y-4 mb-6">
                <button
                  onClick={() => onUpdateSettings({ isLocked: false })}
                  className="w-full py-3.5 px-6 rounded-2xl bg-white/25 hover:bg-white/35 backdrop-blur-md border border-white/30 text-sm font-medium transition-all transform active:scale-95 shadow-lg flex items-center justify-center space-x-2 text-white"
                >
                  <span>轻触解锁 CyberPhone</span>
                </button>
              </div>
            </div>
          ) : (
            /* App Workspace Container */
            <div className="flex-1 w-full h-full relative flex flex-col overflow-hidden">
              {children}
            </div>
          )}
        </div>

        {/* Bottom OS Navigation Bar */}
        {!settings.isLocked && (
          <div className="relative z-40 h-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-rose-100/50 flex items-center justify-between px-8 text-slate-500">
            {/* Back Button */}
            <button
              onClick={() => {
                if (activeApp !== "home") onNavigate("home");
              }}
              className={`p-1.5 rounded-lg transition-colors ${activeApp !== "home" ? "hover:text-rose-500 hover:bg-rose-50" : "opacity-30 cursor-default"}`}
              title="返回主页"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Home Pill Indicator */}
            <button
              onClick={() => onNavigate("home")}
              className="group py-2 px-6 flex items-center justify-center"
              title="手机主页"
            >
              <div className="w-28 h-1 bg-slate-400/60 rounded-full group-hover:bg-rose-400 group-hover:w-32 transition-all" />
            </button>

            {/* App Switcher Icon / Home shortcut */}
            <button
              onClick={() => onNavigate("home")}
              className="p-1.5 rounded-lg hover:text-rose-500 hover:bg-rose-50 transition-colors"
              title="返回桌面"
            >
              <Home className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
