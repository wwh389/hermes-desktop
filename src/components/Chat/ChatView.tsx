import { useState, useRef, useEffect, useCallback } from 'react'
import { hermes } from '../../hermes/client'
import type {
  ChatMessage, ConnectionState, GatewayEvent,
  ApprovalRequest, ClarifyRequest, SlashCommand, ToolCall,
} from '../../hermes/types'
import MessageBubble from './MessageBubble'

let _msgId = 0
const genId = () => `msg_${++_msgId}_${Date.now()}`

interface ChatViewProps {
  initialMessage?: string
}

export default function ChatView({ initialMessage }: ChatViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [connectionState, setConnectionState] = useState<ConnectionState>('idle')
  const [isSending, setIsSending] = useState(false)
  const [approval, setApproval] = useState<ApprovalRequest | null>(null)
  const [clarify, setClarify] = useState<ClarifyRequest | null>(null)
  const [slashCommands, setSlashCommands] = useState<SlashCommand[]>([])
  const [showSlashMenu, setShowSlashMenu] = useState(false)
  const [inputHistory, setInputHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  const msgAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = useCallback(() => {
    if (msgAreaRef.current) msgAreaRef.current.scrollTop = msgAreaRef.current.scrollHeight
  }, [])

  useEffect(() => { scrollToBottom() }, [messages, scrollToBottom])

  // 连接
  useEffect(() => {
    const offState = hermes.onStateChange(setConnectionState)
    hermes.connect().catch(() => {})
    setConnectionState(hermes.connectionState)
    return () => { offState() }
  }, [])

  // 处理初始消息
  useEffect(() => {
    if (initialMessage?.trim()) {
      handleSendMessage(initialMessage.trim())
    }
  }, [])

  // 事件监听
  useEffect(() => {
    const off = hermes.on('*', (event: GatewayEvent) => {
      const { type, payload: raw, session_id } = event
      const payload = raw as Record<string, unknown> | undefined

      switch (type) {
        case 'message.delta': {
          const delta = (payload?.delta as string) || (payload?.content as string) || ''
          if (!delta) return
          setMessages(prev => {
            const last = prev[prev.length - 1]
            if (last && last.role === 'assistant' && last.streaming) {
              return [...prev.slice(0, -1), { ...last, content: last.content + delta }]
            }
            return [...prev, { id: genId(), role: 'assistant', content: delta, timestamp: Date.now(), streaming: true }]
          })
          break
        }
        case 'message.complete': {
          setMessages(prev => {
            const last = prev[prev.length - 1]
            if (last && last.role === 'assistant' && last.streaming) {
              const content = (payload?.content as string) || last.content
              return [...prev.slice(0, -1), { ...last, content, streaming: false }]
            }
            return prev
          })
          setIsSending(false)
          break
        }
        case 'thinking.delta':
        case 'reasoning.delta': {
          const delta = (payload?.delta as string) || (payload?.content as string) || ''
          if (!delta) return
          setMessages(prev => {
            const last = prev[prev.length - 1]
            if (last && last.role === 'assistant') {
              return [...prev.slice(0, -1), { ...last, reasoning: (last.reasoning || '') + delta }]
            }
            return prev
          })
          break
        }
        case 'tool.start': {
          const toolId = (payload?.tool_call_id as string) || (payload?.id as string) || genId()
          const toolName = (payload?.name as string) || (payload?.tool_name as string) || 'tool'
          setMessages(prev => {
            const last = prev[prev.length - 1]
            if (last && last.role === 'assistant') {
              const tool: ToolCall = { id: toolId, name: toolName, status: 'running', arguments: payload?.arguments ? JSON.stringify(payload.arguments, null, 2) : undefined }
              return [...prev.slice(0, -1), { ...last, toolCalls: [...(last.toolCalls || []), tool] }]
            }
            return prev
          })
          break
        }
        case 'tool.progress': {
          const toolId = (payload?.tool_call_id as string) || (payload?.id as string)
          const progress = (payload?.progress as string) || (payload?.output as string) || ''
          setMessages(prev => {
            const last = prev[prev.length - 1]
            if (last?.toolCalls) {
              return [...prev.slice(0, -1), { ...last, toolCalls: last.toolCalls.map(t => t.id === toolId ? { ...t, progress } : t) }]
            }
            return prev
          })
          break
        }
        case 'tool.complete': {
          const toolId = (payload?.tool_call_id as string) || (payload?.id as string)
          const result = (payload?.output as string) || (payload?.result as string) || ''
          const isError = !!payload?.error
          setMessages(prev => {
            const last = prev[prev.length - 1]
            if (last?.toolCalls) {
              return [...prev.slice(0, -1), { ...last, toolCalls: last.toolCalls.map(t => t.id === toolId ? { ...t, status: isError ? 'error' as const : 'complete' as const, result } : t) }]
            }
            return prev
          })
          break
        }
        case 'approval.request': {
          setApproval({
            id: (payload?.id as string) || genId(),
            session_id: session_id || '',
            prompt: (payload?.prompt as string) || (payload?.message as string) || '是否允许此操作？',
            details: payload?.details as string,
            options: payload?.options as string[],
          })
          break
        }
        case 'clarify.request': {
          setClarify({
            id: (payload?.id as string) || genId(),
            session_id: session_id || '',
            question: (payload?.question as string) || (payload?.prompt as string) || '请澄清',
            options: payload?.options as { label: string; value: string }[],
          })
          break
        }
        case 'error': {
          const errMsg = (payload?.message as string) || (payload?.error as string) || '未知错误'
          setMessages(prev => [...prev, { id: genId(), role: 'system', content: errMsg, timestamp: Date.now() }])
          setIsSending(false)
          break
        }
      }
    })
    return () => { off() }
  }, [])

  // 发送消息
  const handleSendMessage = useCallback(async (text: string) => {
    if (!text || isSending) return
    setInputHistory(prev => [...prev, text])
    setHistoryIndex(-1)
    if (text.startsWith('/')) { await hermes.execSlash(text); setInput(''); return }
    setMessages(prev => [...prev, { id: genId(), role: 'user', content: text, timestamp: Date.now() }])
    setInput('')
    setIsSending(true)
    await hermes.sendMessage(text)
  }, [isSending])

  const handleSend = useCallback(() => {
    handleSendMessage(input.trim())
  }, [input, handleSendMessage])

  const handleInterrupt = useCallback(async () => { await hermes.interrupt(); setIsSending(false) }, [])
  const handleApproval = useCallback(async (approved: boolean) => { if (approval) { await hermes.respondApproval(approval.session_id, approved); setApproval(null) } }, [approval])
  const handleClarify = useCallback(async (choice: string) => { if (clarify) { await hermes.respondClarify(clarify.session_id, choice); setClarify(null) } }, [clarify])

  useEffect(() => {
    if (input.startsWith('/') && input.length > 1) {
      hermes.completeSlash(input.slice(1)).then(cmds => { setSlashCommands(cmds); setShowSlashMenu(cmds.length > 0) })
    } else { setShowSlashMenu(false) }
  }, [input])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); return }
    if (e.key === 'ArrowUp' && !input && inputHistory.length > 0) {
      e.preventDefault()
      const newIndex = historyIndex === -1 ? inputHistory.length - 1 : Math.max(0, historyIndex - 1)
      setHistoryIndex(newIndex); setInput(inputHistory[newIndex])
    }
    if (e.key === 'ArrowDown' && historyIndex >= 0) {
      e.preventDefault()
      const newIndex = historyIndex + 1
      if (newIndex >= inputHistory.length) { setHistoryIndex(-1); setInput('') }
      else { setHistoryIndex(newIndex); setInput(inputHistory[newIndex]) }
    }
    if (e.key === 'Escape') { setShowSlashMenu(false); setApproval(null); setClarify(null) }
  }

  const selectSlash = (cmd: SlashCommand) => { setInput(`/${cmd.name} `); setShowSlashMenu(false); inputRef.current?.focus() }

  
  return (
    <div className="chat-view">
      {/* 消息区域 */}
      <div className="chat-msg-area" ref={msgAreaRef}>
        {messages.length === 0 && (
          <div className="chat-empty">
            <div className="chat-empty-icon">💬</div>
            <div className="chat-empty-text">输入问题开始对话</div>
          </div>
        )}
        {messages.map(msg => <MessageBubble key={msg.id} message={msg} />)}
      </div>

      {/* 审批弹窗 */}
      {approval && (
        <div className="modal-overlay">
          <div className="modal-box approval-modal">
            <div className="modal-title">🔒 操作确认</div>
            <div className="modal-content">{approval.prompt}</div>
            {approval.details && <pre className="modal-details">{approval.details}</pre>}
            <div className="modal-actions">
              <button className="btn btn-reject" onClick={() => handleApproval(false)}>拒绝</button>
              <button className="btn btn-approve" onClick={() => handleApproval(true)}>允许</button>
            </div>
          </div>
        </div>
      )}

      {/* Clarify 弹窗 */}
      {clarify && (
        <div className="modal-overlay">
          <div className="modal-box clarify-modal">
            <div className="modal-title">❓ {clarify.question}</div>
            <div className="modal-actions clarify-options">
              {clarify.options?.map(opt => (
                <button key={opt.value} className="btn" onClick={() => handleClarify(opt.value)}>{opt.label}</button>
              ))}
              {!clarify.options?.length && (
                <div className="clarify-input-row">
                  <input className="clarify-input" placeholder="输入回答…" onKeyDown={e => { if (e.key === 'Enter') handleClarify((e.target as HTMLInputElement).value) }} />
                  <button className="btn btn-primary" onClick={() => { const inp = document.querySelector('.clarify-input') as HTMLInputElement; if (inp?.value) handleClarify(inp.value) }}>发送</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 斜杠菜单 */}
      {showSlashMenu && (
        <div className="slash-menu">
          {slashCommands.slice(0, 10).map(cmd => (
            <div key={cmd.name} className="slash-item" onClick={() => selectSlash(cmd)}>
              <span className="slash-name">/{cmd.name}</span>
              {cmd.description && <span className="slash-desc">{cmd.description}</span>}
            </div>
          ))}
        </div>
      )}

      {/* 输入区域 */}
      <div className="chat-input-area">
        <textarea
          ref={inputRef}
          className="chat-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={connectionState !== 'open' ? '等待连接…' : '输入消息（/ 命令）…'}
          rows={1}
          disabled={connectionState !== 'open'}
        />
        {isSending ? (
          <button className="btn-interrupt" onClick={handleInterrupt} title="停止">■</button>
        ) : (
          <button className="btn-send" onClick={handleSend} disabled={!input.trim() || connectionState !== 'open'}>↑</button>
        )}
      </div>
    </div>
  )
}