import React, { useState, useRef, useEffect } from "react";
import {
  CharacterCard,
  ChatMessage,
  WorldBook,
  ApiConfig,
  UserPersona,
} from "../../types";
import { findActiveLoreEntries } from "../../utils/worldBookMatcher";
import {
  CHARACTER_PRACTICE_DATA,
  DEFAULT_PRACTICE_DATA,
} from "../../data/mockChatData";
import {
  Search,
  Send,
  Sparkles,
  BookOpen,
  Volume2,
  VolumeX,
  RotateCcw,
  Edit3,
  Trash2,
  Image as ImageIcon,
  ChevronLeft,
  Info,
  Pin,
  Plus,
  Zap,
  MoreVertical,
  Settings,
  Check,
  User,
  Flame,
  MessageSquare,
  AlertCircle,
} from "lucide-react";

interface SocialAppProps {
  characters: CharacterCard[];
  messages: Record<string, ChatMessage[]>;
  worldBooks: WorldBook[];
  apiConfig: ApiConfig;
  userPersona: UserPersona;
  onSendMessage: (characterId: string, text: string, imageUrl?: string) => Promise<void>;
  onAddSimulatedPair?: (characterId: string, userText: string, botReplyText: string) => void;
  onRegenerateMessage: (characterId: string) => Promise<void>;
  onDeleteMessage: (characterId: string, messageId: string) => void;
  onEditMessage: (characterId: string, messageId: string, newText: string) => void;
  onClearChatHistory: (characterId: string) => void;
  onDeleteCharacter?: (characterId: string) => void;
  onOpenStudio: () => void;
  onOpenWorldBook: () => void;
  onBackToHome: () => void;
}

