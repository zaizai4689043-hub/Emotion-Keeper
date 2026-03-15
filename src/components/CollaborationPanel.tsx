import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { collaborationService } from "../services/collaboration";

interface OnlineUser {
  userId: string;
  userName: string;
  socketId: string;
  joinedAt: Date;
}

interface ChatMessage {
  message: string;
  userId: string;
  userName: string;
  timestamp: Date;
}

export default function CollaborationPanel() {
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ userId: string; userName: string }>({ userId: "", userName: "" });

  useEffect(() => {
    // Connect to collaboration server
    collaborationService.connect()
      .then(() => {
        setIsConnected(true);
        setCurrentUser({
          userId: collaborationService.getUserId(),
          userName: collaborationService.getUserName()
        });
      })
      .catch(error => {
        console.error("Failed to connect to collaboration server:", error);
      });

    // Set up event listeners
    const handleUserJoined = (data: any) => {
      setOnlineUsers(data.onlineUsers || []);
    };

    const handleUserLeft = (data: any) => {
      setOnlineUsers(data.onlineUsers || []);
    };

    const handleChatMessage = (data: any) => {
      setChatMessages(prev => [...prev, data]);
    };

    const handleConnected = () => {
      console.log("Connected to collaboration server");
    };

    const handleDisconnected = () => {
      setIsConnected(false);
    };

    collaborationService.on('user-joined', handleUserJoined);
    collaborationService.on('user-left', handleUserLeft);
    collaborationService.on('chat-message', handleChatMessage);
    collaborationService.on('connected', handleConnected);
    collaborationService.on('disconnected', handleDisconnected);

    // Cleanup on unmount
    return () => {
      collaborationService.off('user-joined', handleUserJoined);
      collaborationService.off('user-left', handleUserLeft);
      collaborationService.off('chat-message', handleChatMessage);
      collaborationService.off('connected', handleConnected);
      collaborationService.off('disconnected', handleDisconnected);
      collaborationService.disconnect();
    };
  }, []);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      collaborationService.sendChatMessage(newMessage);
      setNewMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      {/* Connection Status */}
      <div className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-lg ${
        isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
        <span className="text-sm font-medium">
          {isConnected ? `在线协作 (${onlineUsers.length}人)` : '离线'}
        </span>
      </div>

      {/* Online Users Panel */}
      <AnimatePresence>
        {isConnected && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-2 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden"
            style={{ width: '280px' }}
          >
            <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
              <h3 className="font-bold text-sm">在线协作者</h3>
              <p className="text-xs opacity-90">{currentUser.userName} (你)</p>
            </div>
            
            <div className="p-3 max-h-60 overflow-y-auto">
              {onlineUsers.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">暂无其他协作者</p>
              ) : (
                <div className="space-y-2">
                  {onlineUsers.map((user) => (
                    <div key={user.userId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                        {user.userName.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{user.userName}</p>
                        <p className="text-xs text-gray-500">
                          {user.userId === currentUser.userId ? '你' : '协作者'}
                        </p>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Chat Toggle Button */}
            <button
              onClick={() => setShowChat(!showChat)}
              className="w-full p-3 border-t border-gray-200 text-sm font-medium text-indigo-600 hover:bg-gray-50 flex items-center justify-center gap-2"
            >
              💬 {showChat ? '隐藏聊天' : '开启聊天'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {showChat && isConnected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mt-2 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden"
            style={{ width: '320px', maxHeight: '400px' }}
          >
            <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white">
              <h3 className="font-bold text-sm">团队聊天</h3>
            </div>

            {/* Chat Messages */}
            <div className="p-3 h-64 overflow-y-auto space-y-3">
              {chatMessages.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">暂无消息</p>
              ) : (
                chatMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.userId === currentUser.userId ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-2 rounded-lg ${
                        msg.userId === currentUser.userId
                          ? 'bg-indigo-500 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-xs font-medium mb-1">{msg.userName}</p>
                      <p className="text-sm">{msg.message}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Chat Input */}
            <div className="p-3 border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="输入消息..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={handleSendMessage}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm font-medium hover:bg-indigo-600 transition-colors"
                >
                  发送
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}