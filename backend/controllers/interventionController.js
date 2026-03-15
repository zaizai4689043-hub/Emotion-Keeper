// Emotional phrases for "情绪创可贴" - specifically designed to calm frustrated parents
const EMOTIONAL_PHRASES = {
  patience: [
    "孩子不是不会，只是需要多一点时间。我急，他更慌。",
    "每个孩子都有自己的学习节奏，我的耐心是他安全感的来源。",
    "作业可以重做，但亲子关系的裂痕需要很久才能修复。",
    "他现在的困惑，正是大脑在建立新连接的过程，需要我的支持而非催促。",
    "深呼吸，提醒自己：我的目标是培养一个热爱学习的孩子，而不是完成今天的作业。"
  ],
  mindset: [
    "他现在卡住的地方，也许正是需要我耐心引导的机会。",
    "这不是他在对抗我，而是他在和自己的困惑作斗争。",
    "我的情绪稳定，是他面对困难时最需要的安全感。",
    "把'你怎么又错了'换成'我们一起看看哪里可以改进'，心态会完全不同。",
    "辅导作业不是考试，而是我们共同成长的机会。"
  ],
  action: [
    "先去喝口水，深呼吸三次，回来再换个方法试试。",
    "暂停两分钟，给自己倒杯茶，平静后再继续。",
    "站起来伸个懒腰，换个环境再回来，新鲜感会带来新思路。",
    "对孩子说'妈妈/爸爸需要冷静一下'，示范情绪管理比完成作业更重要。",
    "把难题拆成小步骤，先完成最容易的部分，建立信心再继续。"
  ],
  perspective: [
    "多年后回头看，这些作业题并不重要，但我的态度会影响他一辈子。",
    "今天我选择耐心，是在为他未来的心理健康投资。",
    "作业的分数只影响一时，但我的情绪反应会影响他对学习的终身态度。",
    "我辅导的不是作业，而是他面对困难时的心态和解决问题的能力。",
    "十年后，他不会记得这道题怎么做，但会记得我辅导时是温暖还是冰冷。"
  ]
};

// Calming music tracks
const CALMING_MUSIC = [
  {
    id: 1,
    title: "G 弦上的咏叹调",
    composer: "巴赫",
    duration: "5:00",
    url: "/assets/music/G_Chord_Sonata.mp3",
    cover: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80"
  }
];

// Intervention types
const INTERVENTION_TYPES = [
  { id: 1, name: "呼吸练习", duration: 60 },
  { id: 2, name: "情绪创可贴", duration: 60 },
  { id: 3, name: "暂停 1 分钟", duration: 60 },
  { id: 4, name: "舒缓音乐", duration: 300 }
];

export const getEmotionalPhrases = (req, res) => {
  try {
    res.json(EMOTIONAL_PHRASES);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCalmingMusic = (req, res) => {
  try {
    res.json(CALMING_MUSIC);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getInterventionTypes = (req, res) => {
  try {
    res.json(INTERVENTION_TYPES);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};