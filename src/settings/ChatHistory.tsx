import { useState, useEffect } from "react";

type ChatSession = {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  messageCount: number;
  contextLength?: number;
};

type ChatMessage = {
  id: string;
  sessionId: string;
  from: "me" | "ai";
  text: string;
  time: string;
  tokenCount?: number;
};

type ContextInfo = {
  currentLength: number;
  maxLength: number;
  percentage: number;
};

export default function ChatHistory() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [sessionMessages, setSessionMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [contextInfo, setContextInfo] = useState<ContextInfo>({
    currentLength: 0,
    maxLength: 8000,
    percentage: 0
  });

  useEffect(() => {
    async function loadSessions() {
      try {
        setLoading(true);
        const response = await fetch('/api/chat-sessions');
        if (response.ok) {
          const data = await response.json();
          setSessions(data);
        } else {
          console.error('Failed to load chat sessions');
        }
      } catch (error) {
        console.error('Error loading chat sessions:', error);
      } finally {
        setLoading(false);
      }
    }

    loadSessions();
  }, []);

  async function loadSessionMessages(sessionId: string) {
    try {
      setMessagesLoading(true);
      setSelectedSession(sessionId);

      const [messagesResponse, contextResponse] = await Promise.all([
        fetch(`/api/chat-sessions/${sessionId}/messages`),
        fetch(`/api/chat-sessions/${sessionId}/context`)
      ]);

      if (messagesResponse.ok) {
        const data = await messagesResponse.json();
        setSessionMessages(data);
      }

      if (contextResponse.ok) {
        const contextData = await contextResponse.json();
        setContextInfo({
          currentLength: contextData.currentLength || 0,
          maxLength: contextData.maxLength || 8000,
          percentage: contextData.percentage || 0
        });
      }
    } catch (error) {
      console.error('Error loading session messages:', error);
    } finally {
      setMessagesLoading(false);
    }
  }

  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="history-content">
      <div className="history-header">
        <h3 className="history-title">历史对话</h3>
        <button className="history-close-btn" onClick={() => {}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L12 12L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      <div className="context-info-bar">
        <div className="context-label">上下文使用</div>
        <div className="context-progress-container">
          <div className="context-progress-bar">
            <div
              className="context-progress-fill"
              style={{ width: `${Math.min(contextInfo.percentage, 100)}%` }}
            />
          </div>
          <div className="context-text">
            {contextInfo.currentLength.toLocaleString()} / {contextInfo.maxLength.toLocaleString()} tokens
          </div>
        </div>
        <div className={`context-percentage ${contextInfo.percentage > 80 ? 'warning' : ''}`}>
          {contextInfo.percentage.toFixed(1)}%
        </div>
      </div>

      <input
        className="form-input history-search"
        placeholder="搜索对话..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <div className="history-sessions-list">
        {loading ? (
          <div className="history-empty-state">
            <div className="loading-spinner"></div>
            <span>正在加载对话列表...</span>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="history-empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.3, marginBottom: 8 }}>
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            <span>{searchQuery ? '没有找到匹配的对话' : '暂无历史对话'}</span>
          </div>
        ) : (
          filteredSessions.map((session) => (
            <div
              key={session.id}
              className={`history-session-item ${selectedSession === session.id ? 'selected' : ''}`}
              onClick={() => loadSessionMessages(session.id)}
            >
              <div className="session-title">{session.title}</div>
              <div className="session-preview">{session.lastMessage}</div>
              <div className="session-meta">
                <span className="session-time">{session.timestamp}</span>
                <span className="session-count">{session.messageCount} 条消息</span>
                {session.contextLength && (
                  <span className="session-tokens">{session.contextLength} tokens</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {selectedSession && (
        <div className="history-messages-panel">
          <div className="messages-header">
            <span>对话内容</span>
            <div className="messages-context-mini">
              {contextInfo.currentLength.toLocaleString()} / {contextInfo.maxLength.toLocaleString()}
            </div>
          </div>
          {messagesLoading ? (
            <div className="history-empty-state">
              <div className="loading-spinner"></div>
              <span>正在加载消息...</span>
            </div>
          ) : (
            <div className="messages-list">
              {sessionMessages.map((msg) => (
                <div key={msg.id} className={`message-item ${msg.from}`}>
                  <div className="message-text">{msg.text}</div>
                  <div className="message-time-row">
                    <span className="message-time">{msg.time}</span>
                    {msg.tokenCount && (
                      <span className="message-tokens">{msg.tokenCount}t</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}