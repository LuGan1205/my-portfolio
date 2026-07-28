import React, { useState } from "react";
import { CharacterCard, WorldBook } from "../../types";
import {
  Sparkles,
  Plus,
  Trash2,
  Edit3,
  Check,
  ChevronLeft,
  Download,
  Upload,
  User,
  MessageSquare,
  BookOpen,
  Tag,
} from "lucide-react";

interface CharacterStudioAppProps {
  characters: CharacterCard[];
  worldBooks: WorldBook[];
  onSaveCharacter: (character: CharacterCard) => void;
  onDeleteCharacter: (id: string) => void;
  onImportCharacterCard: (jsonStr: string) => void;
  onBackToHome: () => void;
}

export const CharacterStudioApp: React.FC<CharacterStudioAppProps> = ({
  characters,
  worldBooks,
  onSaveCharacter,
  onDeleteCharacter,
  onImportCharacterCard,
  onBackToHome,
}) => {
  const [selectedChar, setSelectedChar] = useState<CharacterCard | null>(characters[0] || null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formData, setFormData] = useState<Partial<CharacterCard>>({});
  const [deleteConfirmCharId, setDeleteConfirmCharId] = useState<string | null>(null);

  const handleStartCreate = () => {
    const newChar: CharacterCard = {
      id: `char_${Date.now()}`,
      name: "新 AI 角色",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
      tagline: "短句性格标语",
      description: "详细角色设定、外貌与背景。",
      personality: "傲娇、温柔、理智",
      scenario: "初次相遇的场景设定",
      exampleDialogue: "<user>: 你好\n<AI>: *微笑* 你好呀！",
      firstMessage: "*微笑着看着你* “你好，终于见到你了！”",
      boundWorldBookIds: [],
      tags: ["原创"],
    };
    setFormData(newChar);
    setIsEditing(true);
  };

  const handleEditChar = (char: CharacterCard) => {
    setFormData(char);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!formData.name) return;
    const charToSave: CharacterCard = {
      id: formData.id || `char_${Date.now()}`,
      name: formData.name || "未命名",
      avatar: formData.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
      tagline: formData.tagline || "",
      description: formData.description || "",
      personality: formData.personality || "",
      scenario: formData.scenario || "",
      exampleDialogue: formData.exampleDialogue || "",
      firstMessage: formData.firstMessage || "",
      boundWorldBookIds: formData.boundWorldBookIds || [],
      tags: formData.tags || ["角色卡"],
    };

    onSaveCharacter(charToSave);
    setSelectedChar(charToSave);
    setIsEditing(false);
  };

  const handleExportCardJSON = (char: CharacterCard) => {
    // V2 Character Card format JSON
    const v2Card = {
      spec: "chara_card_v2",
      spec_version: "2.0",
      data: {
        name: char.name,
        description: char.description,
        personality: char.personality,
        scenario: char.scenario,
        first_mes: char.firstMessage,
        mes_example: char.exampleDialogue,
        creator_notes: char.tagline,
        tags: char.tags,
      },
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(v2Card, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${char.name}_CharacterCard.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="flex-1 w-full h-full flex flex-col bg-gradient-to-b from-rose-50 via-pink-50/50 to-purple-50/40 text-slate-800 overflow-hidden font-sans">
      {/* Header */}
      <div className="p-4 bg-white/90 border-b border-rose-100 flex items-center justify-between shadow-sm backdrop-blur-md">
        <div className="flex items-center space-x-2">
          <button onClick={onBackToHome} className="p-1 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-rose-500" />
            <h1 className="text-base font-bold text-slate-800">角色工坊 (Character Cards)</h1>
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          <label className="flex items-center space-x-1 px-2.5 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 cursor-pointer shadow-xs transition-all active:scale-95" title="导入角色卡 (JSON)">
            <Upload className="w-3.5 h-3.5" />
            <span>导入</span>
            <input
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (evt) => {
                    const text = evt.target?.result as string;
                    if (text) onImportCharacterCard(text);
                  };
                  reader.readAsText(file);
                  e.target.value = "";
                }
              }}
            />
          </label>
          <button
            onClick={handleStartCreate}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>新建角色卡</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-2/5 border-r border-rose-100 bg-white/60 p-2 overflow-y-auto space-y-2">
          {characters.map((char) => {
            const isSelected = selectedChar?.id === char.id;
            return (
              <div
                key={char.id}
                onClick={() => {
                  setSelectedChar(char);
                  setIsEditing(false);
                }}
                className={`p-2.5 rounded-2xl border cursor-pointer flex items-center space-x-2.5 transition-all shadow-sm ${
                  isSelected
                    ? "bg-rose-50 border-rose-400 text-rose-950 ring-2 ring-rose-300"
                    : "bg-white border-rose-100 text-slate-700 hover:border-rose-300"
                }`}
              >
                <img src={char.avatar} alt={char.name} className="w-10 h-10 rounded-xl object-cover shrink-0 ring-1 ring-rose-200" />
                <div className="truncate">
                  <h3 className="text-xs font-bold truncate">{char.name}</h3>
                  <p className="text-[10px] text-rose-500 truncate">{char.tagline}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Details / Editor */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isEditing ? (
            <div className="bg-white border border-rose-100 rounded-2xl p-4 space-y-3 shadow-sm">
              <h3 className="text-xs font-bold text-rose-600">
                {formData.id ? "编辑角色卡人设" : "新建角色卡"}
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">角色名字</label>
                  <input
                    type="text"
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-rose-50/50 border border-rose-200 rounded-xl p-2.5 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">头像图片 URL</label>
                  <input
                    type="text"
                    value={formData.avatar || ""}
                    onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                    className="w-full bg-rose-50/50 border border-rose-200 rounded-xl p-2.5 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">一句话副标题 / 标语</label>
                  <input
                    type="text"
                    value={formData.tagline || ""}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    className="w-full bg-rose-50/50 border border-rose-200 rounded-xl p-2.5 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">角色人设详细背景 (Description)</label>
                  <textarea
                    value={formData.description || ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white resize-none"
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">开场白消息 (First Message)</label>
                  <textarea
                    value={formData.firstMessage || ""}
                    onChange={(e) => setFormData({ ...formData, firstMessage: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white resize-none"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">绑定世界书</label>
                  <div className="space-y-1">
                    {worldBooks.map((wb) => {
                      const isBound = (formData.boundWorldBookIds || []).includes(wb.id);
                      return (
                        <label key={wb.id} className="flex items-center space-x-2 text-xs text-slate-300">
                          <input
                            type="checkbox"
                            checked={isBound}
                            onChange={(e) => {
                              const current = formData.boundWorldBookIds || [];
                              const updated = e.target.checked
                                ? [...current, wb.id]
                                : current.filter((id) => id !== wb.id);
                              setFormData({ ...formData, boundWorldBookIds: updated });
                            }}
                            className="rounded accent-rose-500"
                          />
                          <span>📖 {wb.title}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs"
                >
                  取消
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs"
                >
                  保存角色
                </button>
              </div>
            </div>
          ) : selectedChar ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <img
                    src={selectedChar.avatar}
                    alt={selectedChar.name}
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-rose-500"
                  />
                  <div>
                    <h2 className="text-base font-bold text-white">{selectedChar.name}</h2>
                    <p className="text-xs text-rose-400">{selectedChar.tagline}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleExportCardJSON(selectedChar)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                    title="导出 Tavern V2 角色卡"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleEditChar(selectedChar)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmCharId(selectedChar.id)}
                    className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition-colors"
                    title="删除角色"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-3 text-xs leading-relaxed">
                <div>
                  <h4 className="font-semibold text-slate-400 mb-1">开场消息:</h4>
                  <p className="text-slate-200 bg-slate-950 p-2.5 rounded-xl">{selectedChar.firstMessage}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-400 mb-1">人设描述:</h4>
                  <p className="text-slate-200 bg-slate-950 p-2.5 rounded-xl whitespace-pre-wrap">
                    {selectedChar.description}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500 text-xs">
              选择或新建角色卡
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmCharId && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-xs bg-white rounded-3xl p-5 space-y-4 shadow-2xl border border-rose-100 text-center">
            <div className="w-12 h-12 bg-rose-100 text-rose-500 rounded-2xl flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">删除角色卡</h3>
              <p className="text-xs text-slate-500 mt-1">
                确定要删除这个角色吗？相关的聊天纪录与设定将被一同移除，此操作无法撤销。
              </p>
            </div>
            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => setDeleteConfirmCharId(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => {
                  if (deleteConfirmCharId) {
                    const remaining = characters.filter((c) => c.id !== deleteConfirmCharId);
                    onDeleteCharacter(deleteConfirmCharId);
                    setSelectedChar(remaining[0] || null);
                    setDeleteConfirmCharId(null);
                  }
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs transition-colors shadow-sm"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
