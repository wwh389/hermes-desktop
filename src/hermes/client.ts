import type {
  ConnectionState,
  GatewayEvent,
  GatewayEventName,
  JsonRpcFrame,
  SlashCommand,
  SessionInfo,
} from './types'

const WS_URL = 'ws://127.0.0.1:9119'
const HEARTBEAT_INTERVAL_MS = 15_000
const HEARTBEAT_DEAD_MS = 45_000
const REQUEST_TIMEOUT_MS = 30_000
const RECONNECT_BASE_MS = 1_000
const RECONNECT_MAX_MS = 30_000

type EventCallback = (event: GatewayEvent) => void
type StateCallback = (state: ConnectionState) => void

export class HermesClient {
  private ws: WebSocket | null = null
  private state: ConnectionState = 'idle'
  private nextId = 0
  private pending = new Map<number, { resolve: (v: unknown) => void; reject: (e: Error) => void; timer: ReturnType<typeof setTimeout> }>()
  private eventHandlers = new Map<string, Set<EventCallback>>()
  private stateHandlers = new Set<StateCallback>()
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null
  private lastInboundAt = 0
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private reconnectAttempt = 0

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN || this.state === 'connecting') { resolve(); return }
      this.setState('connecting')
      const ws = new WebSocket(WS_URL)
      this.ws = ws
      const connectTimeout = setTimeout(() => { ws.close(); this.setState('error'); reject(new Error('连接超时')) }, 10_000)
      ws.addEventListener('open', () => { clearTimeout(connectTimeout); this.reconnectAttempt = 0; this.setState('open'); this.startHeartbeat(); resolve() })
      ws.addEventListener('message', (event) => { this.lastInboundAt = Date.now(); this.handleMessage(event.data as string) })
      ws.addEventListener('close', () => { clearTimeout(connectTimeout); this.stopHeartbeat(); if (this.state !== 'closed') { this.setState('closed'); this.scheduleReconnect() } })
      ws.addEventListener('error', () => { clearTimeout(connectTimeout); if (this.state === 'connecting') { this.setState('error'); reject(new Error('连接失败，请确认 hermes serve 已启动')) } })
    })
  }

  disconnect(): void {
    this.stopHeartbeat(); if (this.reconnectTimer) clearTimeout(this.reconnectTimer); this.reconnectTimer = null
    if (this.ws) { this.ws.close(); this.ws = null }
    this.setState('closed')
    for (const [, p] of this.pending) { clearTimeout(p.timer); p.reject(new Error('断开')) }
    this.pending.clear()
  }

  request<T = unknown>(method: string, params: Record<string, unknown> = {}): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) { reject(new Error('未连接')); return }
      const id = ++this.nextId
      const timer = setTimeout(() => { this.pending.delete(id); reject(new Error(`超时: ${method}`)) }, REQUEST_TIMEOUT_MS)
      this.pending.set(id, { resolve: resolve as (v: unknown) => void, reject, timer })
      const frame: JsonRpcFrame = { id, method, params }
      this.ws.send(JSON.stringify(frame))
    })
  }

  on(eventName: GatewayEventName | '*', callback: EventCallback): () => void {
    if (!this.eventHandlers.has(eventName)) this.eventHandlers.set(eventName, new Set())
    this.eventHandlers.get(eventName)!.add(callback)
    return () => { this.eventHandlers.get(eventName)?.delete(callback) }
  }

  onStateChange(callback: StateCallback): () => void {
    this.stateHandlers.add(callback)
    return () => { this.stateHandlers.delete(callback) }
  }

  get connectionState(): ConnectionState { return this.state }

  async sendMessage(content: string, sessionId?: string): Promise<void> {
    const params: Record<string, unknown> = { content }
    if (sessionId) params.session_id = sessionId
    try { await this.request('prompt.submit', params) } catch { /* fire-and-forget */ }
  }

  async listSessions(limit = 40): Promise<SessionInfo[]> {
    try { const r = await this.request<Record<string, unknown>>('session.list', { limit }); return (r?.sessions as SessionInfo[]) || (r as unknown as SessionInfo[]) || [] } catch { return [] }
  }

  async createSession(): Promise<string | null> {
    try { const r = await this.request<Record<string, unknown>>('session.create', {}); return (r?.session_id as string) || (r?.id as string) || null } catch { return null }
  }

  async resumeSession(sessionId: string): Promise<void> {
    try { await this.request('session.resume', { session_id: sessionId }) } catch { /* ignore */ }
  }

  async respondApproval(sessionId: string, approved: boolean): Promise<void> {
    await this.request('approval.respond', { session_id: sessionId, approved })
  }

  async respondClarify(sessionId: string, choice: string): Promise<void> {
    await this.request('clarify.respond', { session_id: sessionId, choice })
  }

  async completeSlash(query: string): Promise<SlashCommand[]> {
    try { const r = await this.request<Record<string, unknown>>('complete.slash', { query }); return (r?.items as SlashCommand[]) || (r as unknown as SlashCommand[]) || [] } catch { return [] }
  }

  async execSlash(command: string): Promise<void> {
    try { await this.request('slash.exec', { command }) } catch { /* ignore */ }
  }

  async interrupt(sessionId?: string): Promise<void> {
    try { await this.request('prompt.interrupt', sessionId ? { session_id: sessionId } : {}) } catch { /* ignore */ }
  }

  async steer(text: string, sessionId?: string): Promise<void> {
    try { await this.request('prompt.steer', { content: text, ...(sessionId ? { session_id: sessionId } : {}) }) } catch { /* ignore */ }
  }

  private handleMessage(raw: string): void {
    let frame: JsonRpcFrame
    try { frame = JSON.parse(raw) } catch { return }

    if (frame.id != null) {
      const p = this.pending.get(frame.id as number)
      if (p) {
        this.pending.delete(frame.id as number); clearTimeout(p.timer)
        if (frame.error) p.reject(new Error(frame.error.message || 'RPC error'))
        else p.resolve(frame.result)
      }
      return
    }

    const event = frame.params
    if (event?.type) {
      this.emit(event as GatewayEvent)
    }
  }

  private emit(event: GatewayEvent): void {
    const wildcard = this.eventHandlers.get('*')
    if (wildcard) wildcard.forEach(cb => cb(event))
    const handlers = this.eventHandlers.get(event.type)
    if (handlers) handlers.forEach(cb => cb(event))
  }

  private setState(state: ConnectionState): void {
    if (this.state === state) return
    this.state = state
    this.stateHandlers.forEach(cb => cb(state))
  }

  private startHeartbeat(): void {
    this.stopHeartbeat()
    this.heartbeatTimer = setInterval(() => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return
      if (Date.now() - this.lastInboundAt > HEARTBEAT_DEAD_MS) { this.ws.close(); return }
      try { this.ws.send(JSON.stringify({ id: -1, method: 'heartbeat.ping', params: {} })) } catch { /* ignore */ }
    }, HEARTBEAT_INTERVAL_MS)
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer)
    this.heartbeatTimer = null
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return
    const delay = Math.min(RECONNECT_BASE_MS * Math.pow(2, this.reconnectAttempt), RECONNECT_MAX_MS)
    this.reconnectAttempt++
    this.reconnectTimer = setTimeout(() => { this.reconnectTimer = null; this.connect().catch(() => {}) }, delay)
  }
}

export const hermes = new HermesClient()
