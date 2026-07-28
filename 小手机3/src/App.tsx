import React, { useState, useEffect } from "react";
import {
  AppId,
  CharacterCard,
  ChatMessage,
  WorldBook,
  WorldEntry,
  ApiConfig,
  UserPersona,
  PhoneSettings,
} from "./types";
import {
  DEFAULT_CHARACTERS,
  DEFAULT_WORLD_BOOKS,
  DEFAULT_API_CONFIG,
  DEFAULT_USER_PERSONA,
  DEFAULT_PHONE_SETTINGS,
  INITIAL_MESSAGES,
} from "./data/defaultData";
import { findActiveLoreEntries } from "./utils/worldBookMatcher";
import { PhoneContainer } from "./components/PhoneContainer";
import { PhoneHomeScreen } from "./components/PhoneHomeScreen";
import { SocialApp } from "./components/apps/SocialApp";
import { WorldBookApp } from "./components/apps/WorldBookApp";
import { SettingsApp } from "./components/apps/SettingsApp";
import { CharacterStudioApp } from "./components/apps/CharacterStudioApp";
import { GalleryApp } from "./components/apps/GalleryApp";
import { GameApp } from "./components/apps/GameApp";
import lumiAvatar from "./assets/images/lumi_clover_avatar_1785062086306.jpg";
import watercolorWallpaper from "./assets/images/watercolor_pastel_wallpaper_1785059388049.jpg";

