import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import type { ChatMessage, ToolCall } from '../../hermes/types'
import 'highlight.js/styles/github-dark.css'

// ── 工具调用卡片 ──
function ToolCallCard({ tool }: { tool: ToolCall }) {
  const [expanded, setExpanded] = useState(false)
  const statusIcon = tool.status === 'running' ? '⏳' : tool.status === 'error' ? '❌' : '✅'

  return (
    <div className="tool-call-card">
      <div className="tool-call-header" onClick={() => setExpanded(!expanded)}>
        <span className="tool-call-status">{statusIcon}</span>
        <span className="tool-call-name">{tool.name}</span>
        {tool.progress && <span className="tool-call-progress">{tool.progress}</span>}
        <span className="tool-call-toggle">{expanded ? '▼' : '▶'}</span>
      </div>
      {expanded && (
        <div className="tool-call-body">
          {tool.arguments && (
            <div className="tool-call-section">
              <div className="tool-call-label">参数</div>
              <pre className="tool-call-code">{tool.arguments}</pre>
            </div>
          )}
          {tool.result && (
            <div className="tool-call-section">
              <div className="tool-call-label">结果</div>
              <pre className="tool-call-code">{tool.result}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── 推理块 ──
function ReasoningBlock({ text, label }: { text: string; label?: string }) {
  const [expanded, setExpanded] = useState(false)
  if (!text?.trim()) return null

  return (
    <div className="reasoning-block">
      <div className="reasoning-header" onClick={() => setExpanded(!expanded)}>
        <span className="reasoning-icon">💭</span>
        <span className="reasoning-label">{label || '推理过程'}</span>
        <span className="reasoning-toggle">{expanded ? '▼' : '▶'}</span>
      </div>
      {expanded && (
        <div className="reasoning-content">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
            {text}
          </ReactMarkdown>
        </div>
      )}
    </div>
  )
}

// ── 消息气泡 ──
export default function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'
  const isTool = message.role === 'tool'
  const isStreaming = message.streaming

  // 工具消息
  if (isTool) {
    return (
      <div className="chat-msg-row tool">
        <div className="chat-msg-bubble tool-bubble">
          {message.toolCalls?.map(tool => (
            <ToolCallCard key={tool.id} tool={tool} />
          ))}
          {message.content && !message.toolCalls?.length && (
            <pre className="tool-output">{message.content}</pre>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={`chat-msg-row ${isUser ? 'user' : 'assistant'}`}>
      <div className="chat-msg-bubble">
        {/* 推理块（折叠显示） */}
        {(message.reasoning || message.thinking) && (
          <ReasoningBlock text={message.reasoning || message.thinking || ''} />
        )}

        {/* 工具调用列表 */}
        {message.toolCalls?.map(tool => (
          <ToolCallCard key={tool.id} tool={tool} />
        ))}

        {/* 消息正文（Markdown） */}
        {message.content && (
          <div className="chat-msg-text">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                // 代码块：添加复制按钮
                pre: ({ children, ...props }) => (
                  <div className="code-block-wrapper">
                    <pre {...props}>{children}</pre>
                    <button
                      className="code-copy-btn"
                      onClick={() => {
                        const code = (children as any)?.props?.children?.[0]
                        if (typeof code === 'string') navigator.clipboard.writeText(code)
                      }}
                    >
                      复制
                    </button>
                  </div>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}

        {/* 流式输出指示 */}
        {isStreaming && <span className="streaming-cursor">▊</span>}
      </div>
    </div>
  )
}
