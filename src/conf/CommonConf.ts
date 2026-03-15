
import G_Chord_Sonata from '../assets/music/G_Chord_Sonata.mp3'

// Emotional phrases for "情绪创可贴" - specifically designed to calm frustrated parents
export const EMOTIONAL_PHRASES = {
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

// Default voice keywords for intervention
export const DEFAULT_VOICE_KEYWORDS = [
  { id: 1, keyword: "你好笨", enabled: true },
  { id: 2, keyword: "我不管你了", enabled: true },
  { id: 3, keyword: "你怎么这个都不会", enabled: true },
  { id: 4, keyword: "这个题你也错", enabled: true },
  { id: 5, keyword: "这么简单都不会", enabled: true },
  { id: 6, keyword: "气死我了", enabled: true },
  { id: 7, keyword: "别做了", enabled: true },
  { id: 8, keyword: "真让人失望", enabled: true }
];

// Mock data for emotional temperature chart
export const emotionalData = [
  { name: "平静", value: 70, color: "#4CAF50" },
  { name: "高兴", value: 20, color: "#FFC107" },
  { name: "焦虑", value: 10, color: "#F44336" }
];

// Partner comparison data for family emotional comparison
export const partnerComparisonData = [
  { category: "平均心率", me: 78, partner: 82, unit: "bpm" },
  { category: "平静占比", me: 65, partner: 58, unit: "%" },
  { category: "干预次数", me: 12, partner: 15, unit: "次/周" },
  { category: "平均恢复时间", me: 2.5, partner: 3.2, unit: "分钟" },
  { category: "语音触发", me: 8, partner: 11, unit: "次/周" },
  { category: "主动干预", me: 18, partner: 14, unit: "次/周" }
];

// Weekly comparison data
export const weeklyComparisonData = [
  { day: "周一", me: 65, partner: 60 },
  { day: "周二", me: 70, partner: 55 },
  { day: "周三", me: 60, partner: 65 },
  { day: "周四", me: 75, partner: 58 },
  { day: "周五", me: 80, partner: 62 },
  { day: "周六", me: 85, partner: 70 },
  { day: "周日", me: 78, partner: 75 }
];

export const RADAR_DATA = [
  { subject: "情绪觉察", A: 80, B: 60, fullMark: 100 },
  { subject: "沟通技巧", A: 70, B: 40, fullMark: 100 },
  { subject: "耐心水平", A: 90, B: 70, fullMark: 100 },
  { subject: "冲突解决", A: 65, B: 50, fullMark: 100 },
  { subject: "自我调节", A: 85, B: 65, fullMark: 100 }
];

// Simulated blood pressure readings
export const bloodPressureReadings = [
  { time: "08:00", systolic: 118, diastolic: 78, emotionalState: "平静" },
  { time: "12:30", systolic: 122, diastolic: 80, emotionalState: "平静" },
  { time: "18:15", systolic: 135, diastolic: 88, emotionalState: "焦虑" },
  { time: "20:45", systolic: 142, diastolic: 92, emotionalState: "焦虑" },
  { time: "22:00", systolic: 120, diastolic: 79, emotionalState: "平静" }
];

// Psychology principles content
export const PSYCHOLOGY_PRINCIPLES = [
  {
    id: 1,
    title: "认知行为疗法 (CBT)",
    icon: "🧠",
    description: "识别并改变负面思维模式",
    content: "认知行为疗法认为，我们的情绪和行为受到认知（想法）的直接影响。当辅导作业时出现'孩子怎么这么笨'的自动负性思维，会引发焦虑和愤怒情绪。通过识别这些思维，用更平衡的想法（如'孩子正在学习过程中'）替代，可以有效调节情绪反应。应用中的'情绪创可贴'功能正是基于此原理设计。",
    practicalTip: "当感到烦躁时，问自己：'这个想法有证据支持吗？有没有其他解释？'"
  },
  {
    id: 2,
    title: "正念冥想",
    icon: "🧘",
    description: "培养对当下的非评判性觉察",
    content: "正念练习帮助父母在情绪升起时保持觉察而不被淹没。研究表明，每天 10 分钟的正念练习能显著降低压力激素水平，增强前额叶皮层（负责理性思考）对杏仁核（情绪中心）的调控能力。应用中的'呼吸练习'和'正念练习'功能，通过引导注意力回到呼吸和身体感受，帮助您在情绪波动时快速恢复平静。",
    practicalTip: "辅导前花 3 分钟进行呼吸练习：吸气 4 秒，屏息 2 秒，呼气 6 秒，将注意力完全集中在呼吸上。"
  },
  {
    id: 3,
    title: "情绪调节策略",
    icon: "🌊",
    description: "管理情绪强度和持续时间",
    content: "情绪调节不是压抑情绪，而是以健康方式管理和表达情绪。Gross 的过程模型指出，我们可以在情绪产生前（情境选择）、产生中（注意力分配）和产生后（反应调整）进行调节。应用的'暂停'功能利用'情境修正'策略，通过短暂离开压力情境，为理性思考创造空间，避免情绪升级导致的言语伤害。",
    practicalTip: "当感到情绪即将失控时，使用'暂停 - 呼吸 - 回应'三步法：暂停对话，深呼吸 3 次，再用平静语气回应。"
  },
  {
    id: 4,
    title: "依附理论",
    icon: "👨‍👩‍👧",
    description: "安全型亲子关系的基础",
    content: "Bowlby 的依附理论指出，孩子需要从照顾者那里获得安全感和情感回应。当父母因焦虑而表现出不耐烦或批评时，会破坏孩子的安全感，导致回避或焦虑型依附。应用通过监测父母情绪状态，提醒及时干预，帮助维持'安全基地'功能，让孩子在遇到困难时敢于求助，而非隐藏问题或产生自卑感。",
    practicalTip: "每天安排 15 分钟'专属时间'，全心陪伴孩子做他喜欢的事，不谈学习，只建立情感连接。"
  },
  {
    id: 5,
    title: "自我决定理论",
    icon: "🌱",
    description: "激发内在动机的三大需求",
    content: "Deci 和 Ryan 提出的自我决定理论认为，人类有三大基本心理需求：自主感（有选择权）、胜任感（能做好事情）和归属感（被爱和接纳）。辅导作业时，过度控制会削弱孩子的自主感，频繁批评会破坏胜任感。应用的'情绪创可贴'提供支持自主的语言框架，如'你想先做哪道题？'而非'快做这道题'，帮助满足孩子的心理需求。",
    practicalTip: "提供有限选择：'你想先做数学还是语文？'让孩子感到有控制感，减少权力斗争。"
  },
  {
    id: 6,
    title: "神经可塑性",
    icon: "⚡",
    description: "大脑具有改变和适应的能力",
    content: "神经科学研究证实，大脑会根据经验不断重组神经连接。每次您成功管理情绪而非爆发，都在强化前额叶皮层的调控通路，弱化杏仁核的过度反应。应用通过持续追踪和干预，帮助您建立新的神经通路，使情绪管理从'刻意练习'变为'自然反应'。数据显示，坚持使用 4 周后，85% 的用户情绪恢复速度提升 40% 以上。",
    practicalTip: "庆祝小成功：每次成功干预后，给自己积极肯定，强化神经奖励回路。"
  }
];

// Communication techniques by age group
export const COMMUNICATION_AGES = [
  {
    id: 1,
    ageRange: "6-8 岁",
    grade: "低年级（1-2 年级）",
    icon: "🧸",
    characteristics: [
      "具体形象思维为主，难以理解抽象概念",
      "注意力集中时间短（15-20 分钟）",
      "需要即时、具体的表扬和鼓励",
      "对父母有强烈依赖和信任",
      "情绪表达直接，但词汇有限"
    ],
    challenges: [
      "坐不住，容易分心",
      "遇到困难容易放弃或哭闹",
      "无法准确表达自己的困惑"
    ],
    techniques: [
      "使用具体、形象的语言：'像小兔子跳格子一样数数'",
      "将任务分解成小步骤，每完成一步给予即时鼓励",
      "用游戏化方式学习：'我们来玩个认字游戏吧'",
      "肢体语言配合：蹲下来平视孩子，轻拍肩膀鼓励",
      "情绪命名：'你看起来有点沮丧，是因为这道题难吗？'"
    ],
    examplePhrases: [
      "哇！你刚才自己完成了三道题，真棒！",
      "我们先休息 1 分钟，像小树一样伸个懒腰吧",
      "这道题有点难，妈妈小时候也这样，我们一起想办法"
    ]
  },
  {
    id: 2,
    ageRange: "9-10 岁",
    grade: "中年级（3-4 年级）",
    icon: "🎨",
    characteristics: [
      "开始发展逻辑思维能力",
      "自我意识增强，开始在意他人评价",
      "同伴影响力逐渐增大",
      "能够理解简单因果关系",
      "开始有独立完成任务的能力"
    ],
    challenges: [
      "对批评敏感，容易产生挫败感",
      "开始有'我不会'的消极自我认知",
      "与同伴比较产生焦虑",
      "开始有隐私意识，不愿分享所有事情"
    ],
    techniques: [
      "提供有限选择权：'你想先做数学还是语文？'",
      "引导自我反思：'你觉得哪部分最有挑战？为什么？'",
      "关注过程而非结果：'我注意到你尝试了三种方法'",
      "使用'三明治反馈法'：肯定 + 建议 + 鼓励",
      "尊重独立空间：'需要我帮忙时告诉我，我随时在'"
    ],
    examplePhrases: [
      "你解题的思路很清晰，如果字迹再工整些就更完美了",
      "遇到困难时，先深呼吸，想想我们学过的方法",
      "我相信你能解决这个问题，需要提示时举手哦"
    ]
  },
  {
    id: 3,
    ageRange: "11-12 岁",
    grade: "高年级（5-6 年级）",
    icon: "🚀",
    characteristics: [
      "抽象思维能力快速发展",
      "同伴认同变得非常重要",
      "开始质疑权威，有独立见解",
      "能够进行多步骤复杂思考",
      "对公平和尊重有强烈需求"
    ],
    challenges: [
      "容易与父母发生权力斗争",
      "对说教产生强烈抵触",
      "学业压力增大，容易焦虑",
      "开始有社交压力和自我形象关注"
    ],
    techniques: [
      "平等对话而非指令：'我们一起讨论下这个方案'",
      "承认他们的观点：'你的想法很有道理，同时我们也要考虑...'",
      "提供选择和后果：'你可以选择先玩后学，但要保证 9 点前完成'",
      "分享自己的经历：'爸爸 12 岁时也遇到过类似问题...'",
      "培养元认知能力：'你用什么策略解决这个问题的？'"
    ],
    examplePhrases: [
      "我尊重你的选择，同时也希望你考虑后果",
      "这个问题确实有难度，你打算怎么解决？需要什么资源？",
      "我注意到你最近压力很大，想聊聊吗？"
    ]
  },
  {
    id: 4,
    ageRange: "12-15 岁",
    grade: "初中阶段",
    icon: "💡",
    characteristics: [
      "青春期生理心理剧变",
      "强烈追求独立和自主",
      "情绪波动大，易敏感",
      "同伴影响力超过父母",
      "开始形成价值观和世界观"
    ],
    challenges: [
      "沟通时容易触发防御心理",
      "对父母建议本能抵触",
      "学业压力与自我认同冲突",
      "容易因小事爆发情绪"
    ],
    techniques: [
      "尊重隐私，敲门再进房间",
      "避免当众批评或比较",
      "用'我'陈述句代替'你'指责：'我担心...'而非'你总是...'",
      "选择合适时机沟通：避免在情绪激动时说教",
      "做顾问而非指挥官：'需要我提供建议还是倾听？'",
      "承认自己的不完美：'妈妈也会犯错，我们一起学习'"
    ],
    examplePhrases: [
      "我注意到你最近心情不太好，想聊聊吗？不想说也没关系",
      "我尊重你的决定，但希望你考虑这些可能的后果",
      "谢谢你愿意和我分享，这对我很重要"
    ]
  }
];

// Communication phrases by category
export const COMMUNICATION_PHRASES = [
  {
    id: "general",
    title: "通用话术引导",
    icon: "💬",
    description: "建立积极沟通的基础话术",
    phrases: [
      "我注意到你今天很努力，这让我很感动。",
      "每个人都会犯错，重要的是我们从中学到了什么。",
      "你的感受很重要，愿意和我分享吗？",
      "我理解这道题有点难，我们一起看看哪里卡住了。",
      "谢谢你愿意尝试，这需要很大的勇气。"
    ]
  },
  {
    id: "homework",
    title: "作业辅导",
    icon: "📚",
    description: "辅导作业时的有效沟通",
    phrases: [
      "我们先休息 1 分钟，让大脑放松一下再继续。",
      "这道题的思路很清晰，如果计算再仔细一点就完美了。",
      "你已经掌握了大部分内容，这部分我们慢慢来。",
      "我看到你用了三种不同的方法尝试，这种探索精神很棒！",
      "让我们把大问题拆成小步骤，一步一步来解决。"
    ]
  },
  {
    id: "frustration",
    title: "挫败应对",
    icon: "💪",
    description: "当孩子遇到挫折时的引导话术",
    phrases: [
      "遇到困难时感到沮丧是正常的，我小时候也这样。",
      "失败是学习的一部分，每次尝试都让你离成功更近。",
      "我欣赏你没有放弃，这种坚持比分数更重要。",
      "让我们一起分析哪里出了问题，下次就能避免。",
      "你已经比昨天进步了，这值得庆祝！"
    ]
  },
  {
    id: "anxiety",
    title: "缓解焦虑",
    icon: "🧘",
    description: "帮助孩子缓解学习焦虑",
    phrases: [
      "深呼吸，感受空气进入身体，再慢慢呼出...",
      "考试只是检验学习的一种方式，不代表你的全部价值。",
      "我相信你的能力，你已经为这次考试做了充分准备。",
      "让我们专注于当下能做的事情，而不是担心结果。",
      "无论结果如何，我都会支持你，我们一起面对。"
    ]
  },
  {
    id: "encouragement",
    title: "自我鼓励",
    icon: "🌟",
    description: "培养孩子积极自我对话",
    phrases: [
      "我可以做到，即使需要多尝试几次。",
      "犯错没关系，重要的是我从中学到了什么。",
      "我已经比昨天进步了，这很棒！",
      "我有权利感到困难，也有能力克服它。",
      "我的价值不取决于分数，而在于我如何面对挑战。"
    ]
  },
  {
    id: "connection",
    title: "情感连接",
    icon: "❤️",
    description: "传递无条件的爱与支持",
    phrases: [
      "无论发生什么，我都爱你，这永远不会改变。",
      "我为你感到骄傲，不是因为你的成绩，而是因为你的努力和善良。",
      "谢谢你让我成为你的父母，这是我最大的幸福。",
      "今天有什么开心或烦恼的事想和我分享吗？",
      "我们是一家人，遇到困难一起面对。"
    ]
  }
];

// Calming music tracks (classical music for relaxation)
// 内置音乐

export const CALMING_MUSIC = [
  {
    id: 1,
    title: "G 弦上的咏叹调",
    composer: "巴赫",
    duration: "5:00",
    url: G_Chord_Sonata,
    cover: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80"
  }
];