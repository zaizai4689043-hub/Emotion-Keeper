# AI助手来电功能架构设计

## 1. 系统架构

### 1.1 整体架构

```
前端 (React + TypeScript) ←→ 后端 (Express.js) ←→ AI模型服务
  |                                |                    |
  |-- WebRTC 语音通话              |-- WebSocket 实时通信 |-- 语音识别 (ASR)
  |-- 音频处理                     |-- 语音流处理         |-- 自然语言处理 (NLP)
  |-- 界面交互                     |-- 通话管理           |-- 语音合成 (TTS)
```

### 1.2 技术栈选择

| 组件 | 技术/库 | 用途 |
|------|---------|------|
| 前端 | React + TypeScript | 界面构建 |
| 前端 | WebRTC | 实时语音通话 |
| 前端 | MediaRecorder API | 音频录制 |
| 后端 | Express.js | 服务器框架 |
| 后端 | Socket.IO | 实时通信 |
| 后端 | Node.js | 运行环境 |
| AI模型 | Whisper (OpenAI) | 语音识别 |
| AI模型 | GPT-3.5/GPT-4 | 自然语言处理 |
| AI模型 | ElevenLabs API | 语音合成 |

## 2. 功能流程

### 2.1 来电流程

1. 前端触发来电请求或定时触发
2. 后端创建通话会话，生成唯一通话ID
3. 前端显示来电界面
4. 用户接听后，建立WebRTC连接
5. 开始实时语音流传输

### 2.2 通话流程

1. 前端捕获用户语音，通过WebSocket发送到后端
2. 后端将语音流传递给ASR模型进行识别
3. 识别结果传递给NLP模型生成回复
4. NLP回复传递给TTS模型生成语音
5. 后端将合成语音通过WebSocket发送回前端
6. 前端播放AI回复
7. 循环上述过程，直到通话结束

### 2.3 结束通话流程

1. 用户点击结束通话按钮
2. 前端发送结束通话请求到后端
3. 后端关闭WebSocket连接，更新通话记录
4. 前端更新界面状态，显示通话历史

## 3. 核心组件设计

### 3.1 前端组件

| 组件 | 功能 | 技术实现 |
|------|------|----------|
| AICall | 主组件，管理通话状态 | React + TypeScript |
| VoiceRecorder | 音频捕获和播放 | MediaRecorder API |
| WebRTCClient | 实时语音传输 | WebRTC |
| CallUI | 通话界面 | React + Framer Motion |
| CallHistory | 通话历史记录 | React |

### 3.2 后端组件

| 组件 | 功能 | 技术实现 |
|------|------|----------|
| AIController | 通话管理和API接口 | Express.js |
| WebSocketServer | 实时通信 | Socket.IO |
| VoiceProcessor | 音频流处理 | Node.js Stream |
| AIService | AI模型集成 | 第三方API调用 |
| CallManager | 通话状态管理 | 内存存储 |

### 3.3 AI服务

| 服务 | 功能 | 技术实现 |
|------|------|----------|
| SpeechToText | 语音转文本 | Whisper API |
| TextToSpeech | 文本转语音 | ElevenLabs API |
| ChatCompletion | 对话生成 | OpenAI API |

## 4. 数据结构

### 4.1 通话记录

```javascript
{
  id: "call_123",
  userId: "user_456",
  purpose: "情绪支持",
  startTime: "2026-03-14T10:00:00Z",
  endTime: "2026-03-14T10:05:30Z",
  duration: 330, // 秒
  transcript: [
    {
      speaker: "user",
      text: "我最近辅导孩子作业时总是很焦虑",
      timestamp: "2026-03-14T10:00:10Z"
    },
    {
      speaker: "ai",
      text: "我理解您的感受，情绪起伏是正常的。深呼吸，慢慢来，您做得很好。",
      timestamp: "2026-03-14T10:00:15Z"
    }
  ],
  status: "completed"
}
```

### 4.2 实时通话数据

```javascript
{
  callId: "call_123",
  userId: "user_456",
  socketId: "socket_789",
  status: "active",
  lastActivity: "2026-03-14T10:00:15Z",
  audioBuffer: [] // 音频缓冲区
}
```

## 5. API接口设计

### 5.1 通话管理

| 接口 | 方法 | 路径 | 功能 |
|------|------|------|------|
| 发起通话 | POST | /api/ai/call | 创建新通话 |
| 结束通话 | POST | /api/ai/end-call | 结束通话 |
| 获取通话历史 | GET | /api/ai/call-history | 获取用户通话记录 |
| 获取通话详情 | GET | /api/ai/call/:id | 获取特定通话详情 |

### 5.2 WebSocket事件

| 事件 | 方向 | 数据 | 功能 |
|------|------|------|------|
| audio-stream | 客户端→服务器 | { callId, audioData } | 发送音频流 |
| ai-response | 服务器→客户端 | { callId, audioData, text } | 发送AI回复 |
| call-status | 服务器→客户端 | { callId, status } | 更新通话状态 |

## 6. 性能考量

1. **音频处理延迟**：使用WebSocket进行实时音频传输，确保低延迟
2. **AI模型响应时间**：使用流式API减少等待时间
3. **前端性能**：使用Web Workers处理音频处理，避免阻塞主线程
4. **后端扩展性**：使用水平扩展处理多个并发通话

## 7. 安全性

1. **认证授权**：确保只有授权用户可以发起和接收通话
2. **数据加密**：使用HTTPS和WebSocket Secure (WSS)加密传输
3. **隐私保护**：通话内容仅存储在用户设备和加密存储中
4. **速率限制**：防止滥用API和资源耗尽

## 8. 部署方案

### 8.1 本地开发

- 前端：Vite开发服务器
- 后端：Express.js本地服务器
- AI服务：使用第三方API

### 8.2 生产部署

- 前端：静态文件托管（如Vercel、Netlify）
- 后端：云服务器（如AWS EC2、Heroku）
- AI服务：使用云服务提供商的API

## 9. 扩展可能性

1. **多语言支持**：增加多语言语音识别和合成
2. **个性化AI声音**：允许用户选择AI助手的声音
3. **情绪识别**：实时分析用户情绪，调整AI响应
4. **通话记录转录**：自动生成通话文字记录
5. **智能建议**：基于通话内容提供个性化建议

## 10. 技术挑战与解决方案

| 挑战 | 解决方案 |
|------|----------|
| 实时语音处理延迟 | 使用WebSocket和流式API，优化音频处理管道 |
| 跨浏览器兼容性 | 使用WebRTC适配器，提供降级方案 |
| AI模型响应速度 | 使用轻量级模型或边缘计算，缓存常见响应 |
| 网络不稳定 | 实现音频缓冲和重连机制 |
| 资源消耗 | 使用Web Workers和服务器端优化 |
