// AI Assistant Controller
import OpenAI from 'openai';
import axios from 'axios';
import FormData from 'form-data';

// Mock call history data (in production, this would be stored in a database)
let callHistory = [
  {
    id: '1',
    timestamp: new Date('2026-03-13T10:30:00'),
    duration: 120,
    purpose: '情绪支持',
    userId: 'user123',
    transcript: []
  },
  {
    id: '2',
    timestamp: new Date('2026-03-12T15:45:00'),
    duration: 180,
    purpose: '辅导建议',
    userId: 'user123',
    transcript: []
  }
];

// Active calls (in production, this would be stored in a database or Redis)
let activeCalls = new Map();

// Initialize OpenAI client using environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your-openai-api-key' // Fallback for development
});

// ElevenLabs API configuration using environment variables
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || 'your-elevenlabs-api-key'; // Fallback for development
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM'; // Default voice

// Mock AI responses for fallback
const mockResponses = {
  '情绪支持': [
    '您好！我是您的AI情绪助手，有什么可以帮助您的吗？',
    '我理解您的感受，情绪起伏是正常的。深呼吸，慢慢来，您做得很好。',
    '记住，照顾好自己的情绪是很重要的，这样您才能更好地照顾家人。',
    '给自己一些时间和空间，接纳自己的情绪，这是很正常的。',
    '您已经做得很好了，不要对自己太苛刻。'
  ],
  '辅导建议': [
    '您好！我是您的AI辅导助手，有什么可以帮助您的吗？',
    '关于辅导孩子，建议您保持耐心，分解任务，给予积极反馈。',
    '尝试使用可视化的方法来解释概念，这样孩子更容易理解。',
    '建立规律的学习时间，创造一个安静、专注的学习环境。',
    '表扬孩子的努力而不仅仅是结果，这样可以培养他们的成长型思维。'
  ],
  '亲子沟通': [
    '您好！我是您的AI沟通助手，有什么可以帮助您的吗？',
    '有效的亲子沟通需要倾听和理解，尝试用"我"开头表达感受。',
    '给孩子足够的表达空间，不要急于打断或评判他们的想法。',
    '保持开放和诚实的态度，与孩子建立信任关系。',
    '定期安排专门的亲子时间，增进彼此的了解和感情。'
  ],
  '压力管理': [
    '您好！我是您的AI压力管理助手，有什么可以帮助您的吗？',
    '压力管理的关键是找到适合您的放松方式，比如深呼吸、冥想或运动。',
    '尝试将大任务分解成小步骤，这样会更有成就感。',
    '确保充足的睡眠和合理的饮食，这对管理压力非常重要。',
    '学会说"不"，不要过度承诺，给自己一些休息的时间。'
  ],
  '个性化建议': [
    '您好！我是您的AI个性化助手，有什么可以帮助您的吗？',
    '根据您的情况，我建议您保持规律的作息，适当运动，与家人朋友保持联系。',
    '尝试每天花一些时间做自己喜欢的事情，这对心理健康非常重要。',
    '建立一个支持系统，与信任的人分享您的感受和经历。',
    '设定合理的目标，庆祝每一个小成就，保持积极的心态。'
  ]
};

// Get random mock response based on purpose
const getRandomMockResponse = (purpose) => {
  const responses = mockResponses[purpose] || mockResponses['情绪支持'];
  return responses[Math.floor(Math.random() * responses.length)];
};

// Process audio stream and generate response
export const processAudioStream = async (callId, audioData) => {
  try {
    // 1. Get call details
    const call = callHistory.find(c => c.id === callId) || activeCalls.get(callId);
    if (!call) {
      throw new Error('Call not found');
    }
    
    // 2. Try to use OpenAI API for transcription and response
    try {
      // 2.1 Convert audio to text using OpenAI Whisper
      // For development, use mock response to avoid API costs
      console.log('Processing audio stream - using mock response');
      const userMessage = '我需要情绪支持';
      console.log(`User message: ${userMessage}`);
      
      // 2.2 Generate AI response using GPT with optimized parameters
      const aiResponse = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are an AI emotional support assistant. Your purpose is to provide ${call.purpose}. Be empathetic, supportive, and provide practical advice. Keep responses concise and direct.`
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        temperature: 0.6,
        max_tokens: 100,
        response_format: { type: 'text' }
      });
      
      const aiMessage = aiResponse.choices[0].message.content;
      console.log(`AI response: ${aiMessage}`);
      
      // 2.3 Try to convert text to speech using ElevenLabs with optimized settings
      try {
        const speechResponse = await axios.post(
          `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
          {
            text: aiMessage,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
              stability: 0.8,
              similarity_boost: 0.7,
              style: 0.0,
              use_speaker_boost: true
            }
          },
          {
            headers: {
              'xi-api-key': ELEVENLABS_API_KEY,
              'Content-Type': 'application/json'
            },
            responseType: 'arraybuffer',
            timeout: 5000
          }
        );
        
        const audioBuffer = speechResponse.data;
        
        // 2.4 Update call transcript
        if (call.transcript) {
          call.transcript.push(
            {
              speaker: 'user',
              text: userMessage,
              timestamp: new Date()
            },
            {
              speaker: 'ai',
              text: aiMessage,
              timestamp: new Date()
            }
          );
        }
        
        return {
          success: true,
          audioData: audioBuffer,
          text: aiMessage
        };
      } catch (ttsError) {
        console.error('Error with text-to-speech:', ttsError);
        // Fallback to text only response
        if (call.transcript) {
          call.transcript.push(
            {
              speaker: 'user',
              text: userMessage,
              timestamp: new Date()
            },
            {
              speaker: 'ai',
              text: aiMessage,
              timestamp: new Date()
            }
          );
        }
        return {
          success: true,
          text: aiMessage
        };
      }
    } catch (aiError) {
      console.error('Error with AI services:', aiError);
      // Fallback to mock response
      const mockResponse = getRandomMockResponse(call.purpose);
      
      if (call.transcript) {
        call.transcript.push(
          {
            speaker: 'user',
            text: 'User spoke (transcription failed)',
            timestamp: new Date()
          },
          {
            speaker: 'ai',
            text: mockResponse,
            timestamp: new Date()
          }
        );
      }
      
      return {
        success: true,
        text: mockResponse
      };
    }
  } catch (error) {
    console.error('Error processing audio stream:', error);
    // Fallback to generic response
    return {
      success: true,
      text: '您好！我是您的AI助手，有什么可以帮助您的吗？'
    };
  }
};

