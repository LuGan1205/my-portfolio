import React, { useState, useEffect, useRef } from "react";
import { MapPin, Camera } from "lucide-react";
import bannerImage from "../../assets/images/butterfly_bg_card_1785066430574.jpg";
import lumiAvatar from "../../assets/images/lumi_clover_avatar_1785062086306.jpg";

const WIDGET_STORAGE_KEY = "lumi_profile_widget_data_v1";

interface WidgetData {
  bannerUrl: string;
  avatarUrl: string;
  name: string;
  handle: string;
  quote: string;
  location: string;
}

const DEFAULT_WIDGET_DATA: WidgetData = {
  bannerUrl: bannerImage,
  avatarUrl: lumiAvatar,
  name: "LUMI",
  handle: "@ 生活会越来越好的",
  quote: "小世界里干杯",
  location: "地球村",
};

export const ProfileWidget: React.FC = () => {
  const [data, setData] = useState<WidgetData>(() => {
    try {
      const saved = localStorage.getItem(WIDGET_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure new Lumi clover avatar is used if still holding old default avatar
        if (!parsed.avatarUrl || parsed.avatarUrl.includes("maltese_puppy_avatar")) {
          parsed.avatarUrl = lumiAvatar;
        }
        // Update banner url if holding old default banner
        if (!parsed.bannerUrl || parsed.bannerUrl.includes("widget_banner_bg")) {
          parsed.bannerUrl = bannerImage;
        }
        return { ...DEFAULT_WIDGET_DATA, ...parsed };
      }
    } catch {
      // fallback to default
    }
    return DEFAULT_WIDGET_DATA;
  });

  const [editingField, setEditingField] = useState<"name" | "handle" | "quote" | "location" | null>(null);

  const bannerInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(WIDGET_STORAGE_KEY, JSON.stringify(data));
    } catch {
      // ignore quota errors
    }
  }, [data]);

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setData((prev) => ({ ...prev, bannerUrl: event.target!.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setData((prev) => ({ ...prev, avatarUrl: event.target!.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden bg-white/65 backdrop-blur-xl border border-white/80 shadow-lg shadow-slate-200/50 transition-all group/card">
      {/* Hidden File Inputs for Background and Avatar */}
      <input
        type="file"
        ref={bannerInputRef}
        onChange={handleBannerUpload}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={avatarInputRef}
        onChange={handleAvatarUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Top Banner Image (Click to replace image) */}
      <div
        onClick={() => bannerInputRef.current?.click()}
        className="relative h-28 w-full bg-slate-100 overflow-hidden cursor-pointer group/banner"
        title="点击图片直接上传替换背景卡"
      >
        <img
          src={data.bannerUrl}
          alt="Banner"
          className="w-full h-full object-cover transition-transform duration-300 group-hover/banner:scale-105"
        />
        <div className="absolute inset-0 bg-slate-900/25 opacity-0 group-hover/banner:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold space-x-1.5 backdrop-blur-[1px]">
          <Camera className="w-4 h-4" />
          <span>点击更换背景卡</span>
        </div>
      </div>

      {/* Overlapping Avatar (Click to replace avatar) */}
      <div className="relative flex justify-center -mt-10 mb-1 z-10">
        <div
          onClick={() => avatarInputRef.current?.click()}
          className="relative w-20 h-20 rounded-full border-4 border-white shadow-md overflow-hidden bg-white cursor-pointer group/avatar"
          title="点击更换头像"
        >
          <img
            src={data.avatarUrl}
            alt="Avatar"
            className="w-full h-full object-cover transition-transform duration-300 group-hover/avatar:scale-110"
          />
          <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center text-white text-xs">
            <Camera className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Bottom Inline Editable Text Content */}
      <div className="px-4 pb-5 pt-1 flex flex-col items-center text-center space-y-1.5">
        {/* Line 1: Name */}
        {editingField === "name" ? (
          <input
            type="text"
            autoFocus
            value={data.name}
            onChange={(e) => setData((prev) => ({ ...prev, name: e.target.value }))}
            onBlur={() => setEditingField(null)}
            onKeyDown={(e) => e.key === "Enter" && setEditingField(null)}
            placeholder="如: LUMI"
            className="text-center font-black text-slate-800 text-base bg-white/90 border-b-2 border-amber-400 focus:outline-none rounded-md px-2 py-0.5 w-44 shadow-xs"
          />
        ) : (
          <h2
            onClick={() => setEditingField("name")}
            className="text-base font-black text-slate-800 tracking-wide hover:bg-white/60 px-2.5 py-0.5 rounded-xl cursor-pointer transition-colors"
            title="点击直接修改名字"
          >
            {data.name || "LUMI"}
          </h2>
        )}

        {/* Line 2: Handle / Status */}
        {editingField === "handle" ? (
          <input
            type="text"
            autoFocus
            value={data.handle}
            onChange={(e) => setData((prev) => ({ ...prev, handle: e.target.value }))}
            onBlur={() => setEditingField(null)}
            onKeyDown={(e) => e.key === "Enter" && setEditingField(null)}
            placeholder="如: @ 生活会越来越好的"
            className="text-center font-bold text-slate-600 text-xs bg-white/90 border-b-2 border-amber-400 focus:outline-none rounded-md px-2 py-0.5 w-56 shadow-xs"
          />
        ) : (
          <p
            onClick={() => setEditingField("handle")}
            className="text-xs font-bold text-slate-500 hover:bg-white/60 px-2.5 py-0.5 rounded-xl cursor-pointer transition-colors"
            title="点击直接修改签名"
          >
            {data.handle.startsWith("@") ? data.handle : `@ ${data.handle}`}
          </p>
        )}

        {/* Line 3: Quote */}
        {editingField === "quote" ? (
          <input
            type="text"
            autoFocus
            value={data.quote}
            onChange={(e) => setData((prev) => ({ ...prev, quote: e.target.value }))}
            onBlur={() => setEditingField(null)}
            onKeyDown={(e) => e.key === "Enter" && setEditingField(null)}
            placeholder="如: 小世界里干杯"
            className="text-center font-extrabold text-slate-700 text-xs bg-white/90 border-b-2 border-amber-400 focus:outline-none rounded-md px-2 py-0.5 w-52 shadow-xs"
          />
        ) : (
          <p
            onClick={() => setEditingField("quote")}
            className="text-xs font-extrabold text-slate-700 hover:bg-white/60 px-2.5 py-0.5 rounded-xl cursor-pointer transition-colors"
            title="点击直接修改话语"
          >
            {data.quote}
          </p>
        )}

        {/* Line 4: Location Pill */}
        {editingField === "location" ? (
          <div className="mt-1 inline-flex items-center space-x-1 px-2.5 py-0.5 bg-white/90 border-b-2 border-amber-400 rounded-full shadow-xs">
            <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
            <input
              type="text"
              autoFocus
              value={data.location}
              onChange={(e) => setData((prev) => ({ ...prev, location: e.target.value }))}
              onBlur={() => setEditingField(null)}
              onKeyDown={(e) => e.key === "Enter" && setEditingField(null)}
              placeholder="如: 地球村"
              className="text-center font-bold text-slate-700 text-[11px] bg-transparent focus:outline-none w-28"
            />
          </div>
        ) : (
          <div
            onClick={() => setEditingField("location")}
            className="mt-1.5 inline-flex items-center space-x-1 px-3 py-1 bg-white/70 hover:bg-white/95 text-slate-700 hover:text-slate-900 text-[11px] font-bold rounded-full transition-all cursor-pointer shadow-2xs border border-white/80 backdrop-blur-md"
            title="点击直接修改地点"
          >
            <MapPin className="w-3 h-3 text-slate-400" />
            <span>{data.location || "地球村"}</span>
          </div>
        )}
      </div>
    </div>
  );
};
