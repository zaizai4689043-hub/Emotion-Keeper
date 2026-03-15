// Simulated health data for the last 24 hours
const generateHealthData = () => {
  const data = [];
  const now = new Date();
  
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

// Simulated blood pressure readings
const bloodPressureReadings = [
  { time: "08:00", systolic: 118, diastolic: 78, emotionalState: "平静" },
  { time: "12:30", systolic: 122, diastolic: 80, emotionalState: "平静" },
  { time: "18:15", systolic: 135, diastolic: 88, emotionalState: "焦虑" },
  { time: "20:45", systolic: 142, diastolic: 92, emotionalState: "焦虑" },
  { time: "22:00", systolic: 120, diastolic: 79, emotionalState: "平静" }
];

export const getHealthData = (req, res) => {
  try {
    const healthData = generateHealthData();
    res.json(healthData);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getBloodPressureReadings = (req, res) => {
  try {
    res.json(bloodPressureReadings);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateHealthData = (req, res) => {
  try {
    const { heartRate, bloodPressure, stressLevel } = req.body;
    // In a real app, you would save this data to a database
    res.json({ success: true, message: 'Health data updated', data: req.body });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};