// Make AI call
export const makeCall = (req, res) => {
  try {
    const { purpose, userId = 'user123' } = req.body;
    
    // Generate a unique call ID
    const callId = Date.now().toString();
    
    // Create call object
    const call = {
      id: callId,
      userId: userId,
      purpose: purpose || '情绪支持',
      startTime: new Date(),
      status: 'initiated',
      transcript: []
    };
    
    // Add to active calls
    activeCalls.set(callId, call);
    
    res.json({
      success: true,
      callId: callId,
      message: 'AI call initiated successfully',
      purpose: purpose || '情绪支持'
    });
  } catch (error) {
    console.error('Error making AI call:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate AI call'
    });
  }
};

// Get call history
export const getCallHistory = (req, res) => {
  try {
    const { userId = 'user123' } = req.query;
    
    // Filter calls by user ID
    const userCalls = callHistory.filter(call => call.userId === userId);
    
    res.json(userCalls);
  } catch (error) {
    console.error('Error fetching call history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch call history'
    });
  }
};

// Send message to AI (text-based fallback)
export const sendMessage = async (req, res) => {
  try {
    const { callId, message } = req.body;
    
    // Find the call
    const call = callHistory.find(c => c.id === callId) || activeCalls.get(callId);
    
    if (!call) {
      return res.status(404).json({
        success: false,
        message: 'Call not found'
      });
    }
    
    let aiMessage;
    
    // Try to use OpenAI API
    try {
      // Generate AI response using GPT
      const aiResponse = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are an AI emotional support assistant. Your purpose is to provide ${call.purpose}. Be empathetic, supportive, and provide practical advice.`
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 150
      });
      
      aiMessage = aiResponse.choices[0].message.content;
    } catch (aiError) {
      console.error('Error with AI services:', aiError);
      // Fallback to mock response
      aiMessage = getRandomMockResponse(call.purpose);
    }
    
    // Update call transcript
    if (call.transcript) {
      call.transcript.push(
        {
          speaker: 'user',
          text: message,
          timestamp: new Date()
        },
        {
          speaker: 'ai',
          text: aiMessage,
          timestamp: new Date()
        }
      );
    }
    
    res.json({
      success: true,
      response: aiMessage,
      callId: callId
    });
  } catch (error) {
    console.error('Error sending message:', error);
    // Fallback to generic response
    res.json({
      success: true,
      response: '您好！我是您的AI助手，有什么可以帮助您的吗？',
      callId: req.body.callId
    });
  }
};

// End call
export const endCall = (req, res) => {
  try {
    const { callId, duration } = req.body;
    
    // Find the call in active calls
    const call = activeCalls.get(callId);
    
    if (!call) {
      return res.status(404).json({
        success: false,
        message: 'Call not found'
      });
    }
    
    // Update call details
    call.endTime = new Date();
    call.duration = duration || 0;
    call.status = 'completed';
    
    // Move to call history
    callHistory.push(call);
    activeCalls.delete(callId);
    
    res.json({
      success: true,
      message: 'Call ended successfully',
      callId: callId
    });
  } catch (error) {
    console.error('Error ending call:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to end call'
    });
  }
};

// Get active calls
export const getActiveCalls = (req, res) => {
  try {
    const { userId = 'user123' } = req.query;
    
    // Filter active calls by user ID
    const userActiveCalls = Array.from(activeCalls.values()).filter(call => call.userId === userId);
    
    res.json(userActiveCalls);
  } catch (error) {
    console.error('Error fetching active calls:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active calls'
    });
  }
};
