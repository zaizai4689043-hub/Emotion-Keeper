import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { io, Socket } from 'socket.io-client';

type AICallStatus = 'idle' | 'ringing' | 'calling' | 'talking' | 'ended';

export default function AICall() {
  const [status, setStatus] = useState<AICallStatus>('idle');
  const [callDuration, setCallDuration] = useState(0);
  const [callTimer, setCallTimer] = useState<number | null>(null);
  const [aiResponse, setAiResponse] = useState('');
  const [userInput, setUserInput] = useState('');
  const [callHistory, setCallHistory] = useState<{
    id: string;
    timestamp: Date;
    duration: number;
    purpose: string;
  }[]>([]);
  const [showCallHistory, setShowCallHistory] = useState(false);
  const [selectedPurpose, setSelectedPurpose] = useState('情绪支持');
  const [callId, setCallId] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const purposes = [
    '情绪支持',
    '辅导建议',
    '亲子沟通',
    '压力管理',
    '个性化建议'
  ];

  useEffect(() => {
    // 初始化WebSocket连接
    const newSocket = io('http://localhost:4242', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
    setSocket(newSocket);

    // 加载通话历史
    const loadCallHistory = async () => {
      try {
        const response = await fetch('http://localhost:4242/api/ai/call-history');
        const data = await response.json();
        setCallHistory(data);
      } catch (error) {
        console.error('Failed to load call history:', error);
      }
    };

    loadCallHistory();

    // 处理AI响应
    newSocket.on('ai-response', (data) => {
      if (data.callId === callId) {
        setAiResponse(data.text);
        // 播放AI回复音频
        if (data.audioData) {
          playAudio(data.audioData);
        }
      }
    });

    // 处理通话状态更新
    newSocket.on('call-status', (data) => {
      if (data.callId === callId) {
        console.log('Call status updated:', data.status);
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [callId]);

  useEffect(() => {
    if (status === 'talking' && callTimer === null) {
      const timer = window.setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
      setCallTimer(timer);
    } else if (status !== 'talking' && callTimer !== null) {
      clearInterval(callTimer);
      setCallTimer(null);
      if (callDuration > 0) {
        // 添加到通话历史
        setCallHistory(prev => [
          {
            id: Date.now().toString(),
            timestamp: new Date(),
            duration: callDuration,
            purpose: selectedPurpose
          },
          ...prev
        ]);
        setCallDuration(0);
      }
    }
  }, [status, callTimer]);

  useEffect(() => {
    // 清理音频资源
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [mediaStream]);

  const playAudio = (audioData: any) => {
    try {
      if (audioData) {
        const audio = new Audio();
        audio.src = URL.createObjectURL(new Blob([audioData], { type: 'audio/wav' }));
        audio.play();
      }
    } catch (error) {
      console.error('Failed to play audio:', error);
    }
  };

  const startRecording = async () => {
    try {
      // 获取用户媒体设备
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMediaStream(stream);

      // 创建MediaRecorder实例
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // 监听数据可用事件
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          // 直接发送音频数据，不等待录制结束
          if (socket && callId) {
            // 使用二进制数据发送，减少传输时间
            const reader = new FileReader();
            reader.onload = (e) => {
              if (e.target?.result) {
                socket.emit('audio-stream', { callId, audioData: e.target.result });
              }
            };
            reader.readAsArrayBuffer(event.data);
          }
        }
      };

      // 开始录制，减少时间间隔，提高响应速度
      mediaRecorder.start(500); // 每0.5秒发送一次数据
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('无法访问麦克风，请检查权限设置');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerCall = () => {
    setStatus('talking');
    setAiResponse('您好！我是您的AI情绪助手，有什么可以帮助您的吗？');
    startRecording();
  };

  const handleEndCall = async () => {
    try {
      // 停止录制
      stopRecording();
      
      // 结束通话
      if (callId) {
        await fetch('http://localhost:4242/api/ai/end-call', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ callId, duration: callDuration })
        });
      }
      
      setStatus('ended');
      setTimeout(() => setStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to end call:', error);
    }
  };

  const handleMakeCall = async () => {
    try {
      // 发起通话
      const response = await fetch('http://localhost:4242/api/ai/call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ purpose: selectedPurpose })
      });
      
      const data = await response.json();
      if (data.success) {
        setCallId(data.callId);
        setStatus('calling');
        
        // 模拟通话连接
        setTimeout(() => {
          setStatus('talking');
          setAiResponse('您好！我是您的AI情绪助手，有什么可以帮助您的吗？');
          // 开始录制
          startRecording();
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to make call:', error);
    }
  };

  const handleSendMessage = async () => {
    if (userInput.trim()) {
      try {
        // 发送消息到AI
        const response = await fetch('http://localhost:4242/api/ai/message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ callId, message: userInput })
        });
        
        const data = await response.json();
        if (data.success) {
          setAiResponse(data.response);
        }
      } catch (error) {
        console.error('Failed to send message:', error);
      }
      setUserInput('');
    }
  };

  return (
    <div className="w-full">
      {/* 来电界面 */}
      <AnimatePresence>
        {status === 'ringing' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          >
            <div className="bg-white rounded-3xl p-8 w-4/5 max-w-md">
              <div className="text-center mb-8">
                <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">🤖</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">AI情绪助手</h2>
                <p className="text-gray-600 mt-2">正在来电...</p>
                <div className="mt-4 flex space-x-4 justify-center">
                  <button 
                    onClick={handleAnswerCall}
                    className="bg-green-500 hover:bg-green-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-colors"
                  >
                    📞
                  </button>
                  <button 
                    onClick={() => setStatus('idle')}
                    className="bg-red-500 hover:bg-red-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-colors"
                  >
                    🚫
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 通话界面 */}
      <AnimatePresence>
        {status === 'talking' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          >
            <div className="bg-white rounded-3xl p-8 w-4/5 max-w-md">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🤖</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900">AI情绪助手</h2>
                <p className="text-gray-600 mt-1">通话中</p>
                <p className="text-lg font-medium text-indigo-600 mt-2">{formatTime(callDuration)}</p>
              </div>
              
              {/* 音频波形 */}
              <div className="mb-4">
                <canvas 
                  id="audio-waveform" 
                  width={300} 
                  height={60} 
                  className="mx-auto bg-gray-100 rounded-lg"
                />
              </div>
              
              <div className="bg-gray-50 rounded-2xl p-4 mb-6 h-48 overflow-y-auto">
                <div className="flex mb-4">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                    <span className="text-sm">🤖</span>
                  </div>
                  <div className="bg-indigo-100 rounded-2xl rounded-tl-none p-3 max-w-[80%]">
                    <p className="text-gray-800">{aiResponse}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center mb-6">
                <input 
                  type="text" 
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="输入您的问题..."
                  className="flex-1 border border-gray-300 rounded-full py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button 
                  onClick={handleSendMessage}
                  className="ml-2 bg-indigo-500 hover:bg-indigo-600 text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                >
                  ↗
                </button>
              </div>
              
              <div className="flex space-x-4">
                <button 
                  onClick={handleEndCall}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-full font-bold transition-colors"
                >
                  结束通话
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 主界面 */}
      <div className="bg-white rounded-2xl p-6 shadow-md border border-indigo-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-lg text-gray-900">AI助手来电</h3>
            <p className="text-sm text-gray-600 mt-1">获取个性化的情绪支持和辅导建议</p>
          </div>
          <button 
            onClick={() => setShowCallHistory(!showCallHistory)}
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
          >
            通话记录
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">通话目的</label>
            <select 
              value={selectedPurpose}
              onChange={(e) => setSelectedPurpose(e.target.value)}
              className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {purposes.map((purpose, index) => (
                <option key={index} value={purpose}>{purpose}</option>
              ))}
            </select>
          </div>
          
          <button 
            onClick={handleMakeCall}
            disabled={status === 'talking' || status === 'calling'}
            className={`w-full py-4 rounded-xl font-bold transition-colors ${status === 'talking' || status === 'calling' ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
          >
            {status === 'talking' ? '通话中...' : status === 'calling' ? '呼叫中...' : '呼叫AI助手'}
          </button>
          
          <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
            <h4 className="font-medium text-indigo-900 mb-2">AI助手可以帮助您：</h4>
            <ul className="space-y-2 text-sm text-indigo-800">
              <li className="flex items-start"><span className="text-indigo-600 mr-2">✓</span><span>提供情绪支持和心理疏导</span></li>
              <li className="flex items-start"><span className="text-indigo-600 mr-2">✓</span><span>给出辅导孩子的具体建议</span></li>
              <li className="flex items-start"><span className="text-indigo-600 mr-2">✓</span><span>改善亲子沟通技巧</span></li>
              <li className="flex items-start"><span className="text-indigo-600 mr-2">✓</span><span>教授压力管理方法</span></li>
              <li className="flex items-start"><span className="text-indigo-600 mr-2">✓</span><span>根据您的情况提供个性化建议</span></li>
            </ul>
          </div>
        </div>
        
        {/* 通话历史 */}
        <AnimatePresence>
          {showCallHistory && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 border-t border-gray-200 pt-4"
            >
              <h4 className="font-medium text-gray-900 mb-3">通话记录</h4>
              {callHistory.length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {callHistory.map((call) => (
                    <div key={call.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">{call.purpose}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {call.timestamp.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatTime(call.duration)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">暂无通话记录</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
