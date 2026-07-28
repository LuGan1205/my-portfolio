import React, { useState } from "react";
import { WorldBook, WorldEntry, CharacterCard, InsertionPosition } from "../../types";
import {
  BookOpen,
  Plus,
  Trash2,
  Edit3,
  Search,
  Check,
  ChevronLeft,
  Sparkles,
  Zap,
  Download,
  Upload,
  Layers,
  FileText,
  Sliders,
  HelpCircle,
} from "lucide-react";

interface WorldBookAppProps {
  worldBooks: WorldBook[];
  characters: CharacterCard[];
  onSaveWorldBook: (book: WorldBook) => void;
  onDeleteWorldBook: (id: string) => void;
  onImportWorldBook: (jsonString: string) => void;
  onBackToHome: () => void;
}

export const WorldBookApp: React.FC<WorldBookAppProps> = ({
  worldBooks,
  characters,
  onSaveWorldBook,
  onDeleteWorldBook,
  onImportWorldBook,
  onBackToHome,
}) => {
  const [selectedBookId, setSelectedBookId] = useState<string | null>(
    worldBooks[0]?.id || null
  );
  const [isEditingEntry, setIsEditingEntry] = useState<boolean>(false);
  const [editingEntry, setEditingEntry] = useState<Partial<WorldEntry> | null>(null);
  const [sandboxText, setSandboxText] = useState<string>(
    "下午路过云朵烘焙坊，桃子刚出炉了热气腾腾的草莓舒芙蕾和棉花糖玫瑰热可可，说今晚还要和我一起去银河星空观测台看流星..."
  );

  const [deleteConfirmBookId, setDeleteConfirmBookId] = useState<string | null>(null);

  const selectedBook = worldBooks.find((w) => w.id === selectedBookId);

  // Calculate sandbox triggers
  const sandboxMatches = selectedBook
    ? selectedBook.entries.filter((entry) => {
        if (!entry.enabled) return false;
        return entry.keys.some((k) =>
          k.trim() && sandboxText.toLowerCase().includes(k.trim().toLowerCase())
        );
      })
    : [];

  const handleCreateNewBook = () => {
    const newBook: WorldBook = {
      id: `wb_${Date.now()}`,
      title: "新世界书草稿",
      description: "用于设定背景世界观、词条与触发关键词的词条库。",
      updatedAt: Date.now(),
      entries: [
        {
          id: `we_${Date.now()}`,
          title: "示例文本词条",
          keys: ["关键词1", "关键词2"],
          content: "当聊到此关键词时，该段背景世界观会自动插入 AI 的记忆提示词中。",
          enabled: true,
          position: "after_sys",
          matchCount: 0,
        },
      ],
    };
    onSaveWorldBook(newBook);
    setSelectedBookId(newBook.id);
  };

  const handleSaveEntry = () => {
    if (!selectedBook || !editingEntry?.title) return;
    const isNew = !editingEntry.id;
    const entryToSave: WorldEntry = {
      id: editingEntry.id || `we_${Date.now()}`,
      title: editingEntry.title || "未命名词条",
      keys: editingEntry.keys || [],
      content: editingEntry.content || "",
      enabled: editingEntry.enabled !== false,
      position: editingEntry.position || "after_sys",
      depth: editingEntry.depth || 4,
      matchCount: editingEntry.matchCount || 0,
    };

    const updatedEntries = isNew
      ? [...selectedBook.entries, entryToSave]
      : selectedBook.entries.map((e) => (e.id === entryToSave.id ? entryToSave : e));

    onSaveWorldBook({
      ...selectedBook,
      entries: updatedEntries,
      updatedAt: Date.now(),
    });

    setIsEditingEntry(false);
    setEditingEntry(null);
  };

  const handleDeleteEntry = (entryId: string) => {
    if (!selectedBook) return;
    const updatedEntries = selectedBook.entries.filter((e) => e.id !== entryId);
    onSaveWorldBook({
      ...selectedBook,
      entries: updatedEntries,
      updatedAt: Date.now(),
    });
  };

  const handleExportJSON = (book: WorldBook) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(book, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${book.title}_WorldBook.json`);
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
            <BookOpen className="w-5 h-5 text-amber-600" />
            <h1 className="text-base font-bold text-slate-800">世界书 (World Info)</h1>
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          <label className="flex items-center space-x-1 px-2.5 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs border border-amber-200 cursor-pointer shadow-xs transition-all active:scale-95" title="导入世界书 (JSON)">
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
                    if (text) onImportWorldBook(text);
                  };
                  reader.readAsText(file);
                  e.target.value = "";
                }
              }}
            />
          </label>
          <button
            onClick={handleCreateNewBook}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-white font-bold text-xs shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>新建世界书</span>
          </button>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left World Book List Sidebar */}
        <div className="w-2/5 border-r border-rose-100 bg-white/60 flex flex-col overflow-y-auto p-2 space-y-2">
          <div className="text-[11px] font-bold text-slate-500 px-2 py-1 flex justify-between items-center">
            <span>所有世界书 ({worldBooks.length})</span>
          </div>

          {worldBooks.map((book) => {
            const isSelected = book.id === selectedBookId;
            return (
              <div
                key={book.id}
                onClick={() => setSelectedBookId(book.id)}
                className={`p-3 rounded-2xl border cursor-pointer transition-all shadow-sm ${
                  isSelected
                    ? "bg-amber-50 border-amber-400 text-amber-950 ring-2 ring-amber-300"
                    : "bg-white border-rose-100 hover:border-amber-300 text-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold truncate">{book.title}</h3>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold font-mono">
                    {book.entries.length} 词条
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 line-clamp-2 mt-1">{book.description}</p>
              </div>
            );
          })}
        </div>

        {/* Right Detail & Entry Editor Area */}
        {selectedBook ? (
          <div className="flex-1 flex flex-col overflow-y-auto p-4 space-y-4">
            {/* World Book Metadata */}
            <div className="bg-white/90 border border-rose-100 rounded-2xl p-4 space-y-3 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <input
                    type="text"
                    value={selectedBook.title}
                    onChange={(e) => onSaveWorldBook({ ...selectedBook, title: e.target.value })}
                    className="bg-transparent text-sm font-bold text-slate-800 focus:outline-none border-b border-transparent focus:border-amber-500 w-full"
                  />
                  <textarea
                    value={selectedBook.description}
                    onChange={(e) => onSaveWorldBook({ ...selectedBook, description: e.target.value })}
                    className="bg-transparent text-xs text-slate-500 focus:outline-none border-b border-transparent focus:border-amber-500 w-full resize-none mt-1"
                    rows={2}
                  />
                </div>
                <div className="flex items-center space-x-1 shrink-0 ml-2">
                  <button
                    onClick={() => handleExportJSON(selectedBook)}
                    className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-slate-600 text-xs flex items-center space-x-1 border border-rose-100"
                    title="导出 JSON 词条包"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmBookId(selectedBook.id)}
                    className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 transition-colors"
                    title="删除世界书"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Live Trigger Sandbox / Testing Box */}
            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3 space-y-2 shadow-sm">
              <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                <span className="flex items-center space-x-1">
                  <Zap className="w-4 h-4 text-amber-400 animate-bounce" />
                  <span>实时词条触发测试演练沙盒</span>
                </span>
                <span className="text-[10px] text-amber-400/80">
                  匹配到 ({sandboxMatches.length}) 个词条
                </span>
              </div>
              <textarea
                value={sandboxText}
                onChange={(e) => setSandboxText(e.target.value)}
                placeholder="在此输入测试文本..."
                className="w-full bg-slate-950 border border-amber-900/50 rounded-xl p-2.5 text-xs text-amber-100 placeholder-amber-700/50 focus:outline-none focus:border-amber-500 resize-none"
                rows={2}
              />
              {sandboxMatches.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {sandboxMatches.map((m) => (
                    <span
                      key={m.id}
                      className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] px-2 py-0.5 rounded-full font-medium"
                    >
                      ⚡ {m.title}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Entry Management Header */}
            <div className="flex items-center justify-between pt-2">
              <h3 className="text-xs font-bold text-slate-300 flex items-center space-x-1">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>词条列表 ({selectedBook.entries.length})</span>
              </h3>
              <button
                onClick={() => {
                  setEditingEntry({
                    title: "",
                    keys: ["新关键词"],
                    content: "",
                    enabled: true,
                    position: "after_sys",
                  });
                  setIsEditingEntry(true);
                }}
                className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-medium flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>添加词条</span>
              </button>
            </div>

            {/* Entry Items */}
            <div className="space-y-2">
              {selectedBook.entries.map((entry) => (
                <div
                  key={entry.id}
                  className={`p-3 rounded-2xl border transition-all ${
                    entry.enabled
                      ? "bg-slate-900 border-slate-800"
                      : "bg-slate-950 border-slate-900 opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={entry.enabled}
                        onChange={(e) => {
                          const updated = selectedBook.entries.map((item) =>
                            item.id === entry.id ? { ...item, enabled: e.target.checked } : item
                          );
                          onSaveWorldBook({ ...selectedBook, entries: updated });
                        }}
                        className="rounded accent-amber-500"
                      />
                      <h4 className="text-xs font-bold text-white">{entry.title}</h4>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => {
                          setEditingEntry(entry);
                          setIsEditingEntry(true);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-white"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Keywords tags */}
                  <div className="flex flex-wrap gap-1 my-2">
                    {entry.keys.map((k, idx) => (
                      <span
                        key={idx}
                        className="bg-slate-800 text-amber-300 text-[10px] px-2 py-0.5 rounded-md font-mono"
                      >
                        #{k}
                      </span>
                    ))}
                  </div>

                  <p className="text-[11px] text-slate-300 bg-slate-950 p-2 rounded-xl whitespace-pre-wrap">
                    {entry.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
            选择或新建一本世界书
          </div>
        )}
      </div>

      {/* Entry Modal Drawer */}
      {isEditingEntry && editingEntry && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white">
              {editingEntry.id ? "编辑世界书词条" : "新建世界书词条"}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">词条标题</label>
                <input
                  type="text"
                  value={editingEntry.title || ""}
                  onChange={(e) => setEditingEntry({ ...editingEntry, title: e.target.value })}
                  placeholder="如: 新翠市黑客组织"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">触发关键词 (英文逗号分隔)</label>
                <input
                  type="text"
                  value={(editingEntry.keys || []).join(", ")}
                  onChange={(e) =>
                    setEditingEntry({
                      ...editingEntry,
                      keys: e.target.value.split(",").map((s) => s.trim()),
                    })
                  }
                  placeholder="黑客, 神经网, 新翠市"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">词条内容 (描述与世界观知识)</label>
                <textarea
                  value={editingEntry.content || ""}
                  onChange={(e) => setEditingEntry({ ...editingEntry, content: e.target.value })}
                  placeholder="详细描述该名词的背景、规则与重要设定..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500 resize-none"
                  rows={4}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setIsEditingEntry(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs"
              >
                取消
              </button>
              <button
                onClick={handleSaveEntry}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
              >
                保存词条
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmBookId && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-xs bg-white rounded-3xl p-5 space-y-4 shadow-2xl border border-rose-100 text-center">
            <div className="w-12 h-12 bg-rose-100 text-rose-500 rounded-2xl flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">删除世界书</h3>
              <p className="text-xs text-slate-500 mt-1">
                确定要删除这本世界书吗？里面的所有词条设定将被一同移除，此操作无法撤销。
              </p>
            </div>
            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => setDeleteConfirmBookId(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => {
                  if (deleteConfirmBookId) {
                    const remaining = worldBooks.filter((b) => b.id !== deleteConfirmBookId);
                    onDeleteWorldBook(deleteConfirmBookId);
                    setSelectedBookId(remaining[0]?.id || null);
                    setDeleteConfirmBookId(null);
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