export const SocialApp: React.FC<SocialAppProps> = ({
  characters,
  messages,
  worldBooks,
  apiConfig,
  userPersona,
  onSendMessage,
  onAddSimulatedPair,
  onRegenerateMessage,
  onDeleteMessage,
  onEditMessage,
  onClearChatHistory,
  onDeleteCharacter,
  onOpenStudio,
  onOpenWorldBook,
  onBackToHome,
}) => {
  const [activeTab, setActiveTab] = useState<"contacts" | "chats">("contacts");
  const [selectedCharId, setSelectedCharId] = useState<string | null>(null);
  const [inputText, setInputText] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);
  const [showCharDetails, setShowCharDetails] = useState<boolean>(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>("");
  const [deletingChar, setDeletingChar] = useState<CharacterCard | null>(null);
  const [hasShownPracticeNotice, setHasShownPracticeNotice] = useState<boolean>(() => {
    return localStorage.getItem("cy_practice_notice_shown") === "true";
  });
  const [showPracticeModal, setShowPracticeModal] = useState<boolean>(false);

  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressTriggered = useRef<boolean>(false);

  const handleTouchStartContact = (char: CharacterCard) => {
    isLongPressTriggered.current = false;
    longPressTimerRef.current = setTimeout(() => {
      isLongPressTriggered.current = true;
      if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(50);
      }
      setDeletingChar(char);
    }, 600);
  };

  const handleTouchEndContact = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const chatEndRef = useRef<HTMLDivElement>(null);

  const selectedChar = characters.find((c) => c.id === selectedCharId);
  const currentMessages = selectedCharId ? messages[selectedCharId] || [] : [];

  // Active Lore Entries matched in recent chat context
  const activeLore = selectedChar
    ? findActiveLoreEntries(currentMessages, worldBooks, selectedChar.boundWorldBookIds)
    : { activeEntries: [], matchedKeys: [] };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages, isSending]);

  // Handle Voice Audio TTS
  const toggleSpeech = (msgId: string, text: string) => {
    if (playingAudioId === msgId) {
      window.speechSynthesis.cancel();
      setPlayingAudioId(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean markdown/asterisks for audio
    const cleanText = text.replace(/\*.*?\*/g, "").replace(/[`#_]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "zh-CN";
    utterance.rate = 1.0;
    utterance.onend = () => setPlayingAudioId(null);
    utterance.onerror = () => setPlayingAudioId(null);

    setPlayingAudioId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async () => {
    if (!inputText.trim() || !selectedCharId || isSending) return;
    const text = inputText;
    setInputText("");
    setIsSending(true);
    try {
      await onSendMessage(selectedCharId, text);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const handleGenerateSceneImage = async () => {
    if (!selectedCharId || isGeneratingImage) return;
    setIsGeneratingImage(true);
    try {
      const prompt = `A vivid anime style scene of character ${selectedChar?.name}: ${selectedChar?.tagline || ""}. High quality portrait, aesthetic lighting.`;
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (data.imageUrl) {
        await onSendMessage(selectedCharId, "*发送了一张场景快照*", data.imageUrl);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleSelectPresetOption = (optionText: string) => {
    if (!selectedCharId || isSending) return;

    // Show practice notice modal only once
    if (!hasShownPracticeNotice) {
      setShowPracticeModal(true);
      setHasShownPracticeNotice(true);
      localStorage.setItem("cy_practice_notice_shown", "true");
    }

    // Get 10+ random replies
    const practiceData = CHARACTER_PRACTICE_DATA[selectedCharId] || DEFAULT_PRACTICE_DATA;
    const replies = practiceData.characterRandomReplies;
    const randomReply = replies[Math.floor(Math.random() * replies.length)];

    setIsSending(true);

    setTimeout(() => {
      if (onAddSimulatedPair) {
        onAddSimulatedPair(selectedCharId, optionText, randomReply);
      }
      setIsSending(false);
    }, 800);
  };

  const currentPracticeData = selectedCharId
    ? CHARACTER_PRACTICE_DATA[selectedCharId] || DEFAULT_PRACTICE_DATA
    : DEFAULT_PRACTICE_DATA;

  const filteredCharacters = characters.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex-1 w-full h-full flex flex-col bg-gradient-to-b from-rose-50 via-pink-50/50 to-purple-50/40 text-slate-800 overflow-hidden font-sans">
      {/* 1. CHAT DETAIL VIEW */}
      {selectedCharId && selectedChar ? (
        <div className="flex-1 flex flex-col h-full bg-gradient-to-b from-rose-50/80 via-pink-50/40 to-white relative overflow-hidden">
          {/* Header */}
          <div className="h-14 px-3 bg-white/90 backdrop-blur-md border-b border-rose-100 flex items-center justify-between z-20 shadow-sm">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSelectedCharId(null)}
                className="p-1.5 rounded-full hover:bg-rose-50 text-slate-600 active:scale-95 transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div
                onClick={() => setShowCharDetails(true)}
                className="flex items-center space-x-2.5 cursor-pointer hover:opacity-80 transition-opacity"
              >
                <div className="relative">
                  <img
                    src={selectedChar.avatar}
                    alt={selectedChar.name}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-rose-300 shadow-sm"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-1">
                    <span>{selectedChar.name}</span>
                    {selectedChar.isPinned && <Pin className="w-3 h-3 text-amber-500 fill-amber-500" />}
                  </h3>
                  <p className="text-[10px] text-rose-500 font-medium truncate max-w-[130px]">
                    {selectedChar.tagline}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              {/* Active World Book Trigger Badge Button */}
              {activeLore.matchedKeys.length > 0 && (
                <button
                  onClick={onOpenWorldBook}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-semibold animate-pulse shadow-sm"
                  title="查看当前触发的世界书词条"
                >
                  <Zap className="w-3 h-3 text-amber-600" />
                  <span>世界书 ({activeLore.matchedKeys.length})</span>
                </button>
              )}

              <button
                onClick={() => setShowCharDetails(!showCharDetails)}
                className="p-2 rounded-full hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors"
                title="聊天设置"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Chat Message Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
            {currentMessages.map((msg) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={msg.id}
                  className={`flex items-start space-x-2.5 ${isUser ? "flex-row-reverse space-x-reverse" : "flex-row"} group`}
                >
                  {/* Avatar */}
                  <img
                    src={isUser ? userPersona.avatar : selectedChar.avatar}
                    alt="avatar"
                    className="w-8 h-8 rounded-full object-cover shrink-0 ring-2 ring-white shadow-sm"
                  />

                  {/* Bubble Container */}
                  <div className={`max-w-[78%] flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                    <div className="flex items-center space-x-1 text-[10px] text-slate-400 mb-1 px-1">
                      <span>{isUser ? userPersona.name : selectedChar.name}</span>
                      <span>·</span>
                      <span>
                        {new Date(msg.timestamp).toLocaleTimeString("zh-CN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    {/* Standard Message Bubble */}
                    <div
                      className={`relative rounded-2xl p-3 text-xs leading-relaxed shadow-sm border ${
                        isUser
                          ? "bg-rose-500 border-rose-400 text-white rounded-tr-none"
                          : "bg-white border-rose-100 text-slate-800 rounded-tl-none"
                      }`}
                    >
                      {/* Attached Image if any */}
                      {msg.imageUrl && (
                        <img
                          src={msg.imageUrl}
                          alt="Attached scene"
                          className="w-full max-h-56 object-cover rounded-xl mb-2 border border-slate-200"
                        />
                      )}

                      {/* Text Content with Action Italic Formatting */}
                      <div className="whitespace-pre-wrap break-words">
                        {msg.content.split(/(\*.*?\*)/g).map((part, i) => {
                          if (part.startsWith("*") && part.endsWith("*")) {
                            return (
                              <span key={i} className={`italic font-light ${isUser ? "text-rose-100" : "text-rose-600"}`}>
                                {part}
                              </span>
                            );
                          }
                          return <span key={i}>{part}</span>;
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* AI Thinking indicator */}
            {isSending && (
              <div className="flex items-start space-x-2.5">
                <img
                  src={selectedChar.avatar}
                  alt="avatar"
                  className="w-8 h-8 rounded-full object-cover shrink-0 ring-2 ring-rose-200 animate-pulse"
                />
                <div className="bg-white border border-rose-100 rounded-2xl rounded-tl-none p-3 text-xs text-rose-600 flex items-center space-x-2 shadow-sm">
                  <Sparkles className="w-4 h-4 text-rose-500 animate-spin" />
                  <span>{selectedChar.name} 正在思考并检索世界书...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Bottom Chat Options Bar (Practice Mode) */}
          <div className="p-3 bg-white/95 border-t border-rose-100 flex flex-col space-y-2 shadow-sm z-10 backdrop-blur-md">
            <div className="flex items-center justify-between text-[11px] text-rose-500 font-medium px-1">
              <span className="flex items-center space-x-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-rose-500" />
                <span>请点击下方预设话语发送沟通（选择选项）：</span>
              </span>
              <span className="text-[10px] bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full border border-rose-200">
                练习模式
              </span>
            </div>

            {/* 3 Preset Options */}
            <div className="flex flex-col space-y-1.5">
              {currentPracticeData.userPresetOptions.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectPresetOption(option)}
                  disabled={isSending}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-rose-50/90 to-pink-50/70 hover:from-rose-100 hover:to-pink-100 border border-rose-200/80 text-xs text-slate-800 font-medium shadow-2xs hover:shadow-xs active:scale-[0.99] transition-all flex items-center justify-between group disabled:opacity-50"
                >
                  <span className="truncate pr-2">{option}</span>
                  <Send className="w-3.5 h-3.5 text-rose-400 group-hover:text-rose-600 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </button>
              ))}
            </div>
          </div>

          {/* Practice API Modal Notice */}
          {showPracticeModal && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
              <div className="bg-white border border-rose-100 rounded-3xl p-5 max-w-xs w-full shadow-2xl flex flex-col items-center text-center space-y-3 animate-scaleUp">
                <div className="w-12 h-12 rounded-full bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-500 shadow-inner">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-black text-slate-800">提示</h3>
                  <p className="text-xs text-rose-600 font-bold bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200">
                    此为练习未正式接入api
                  </p>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed px-1">
                  当前处于本地对话练习互动模式，话语将由预设剧本角色进行智能匹配回应。
                </p>
                <button
                  onClick={() => setShowPracticeModal(false)}
                  className="w-full py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 active:scale-95 text-white font-bold text-xs shadow-md shadow-rose-200 transition-all border border-rose-600"
                >
                  我知道了
                </button>
              </div>
            </div>
          )}

          {/* Character Details Drawer Modal */}
          {showCharDetails && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-50 flex flex-col justify-end animate-fadeIn">
              <div className="bg-white border-t border-rose-100 rounded-t-3xl p-5 space-y-4 max-h-[85%] overflow-y-auto shadow-2xl">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <img
                      src={selectedChar.avatar}
                      alt={selectedChar.name}
                      className="w-14 h-14 rounded-2xl object-cover ring-2 ring-rose-400 shadow-sm"
                    />
                    <div>
                      <h2 className="text-base font-bold text-slate-800">{selectedChar.name}</h2>
                      <p className="text-xs text-rose-500 font-medium">{selectedChar.tagline}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCharDetails(false)}
                    className="p-1.5 rounded-full bg-rose-50 text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <h4 className="font-bold text-slate-600 mb-1">人设设定与外貌描述:</h4>
                    <p className="text-slate-700 bg-rose-50/60 p-2.5 rounded-xl leading-relaxed border border-rose-100">
                      {selectedChar.description}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-600 mb-1">性格特征:</h4>
                    <p className="text-slate-700 bg-rose-50/60 p-2.5 rounded-xl border border-rose-100">{selectedChar.personality}</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-600 mb-1">绑定世界书:</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedChar.boundWorldBookIds.map((bid) => {
                        const book = worldBooks.find((w) => w.id === bid);
                        return (
                          <span
                            key={bid}
                            className="bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full text-[10px] font-medium"
                          >
                            📖 {book?.title || bid}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-rose-100 flex flex-col space-y-2">
                  <div className="flex justify-between space-x-2">
                    <button
                      onClick={() => {
                        if (confirm(`确定要清空与 ${selectedChar.name} 的所有聊天记录吗？`)) {
                          onClearChatHistory(selectedChar.id);
                          setShowCharDetails(false);
                        }
                      }}
                      className="flex-1 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold transition-all"
                    >
                      清空聊天记录
                    </button>
                    <button
                      onClick={onOpenStudio}
                      className="flex-1 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-900 border border-slate-800/40 text-xs font-bold shadow-xs transition-all"
                    >
                      编辑角色卡
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      setDeletingChar(selectedChar);
                      setShowCharDetails(false);
                    }}
                    className="w-full py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold border border-rose-600 shadow-xs transition-all flex items-center justify-center space-x-1.5"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>删除此联系人 / 好友</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* 2. MAIN SOCIAL MESSENGER TAB (CONVERSATION LIST & CONTACTS) */
        <div className="flex-1 flex flex-col h-full bg-gradient-to-b from-rose-50 via-pink-50/40 to-white overflow-hidden">
          {/* Header */}
          <div className="p-4 bg-white/90 border-b border-rose-100 flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-2">
              <button
                onClick={onBackToHome}
                className="p-1 rounded-lg text-slate-500 hover:text-rose-600"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-1.5">
                <span className="text-base font-black text-slate-800">QQ</span>
              </div>
            </div>

            <button
              onClick={onOpenStudio}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-rose-500 hover:bg-rose-400 text-white text-xs font-medium active:scale-95 transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>添加好友</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="p-3 bg-white/60 border-b border-rose-100">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索QQ联系人、好友或标签..."
                className="w-full bg-white border border-rose-200 rounded-full pl-9 pr-4 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rose-400"
              />
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex border-b border-rose-100 bg-white/40 text-xs text-slate-600 font-medium">
            <button
              onClick={() => setActiveTab("contacts")}
              className={`flex-1 py-2.5 text-center border-b-2 transition-colors ${
                activeTab === "contacts"
                  ? "border-rose-500 text-rose-600 font-bold bg-white/60"
                  : "border-transparent hover:text-rose-500"
              }`}
            >
              联系人 ({characters.length})
            </button>
            <button
              onClick={() => setActiveTab("chats")}
              className={`flex-1 py-2.5 text-center border-b-2 transition-colors ${
                activeTab === "chats"
                  ? "border-rose-500 text-rose-600 font-bold bg-white/60"
                  : "border-transparent hover:text-rose-500"
              }`}
            >
              消息列表
            </button>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {activeTab === "contacts" ? (
              /* Contacts / QQ Friend List View */
              <div className="space-y-2 p-1">
                <div className="flex items-center justify-between px-2 py-1 text-xs font-black text-slate-700">
                  <span className="flex items-center space-x-1">
                    <span>🐧</span>
                    <span>我的好友 ({filteredCharacters.length})</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">[ 全部在线 ]</span>
                </div>

                {filteredCharacters.map((char) => (
                  <div
                    key={char.id}
                    onTouchStart={() => handleTouchStartContact(char)}
                    onTouchEnd={handleTouchEndContact}
                    onTouchMove={handleTouchEndContact}
                    onMouseDown={() => handleTouchStartContact(char)}
                    onMouseUp={handleTouchEndContact}
                    onMouseLeave={handleTouchEndContact}
                    onClick={() => {
                      if (isLongPressTriggered.current) {
                        isLongPressTriggered.current = false;
                        return;
                      }
                      setSelectedCharId(char.id);
                    }}
                    className="p-3 rounded-2xl bg-white border border-slate-200/80 hover:border-amber-300 hover:bg-amber-50/30 flex flex-col space-y-2.5 shadow-xs cursor-pointer active:scale-98 transition-all relative group selection:bg-none"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="relative shrink-0">
                          <img
                            src={char.avatar}
                            alt={char.name}
                            className="w-11 h-11 rounded-2xl object-cover ring-2 ring-amber-200 shadow-xs"
                          />
                          <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white shadow-xs" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <h3 className="text-xs font-black text-slate-800">{char.name}</h3>
                            <span className="bg-emerald-100 text-emerald-700 text-[9px] font-extrabold px-1.5 py-0.2 rounded-md">
                              [在线]
                            </span>
                            {char.isPinned && <Pin className="w-3 h-3 text-amber-500 fill-amber-500" />}
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium truncate max-w-[180px] mt-0.5">
                            {char.tagline}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCharId(char.id);
                        }}
                        className="px-3 py-1.5 rounded-full bg-amber-400 hover:bg-amber-500 text-slate-900 text-xs font-bold border border-slate-800/40 shadow-xs active:scale-95 transition-all"
                      >
                        发消息
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-100">
                      {char.tags.map((t, idx) => (
                        <span key={idx} className="bg-amber-100/60 text-amber-900 border border-amber-200/60 text-[10px] px-2 py-0.5 rounded-md font-bold">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Chats / Recent Messages View */
              <div className="space-y-1">
                {filteredCharacters.map((char) => {
                  const charMsgs = messages[char.id] || [];
                  const lastMsg = charMsgs[charMsgs.length - 1];
                  return (
                    <div
                      key={char.id}
                      onClick={() => setSelectedCharId(char.id)}
                      className="p-3 rounded-2xl bg-white hover:bg-rose-50/80 border border-rose-100/80 flex items-center justify-between cursor-pointer transition-all shadow-sm active:scale-98"
                    >
                      <div className="flex items-center space-x-3 truncate">
                        <div className="relative shrink-0">
                          <img
                            src={char.avatar}
                            alt={char.name}
                            className="w-12 h-12 rounded-2xl object-cover ring-2 ring-rose-200 shadow-sm"
                          />
                          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
                        </div>
                        <div className="truncate">
                          <div className="flex items-center space-x-1">
                            <h3 className="text-xs font-bold text-slate-800 truncate">{char.name}</h3>
                            {char.isPinned && <Pin className="w-3 h-3 text-amber-500 fill-amber-500" />}
                          </div>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            {lastMsg ? lastMsg.content : char.tagline}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end space-y-1 shrink-0 ml-2">
                        <span className="text-[10px] text-slate-400">
                          {lastMsg
                            ? new Date(lastMsg.timestamp).toLocaleTimeString("zh-CN", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "刚刚"}
                        </span>
                        {char.unreadCount ? (
                          <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                            {char.unreadCount}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Contact Confirmation Modal */}
      {deletingChar && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border-2 border-slate-800 p-5 max-w-xs w-full shadow-2xl flex flex-col items-center text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-500 border border-rose-300 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-800">删除联系人？</h3>
              <p className="text-xs text-slate-600 font-medium mt-1">
                确定要删除好友 <span className="font-bold text-rose-600">"{deletingChar.name}"</span> 吗？相关聊天记录将被移除。
              </p>
            </div>
            <div className="flex space-x-2 w-full pt-1">
              <button
                onClick={() => setDeletingChar(null)}
                className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-300 transition-all active:scale-95"
              >
                取消
              </button>
              <button
                onClick={() => {
                  if (onDeleteCharacter) {
                    onDeleteCharacter(deletingChar.id);
                  }
                  if (selectedCharId === deletingChar.id) {
                    setSelectedCharId(null);
                  }
                  setDeletingChar(null);
                }}
                className="flex-1 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold border border-rose-600 shadow-xs active:scale-95 transition-all"
              >
                确定删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
