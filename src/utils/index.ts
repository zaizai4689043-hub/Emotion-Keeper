// Simulated voice transcript records (stored by date)
export const generateVoiceTranscripts = () => {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  return [
    {
      date: today,
      records: [
        { id: 1, time: "19:23", text: "这个题讲了这么多遍怎么还不会", triggered: true, keyword: "怎么还不会" },
        { id: 2, time: "19:45", text: "我们先休息一下，喝口水", triggered: false, keyword: null },
        { id: 3, time: "20:12", text: "你看，这样想是不是就简单多了", triggered: false, keyword: null },
        { id: 4, time: "20:38", text: "你怎么这个都不会", triggered: true, keyword: "怎么这个都不会" }
      ]
    },
    {
      date: yesterday,
      records: [
        { id: 5, time: "19:15", text: "别着急，我们慢慢来", triggered: false, keyword: null },
        { id: 6, time: "19:42", text: "这么简单都不会", triggered: true, keyword: "这么简单都不会" },
        { id: 7, time: "20:05", text: "妈妈刚才太急了，对不起", triggered: false, keyword: null }
      ]
    }
  ];
};

// Simulated health data for the last 24 hours
export const generateHealthData = () => {
  const data = [];
  const now = new Date().getTime();
  
  for (let i = 23; i >= 0; i--) {
    const hour = new Date(now - i * 60 * 60 * 1000);
    const hourNum = hour.getHours();
    
    // Simulate heart rate patterns based on time of day and emotional state
    let baseHR = 65;
    let stressLevel = 0.3;
    
    // Higher heart rate during typical stress times (evening homework time)
    if (hourNum >= 18 && hourNum <= 21) {
      baseHR = 78;
      stressLevel = 0.7;
    } 
    // Lower during sleep hours
    else if (hourNum >= 22 || hourNum < 6) {
      baseHR = 58;
      stressLevel = 0.1;
    }
    // Morning routine
    else if (hourNum >= 6 && hourNum <= 8) {
      baseHR = 70;
      stressLevel = 0.4;
    }
    
    // Add some randomness
    const hrVariation = Math.floor(Math.random() * 8) - 4;
    const stressVariation = Math.random() * 0.2 - 0.1;
    
    data.push({
      time: `${hourNum.toString().padStart(2, '0')}:00`,
      heartRate: Math.max(50, Math.min(100, baseHR + hrVariation)),
      stressLevel: Math.max(0.1, Math.min(0.9, stressLevel + stressVariation)),
      emotionalState: stressLevel > 0.6 ? "焦虑" : stressLevel > 0.4 ? "紧张" : "平静"
    });
  }
  
  return data;
};