const API_BASE_URL = 'http://localhost:4242/api';

// Health API
export const healthApi = {
  getHealthData: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health/data`);
      if (!response.ok) throw new Error('Failed to fetch health data');
      return await response.json();
    } catch (error) {
      console.error('Error fetching health data:', error);
      // Return mock data as fallback
      return [];
    }
  },
  getBloodPressureReadings: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health/blood-pressure`);
      if (!response.ok) throw new Error('Failed to fetch blood pressure readings');
      return await response.json();
    } catch (error) {
      console.error('Error fetching blood pressure readings:', error);
      // Return mock data as fallback
      return [];
    }
  },
  updateHealthData: async (data: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/health/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update health data');
      return await response.json();
    } catch (error) {
      console.error('Error updating health data:', error);
      return { success: false };
    }
  },
};

// Voice API
export const voiceApi = {
  getVoiceTranscripts: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/voice/transcripts`);
      if (!response.ok) throw new Error('Failed to fetch voice transcripts');
      return await response.json();
    } catch (error) {
      console.error('Error fetching voice transcripts:', error);
      // Return mock data as fallback
      return [];
    }
  },
  addVoiceTranscript: async (data: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/voice/transcript`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to add voice transcript');
      return await response.json();
    } catch (error) {
      console.error('Error adding voice transcript:', error);
      return { success: false };
    }
  },
  getVoiceKeywords: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/voice/keywords`);
      if (!response.ok) throw new Error('Failed to fetch voice keywords');
      return await response.json();
    } catch (error) {
      console.error('Error fetching voice keywords:', error);
      // Return mock data as fallback
      return [];
    }
  },
  updateVoiceKeywords: async (keywords: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/voice/keywords`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(keywords),
      });
      if (!response.ok) throw new Error('Failed to update voice keywords');
      return await response.json();
    } catch (error) {
      console.error('Error updating voice keywords:', error);
      return { success: false };
    }
  },
};

// Intervention API
export const interventionApi = {
  getEmotionalPhrases: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/intervention/phrases`);
      if (!response.ok) throw new Error('Failed to fetch emotional phrases');
      return await response.json();
    } catch (error) {
      console.error('Error fetching emotional phrases:', error);
      // Return mock data as fallback
      return {};
    }
  },
  getCalmingMusic: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/intervention/music`);
      if (!response.ok) throw new Error('Failed to fetch calming music');
      return await response.json();
    } catch (error) {
      console.error('Error fetching calming music:', error);
      // Return mock data as fallback
      return [];
    }
  },
  getInterventionTypes: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/intervention/types`);
      if (!response.ok) throw new Error('Failed to fetch intervention types');
      return await response.json();
    } catch (error) {
      console.error('Error fetching intervention types:', error);
      // Return mock data as fallback
      return [];
    }
  },
};

// Data API
export const dataApi = {
  getPsychologyPrinciples: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/data/psychology`);
      if (!response.ok) throw new Error('Failed to fetch psychology principles');
      return await response.json();
    } catch (error) {
      console.error('Error fetching psychology principles:', error);
      // Return mock data as fallback
      return [];
    }
  },
  getCommunicationAges: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/data/communication/ages`);
      if (!response.ok) throw new Error('Failed to fetch communication ages');
      return await response.json();
    } catch (error) {
      console.error('Error fetching communication ages:', error);
      // Return mock data as fallback
      return [];
    }
  },
  getCommunicationPhrases: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/data/communication/phrases`);
      if (!response.ok) throw new Error('Failed to fetch communication phrases');
      return await response.json();
    } catch (error) {
      console.error('Error fetching communication phrases:', error);
      // Return mock data as fallback
      return [];
    }
  },
};

// AI Assistant API
export const aiApi = {
  makeCall: async (purpose: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/call`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ purpose }),
      });
      if (!response.ok) throw new Error('Failed to make AI call');
      return await response.json();
    } catch (error) {
      console.error('Error making AI call:', error);
      // Return mock data as fallback
      return { success: true, callId: Date.now().toString() };
    }
  },
  getCallHistory: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/call-history`);
      if (!response.ok) throw new Error('Failed to fetch call history');
      return await response.json();
    } catch (error) {
      console.error('Error fetching call history:', error);
      // Return mock data as fallback
      return [];
    }
  },
  sendMessage: async (callId: string, message: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ callId, message }),
      });
      if (!response.ok) throw new Error('Failed to send message');
      return await response.json();
    } catch (error) {
      console.error('Error sending message:', error);
      // Return mock data as fallback
      return { success: true, response: '我理解您的感受，情绪起伏是正常的。深呼吸，慢慢来，您做得很好。' };
    }
  },
};