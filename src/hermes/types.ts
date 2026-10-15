// hermes serve 的 WebSocket JSON-RPC 协议类型定义

// ── JSON-RPC 帧 ──
export interface JsonRpcFrame {
  id?: number | string | null
  method?: string
  params?: GatewayEvent | Record<string, unknown>
  result?: unknown
  error?: { code?: number; message?: string; data?: unknown }
}

// ── 事件类型 ──
export type GatewayEventName =
  | 'gateway.ready'
  | 'session.info'
  | 'session.usage'
  | 'message.start'
  | 'message.delta'
  | 'message.interim'
  | 'message.complete'
  | 'thinking.delta'
  | 'reasoning.delta'
  | 'reasoning.available'
  | 'status.update'
  | 'tool.start'
  | 'tool.progress'
  | 'tool.complete'
  | 'tool.generating'
  | 'clarify.request'
  | 'approval.request'
  | 'sudo.request'
  | 'secret.request'
  | 'background.complete'
  | 'error'
  | string

export interface GatewayEvent<P = unknown> {
  type: GatewayEventName
  payload?: P
  session_id?: string
}

// ── 连接状态 ──
export type ConnectionState = 'idle' | 'connecting' | 'open' | 'closed' | 'error'

// ── 消息相关 ──
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system' | 'tool'
  content: string
  timestamp: number
  // 工具调用
  toolCalls?: ToolCall[]
  // 推理/思考
  reasoning?: string
  thinking?: string
  // 是否正在流式输出
  streaming?: boolean
  // 附件
  attachments?: Attachment[]
}

export interface ToolCall {
  id: string
  name: string
  arguments?: string
  result?: string
  status: 'running' | 'complete' | 'error'
  progress?: string
}

export interface Attachment {
  type: 'file' | 'image'
  name: string
  url?: string
  data?: string // base64
}

// ── 审批 ──
export interface ApprovalRequest {
  id: string
  session_id: string
  prompt: string
  details?: string
  options?: string[]
}

// ── Clarify ──
export interface ClarifyRequest {
  id: string
  session_id: string
  question: string
  options?: { label: string; value: string }[]
}

// ── 会话 ──
export interface SessionInfo {
  id: string
  title?: string
  last_message?: string
  created_at?: number
  updated_at?: number
  message_count?: number
  pinned?: boolean
  archived?: boolean
}

// ── 斜杠命令 ──
export interface SlashCommand {
  name: string
  description?: string
  category?: string
}
