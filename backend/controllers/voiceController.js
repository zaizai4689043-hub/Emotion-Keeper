// Default voice keywords for intervention
const DEFAULT_VOICE_KEYWORDS = [
  { id: 1, keyword: "你好笨", enabled: true },
  { id: 2, keyword: "我不管你了", enabled: true },
  { id: 3, keyword: "你怎么这个都不会", enabled: true },
  { id: 4, keyword: "这个题你也错", enabled: true },
  { id: 5, keyword: "这么简单都不会", enabled: true },
  { id: 6, keyword: "气死我了", enabled: true },
  { id: 7, keyword: "别做了", enabled: true },
  { id: 8, keyword: "真让人失望", enabled: true }
];

// Simulated voice transcript records (stored by date)
const generateVoiceTranscripts = () => {
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

export const getVoiceTranscripts = (req, res) => {
  try {
    const transcripts = generateVoiceTranscripts();
    res.json(transcripts);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const addVoiceTranscript = (req, res) => {
  try {
    const { date, time, text, triggered, keyword } = req.body;
    // In a real app, you would save this to a database
    res.json({ success: true, message: 'Voice transcript added', data: req.body });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getVoiceKeywords = (req, res) => {
  try {
    res.json(DEFAULT_VOICE_KEYWORDS);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateVoiceKeywords = (req, res) => {
  try {
    const keywords = req.body;
    // In a real app, you would save this to a database
    res.json({ success: true, message: 'Voice keywords updated', data: keywords });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};