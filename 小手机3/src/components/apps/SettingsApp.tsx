import React, { useState } from "react";
import { ApiConfig, UserPersona, PhoneSettings } from "../../types";
import watercolorWallpaper from "../../assets/images/watercolor_pastel_wallpaper_1785059388049.jpg";
import puppyWallpaper from "../../assets/images/line_puppy_wallpaper_1785057289111.jpg";
import {
  Settings,
  Globe,
  Key,
  ShieldCheck,
  Sliders,
  User,
  Palette,
  Database,
  Download,
  Upload,
  Check,
  ChevronLeft,
  Eye,
  EyeOff,
  Zap,
  Info,
  Server,
  RefreshCw,
} from "lucide-react";

interface SettingsAppProps {
  apiConfig: ApiConfig;
  userPersona: UserPersona;
  phoneSettings: PhoneSettings;
  onUpdateApiConfig: (config: Partial<ApiConfig>) => void;
  onUpdatePersona: (persona: Partial<UserPersona>) => void;
  onUpdatePhoneSettings: (settings: Partial<PhoneSettings>) => void;
  onExportAllData: () => void;
  onImportAllData: (jsonStr: string) => void;
  onBackToHome: () => void;
}

export const SettingsApp: React.FC<SettingsAppProps> = ({
  apiConfig,
  userPersona,
  phoneSettings,
  onUpdateApiConfig,
  onUpdatePersona,
  onUpdatePhoneSettings,
  onExportAllData,
  onImportAllData,
  onBackToHome,
}) => {
  const [activeTab, setActiveTab] = useState<"api" | "persona" | "phone" | "data">("api");
  const [showApiKey, setShowApiKey] = useState<boolean>(false);
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState<boolean>(false);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestStatus("正在连通性测试中...");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: "ping" }],
          character: { name: "TestBot" },
          apiConfig,
        }),
      });

      const data = await res.json();
      if (res.ok && data.text) {
        setTestStatus("✅ 连接成功！API Endpoint 响应正常。");
      } else {
        setTestStatus(`❌ 连接失败: ${data.error || "未知错误"}`);
      }
    } catch (err: any) {
      setTestStatus(`❌ 网络或连接错误: ${err.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  const WALLPAPER_PRESETS = [
    {
      name: "⭐ 治愈水彩星星 (Hanging Stars)",
      url: watercolorWallpaper,
    },
    {
      name: "🐾 线条小狗·彩绘涂鸦",
      url: puppyWallpaper,
    },
    {
      name: "🌸 奶油草莓舒芙蕾",
      url: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=800&auto=format&fit=crop&q=80",
    },
    {
      name: "🐱 猫咪花房阳光晒阳",
      url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&auto=format&fit=crop&q=80",
    },
  ];

  return (
    <div className="flex-1 w-full h-full flex flex-col bg-gradient-to-b from-rose-50 via-pink-50/60 to-purple-50/50 text-slate-800 overflow-hidden font-sans">
      {/* Header */}
      <div className="p-4 bg-white/90 border-b border-rose-100 flex items-center justify-between shadow-sm backdrop-blur-md">
        <div className="flex items-center space-x-2">
          <button onClick={onBackToHome} className="p-1 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-rose-500" />
            <h1 className="text-base font-bold text-slate-800">系统设置 (Settings)</h1>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-rose-100 bg-white/60 text-xs text-slate-600 font-medium">
        <button
          onClick={() => setActiveTab("api")}
          className={`flex-1 py-3 text-center border-b-2 flex items-center justify-center space-x-1 transition-colors ${
            activeTab === "api"
              ? "border-rose-500 text-rose-600 font-bold bg-rose-50/50"
              : "border-transparent hover:text-rose-500"
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>API 配置</span>
        </button>

        <button
          onClick={() => setActiveTab("persona")}
          className={`flex-1 py-3 text-center border-b-2 flex items-center justify-center space-x-1 transition-colors ${
            activeTab === "persona"
              ? "border-rose-500 text-rose-600 font-bold bg-rose-50/50"
              : "border-transparent hover:text-rose-500"
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>我的形象</span>
        </button>

        <button
          onClick={() => setActiveTab("phone")}
          className={`flex-1 py-3 text-center border-b-2 flex items-center justify-center space-x-1 transition-colors ${
            activeTab === "phone"
              ? "border-rose-500 text-rose-600 font-bold bg-rose-50/50"
              : "border-transparent hover:text-rose-500"
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>壁纸与尺寸</span>
        </button>

        <button
          onClick={() => setActiveTab("data")}
          className={`flex-1 py-3 text-center border-b-2 flex items-center justify-center space-x-1 transition-colors ${
            activeTab === "data"
              ? "border-rose-500 text-rose-600 font-bold bg-rose-50/50"
              : "border-transparent hover:text-rose-500"
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>备份恢复</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* TAB 1: API CONFIGURATION */}
        {activeTab === "api" && (
          <div className="space-y-4">
            {/* Mode Choice Card */}
            <div className="bg-white/90 border border-rose-100 rounded-2xl p-4 space-y-3 shadow-sm">
              <h3 className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                <Globe className="w-4 h-4 text-rose-500" />
                <span>模型接口模式选择</span>
              </h3>

              <div className="grid grid-cols-1 gap-2">
                {/* Option 1: Built-in Gemini */}
                <label
                  onClick={() => onUpdateApiConfig({ source: "built-in" })}
                  className={`p-3 rounded-xl border flex items-start space-x-3 cursor-pointer transition-all ${
                    apiConfig.source === "built-in"
                      ? "bg-rose-50 border-rose-400 text-rose-950 shadow-sm"
                      : "bg-white border-slate-200 text-slate-600 hover:border-rose-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="apiSource"
                    checked={apiConfig.source === "built-in"}
                    onChange={() => onUpdateApiConfig({ source: "built-in" })}
                    className="mt-0.5 accent-rose-500"
                  />
                  <div>
                    <div className="text-xs font-bold flex items-center space-x-2 text-rose-900">
                      <span>内置免费 API (Built-in Gemini Server)</span>
                      <span className="bg-emerald-100 text-emerald-700 text-[10px] px-1.5 py-0.2 rounded font-mono font-medium">
                        免配置·即开即用
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      由系统服务端自动注入 Gemini 3.6 Flash 模型，零配置即享高质量角色扮演。
                    </p>
                  </div>
                </label>

                {/* Option 2: Custom API Endpoint */}
                <label
                  onClick={() => onUpdateApiConfig({ source: "custom" })}
                  className={`p-3 rounded-xl border flex items-start space-x-3 cursor-pointer transition-all ${
                    apiConfig.source === "custom"
                      ? "bg-amber-50 border-amber-400 text-amber-950 shadow-sm"
                      : "bg-white border-slate-200 text-slate-600 hover:border-rose-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="apiSource"
                    checked={apiConfig.source === "custom"}
                    onChange={() => onUpdateApiConfig({ source: "custom" })}
                    className="mt-0.5 accent-amber-500"
                  />
                  <div>
                    <div className="text-xs font-bold flex items-center space-x-2 text-amber-900">
                      <span>自定义 API Endpoint (URL & Key)</span>
                      <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.2 rounded font-mono font-medium">
                        OpenAI/DeepSeek/中转
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      支持填写任意第三方 OpenAI 兼容格式接口地址 (如 OpenAI, DeepSeek, OneAPI, Claude中转)。
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Custom API Input Form */}
            {apiConfig.source === "custom" && (
              <div className="bg-white/90 border border-amber-200 rounded-2xl p-4 space-y-3.5 shadow-sm animate-fadeIn">
                <h3 className="text-xs font-bold text-amber-700 flex items-center space-x-1.5">
                  <Key className="w-4 h-4" />
                  <span>自定义接口参数配置</span>
                </h3>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    API Endpoint URL (接口地址)
                  </label>
                  <input
                    type="text"
                    value={apiConfig.customUrl}
                    onChange={(e) => onUpdateApiConfig({ customUrl: e.target.value })}
                    placeholder="例如: https://api.openai.com/v1 或 https://api.deepseek.com/v1"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-mono placeholder-slate-400 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    API Key (密钥)
                  </label>
                  <div className="relative">
                    <input
                      type={showApiKey ? "text" : "password"}
                      value={apiConfig.customKey}
                      onChange={(e) => onUpdateApiConfig({ customKey: e.target.value })}
                      placeholder="sk-..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 pr-10 text-xs text-slate-800 font-mono placeholder-slate-400 focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    模型名称 (Model)
                  </label>
                  <input
                    type="text"
                    value={apiConfig.model}
                    onChange={(e) => onUpdateApiConfig({ model: e.target.value })}
                    placeholder="如: gpt-4o, deepseek-chat, claude-3-5-sonnet"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-mono placeholder-slate-400 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Ping Test */}
                <div className="pt-2 flex flex-col space-y-2">
                  <button
                    onClick={handleTestConnection}
                    disabled={isTesting || !apiConfig.customUrl || !apiConfig.customKey}
                    className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-bold text-xs flex items-center justify-center space-x-1.5 disabled:opacity-50 transition-all shadow-sm"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? "animate-spin" : ""}`} />
                    <span>{isTesting ? "测试连通性中..." : "测试 API 连接"}</span>
                  </button>

                  {testStatus && (
                    <div
                      className={`p-2.5 rounded-xl text-xs font-medium ${
                        testStatus.includes("✅")
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-rose-50 text-rose-800 border border-rose-200"
                      }`}
                    >
                      {testStatus}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Generation Parameters Sliders */}
            <div className="bg-white/90 border border-rose-100 rounded-2xl p-4 space-y-4 shadow-sm">
              <h3 className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                <Sliders className="w-4 h-4 text-rose-500" />
                <span>生成采样参数 (Temperature & Tokens)</span>
              </h3>

              <div>
                <div className="flex justify-between text-xs text-slate-700 mb-1 font-medium">
                  <span>采样温度 (Temperature): {apiConfig.temperature}</span>
                  <span className="text-rose-500">
                    {apiConfig.temperature > 1.0 ? "创意天马行空" : "严谨稳定角色"}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.8"
                  step="0.05"
                  value={apiConfig.temperature}
                  onChange={(e) => onUpdateApiConfig({ temperature: parseFloat(e.target.value) })}
                  className="w-full accent-rose-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-700 mb-1 font-medium">
                  <span>最大生成长度 (Max Tokens): {apiConfig.maxTokens}</span>
                </div>
                <input
                  type="range"
                  min="256"
                  max="3072"
                  step="128"
                  value={apiConfig.maxTokens}
                  onChange={(e) => onUpdateApiConfig({ maxTokens: parseInt(e.target.value) })}
                  className="w-full accent-rose-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USER PERSONA */}
        {activeTab === "persona" && (
          <div className="bg-white/90 border border-rose-100 rounded-2xl p-4 space-y-4 shadow-sm">
            <h3 className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
              <User className="w-4 h-4 text-rose-500" />
              <span>设置我的角色人设 (User Persona)</span>
            </h3>

            <div className="flex items-center space-x-3">
              <img
                src={userPersona.avatar}
                alt={userPersona.name}
                className="w-14 h-14 rounded-full object-cover ring-2 ring-rose-400 shadow-sm"
              />
              <div className="flex-1 space-y-1">
                <label className="block text-[11px] text-slate-500 font-medium">头像 URL</label>
                <input
                  type="text"
                  value={userPersona.avatar}
                  onChange={(e) => onUpdatePersona({ avatar: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">用户名字</label>
              <input
                type="text"
                value={userPersona.name}
                onChange={(e) => onUpdatePersona({ name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">人设描述 (AI 角色如何看待你)</label>
              <textarea
                value={userPersona.description}
                onChange={(e) => onUpdatePersona({ description: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none resize-none"
                rows={3}
              />
            </div>
          </div>
        )}

        {/* TAB 3: PHONE APPEARANCE & WALLPAPER SPECIFICATIONS */}
        {activeTab === "phone" && (
          <div className="space-y-4">
            {/* WALLPAPER SIZE GUIDANCE BOX - Highlighting specs requested by user */}
            <div className="bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-2xl p-4 space-y-2.5 shadow-md">
              <div className="flex items-center space-x-2">
                <Info className="w-5 h-5 text-amber-200" />
                <h3 className="text-xs font-bold text-white tracking-wide">
                  📱 壁纸尺寸与图片推荐规格
                </h3>
              </div>
              <div className="bg-white/15 backdrop-blur-md rounded-xl p-3 text-[11px] space-y-1.5 leading-relaxed border border-white/20">
                <p>
                  • <strong className="text-amber-200">屏幕显示宽高比 (Aspect Ratio):</strong> <span className="font-mono font-bold">9 : 19.5</span> (竖屏全屏智能手机尺寸)
                </p>
                <p>
                  • <strong className="text-amber-200">最佳推荐图像分辨率:</strong> <span className="font-mono font-bold">1080 × 2340 像素</span> 或 <span className="font-mono font-bold">1170 × 2532 像素</span>
                </p>
                <p>
                  • <strong className="text-amber-200">视口渲染框大小:</strong> <span className="font-mono font-bold">430 × 880 像素</span>
                </p>
                <p className="text-white/90 pt-1 border-t border-white/20 text-[10px]">
                  💡 <strong>选图小技巧：</strong> 建议选择主体人物或风景集中在图片中上部的竖屏高分辨率图片，避免被底部的软件图标与状态栏遮挡。
                </p>
              </div>
            </div>

            {/* Custom Wallpaper URL Input */}
            <div className="bg-white/90 border border-rose-100 rounded-2xl p-4 space-y-3 shadow-sm">
              <h3 className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                <Upload className="w-4 h-4 text-rose-500" />
                <span>自定义壁纸图片 URL</span>
              </h3>
              <div className="space-y-2">
                <input
                  type="text"
                  value={phoneSettings.wallpaper}
                  onChange={(e) => onUpdatePhoneSettings({ wallpaper: e.target.value })}
                  placeholder="请输入或粘贴网络图片链接 (https://...)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 placeholder-slate-400 font-mono"
                />
              </div>
            </div>

            {/* Wallpaper Selection Presets */}
            <div className="bg-white/90 border border-rose-100 rounded-2xl p-4 space-y-3 shadow-sm">
              <h3 className="text-xs font-bold text-slate-800">内置精选美图壁纸</h3>
              <div className="grid grid-cols-2 gap-2">
                {WALLPAPER_PRESETS.map((wp, idx) => (
                  <div
                    key={idx}
                    onClick={() => onUpdatePhoneSettings({ wallpaper: wp.url })}
                    className={`relative h-28 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                      phoneSettings.wallpaper === wp.url ? "border-rose-500 ring-2 ring-rose-300" : "border-transparent"
                    }`}
                  >
                    <img src={wp.url} alt={wp.name} className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 left-2 text-[10px] font-bold text-white drop-shadow">
                      {wp.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: DATA BACKUP & RESTORE */}
        {activeTab === "data" && (
          <div className="bg-white/90 border border-rose-100 rounded-2xl p-4 space-y-4 shadow-sm">
            <h3 className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
              <Database className="w-4 h-4 text-rose-500" />
              <span>数据导出与一键恢复</span>
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed">
              您可以导出所有的聊天记录、角色卡人设与世界书设定，或者在其他设备上恢复应用数据。
            </p>

            <div className="flex space-x-2 pt-2">
              <button
                onClick={onExportAllData}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs flex items-center justify-center space-x-1 shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>导出全量 JSON 备份</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
