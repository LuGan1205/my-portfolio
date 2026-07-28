import React, { useState } from "react";
import { CharacterCard } from "../../types";
import { Image as ImageIcon, Sparkles, ChevronLeft, Download, Plus, Heart } from "lucide-react";

interface GalleryAppProps {
  characters: CharacterCard[];
  onBackToHome: () => void;
}

export const GalleryApp: React.FC<GalleryAppProps> = ({ characters, onBackToHome }) => {
  const [photos, setPhotos] = useState<Array<{ id: string; url: string; title: string; likes: number }>>([
    {
      id: "p1",
      url: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80",
      title: "艾莉亚在新翠市下城区的深夜照片",
      likes: 128,
    },
    {
      id: "p2",
      url: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=600&auto=format&fit=crop&q=80",
      title: "埃尔德林在阿斯特拉星光图书馆的记录",
      likes: 95,
    },
    {
      id: "p3",
      url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80",
      title: "诺诺与猫咖团子的特写照片",
      likes: 210,
    },
  ]);

  const [prompt, setPrompt] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: `Anime artwork: ${prompt}` }),
      });
      const data = await res.json();
      if (data.imageUrl) {
        setPhotos([
          {
            id: `p_${Date.now()}`,
            url: data.imageUrl,
            title: prompt,
            likes: 1,
          },
          ...photos,
        ]);
        setPrompt("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 w-full h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Header */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button onClick={onBackToHome} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-2">
            <ImageIcon className="w-5 h-5 text-teal-400" />
            <h1 className="text-base font-bold text-white">AI 动态相册 (Gallery)</h1>
          </div>
        </div>
      </div>

      {/* Generator Prompt Bar */}
      <div className="p-3 bg-slate-900/60 border-b border-slate-800 flex items-center space-x-2">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="描述想要生成的 AI 角色插画..."
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
        />
        <button
          onClick={handleGenerate}
          disabled={!prompt.trim() || isGenerating}
          className="px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center space-x-1 disabled:opacity-40"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isGenerating ? "生成中..." : "生成"}</span>
        </button>
      </div>

      {/* Grid of Photos */}
      <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 gap-3">
        {photos.map((item) => (
          <div
            key={item.id}
            className="group relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-md flex flex-col"
          >
            <img src={item.url} alt={item.title} className="w-full h-36 object-cover" />
            <div className="p-2.5 flex-1 flex flex-col justify-between">
              <p className="text-[11px] text-slate-200 line-clamp-2">{item.title}</p>
              <div className="flex justify-between items-center mt-2 text-[10px] text-slate-400">
                <button
                  onClick={() =>
                    setPhotos(
                      photos.map((p) => (p.id === item.id ? { ...p, likes: p.likes + 1 } : p))
                    )
                  }
                  className="flex items-center space-x-1 hover:text-rose-400"
                >
                  <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                  <span>{item.likes}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