export default function App() {
  const [activeApp, setActiveApp] = useState<AppId>("home");

  // State with LocalStorage persistence
  const [characters, setCharacters] = useState<CharacterCard[]>(() => {
    const saved = localStorage.getItem("cy_characters");
    if (saved) {
      try {
        let parsed: CharacterCard[] = JSON.parse(saved);
        // Only keep char_liuliu and char_lumi as requested by the user
        parsed = parsed.filter((c) => c.id === "char_liuliu" || c.id === "char_lumi");
        const missingDefaults = DEFAULT_CHARACTERS.filter(
          (defChar) => !parsed.some((c) => c.id === defChar.id)
        );
        if (missingDefaults.length > 0) {
          parsed = [...missingDefaults, ...parsed];
        }
        return parsed;
      } catch (e) {
        return DEFAULT_CHARACTERS;
      }
    }
    return DEFAULT_CHARACTERS;
  });

  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(() => {
    const saved = localStorage.getItem("cy_messages");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        let updated = false;
        Object.keys(INITIAL_MESSAGES).forEach((key) => {
          if (!parsed[key]) {
            parsed[key] = INITIAL_MESSAGES[key];
            updated = true;
          }
        });
        return parsed;
      } catch (e) {
        return INITIAL_MESSAGES;
      }
    }
    return INITIAL_MESSAGES;
  });

  const [worldBooks, setWorldBooks] = useState<WorldBook[]>(() => {
    const saved = localStorage.getItem("cy_worldbooks");
    if (saved) {
      try {
        let parsed: WorldBook[] = JSON.parse(saved);
        const missingWb = DEFAULT_WORLD_BOOKS.filter(
          (defWb) => !parsed.some((w) => w.id === defWb.id)
        );
        if (missingWb.length > 0) {
          parsed = [...missingWb, ...parsed];
        }
        return parsed;
      } catch (e) {
        return DEFAULT_WORLD_BOOKS;
      }
    }
    return DEFAULT_WORLD_BOOKS;
  });

  const [apiConfig, setApiConfig] = useState<ApiConfig>(() => {
    const saved = localStorage.getItem("cy_apiconfig");
    return saved ? JSON.parse(saved) : DEFAULT_API_CONFIG;
  });

  const [userPersona, setUserPersona] = useState<UserPersona>(() => {
    const saved = localStorage.getItem("cy_userpersona");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          avatar: lumiAvatar,
          name: parsed.name && parsed.name !== "小软芽 🐾" ? parsed.name : "LUMI",
        };
      } catch (e) {
        return DEFAULT_USER_PERSONA;
      }
    }
    return DEFAULT_USER_PERSONA;
  });

  const [phoneSettings, setPhoneSettings] = useState<PhoneSettings>(() => {
    const saved = localStorage.getItem("cy_phonesettings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          wallpaper: parsed.wallpaper || watercolorWallpaper,
        };
      } catch (e) {
        return DEFAULT_PHONE_SETTINGS;
      }
    }
    return DEFAULT_PHONE_SETTINGS;
  });

  // Save to LocalStorage on updates
  useEffect(() => {
    localStorage.setItem("cy_characters", JSON.stringify(characters));
  }, [characters]);

  useEffect(() => {
    localStorage.setItem("cy_messages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem("cy_worldbooks", JSON.stringify(worldBooks));
  }, [worldBooks]);

  useEffect(() => {
    localStorage.setItem("cy_apiconfig", JSON.stringify(apiConfig));
  }, [apiConfig]);

  useEffect(() => {
    localStorage.setItem("cy_userpersona", JSON.stringify(userPersona));
  }, [userPersona]);

  useEffect(() => {
    localStorage.setItem("cy_phonesettings", JSON.stringify(phoneSettings));
  }, [phoneSettings]);

  // Handle AI Chat Sending
  const handleSendMessage = async (characterId: string, text: string, imageUrl?: string) => {
    const targetChar = characters.find((c) => c.id === characterId);
    if (!targetChar) return;

    const userMsg: ChatMessage = {
      id: `msg_u_${Date.now()}`,
      characterId,
      role: "user",
      content: text,
      timestamp: Date.now(),
      imageUrl,
    };

    const existingMsgs = messages[characterId] || [];
    const updatedHistory = [...existingMsgs, userMsg];

    setMessages((prev) => ({
      ...prev,
      [characterId]: updatedHistory,
    }));

    // Find Active Lore Entries in current conversation context
    const loreMatch = findActiveLoreEntries(
      updatedHistory,
      worldBooks,
      targetChar.boundWorldBookIds
    );

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedHistory.map((m) => ({ role: m.role, content: m.content })),
          character: targetChar,
          userPersona,
          activeLoreEntries: loreMatch.activeEntries,
          apiConfig,
        }),
      });

      const data = await response.json();
      const replyContent = data.text || "No response received";

      const aiMsg: ChatMessage = {
        id: `msg_a_${Date.now()}`,
        characterId,
        role: "assistant",
        content: replyContent,
        timestamp: Date.now(),
        activeLoreKeys: loreMatch.matchedKeys,
      };

      setMessages((prev) => ({
        ...prev,
        [characterId]: [...prev[characterId], aiMsg],
      }));

      // Update character last message preview
      setCharacters((prev) =>
        prev.map((c) =>
          c.id === characterId
            ? {
                ...c,
                lastMessageText: replyContent,
                lastMessageTime: Date.now(),
                unreadCount: 0,
              }
            : c
        )
      );
    } catch (err) {
      console.error("Chat Error:", err);
      const errorMsg: ChatMessage = {
        id: `msg_err_${Date.now()}`,
        characterId,
        role: "assistant",
        content: `❌ 发送错误: 无法与 AI API 建立通信，请检查 [设置] 中的接口配置或网络状态。`,
        timestamp: Date.now(),
      };
      setMessages((prev) => ({
        ...prev,
        [characterId]: [...prev[characterId], errorMsg],
      }));
    }
  };

  const handleRegenerateMessage = async (characterId: string) => {
    const existingMsgs = messages[characterId] || [];
    if (existingMsgs.length === 0) return;

    // Remove last message if it's from assistant
    let trimmedHistory = [...existingMsgs];
    if (trimmedHistory[trimmedHistory.length - 1].role === "assistant") {
      trimmedHistory.pop();
    }

    setMessages((prev) => ({
      ...prev,
      [characterId]: trimmedHistory,
    }));

    const lastUserMsg = trimmedHistory[trimmedHistory.length - 1];
    if (lastUserMsg && lastUserMsg.role === "user") {
      const targetChar = characters.find((c) => c.id === characterId);
      if (!targetChar) return;

      const loreMatch = findActiveLoreEntries(
        trimmedHistory,
        worldBooks,
        targetChar.boundWorldBookIds
      );

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: trimmedHistory.map((m) => ({ role: m.role, content: m.content })),
            character: targetChar,
            userPersona,
            activeLoreEntries: loreMatch.activeEntries,
            apiConfig,
          }),
        });

        const data = await response.json();
        const replyContent = data.text || "...";

        const aiMsg: ChatMessage = {
          id: `msg_a_${Date.now()}`,
          characterId,
          role: "assistant",
          content: replyContent,
          timestamp: Date.now(),
          activeLoreKeys: loreMatch.matchedKeys,
        };

        setMessages((prev) => ({
          ...prev,
          [characterId]: [...prev[characterId], aiMsg],
        }));
      } catch (err) {
        console.error("Regenerate Error:", err);
      }
    }
  };

  const handleDeleteMessage = (characterId: string, messageId: string) => {
    setMessages((prev) => ({
      ...prev,
      [characterId]: (prev[characterId] || []).filter((m) => m.id !== messageId),
    }));
  };

  const handleEditMessage = (characterId: string, messageId: string, newText: string) => {
    setMessages((prev) => ({
      ...prev,
      [characterId]: (prev[characterId] || []).map((m) =>
        m.id === messageId ? { ...m, content: newText } : m
      ),
    }));
  };

  const handleClearChatHistory = (characterId: string) => {
    setMessages((prev) => ({
      ...prev,
      [characterId]: [],
    }));
  };

  const handleAddSimulatedMessagePair = (
    characterId: string,
    userText: string,
    botReplyText: string
  ) => {
    const now = Date.now();
    const userMsg: ChatMessage = {
      id: `msg_u_${now}`,
      characterId,
      role: "user",
      content: userText,
      timestamp: now,
    };

    const aiMsg: ChatMessage = {
      id: `msg_a_${now + 50}`,
      characterId,
      role: "assistant",
      content: botReplyText,
      timestamp: now + 50,
    };

    setMessages((prev) => ({
      ...prev,
      [characterId]: [...(prev[characterId] || []), userMsg, aiMsg],
    }));

    setCharacters((prev) =>
      prev.map((c) =>
        c.id === characterId
          ? {
              ...c,
              lastMessageText: botReplyText,
              lastMessageTime: now + 50,
              unreadCount: 0,
            }
          : c
      )
    );
  };

  // World Book Handlers
  const handleSaveWorldBook = (book: WorldBook) => {
    setWorldBooks((prev) => {
      const exists = prev.some((b) => b.id === book.id);
      return exists ? prev.map((b) => (b.id === book.id ? book : b)) : [...prev, book];
    });
  };

  const handleDeleteWorldBook = (id: string) => {
    setWorldBooks((prev) => prev.filter((b) => b.id !== id));
  };

  const handleImportWorldBook = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      let title = parsed.title || parsed.name || "导入的世界书";
      let description = parsed.description || "导入的世界书设定";
      let entries: WorldEntry[] = [];

      let rawEntries = parsed.entries || parsed.world_info || parsed;

      if (rawEntries && typeof rawEntries === "object") {
        if (!Array.isArray(rawEntries)) {
          rawEntries = Object.values(rawEntries);
        }
      }

      if (Array.isArray(rawEntries)) {
        entries = rawEntries.map((e: any, idx: number) => {
          const keys = Array.isArray(e.keys)
            ? e.keys
            : typeof e.keys === "string"
            ? e.keys.split(",").map((k: string) => k.trim()).filter(Boolean)
            : Array.isArray(e.key)
            ? e.key
            : typeof e.key === "string"
            ? e.key.split(",").map((k: string) => k.trim()).filter(Boolean)
            : ["未命名"];

          return {
            id: e.id || `e_${Date.now()}_${idx}`,
            title: e.title || e.comment || e.name || keys[0] || `词条 ${idx + 1}`,
            keys: keys.length > 0 ? keys : ["关键词"],
            content: e.content || e.entry || e.text || "",
            enabled: e.enabled !== false && e.disable !== true,
            position: e.position || "after_sys",
            depth: typeof e.depth === "number" ? e.depth : 0,
            matchCount: e.matchCount || 0,
          };
        });
      }

      const newBook: WorldBook = {
        id: `wb_${Date.now()}`,
        title,
        description,
        entries,
        updatedAt: Date.now(),
      };

      handleSaveWorldBook(newBook);
      alert(`成功导入世界书: ${newBook.title} (包含 ${newBook.entries.length} 个词条)`);
    } catch (err) {
      alert("导入世界书失败，请确认选择的是正确的 JSON 格式文件。");
    }
  };

  // Character Card Handlers
  const handleSaveCharacter = (character: CharacterCard) => {
    setCharacters((prev) => {
      const exists = prev.some((c) => c.id === character.id);
      return exists ? prev.map((c) => (c.id === character.id ? character : c)) : [...prev, character];
    });
  };

  const handleDeleteCharacter = (id: string) => {
    setCharacters((prev) => prev.filter((c) => c.id !== id));
    setMessages((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  const handleImportCharacterCard = (jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      const data = parsed.data || parsed.chara || parsed;
      const newChar: CharacterCard = {
        id: `char_${Date.now()}`,
        name: data.name || "导入角色",
        avatar: data.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
        tagline: data.creator_notes || data.tagline || data.personality?.slice(0, 30) || "导入的角色卡",
        description: data.description || "",
        personality: data.personality || "",
        scenario: data.scenario || "",
        exampleDialogue: data.mes_example || data.exampleDialogue || "",
        firstMessage: data.first_mes || data.firstMessage || "你好！",
        boundWorldBookIds: data.boundWorldBookIds || [],
        tags: Array.isArray(data.tags) ? data.tags : ["导入"],
      };
      handleSaveCharacter(newChar);
      alert(`成功导入角色卡: ${newChar.name}`);
    } catch (err) {
      alert("导入角色卡失败，请确认选择的是正确的 JSON 格式文件。");
    }
  };

  // Export / Import All Data
  const handleExportAllData = () => {
    const backup = {
      version: "1.0",
      timestamp: Date.now(),
      characters,
      messages,
      worldBooks,
      apiConfig,
      userPersona,
      phoneSettings,
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `CyberPhone_Backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportAllData = (jsonStr: string) => {
    try {
      const backup = JSON.parse(jsonStr);
      if (backup.characters) setCharacters(backup.characters);
      if (backup.messages) setMessages(backup.messages);
      if (backup.worldBooks) setWorldBooks(backup.worldBooks);
      if (backup.apiConfig) setApiConfig(backup.apiConfig);
      if (backup.userPersona) setUserPersona(backup.userPersona);
      if (backup.phoneSettings) setPhoneSettings(backup.phoneSettings);
      alert("成功导入全量备份数据！");
    } catch (err) {
      alert("备份数据 JSON 解析失败");
    }
  };

  return (
    <PhoneContainer
      settings={phoneSettings}
      onUpdateSettings={(s) => setPhoneSettings((prev) => ({ ...prev, ...s }))}
      activeApp={activeApp}
      onNavigate={(appId) => setActiveApp(appId)}
    >
      {activeApp === "home" && (
        <PhoneHomeScreen
          settings={phoneSettings}
          characters={characters}
          worldBooks={worldBooks}
          apiConfig={apiConfig}
          onOpenApp={(appId) => setActiveApp(appId)}
        />
      )}

      {activeApp === "social" && (
        <SocialApp
          characters={characters}
          messages={messages}
          worldBooks={worldBooks}
          apiConfig={apiConfig}
          userPersona={userPersona}
          onSendMessage={handleSendMessage}
          onAddSimulatedPair={handleAddSimulatedMessagePair}
          onRegenerateMessage={handleRegenerateMessage}
          onDeleteMessage={handleDeleteMessage}
          onEditMessage={handleEditMessage}
          onClearChatHistory={handleClearChatHistory}
          onDeleteCharacter={handleDeleteCharacter}
          onOpenStudio={() => setActiveApp("studio")}
          onOpenWorldBook={() => setActiveApp("worldbook")}
          onBackToHome={() => setActiveApp("home")}
        />
      )}

      {activeApp === "worldbook" && (
        <WorldBookApp
          worldBooks={worldBooks}
          characters={characters}
          onSaveWorldBook={handleSaveWorldBook}
          onDeleteWorldBook={handleDeleteWorldBook}
          onImportWorldBook={handleImportWorldBook}
          onBackToHome={() => setActiveApp("home")}
        />
      )}

      {activeApp === "settings" && (
        <SettingsApp
          apiConfig={apiConfig}
          userPersona={userPersona}
          phoneSettings={phoneSettings}
          onUpdateApiConfig={(cfg) => setApiConfig((prev) => ({ ...prev, ...cfg }))}
          onUpdatePersona={(p) => setUserPersona((prev) => ({ ...prev, ...p }))}
          onUpdatePhoneSettings={(s) => setPhoneSettings((prev) => ({ ...prev, ...s }))}
          onExportAllData={handleExportAllData}
          onImportAllData={handleImportAllData}
          onBackToHome={() => setActiveApp("home")}
        />
      )}

      {activeApp === "studio" && (
        <CharacterStudioApp
          characters={characters}
          worldBooks={worldBooks}
          onSaveCharacter={handleSaveCharacter}
          onDeleteCharacter={handleDeleteCharacter}
          onImportCharacterCard={handleImportCharacterCard}
          onBackToHome={() => setActiveApp("home")}
        />
      )}

      {activeApp === "gallery" && (
        <GalleryApp
          characters={characters}
          onBackToHome={() => setActiveApp("home")}
        />
      )}

      {activeApp === "game" && (
        <GameApp
          onBackToHome={() => setActiveApp("home")}
        />
      )}
    </PhoneContainer>
  );
}
