import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, Legend
} from "recharts";

import { healthApi, voiceApi, interventionApi, dataApi } from "./services/api";

import AICall from "./components/AICall";

// Emotional phrases for "情绪创可贴"
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



// Mock data for emotional temperature chart
const emotionalData = [
  { name: "平静", value: 70, color: "#4CAF50" },
  { name: "高兴", value: 20, color: "#FFC107" },
  { name: "焦虑", value: 10, color: "#F44336" }
];

// Family comparison data including child
const partnerComparisonData = [
  { category: "平均心率", me: 78, partner: 82, child: 95, unit: "bpm" },
  { category: "平静占比", me: 65, partner: 58, child: 72, unit: "%" },
  { category: "干预次数", me: 12, partner: 15, child: 8, unit: "次/周" },
  { category: "平均恢复时间", me: 2.5, partner: 3.2, child: 1.8, unit: "分钟" },
  { category: "语音触发", me: 8, partner: 11, child: 5, unit: "次/周" },
  { category: "主动干预", me: 18, partner: 14, child: 6, unit: "次/周" }
];

// Weekly comparison data including child
const weeklyComparisonData = [
  { day: "周一", me: 65, partner: 60, child: 70 },
  { day: "周二", me: 70, partner: 55, child: 75 },
  { day: "周三", me: 60, partner: 65, child: 68 },
  { day: "周四", me: 75, partner: 58, child: 72 },
  { day: "周五", me: 80, partner: 62, child: 85 },
  { day: "周六", me: 85, partner: 70, child: 90 },
  { day: "周日", me: 78, partner: 75, child: 88 }
];

const RADAR_DATA = [
  { subject: "情绪觉察", A: 80, B: 60, fullMark: 100 },
  { subject: "沟通技巧", A: 70, B: 40, fullMark: 100 },
  { subject: "耐心水平", A: 90, B: 70, fullMark: 100 },
  { subject: "冲突解决", A: 65, B: 50, fullMark: 100 },
  { subject: "自我调节", A: 85, B: 65, fullMark: 100 }
];

// Family Emotional Health Learning Manual Content with Audio Scripts
const LEARNING_MANUAL_CONTENT = {
  parts: [
    { id: 1, title: "第一部分 认识焦虑", chapters: [1, 2, 3] },
    { id: 2, title: "第二部分 应对焦虑", chapters: [4, 5, 6, 7, 8] },
    { id: 3, title: "第三部分 养育不焦虑的孩子", chapters: [9, 10, 11, 12] }
  ],
  quickTips: [
    { title: "深呼吸练习", content: "当感到焦虑时，尝试4-7-8呼吸法：吸气4秒，屏息7秒，呼气8秒，重复3次。" },
    { title: "情绪命名", content: "给情绪命名可以帮助你更好地理解和管理它，比如'我现在感到焦虑'而不是'我现在很糟糕'。" },
    { title: "暂停策略", content: "当情绪升级时，给自己一个2分钟的暂停时间，离开现场，做些其他事情，然后再回来。" },
    { title: "感恩练习", content: "每天记录3件让你感恩的事情，这可以帮助你关注生活中的积极面。" }
  ],
  chapters: [
    {
      id: 1,
      part: 1,
      title: "第一章 你焦虑吗？",
      icon: "🔍",
      color: "from-purple-500 to-indigo-600",
      readTime: "5 分钟",
      audioDuration: "4:30",
      audioScript: "欢迎来到家庭情绪健康学习手册第一章。焦虑是一种正常的情绪反应，但过度焦虑会影响生活质量。根据 GAD-7 量表，偶尔担心是正常的，但如果每周大部分时间都感到紧张、难以控制担忧，并伴有身体症状如心悸、失眠，可能需要关注。我们要学会区分正常担心与病理性焦虑，识别身体信号如心跳加速、肌肉紧张、呼吸急促，以及情绪信号如易怒、难以集中注意力、灾难化思维。当伴侣表现出急躁时，试着问'你最近是不是压力很大'而非'你为什么总是发脾气'。看见对方的焦虑，是支持的第一步。",
      sections: [
        {
          title: "焦虑的自我觉察",
          content: "焦虑是一种正常的情绪反应，但过度焦虑会影响生活质量。根据 GAD-7 量表，偶尔担心是正常的，但如果每周大部分时间都感到紧张、难以控制担忧，并伴有身体症状（心悸、失眠），可能需要关注。",
          keyPoints: [
            "区分'正常担心'与'病理性焦虑'",
            "身体信号：心跳加速、肌肉紧张、呼吸急促",
            "情绪信号：易怒、难以集中注意力、灾难化思维"
          ]
        },
        {
          title: "伴侣共读：互相看见",
          content: "焦虑往往隐藏在'忙碌'或'生气'背后。当伴侣表现出急躁时，试着问：'你最近是不是压力很大？'而非'你为什么总是发脾气'。看见对方的焦虑，是支持的第一步。",
          keyPoints: [
            "不评判对方的焦虑表现",
            "用'我注意到...'代替'你总是...'",
            "共同完成焦虑自评，了解彼此状态"
          ]
        }
      ]
    },
    {
      id: 2,
      part: 1,
      title: "第二章 不同类型的焦虑",
      icon: "🎭",
      color: "from-purple-500 to-indigo-600",
      readTime: "6 分钟",
      audioDuration: "5:15",
      audioScript: "第二章我们将了解不同类型的焦虑。焦虑不仅是一种感觉，它有不同类型。广泛性焦虑表现为对日常事务过度担忧。社交焦虑是害怕他人评价。表现焦虑是怕做不好，这在辅导作业时最常见。分离焦虑是过度担心孩子安全，难以放手。识别类型有助于针对性应对。伴侣双方可能有不同类型的焦虑，一方可能是表现焦虑盯着成绩，另一方可能是分离焦虑盯着安全。理解差异，避免互相指责你太严或你太宠。讨论各自最担心的事情是什么，尊重对方的焦虑类型不否定，分工合作一人负责学业一人负责情感。",
      sections: [
        {
          title: "焦虑的多种面貌",
          content: "焦虑不仅是一种感觉，它有不同类型：广泛性焦虑（持续担忧）、社交焦虑（害怕评价）、表现焦虑（怕做不好）、分离焦虑（担心孩子安全）。识别类型有助于针对性应对。",
          keyPoints: [
            "广泛性焦虑：对日常事务过度担忧",
            "表现焦虑：辅导作业时最常见，怕孩子落后",
            "分离焦虑：过度担心孩子安全，难以放手"
          ]
        },
        {
          title: "伴侣共读：理解差异",
          content: "伴侣双方可能有不同类型的焦虑。一方可能是'表现焦虑'（盯着成绩），另一方可能是'分离焦虑'（盯着安全）。理解差异，避免互相指责'你太严'或'你太宠'。",
          keyPoints: [
            "讨论各自最担心的事情是什么",
            "尊重对方的焦虑类型，不否定",
            "分工合作：一人负责学业，一人负责情感"
          ]
        }
      ]
    },
    {
      id: 3,
      part: 1,
      title: "第三章 产生焦虑的原因",
      icon: "🌱",
      color: "from-purple-500 to-indigo-600",
      readTime: "7 分钟",
      audioDuration: "6:00",
      audioScript: "第三章我们探讨焦虑的来源。焦虑源于生物、心理和社会因素。生物学上，杏仁核过度活跃。心理上，核心信念如我不够好。社会上，竞争压力。代际传递也很重要，焦虑的父母容易养育焦虑的孩子。生物因素包括遗传和神经递质失衡。心理因素包括完美主义和控制欲。社会因素包括教育内卷和同辈压力。分享各自的成长经历，我小时候被怎样对待。理解对方的焦虑不是故意找茬，而是过往经验的反应。这能增加同理心，减少冲突。共同决定不把上一代的焦虑传给孩子。",
      sections: [
        {
          title: "焦虑的来源",
          content: "焦虑源于生物、心理和社会因素。生物学上，杏仁核过度活跃；心理上，核心信念（'我不够好'）；社会上，竞争压力。代际传递也很重要：焦虑的父母容易养育焦虑的孩子。",
          keyPoints: [
            "生物因素：遗传、神经递质失衡",
            "心理因素：完美主义、控制欲",
            "社会因素：教育内卷、同辈压力",
            "代际传递：原生家庭的影响"
          ]
        },
        {
          title: "伴侣共读：追溯根源",
          content: "分享各自的成长经历：'我小时候被怎样对待？'理解对方的焦虑不是'故意找茬'，而是'过往经验的反应'。这能增加同理心，减少冲突。",
          keyPoints: [
            "分享原生家庭的教育方式",
            "理解对方的'触发点'来自哪里",
            "共同决定：不把上一代的焦虑传给孩子"
          ]
        }
      ]
    },
    {
      id: 4,
      part: 2,
      title: "第四章 处理焦虑",
      icon: "🛡️",
      color: "from-amber-500 to-orange-600",
      readTime: "6 分钟",
      audioDuration: "5:30",
      audioScript: "第四章我们学习处理焦虑的方法。当焦虑来袭，使用着陆技术，五感练习，五种看到的、四种触摸到的。呼吸调节，四七八呼吸法。这些方法能在 90 秒内降低生理唤起。建立焦虑急救协议，当一方焦虑发作时，另一方不讲道理只提供陪伴。可以说我在这里，我们一起呼吸。避免说别想太多。约定一个求助信号如握手三次。一方焦虑时，另一方担任容器角色。事后复盘，不在情绪当下解决问题。",
      sections: [
        {
          title: "即时应对策略",
          content: "当焦虑来袭，使用'着陆技术'：5-4-3-2-1 感官练习（5 种看到的、4 种触摸到的...）。呼吸调节：4-7-8 呼吸法。这些方法能在 90 秒内降低生理唤起。",
          keyPoints: [
            "4-7-8 呼吸法：吸气 4 秒，屏息 7 秒，呼气 8 秒",
            "5-4-3-2-1 感官着陆练习",
            "渐进式肌肉放松：紧绷 - 放松循环"
          ]
        },
        {
          title: "伴侣共读：情绪急救",
          content: "建立'焦虑急救协议'：当一方焦虑发作时，另一方不讲道理，只提供陪伴。可以说：'我在这里，我们一起呼吸'。避免说'别想太多'。",
          keyPoints: [
            "约定一个'求助信号'（如握手 3 次）",
            "一方焦虑时，另一方担任'容器'角色",
            "事后复盘，不在情绪当下解决问题"
          ]
        }
      ]
    },
    {
      id: 5,
      part: 2,
      title: "第五章 日常情绪，日常处理",
      icon: "📅",
      color: "from-amber-500 to-orange-600",
      readTime: "5 分钟",
      audioDuration: "4:45",
      audioScript: "第五章我们建立日常情绪管理习惯。焦虑管理不仅是危机干预，更是日常习惯。保证睡眠、规律运动、正念冥想。研究显示，每周 150 分钟中等强度运动能显著降低焦虑水平。睡眠优先，睡前一小时不用电子设备。运动处方，每周三次每次三十分钟。正念练习，每天十分钟觉察呼吸。建立家庭的无焦虑时间，每天二十分钟，不谈学习工作，只聊天或散步。这是给家庭情感账户存款的时刻。设立无作业话题时段，共同参与放松活动如一起做饭，互相提醒休息而非互相施压。",
      sections: [
        {
          title: "建立情绪韧性",
          content: "焦虑管理不仅是危机干预，更是日常习惯。保证睡眠、规律运动、正念冥想。研究显示，每周 150 分钟中等强度运动能显著降低焦虑水平。",
          keyPoints: [
            "睡眠优先：睡前 1 小时不用电子设备",
            "运动处方：每周 3 次，每次 30 分钟",
            "正念练习：每天 10 分钟觉察呼吸"
          ]
        },
        {
          title: "伴侣共读：共同仪式",
          content: "建立家庭的'无焦虑时间'：每天 20 分钟，不谈学习、工作，只聊天或散步。这是给家庭情感账户'存款'的时刻。",
          keyPoints: [
            "设立'无作业话题'时段",
            "共同参与放松活动（如一起做饭）",
            "互相提醒休息，而非互相施压"
          ]
        }
      ]
    },
    {
      id: 6,
      part: 2,
      title: "第六章 拔出焦虑的'根'",
      icon: "🌳",
      color: "from-amber-500 to-orange-600",
      readTime: "8 分钟",
      audioDuration: "7:00",
      audioScript: "第六章我们探索焦虑的根源。焦虑的根往往是核心信念，我必须完美，孩子失败就是我失败。通过书写练习，识别这些信念，问自己这是事实还是想法。识别必须应该思维。挑战灾难化想法，最坏情况真的会发生吗。替换为弹性信念，尽力就好。讨论各自的教育信念，我们认为什么是成功。如果一方认为成绩第一，另一方认为快乐第一，需要协商找到平衡点，避免孩子接收到矛盾信息。写下各自的教育核心价值观，找出共识区尊重差异区，在孩子面前保持一致立场。",
      sections: [
        {
          title: "探索核心信念",
          content: "焦虑的根往往是核心信念：'我必须完美'、'孩子失败就是我失败'。通过书写练习，识别这些信念，问自己：'这是事实还是想法？'",
          keyPoints: [
            "识别'必须/应该'思维",
            "挑战灾难化想法：'最坏情况真的会发生吗？'",
            "替换为弹性信念：'尽力就好'"
          ]
        },
        {
          title: "伴侣共读：信念对齐",
          content: "讨论各自的教育信念：'我们认为什么是成功？'如果一方认为'成绩第一'，另一方认为'快乐第一'，需要协商找到平衡点，避免孩子接收到矛盾信息。",
          keyPoints: [
            "写下各自的教育核心价值观",
            "找出共识区，尊重差异区",
            "在孩子面前保持一致立场"
          ]
        }
      ]
    },
    {
      id: 7,
      part: 2,
      title: "第七章 改变认知，改变焦虑",
      icon: "🧠",
      color: "from-amber-500 to-orange-600",
      readTime: "7 分钟",
      audioDuration: "6:15",
      audioScript: "第七章学习认知重构技术。认知行为疗法认为，想法决定情绪。将孩子这次考不好将来就完了重构为这是一次学习机会，我们可以一起分析原因。情绪会从绝望转为希望。捕捉自动负性思维。寻找证据支持反对该想法。生成更平衡的替代想法。当一方陷入负性思维时，另一方温和地提醒，这是焦虑在说话还是事实在说话。成为彼此的认知教练而非批评者。互相指出对方的灾难化思维，用提问代替说教，有其他可能性吗，庆祝认知改变的小进步。",
      sections: [
        {
          title: "认知重构技术 (CBT)",
          content: "认知行为疗法认为，想法决定情绪。将'孩子这次考不好，将来就完了'重构为'这是一次学习机会，我们可以一起分析原因'。情绪会从绝望转为希望。",
          keyPoints: [
            "捕捉自动负性思维",
            "寻找证据支持/反对该想法",
            "生成更平衡的替代想法"
          ]
        },
        {
          title: "伴侣共读：认知互助",
          content: "当一方陷入负性思维时，另一方温和地提醒：'这是焦虑在说话，还是事实在说话？'成为彼此的'认知教练'，而非批评者。",
          keyPoints: [
            "互相指出对方的'灾难化思维'",
            "用提问代替说教：'有其他可能性吗？'",
            "庆祝认知改变的小进步"
          ]
        }
      ]
    },
    {
      id: 8,
      part: 2,
      title: "第八章 设立健康的界限",
      icon: "🚧",
      color: "from-amber-500 to-orange-600",
      readTime: "6 分钟",
      audioDuration: "5:20",
      audioScript: "第八章学习设立健康的界限。焦虑常源于界限模糊，把孩子的问题当成自己的问题，把工作的压力带回家。健康界限是我关心你，但这是你的人生。课题分离，孩子的情绪归孩子，父母的情绪归父母。工作家庭界限，回家前转换角色。夫妻界限，不在孩子面前争吵。允许对方有独处时间处理情绪。当一方说我需要静静，另一方不追问，而是说好，我在隔壁，需要时叫我。这是信任的表现。尊重对方的情绪处理方式，不强行帮助除非被请求，建立请勿打扰信号系统。",
      sections: [
        {
          title: "界限的力量",
          content: "焦虑常源于界限模糊：把孩子的问题当成自己的问题，把工作的压力带回家。健康界限是：'我关心你，但这是你的人生'。",
          keyPoints: [
            "课题分离：孩子的情绪归孩子，父母的情绪归父母",
            "工作 - 家庭界限：回家前转换角色",
            "夫妻界限：不在孩子面前争吵"
          ]
        },
        {
          title: "伴侣共读：尊重空间",
          content: "允许对方有'独处时间'处理情绪。当一方说'我需要静静'，另一方不追问，而是说'好，我在隔壁，需要时叫我'。这是信任的表现。",
          keyPoints: [
            "尊重对方的情绪处理方式",
            "不强行'帮助'，除非被请求",
            "建立'请勿打扰'信号系统"
          ]
        }
      ]
    },
    {
      id: 9,
      part: 3,
      title: "第九章 现在的孩子都怎么了",
      icon: "📱",
      color: "from-green-500 to-emerald-600",
      readTime: "6 分钟",
      audioDuration: "5:30",
      audioScript: "第九章我们理解时代背景下的焦虑。现代孩子面临前所未有的压力，学业竞争、社交媒体比较、未来不确定性。大脑前额叶二十五岁才发育完全，孩子缺乏情绪调节能力，需要父母作为外置前额叶。理解时代压力的客观存在。认识大脑发育阶段限制。不把孩子当缩小版成人期待。面对外部压力，夫妻是盟友。不互相指责都是你惯的或都是你逼的。共同面对问题，我们如何一起帮助孩子应对这个挑战。不互相推卸教育责任，共同研究孩子面临的真实压力，成为孩子的安全基地而非压力源。",
      sections: [
        {
          title: "时代背景下的焦虑",
          content: "现代孩子面临前所未有的压力：学业竞争、社交媒体比较、未来不确定性。大脑前额叶 25 岁才发育完全，孩子缺乏情绪调节能力，需要父母作为'外置前额叶'。",
          keyPoints: [
            "理解时代压力的客观存在",
            "认识大脑发育阶段限制",
            "不把孩子当'缩小版成人'期待"
          ]
        },
        {
          title: "伴侣共读：统一阵线",
          content: "面对外部压力，夫妻是盟友。不互相指责'都是你惯的'或'都是你逼的'。共同面对问题：'我们如何一起帮助孩子应对这个挑战？'",
          keyPoints: [
            "不互相推卸教育责任",
            "共同研究孩子面临的真实压力",
            "成为孩子的'安全基地'而非'压力源'"
          ]
        }
      ]
    },
    {
      id: 10,
      part: 3,
      title: "第十章 如何帮助孩子缓解焦虑",
      icon: "🤗",
      color: "from-green-500 to-emerald-600",
      readTime: "7 分钟",
      audioDuration: "6:10",
      audioScript: "第十章学习如何帮助孩子缓解焦虑。孩子焦虑时，不需要解决方案，需要被理解。说我知道这很难比这有什么好怕的有效一百倍。情绪被接纳后，理性脑才能工作。先连接后纠正。命名情绪，你看起来有点担心。不急于解决问题，先陪伴情绪。一方负责情感容器接纳情绪，一方负责问题解决提供方法。角色可轮换。避免双方都讲道理或双方都情绪化。约定谁先安抚谁后引导，不在孩子面前否定对方的安抚方式，事后交流哪种方式对孩子更有效。",
      sections: [
        {
          title: "共情与验证",
          content: "孩子焦虑时，不需要解决方案，需要被理解。说'我知道这很难'比'这有什么好怕的'有效 100 倍。情绪被接纳后，理性脑才能工作。",
          keyPoints: [
            "先连接，后纠正",
            "命名情绪：'你看起来有点担心'",
            "不急于解决问题，先陪伴情绪"
          ]
        },
        {
          title: "伴侣共读：分工配合",
          content: "一方负责'情感容器'（接纳情绪），一方负责'问题解决'（提供方法）。角色可轮换。避免双方都讲道理或双方都情绪化。",
          keyPoints: [
            "约定谁先安抚，谁后引导",
            "不在孩子面前否定对方的安抚方式",
            "事后交流哪种方式对孩子更有效"
          ]
        }
      ]
    },
    {
      id: 11,
      part: 3,
      title: "第十一章 预防悲剧",
      icon: "🚨",
      color: "from-green-500 to-emerald-600",
      readTime: "8 分钟",
      audioDuration: "7:00",
      audioScript: "第十一章学习预防悲剧。严重焦虑可能发展为抑郁或自伤行为。警惕信号，睡眠食欲显著改变、自伤痕迹、谈论死亡、退缩行为。早期干预至关重要。关注行为突变而非偶尔情绪。直接询问，你有想过伤害自己吗。必要时寻求专业心理咨询。发现危机信号时，不互相指责是你管得太严。共同行动，一方陪伴孩子，一方联系专业资源。这是家庭危机，需要家庭力量。建立危机应对预案，保存心理咨询热线和资源，互相支持避免一方崩溃。",
      sections: [
        {
          title: "识别危机信号",
          content: "严重焦虑可能发展为抑郁或自伤行为。警惕信号：睡眠食欲显著改变、自伤痕迹、谈论死亡、退缩行为。早期干预至关重要。",
          keyPoints: [
            "关注行为突变而非偶尔情绪",
            "直接询问：'你有想过伤害自己吗？'",
            "必要时寻求专业心理咨询"
          ]
        },
        {
          title: "伴侣共读：共同守护",
          content: "发现危机信号时，不互相指责'是你管得太严'。共同行动：一方陪伴孩子，一方联系专业资源。这是家庭危机，需要家庭力量。",
          keyPoints: [
            "建立危机应对预案",
            "保存心理咨询热线和资源",
            "互相支持，避免一方崩溃"
          ]
        }
      ]
    },
    {
      id: 12,
      part: 3,
      title: "第十二章 如何养育不焦虑的孩子",
      icon: "🌈",
      color: "from-green-500 to-emerald-600",
      readTime: "7 分钟",
      audioDuration: "6:20",
      audioScript: "第十二章学习如何养育不焦虑的孩子。不焦虑的孩子不是没有压力，而是有应对压力的能力。培养成长型思维、自主感、胜任感。父母的情绪稳定是最好的疫苗。允许孩子犯错，视其为学习机会。培养自主决策能力。父母先管理好自己的焦虑。回顾初心，我们希望孩子成为什么样的人。通常不是成绩最好，而是健康快乐。当焦虑来袭，回到这个愿景，它能帮你校准方向。写下对孩子的长期期望，定期检查教育行为是否符合愿景，互相提醒还记得我们的初心吗。",
      sections: [
        {
          title: "培养心理韧性",
          content: "不焦虑的孩子不是没有压力，而是有应对压力的能力。培养成长型思维、自主感、胜任感。父母的情绪稳定是最好的疫苗。",
          keyPoints: [
            "允许孩子犯错，视其为学习机会",
            "培养自主决策能力",
            "父母先管理好自己的焦虑"
          ]
        },
        {
          title: "伴侣共读：长期愿景",
          content: "回顾初心：'我们希望孩子成为什么样的人？'通常不是'成绩最好'，而是'健康快乐'。当焦虑来袭，回到这个愿景，它能帮你校准方向。",
          keyPoints: [
            "写下对孩子的长期期望",
            "定期检查教育行为是否符合愿景",
            "互相提醒：'还记得我们的初心吗？'"
          ]
        }
      ]
    }
  ]
};

// Simulated health data for the last 24 hours
const generateHealthData = () => {
  const data = [];
  const now = new Date().getTime();
  
  for (let i = 23; i >= 0; i--) {
    const hour = new Date(now - i * 60 * 60 * 1000);
    const hourNum = hour.getHours();
    
    let baseHR = 65;
    let stressLevel = 0.3;
    
    if (hourNum >= 18 && hourNum <= 21) {
      baseHR = 78;
      stressLevel = 0.7;
    } else if (hourNum >= 22 || hourNum < 6) {
      baseHR = 58;
      stressLevel = 0.1;
    } else if (hourNum >= 6 && hourNum <= 8) {
      baseHR = 70;
      stressLevel = 0.4;
    }
    
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


// Psychology principles content
const PSYCHOLOGY_PRINCIPLES = [
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
const COMMUNICATION_AGES = [
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
const COMMUNICATION_PHRASES = [
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

// Calming music tracks - Canon in D as background
const CALMING_MUSIC = [
  {
    id: 1,
    title: "卡农 in D 大调",
    composer: "帕赫贝尔",
    duration: "5:00",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    cover: "https://images.unsplash.com/photo-1507838153414-b4b713384ebd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
    isBackground: true
  },
  {
    id: 2,
    title: "G 弦上的咏叹调",
    composer: "巴赫",
    duration: "4:15",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    cover: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 3,
    title: "月光奏鸣曲",
    composer: "贝多芬",
    duration: "6:20",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 4,
    title: "四季·春",
    composer: "维瓦尔第",
    duration: "3:45",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80"
  }
];

// TTS Service Configuration - 豆包 TTS 配置
const TTS_CONFIG = {
  provider: 'doubao',
  voice: 'zh_female_wanwanxuejie_moon_bigtts',
  voiceName: '湾湾学姐 (温暖知性女声)',
  rate: 1.0,
  pitch: 0,
  volume: 1.0,
  apiKey: 'YOUR_DOUBAO_API_KEY',
  appId: 'YOUR_DOUBAO_APP_ID',
  endpoint: 'https://openspeech.bytedance.com/api/v1/tts'
};

// 可选音色列表 - 豆包 TTS 音色
const AVAILABLE_VOICES = [
  { id: 'zh_female_wanwanxuejie_moon_bigtts', name: '湾湾学姐', provider: 'doubao', emotion: '温暖、知性、亲切' },
  { id: 'zh_female_qingchunvsheng_moon_bigtts', name: '青春女声', provider: 'doubao', emotion: '清新、活力、阳光' },
  { id: 'zh_male_wenhezhisheng_moon_bigtts', name: '温和知声', provider: 'doubao', emotion: '沉稳、可靠、专业' },
  { id: 'zh_female_tianmeinvsheng_moon_bigtts', name: '甜美女生', provider: 'doubao', emotion: '甜美、温柔、治愈' },
  { id: 'zh_female_chengshunvsheng_moon_bigtts', name: '成熟女声', provider: 'doubao', emotion: '成熟、稳重、优雅' },
  { id: 'zh_male_qingnianzhisheng_moon_bigtts', name: '青年知声', provider: 'doubao', emotion: '年轻、活力、亲和' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [emotionalState, setEmotionalState] = useState("平静");

  const [timeLeft, setTimeLeft] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const [voiceDetection, setVoiceDetection] = useState(false);
  const [showIntervention, setShowIntervention] = useState(false);
  const [currentIntervention, setCurrentIntervention] = useState<any>(null);
  const [heartRate, setHeartRate] = useState(72);
  const [bloodPressure, setBloodPressure] = useState({ systolic: 120, diastolic: 80 });
  const [healthData, setHealthData] = useState(generateHealthData());
  const [stressLevel, setStressLevel] = useState(0.3);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [resourceDetail, setResourceDetail] = useState<string | null>(null);
  const [expandedPrinciple, setExpandedPrinciple] = useState<number | null>(null);
  const [expandedAgeGroup, setExpandedAgeGroup] = useState<number | null>(null);
  const [expandedPhraseCategory, setExpandedPhraseCategory] = useState<string | null>(null);
  const [showAllPhrases, setShowAllPhrases] = useState(false);
  const [falseAlarmCount, setFalseAlarmCount] = useState(0);
  const [showFalseAlarmConfirmation, setShowFalseAlarmConfirmation] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [currentMusicIndex, setCurrentMusicIndex] = useState(0);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [currentPhraseCategory, setCurrentPhraseCategory] = useState("patience");
  const audioRef = useRef<any>(null);
  
  // Privacy popup states
  const [showPrivacyPopup, setShowPrivacyPopup] = useState(true);
  const [privacyAccepted, setPrivacyAccepted] = useState(true); // Default checked
  
  // Voice keyword settings state
  const [voiceKeywords, setVoiceKeywords] = useState<any[]>([]);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [showFullReport, setShowFullReport] = useState(false);
  const [showUserGuide, setShowUserGuide] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const [alertType, setAlertType] = useState("voice");

  const [isRecording, setIsRecording] = useState(false);
  const [hasCustomRecording, setHasCustomRecording] = useState(false);
  const [recordingSource, setRecordingSource] = useState("self");
  
  // Voice transcript records state
  const [voiceTranscripts, setVoiceTranscripts] = useState<any[]>([]);
  const [showVoiceRecords, setShowVoiceRecords] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // API data states
  const [emotionalPhrases, setEmotionalPhrases] = useState<any>({});
  const [calmingMusic, setCalmingMusic] = useState<any[]>([]);
  const [bloodPressureReadings, setBloodPressureReadings] = useState<any[]>([]);
  
  // Partner comparison state
  const [showPartnerComparison, setShowPartnerComparison] = useState(false);
  const [comparisonView, setComparisonView] = useState("overview");
  const [partnerConnected, setPartnerConnected] = useState(false);
  
  // Device connection states
  const [isSearching, setIsSearching] = useState(false);
  const [foundDevices, setFoundDevices] = useState<any[]>([]);
  const [isPairing, setIsPairing] = useState(false);
  const [pairingDevice, setPairingDevice] = useState<any>(null);
  const [showDeviceList, setShowDeviceList] = useState(false);
  const [healthDevices, setHealthDevices] = useState([
    { id: 'apple-watch', name: 'Apple Watch', connected: true, type: 'smartwatch', battery: 85 },
    { id: 'mi-band', name: '小米手环', connected: false, type: 'fitness', battery: 60 }
  ]);
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [selectedDeviceType, setSelectedDeviceType] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Learning manual state
  const [showLearningManual, setShowLearningManual] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [completedChapters, setCompletedChapters] = useState<number[]>([]);
  
  // Audio player state for learning manual - FIXED
  const [isChapterAudioPlaying, setIsChapterAudioPlaying] = useState(false);
  const [chapterAudioProgress, setChapterAudioProgress] = useState(0);
  const [chapterAudioVolume, setChapterAudioVolume] = useState(0.3);
  const [currentPlayingChapter, setCurrentPlayingChapter] = useState<number | null>(null);
  const [isTTSSpeaking, setIsTTSSpeaking] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState(AVAILABLE_VOICES[0]);
  const [showVoiceSelector, setShowVoiceSelector] = useState(false);
  const [currentVoiceId, setCurrentVoiceId] = useState(AVAILABLE_VOICES[0].id);
  const chapterAudioRef = useRef<any>(null);
  const bgMusicRef = useRef<any>(null);
  const ttsRef = useRef<any>(null);
  const currentAudioRef = useRef<any>(null);
  
  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch voice data
        const [keywords, transcripts] = await Promise.all([
          voiceApi.getVoiceKeywords(),
          voiceApi.getVoiceTranscripts()
        ]);
        setVoiceKeywords(keywords);
        setVoiceTranscripts(transcripts);
        
        // Fetch intervention data
        const [phrases, music] = await Promise.all([
          interventionApi.getEmotionalPhrases(),
          interventionApi.getCalmingMusic()
        ]);
        setEmotionalPhrases(phrases);
        setCalmingMusic(music);
        
        // Fetch health data
        const [health, bloodPressure] = await Promise.all([
          healthApi.getHealthData(),
          healthApi.getBloodPressureReadings()
        ]);
        setHealthData(health);
        setBloodPressureReadings(bloodPressure);
        
        // Fetch psychology and communication data
        await Promise.all([
          dataApi.getPsychologyPrinciples(),
          dataApi.getCommunicationAges(),
          dataApi.getCommunicationPhrases()
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    fetchData();
  }, []);
  
  // Initialize audio players and TTS
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = 0.5;
    }
    if (!chapterAudioRef.current) {
      chapterAudioRef.current = new Audio();
      chapterAudioRef.current.volume = 1.0;
    }
    if (!bgMusicRef.current && calmingMusic.length > 0) {
      bgMusicRef.current = new Audio();
      bgMusicRef.current.volume = chapterAudioVolume;
      bgMusicRef.current.loop = true;
      bgMusicRef.current.src = calmingMusic[0].url;
    }
    
    // Initialize Web Speech API for TTS (fallback)
    if ('speechSynthesis' in window) {
      ttsRef.current = window.speechSynthesis;
      setTtsSupported(true);
      
      const loadVoices = () => {
        const voices = ttsRef.current.getVoices();
        const zhVoices = voices.filter((v: any) => v.lang.includes('zh'));
        if (zhVoices.length > 0) {
          console.log('Available Chinese voices:', zhVoices.map((v: any) => v.name));
        }
      };
      
      loadVoices();
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = loadVoices;
      }
    } else {
      setTtsSupported(false);
      console.warn('Web Speech API not supported');
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (chapterAudioRef.current) {
        chapterAudioRef.current.pause();
        chapterAudioRef.current = null;
      }
      if (bgMusicRef.current) {
        bgMusicRef.current.pause();
        bgMusicRef.current = null;
      }
      if (ttsRef.current) {
        ttsRef.current.cancel();
        ttsRef.current = null;
      }
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
    };
  }, []);
  
  // TTS Speech Function - 豆包 TTS 调用 (FIXED)
  const speakText = (text: string, voiceId: string, onEnd: (() => void) | undefined) => {
    if (!ttsSupported) {
      console.log('TTS would speak:', text);
      if (onEnd) setTimeout(onEnd, 5000);
      return;
    }
    
    // 停止之前的语音
    if (ttsRef.current) {
      ttsRef.current.cancel();
    }
    
    // 停止之前的音频
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    
    // 优先使用豆包 TTS（需要后端代理）
    if (TTS_CONFIG.provider === 'doubao') {
      // 调用后端豆包 TTS 服务
      fetchCloudTTS(text, voiceId).then(audioUrl => {
        if (audioUrl) {
          const audio = new Audio(audioUrl);
          audio.volume = 1.0;
          currentAudioRef.current = audio;
          
          audio.onended = () => {
            setIsTTSSpeaking(false);
            if (onEnd) onEnd();
          };
          
          audio.onerror = () => {
            console.error('Doubao TTS audio load failed');
            // Fallback to Web Speech API
            fallbackToWebSpeech(text, onEnd);
          };
          
          audio.play().then(() => {
            setIsTTSSpeaking(true);
          }).catch(() => {
            fallbackToWebSpeech(text, onEnd);
          });
        } else {
          fallbackToWebSpeech(text, onEnd);
        }
      }).catch(() => {
        fallbackToWebSpeech(text, onEnd);
      });
    } else {
      fallbackToWebSpeech(text, onEnd);
    }
  };
  
  // Fallback to Web Speech API
  const fallbackToWebSpeech = (text: string, onEnd: (() => void) | undefined) => {
    if (!ttsRef.current) {
      if (onEnd) setTimeout(onEnd, 5000);
      return;
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    const voices = ttsRef.current.getVoices();
    const preferredVoice = voices.find((v: any) => 
      v.name.includes('Chinese') ||
      v.name.includes('中文') ||
      v.lang.includes('zh-CN')
    );
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    utterance.onend = () => {
      setIsTTSSpeaking(false);
      if (onEnd) onEnd();
    };
    
    utterance.onerror = (event) => {
      console.error('TTS Error:', event);
      setIsTTSSpeaking(false);
    };
    
    setIsTTSSpeaking(true);
    ttsRef.current.speak(utterance);
  };
  
  // 调用豆包 TTS 服务的函数（需要后端支持）- FIXED
  const fetchCloudTTS = async (text: string, voiceId: string) => {
    try {
      const voice = AVAILABLE_VOICES.find(v => v.id === voiceId) || AVAILABLE_VOICES[0];
      
      // 示例：调用后端豆包 TTS 服务
      const response = await fetch('/api/tts/doubao/synthesize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          voice: voiceId,
          voice_name: voice.name,
          rate: TTS_CONFIG.rate,
          provider: 'doubao'
        }),
      });
      
      if (!response.ok) {
        throw new Error('TTS API failed');
      }
      
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      return audioUrl;
    } catch (error) {
      console.error('Doubao TTS failed:', error);
      return null;
    }
  };
  
  // Handle music playback
  useEffect(() => {
    if (currentIntervention === "舒缓音乐" && calmingMusic[currentMusicIndex]) {
      const audio = audioRef.current;
      audio.src = calmingMusic[currentMusicIndex].url;
      audio.loop = true;
      if (showIntervention && !isMusicPlaying) {
        audio.play().then(() => {
          setIsMusicPlaying(true);
        }).catch((e: any) => {
          console.log("Auto-play failed:", e);
        });
      }
    }
    return () => {
      if (audioRef.current && currentIntervention !== "舒缓音乐") {
        audioRef.current.pause();
        setIsMusicPlaying(false);
      }
    };
  }, [currentIntervention, currentMusicIndex, showIntervention, isMusicPlaying, calmingMusic]);
  
  // Simulate real-time heart rate monitoring
  useEffect(() => {
    if (isMonitoring) {
      const interval = setInterval(() => {
        let baseHR = emotionalState === "焦虑" ? 85 : 72;
        const variation = Math.floor(Math.random() * 6) - 3;
        setHeartRate(() => {
          const newHR = Math.max(55, Math.min(110, baseHR + variation));
          const newStress = Math.min(0.9, Math.max(0.1, (newHR - 60) / 50));
          setStressLevel(newStress);
          return newHR;
        });
        if (Math.random() > 0.7) {
          const baseSystolic = emotionalState === "焦虑" ? 135 : 120;
          const baseDiastolic = emotionalState === "焦虑" ? 88 : 80;
          setBloodPressure({
            systolic: Math.max(90, Math.min(160, baseSystolic + Math.floor(Math.random() * 8) - 4)),
            diastolic: Math.max(60, Math.min(100, baseDiastolic + Math.floor(Math.random() * 6) - 3))
          });
        }
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isMonitoring, emotionalState]);
  
  // Timer logic for interventions
  useEffect(() => {
    let timer: number | undefined;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      setShowIntervention(false);
      if (currentIntervention === "舒缓音乐" && audioRef.current) {
        audioRef.current.pause();
        setIsMusicPlaying(false);
      }
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, currentIntervention]);
  
  // Reset timer when intervention changes
  useEffect(() => {
    if (currentIntervention) {
      setTimeLeft(60);
      setIsRunning(true);
    }
  }, [currentIntervention]);
  
  // Generate new health data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      healthApi.getHealthData().then(data => {
        if (data && data.length > 0) {
          setHealthData(data);
        }
      });
    }, 30000);
    return () => clearInterval(interval);
  }, []);
  
  // Simulate voice transcription when voice detection is enabled
  useEffect(() => {
    let transcriptInterval: number | undefined;
    if (voiceDetection) {
      transcriptInterval = setInterval(() => {
        if (Math.random() > 0.7) {
          const possibleTranscripts = [
            { text: "这个题讲了这么多遍怎么还不会", triggered: true, keyword: "怎么还不会" },
            { text: "我们先休息一下，喝口水", triggered: false, keyword: null },
            { text: "你看，这样想是不是就简单多了", triggered: false, keyword: null },
            { text: "别着急，我们慢慢来", triggered: false, keyword: null },
            { text: "你怎么这个都不会", triggered: true, keyword: "怎么这个都不会" }
          ];
          const randomTranscript = possibleTranscripts[Math.floor(Math.random() * possibleTranscripts.length)];
          const now = new Date();
          const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
          const dateStr = now.toISOString().split('T')[0];
          setVoiceTranscripts(prev => {
            const todayRecords = prev.find(d => d.date === dateStr);
            if (todayRecords) {
              return prev.map(d => d.date === dateStr ? { ...d, records: [...d.records, { id: Date.now(), time: timeStr, ...randomTranscript }] } : d);
            } else {
              return [{ date: dateStr, records: [{ id: Date.now(), time: timeStr, ...randomTranscript }] }, ...prev];
            }
          });
        }
      }, 10000);
    }
    return () => clearInterval(transcriptInterval);
  }, [voiceDetection]);
  
  const handleInterventionSelect = (type: string) => {
    setCurrentIntervention(type);
    setShowIntervention(true);
    setIsRunning(true);
    if (type === "舒缓音乐") {
      setCurrentMusicIndex(0);
      setIsMusicPlaying(false);
    }
    if (type === "情绪创可贴") {
      const categories = Object.keys(EMOTIONAL_PHRASES) as Array<keyof typeof EMOTIONAL_PHRASES>;
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      if (randomCategory) {
        setCurrentPhraseCategory(randomCategory);
        setCurrentPhraseIndex(Math.floor(Math.random() * EMOTIONAL_PHRASES[randomCategory].length));
      }
    }
    if (type !== "语音触发干预" && type !== "舒缓音乐") {
      setTimeout(() => {
        setHeartRate(prev => Math.max(60, prev - 10));
        setStressLevel(prev => Math.max(0.1, prev - 0.3));
      }, 2000);
    }
  };
  
  const toggleMusicPlayback = () => {
    if (!audioRef.current || !CALMING_MUSIC[currentMusicIndex]) return;
    const audio = audioRef.current;
    if (isMusicPlaying) {
      audio.pause();
      setIsMusicPlaying(false);
    } else {
      audio.play().then(() => {
        setIsMusicPlaying(true);
      }).catch((e: any) => {
        console.log("Playback failed:", e);
        alert("音乐播放需要用户交互。请点击播放按钮再次尝试。");
      });
    }
  };
  
  const changeMusicTrack = (direction: 'next' | 'prev') => {
    if (calmingMusic.length === 0) return;
    const step = direction === 'next' ? 1 : -1;
    const newIndex = (currentMusicIndex + step + calmingMusic.length) % calmingMusic.length;
    setCurrentMusicIndex(newIndex);
    setIsMusicPlaying(false);
    if (audioRef.current) {
      audioRef.current.src = calmingMusic[newIndex].url;
    }
  };
  
  const handleFalseAlarm = () => {
    setStressLevel(0.2);
    setHeartRate(68);
    setFalseAlarmCount(prev => prev + 1);
    setShowFalseAlarmConfirmation(true);
    setTimeout(() => {
      setShowFalseAlarmConfirmation(false);
    }, 3000);
    if (showIntervention) {
      setIsRunning(false);
      setShowIntervention(false);
      setCurrentIntervention(null);
      if (currentIntervention === "舒缓音乐" && audioRef.current) {
        audioRef.current.pause();
        setIsMusicPlaying(false);
      }
    }
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleParentVoiceToggle = () => {
    setVoiceDetection(!voiceDetection);
    if (!voiceDetection) {
      setTimeout(() => {
        if (voiceDetection) return;
        setEmotionalState("焦虑");
        handleInterventionSelect("语音触发干预");
        setHeartRate(95);
        setStressLevel(0.8);
      }, 3000);
    }
  };
  
  const toggleHealthMonitoring = () => {
    setIsMonitoring(!isMonitoring);
    if (!isMonitoring) {
      setHeartRate(emotionalState === "焦虑" ? 85 : 72);
      setStressLevel(emotionalState === "焦虑" ? 0.7 : 0.3);
    }
  };
  
  const getNextPhrase = () => {
    if (Object.keys(emotionalPhrases).length === 0) return;
    
    const categories = Object.keys(emotionalPhrases);
    let newCategory;
    if (Math.random() > 0.3) {
      newCategory = currentPhraseCategory;
    } else {
      const otherCategories = categories.filter(cat => cat !== currentPhraseCategory);
      newCategory = otherCategories[Math.floor(Math.random() * otherCategories.length)];
    }
    const phrases = emotionalPhrases[newCategory];
    let newIndex;
    if (phrases.length > 1) {
      do {
        newIndex = Math.floor(Math.random() * phrases.length);
      } while (newIndex === currentPhraseIndex && phrases.length > 1);
    } else {
      newIndex = 0;
    }
    setCurrentPhraseCategory(newCategory);
    setCurrentPhraseIndex(newIndex);
  };
  
  const toggleKeyword = (id: number) => {
    setVoiceKeywords(prev => prev.map(kw => kw.id === id ? { ...kw, enabled: !kw.enabled } : kw));
  };

  const deleteKeyword = (id: number) => {
    setVoiceKeywords(prev => prev.filter(kw => kw.id !== id));
  };

  const handleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      setTimeout(() => {
        setIsRecording(false);
        setHasCustomRecording(true);
      }, 3000);
    }
  };

  const handleChapterComplete = (chapterId: number) => {
    if (chapterId && !completedChapters.includes(chapterId)) {
      setCompletedChapters(prev => [...prev, chapterId]);
    }
  };
  
  // Chapter audio controls with Doubao TTS - FIXED
  const toggleChapterAudio = () => {
    if (!selectedChapter) return;
    
    const chapter = LEARNING_MANUAL_CONTENT.chapters.find(c => c.id === selectedChapter);
    if (!chapter) return;
    
    // 停止所有播放
    if (chapterAudioRef.current) {
      chapterAudioRef.current.pause();
    }
    if (bgMusicRef.current) {
      bgMusicRef.current.pause();
    }
    if (ttsRef.current && isTTSSpeaking) {
      ttsRef.current.cancel();
    }
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    
    if (isChapterAudioPlaying && currentPlayingChapter === chapter.id) {
      // 停止播放
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
      if (bgMusicRef.current) {
        bgMusicRef.current.pause();
        bgMusicRef.current.currentTime = 0;
      }
      setIsChapterAudioPlaying(false);
      setCurrentPlayingChapter(null);
      setIsTTSSpeaking(false);
      setChapterAudioProgress(0);
    } else {
      // 开始播放 - 使用当前选中的音色
      setCurrentPlayingChapter(chapter.id);
      setChapterAudioProgress(0);
      
      // 启动背景音乐
      if (bgMusicRef.current) {
        bgMusicRef.current.src = CALMING_MUSIC[0].url;
        bgMusicRef.current.volume = chapterAudioVolume;
        bgMusicRef.current.currentTime = 0;
        bgMusicRef.current.play().catch((e: any) => console.log("Background music failed:", e));
      }
      
      // 使用当前选中的音色开始 TTS 朗读
      if (chapter.audioScript) {
        speakText(chapter.audioScript, currentVoiceId, () => {
          // TTS 完成
          setIsChapterAudioPlaying(false);
          setIsTTSSpeaking(false);
          setChapterAudioProgress(100);
          if (bgMusicRef.current) {
            bgMusicRef.current.pause();
          }
        });
        setIsChapterAudioPlaying(true);
        setIsTTSSpeaking(true);
        
        // 模拟进度
        const durationParts = chapter.audioDuration.split(':');
        const totalSeconds = parseInt(durationParts[0]) * 60 + parseInt(durationParts[1]);
        const progressInterval = setInterval(() => {
          setChapterAudioProgress(prev => {
            const newProgress = prev + (100 / totalSeconds);
            if (newProgress >= 100) {
              clearInterval(progressInterval);
              return 100;
            }
            return newProgress;
          });
        }, 1000);
      }
    }
  };
  
  // 切换音色 - FIXED
  const handleVoiceChange = (voiceId: string) => {
    setCurrentVoiceId(voiceId);
    setSelectedVoice(AVAILABLE_VOICES.find(v => v.id === voiceId) || AVAILABLE_VOICES[0]);
    setShowVoiceSelector(false);
    
    // 如果正在播放，重新开始使用新音色
    if (isChapterAudioPlaying && currentPlayingChapter) {
      const chapter = LEARNING_MANUAL_CONTENT.chapters.find(c => c.id === currentPlayingChapter);
      if (chapter) {
        // 停止当前播放
        if (ttsRef.current) {
          ttsRef.current.cancel();
        }
        if (currentAudioRef.current) {
          currentAudioRef.current.pause();
          currentAudioRef.current = null;
        }
        
        // 使用新音色重新开始
        setTimeout(() => {
          setIsTTSSpeaking(false);
          toggleChapterAudio();
        }, 100);
      }
    }
  };
  
  // Device connection functions
  const searchPartnerDevices = async () => {
    setIsSearching(true);
    setFoundDevices([]);
    setErrorMessage('');
    
    // Simulate device search with error possibility
    setTimeout(() => {
      // 90% success rate
      if (Math.random() > 0.1) {
        setFoundDevices([
          { id: 'partner-1', name: '张妈妈的手机', signal: 85, deviceType: 'phone' },
          { id: 'partner-2', name: '伴侣设备', signal: 72, deviceType: 'phone' }
        ]);
        setIsSearching(false);
        setShowDeviceList(true);
      } else {
        setIsSearching(false);
        setErrorMessage('搜索设备失败，请确保蓝牙已开启且设备在附近');
        setTimeout(() => setErrorMessage(''), 3000);
      }
    }, 2000);
  };
  
  const pairPartnerDevice = async (device: any) => {
    setIsPairing(true);
    setPairingDevice(device);
    setErrorMessage('');
    
    // Simulate pairing process with error possibility
    setTimeout(() => {
      // 85% success rate
      if (Math.random() > 0.15) {
        setPartnerConnected(true);
        setIsPairing(false);
        setShowDeviceList(false);
        setPairingDevice(null);
        setSuccessMessage('伴侣设备配对成功！');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setIsPairing(false);
        setPairingDevice(null);
        setErrorMessage('配对失败，请确保设备已开启并在配对模式');
        setTimeout(() => setErrorMessage(''), 3000);
      }
    }, 3000);
  };
  
  const connectHealthDevice = async (deviceId: string) => {
    setIsConnecting(true);
    setErrorMessage('');
    
    // Simulate connection process with error possibility
    setTimeout(() => {
      // 80% success rate
      if (Math.random() > 0.2) {
        setHealthDevices(prev => prev.map(device => 
          device.id === deviceId ? { ...device, connected: true } : { ...device, connected: false }
        ));
        setIsConnecting(false);
        setSuccessMessage('健康设备连接成功！');
        setTimeout(() => setSuccessMessage(''), 3000);
        
        // Start data synchronization
        startDeviceDataSync(deviceId);
      } else {
        setIsConnecting(false);
        setErrorMessage('连接失败，请确保设备电量充足且在蓝牙范围内');
        setTimeout(() => setErrorMessage(''), 3000);
      }
    }, 2000);
  };
  
  const disconnectHealthDevice = async (deviceId: string) => {
    setHealthDevices(prev => prev.map(device => 
      device.id === deviceId ? { ...device, connected: false } : device
    ));
    setSuccessMessage('设备已断开连接');
    setTimeout(() => setSuccessMessage(''), 3000);
  };
  
  const addHealthDevice = async (deviceType: string) => {
    setIsConnecting(true);
    setErrorMessage('');
    
    // Simulate device addition with error possibility
    setTimeout(() => {
      // 85% success rate
      if (Math.random() > 0.15) {
        const newDevice = {
          id: `device-${Date.now()}`,
          name: deviceType === 'smartwatch' ? '新智能手表' : 
                deviceType === 'fitness' ? '新健身手环' : 
                deviceType === 'blood-pressure' ? '新血压计' : '新健康设备',
          connected: true,
          type: deviceType,
          battery: 100
        };
        setHealthDevices(prev => prev.map(device => ({ ...device, connected: false })).concat(newDevice));
        setIsConnecting(false);
        setShowAddDevice(false);
        setSelectedDeviceType('');
        setSuccessMessage('新设备添加成功！');
        setTimeout(() => setSuccessMessage(''), 3000);
        
        // Start data synchronization for the new device
        startDeviceDataSync(newDevice.id);
      } else {
        setIsConnecting(false);
        setErrorMessage('添加设备失败，请重试');
        setTimeout(() => setErrorMessage(''), 3000);
      }
    }, 2500);
  };
  
  // Device data synchronization function
  const startDeviceDataSync = (deviceId: string) => {
    // Simulate data synchronization every 5 seconds
    const syncInterval = setInterval(() => {
      // Check if device is still connected
      const device = healthDevices.find(d => d.id === deviceId);
      if (!device || !device.connected) {
        clearInterval(syncInterval);
        return;
      }
      
      // Update device battery level (simulate battery drain)
      setHealthDevices(prev => prev.map(d => 
        d.id === deviceId ? { ...d, battery: Math.max(0, d.battery - 1) } : d
      ));
      
      // Simulate health data updates
      if (device.type === 'smartwatch' || device.type === 'fitness') {
        // Update heart rate
        const newHR = Math.max(60, Math.min(100, heartRate + Math.floor(Math.random() * 6) - 3));
        setHeartRate(newHR);
        
        // Update stress level based on heart rate
        const newStress = Math.min(0.9, Math.max(0.1, (newHR - 60) / 50));
        setStressLevel(newStress);
      }
      
      if (device.type === 'blood-pressure' || device.type === 'smartwatch') {
        // Update blood pressure
        setBloodPressure(prev => ({
          systolic: Math.max(90, Math.min(160, prev.systolic + Math.floor(Math.random() * 4) - 2)),
          diastolic: Math.max(60, Math.min(100, prev.diastolic + Math.floor(Math.random() * 3) - 1))
        }));
      }
    }, 5000);
  };
  
  // Start data sync for already connected devices
  useEffect(() => {
    healthDevices.forEach(device => {
      if (device.connected) {
        startDeviceDataSync(device.id);
      }
    });
  }, []);
  
  // Handle privacy popup accept
  const handlePrivacyAccept = () => {
    if (privacyAccepted) {
      setShowPrivacyPopup(false);
      // Enable voice detection by default as per requirements
      setVoiceDetection(true);
    }
  };
  
  const renderHomeTab = () => (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
        <div>9:41</div>
        <div className="flex space-x-1">
          <span>📶</span>
          <span>🔋 87%</span>
        </div>
      </div>
      
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`rounded-2xl p-4 mb-2 ${stressLevel > 0.6 ? 'bg-gradient-to-r from-red-50 to-red-100 border border-red-200' : stressLevel > 0.4 ? 'bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200' : 'bg-gradient-to-r from-green-50 to-green-100 border border-green-200'}`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center">
              <span className="text-2xl mr-2">❤️</span>
              <span className="font-bold">{stressLevel > 0.6 ? "身体唤起水平较高" : stressLevel > 0.4 ? "轻度身体唤起" : "身体状态平稳"}</span>
            </div>
            <div className="mt-1 flex items-baseline">
              <span className="text-3xl font-bold mr-2">{heartRate}</span>
              <span className="text-lg">bpm</span>
              <span className="ml-3 text-lg">{bloodPressure.systolic}/{bloodPressure.diastolic} mmHg</span>
            </div>
          </div>
          <button onClick={toggleHealthMonitoring} className={`w-10 h-10 rounded-full flex items-center justify-center ${isMonitoring ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
            {isMonitoring ? '⏸️' : '▶️'}
          </button>
        </div>
        <div className="mt-3">
          <div className="flex justify-between text-xs mb-1">
            <span>低唤起</span>
            <span>高唤起</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className={`h-full rounded-full transition-all duration-500 ${stressLevel > 0.6 ? 'bg-red-500' : stressLevel > 0.4 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${stressLevel * 100}%` }}></div>
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span>0.1</span>
            <span>{stressLevel.toFixed(1)}</span>
            <span>0.9</span>
          </div>
        </div>
        {stressLevel > 0.6 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-start">
              <div className="bg-red-200 text-red-800 rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-1 text-xs flex-shrink-0">i</div>
              <div className="flex-1">
                <p className="text-sm text-red-800">我们检测到您身体可能处于紧张状态（高唤起），考虑到您正在辅导作业，这可能是需要放松的信号。我们为您提供一个暂停选择。<span className="font-medium block mt-1">如果您其实是在为孩子的进步而兴奋，可以轻松地忽略它或标记为误报。</span></p>
                <button onClick={handleFalseAlarm} className="mt-2 text-xs text-red-600 hover:text-red-800 font-medium flex items-center"><span className="mr-1">→</span> 这不是压力，标记为误报</button>
              </div>
            </div>
            {showFalseAlarmConfirmation && (
              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-green-800 text-xs">✓ 已记录您的反馈，系统将优化检测算法</motion.div>
            )}
          </motion.div>
        )}
      </motion.div>
      
      <div className="text-center">
        <div className="text-5xl mb-2">{emotionalState === "焦虑" ? "😟" : "😊"}</div>
        <h1 className="text-2xl font-bold text-gray-900">{emotionalState === "焦虑" ? "检测到情绪波动" : "当前情绪状态"}</h1>
        <p className="text-gray-600 mt-1">{emotionalState === "焦虑" ? "建议进行短暂干预" : "保持平静，继续加油"}</p>
      </div>
      

      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => handleInterventionSelect("呼吸练习")} className="bg-indigo-50 rounded-2xl p-6 flex flex-col items-center justify-center hover:bg-indigo-100 transition-colors border-2 border-transparent active:border-indigo-300">
          <div className="text-4xl mb-2">🌬️</div>
          <span className="font-bold">呼吸练习</span>
        </button>
        <button onClick={() => handleInterventionSelect("情绪创可贴")} className="bg-green-50 rounded-2xl p-6 flex flex-col items-center justify-center hover:bg-green-100 transition-colors border-2 border-transparent active:border-green-300">
          <div className="text-4xl mb-2">🩹</div>
          <span className="font-bold">情绪创可贴</span>
        </button>
        <button onClick={() => handleInterventionSelect("暂停 1 分钟")} className="bg-yellow-50 rounded-2xl p-6 flex flex-col items-center justify-center hover:bg-yellow-100 transition-colors border-2 border-transparent active:border-yellow-300">
          <div className="text-4xl mb-2">⏸️</div>
          <span className="font-bold">暂停 1 分钟</span>
        </button>
        <button onClick={() => handleInterventionSelect("舒缓音乐")} className="bg-purple-50 rounded-2xl p-6 flex flex-col items-center justify-center hover:bg-purple-100 transition-colors border-2 border-transparent active:border-purple-300">
          <div className="text-4xl mb-2">🎵</div>
          <span className="font-bold">舒缓音乐</span>
        </button>
      </div>
      
      <AICall />
      
      {showIntervention && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-blue-50 rounded-2xl p-5 border-2 border-blue-200">
          <div className="flex justify-between items-center mb-3">
            <span className="font-bold text-lg text-blue-800">{currentIntervention === "情绪话术" ? "情绪创可贴" : currentIntervention === "暂停提醒" ? "暂停 1 分钟" : currentIntervention === "舒缓音乐" ? "舒缓音乐" : currentIntervention}</span>
            <span className={`font-mono text-3xl font-bold ${timeLeft < 10 ? "text-red-500 animate-pulse" : "text-blue-600"}`}>{formatTime(timeLeft)}</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-3 overflow-hidden">
            <div className="bg-blue-600 h-full rounded-full transition-all duration-1000" style={{ width: `${(timeLeft / 60) * 100}%` }}></div>
          </div>
          <div className="mt-4 space-y-3">
            {currentIntervention === "呼吸练习" && (
              <div className="text-center">
                <div className="text-6xl mb-2 animate-pulse">🌬️</div>
                <p className="font-medium">吸气 4 秒 → 屏息 2 秒 → 呼气 6 秒</p>
                <p className="text-sm text-gray-600 mt-1">跟随呼吸节奏，放松肩膀和面部肌肉</p>
              </div>
            )}
            {currentIntervention === "情绪创可贴" && Object.keys(emotionalPhrases).length > 0 && (
              <div className="bg-white p-4 rounded-xl border border-gray-200">
                <p className="italic text-lg text-center min-h-[60px] text-gray-800">"{emotionalPhrases[currentPhraseCategory] && emotionalPhrases[currentPhraseCategory][currentPhraseIndex]}"</p>
                <div className="mt-3 flex justify-between items-center text-sm">
                  <span className="text-indigo-700 font-medium">{currentPhraseCategory === "patience" && "⏳ 耐心提醒"}{currentPhraseCategory === "mindset" && "🧘 心态调整"}{currentPhraseCategory === "action" && "💡 行动建议"}{currentPhraseCategory === "perspective" && "👀 长远视角"}</span>
                  <button onClick={getNextPhrase} className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center transition-all"><span className="mr-1 text-xl">✨</span> 换一个</button>
                </div>
              </div>
            )}
            {currentIntervention === "暂停 1 分钟" && (
              <div className="text-center">
                <div className="text-6xl mb-2">⏸️</div>
                <p className="font-medium">建议暂停 1 分钟</p>
                <p className="text-sm text-gray-600 mt-1">离开当前情境，深呼吸，放松肩膀和面部肌肉。1 分钟后以更平静的状态继续辅导。</p>
              </div>
            )}
            {currentIntervention === "舒缓音乐" && calmingMusic.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                    <img src={calmingMusic[currentMusicIndex].cover} alt={calmingMusic[currentMusicIndex].title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-lg text-gray-900">{calmingMusic[currentMusicIndex].title}</h4>
                    <p className="text-gray-600">{calmingMusic[currentMusicIndex].composer} • {calmingMusic[currentMusicIndex].duration}</p>
                  </div>
                </div>
                <div className="flex justify-center space-x-4">
                  <button onClick={() => changeMusicTrack('prev')} className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">⏮️</button>
                  <button onClick={toggleMusicPlayback} className="w-16 h-16 rounded-full bg-purple-600 text-white flex items-center justify-center hover:bg-purple-700 transition-colors shadow-lg">{isMusicPlaying ? '⏸️' : '▶️'}</button>
                  <button onClick={() => changeMusicTrack('next')} className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">⏭️</button>
                </div>
                <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                  <p className="text-indigo-900 text-sm"><span className="font-medium">💡 使用建议：</span> 闭上眼睛，专注于舒缓音乐的旋律和节奏。让音乐帮助您放松身心，1 分钟后以更平静的状态继续辅导。</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-purple-900 text-xs"><span className="font-medium">🎵 舒缓音乐益处：</span> 研究表明，舒缓音乐能降低皮质醇水平（压力激素），减缓心率，促进α脑波产生，帮助大脑进入放松状态。</p>
                </div>
              </div>
            )}
            {currentIntervention === "语音触发干预" && (
              <div className="bg-amber-50 p-4 rounded-xl">
                <div className="flex items-start">
                  <div className="bg-red-200 text-red-800 rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-1 text-sm flex-shrink-0">i</div>
                  <div className="flex-1">
                    <p className="font-medium">检测到可能的情绪升级信号：</p>
                    <p className="text-gray-700 mt-1">"你怎么这个都不会"</p>
                    <p className="text-sm text-amber-800 mt-2">我们注意到这句话可能表示情绪波动。考虑到您正在辅导作业，这可能是需要暂停的信号。<span className="font-medium block mt-1">如果您其实是在用严肃但平静的语气指导孩子，可以标记为误报。</span></p>
                    <button onClick={handleFalseAlarm} className="mt-2 text-xs text-amber-700 hover:text-amber-900 font-medium flex items-center"><span className="mr-1">→</span> 这是误报，我状态很好</button>
                  </div>
                </div>
              </div>
            )}
            {currentIntervention === "语音触发干预" ? (
              <div className="flex space-x-3">
                <button onClick={() => { setIsRunning(false); setShowIntervention(false); setCurrentIntervention(null); if (currentIntervention === "舒缓音乐" && audioRef.current) { audioRef.current.pause(); setIsMusicPlaying(false); } }} className="flex-1 bg-red-100 text-red-700 py-3 rounded-xl font-bold hover:bg-red-200 transition-colors">✋ 结束干预</button>
                <button onClick={handleFalseAlarm} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors border border-gray-300">误报</button>
              </div>
            ) : (
              <button onClick={() => { setIsRunning(false); setShowIntervention(false); setCurrentIntervention(null); if (currentIntervention === "舒缓音乐" && audioRef.current) { audioRef.current.pause(); setIsMusicPlaying(false); } }} className="w-full bg-red-100 text-red-700 py-3 rounded-xl font-bold hover:bg-red-200 transition-colors">✋ 结束干预</button>
            )}
          </div>
        </motion.div>
      )}
      

    </div>
  );
  
  const renderHealthTab = () => (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
        <div>9:41</div>
        <div className="flex space-x-1"><span>📶</span><span>🔋 87%</span></div>
      </div>
      <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">健康监测</h1>
      <div className="bg-white rounded-2xl p-5 shadow-md border border-indigo-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">实时监测</h2>
          <button onClick={toggleHealthMonitoring} className={`px-3 py-1 rounded-full text-xs font-medium ${isMonitoring ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}`}>{isMonitoring ? '监测中' : '已暂停'}</button>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-3 bg-indigo-50 rounded-xl">
            <div className="text-2xl mb-1">❤️</div>
            <div className="text-3xl font-bold text-indigo-700">{heartRate}</div>
            <div className="text-xs text-gray-600 mt-1">心率 (bpm)</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-xl">
            <div className="text-2xl mb-1">🩺</div>
            <div className="text-2xl font-bold text-purple-700">{bloodPressure.systolic}/{bloodPressure.diastolic}</div>
            <div className="text-xs text-gray-600 mt-1">血压 (mmHg)</div>
          </div>
        </div>
        <div className="mb-4">
          <div className="flex justify-between mb-2">
            <span className="font-medium">身体唤起水平</span>
            <span className="font-bold" style={{ color: stressLevel > 0.6 ? '#ef4444' : stressLevel > 0.4 ? '#f59e0b' : '#10b981' }}>{stressLevel > 0.6 ? '高' : stressLevel > 0.4 ? '中' : '低'}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className={`h-full rounded-full transition-all duration-500 ${stressLevel > 0.6 ? 'bg-red-500' : stressLevel > 0.4 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${stressLevel * 100}%` }}></div>
          </div>
        </div>
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start">
            <div className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-1 text-xs">i</div>
            <p className="text-sm text-blue-800">我们检测的是身体唤起水平（生理激活），而非具体情绪。高唤起可能表示焦虑、兴奋或专注。您最了解自己的状态，请根据实际情况判断。</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl p-4 shadow-md border border-indigo-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">24 小时心率趋势</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={healthData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="time" tick={{ fontSize: 10 }} tickLine={false} axisLine={{ stroke: '#e5e7eb' }} interval="preserveStartEnd" />
              <YAxis domain={[50, 110]} tick={{ fontSize: 10 }} tickLine={false} axisLine={{ stroke: '#e5e7eb' }} label={{ value: '心率 (bpm)', angle: -90, position: 'insideLeft', offset: 0 }} />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid #e5e7eb', borderRadius: '8px' }} labelStyle={{ fontWeight: 'bold' }} formatter={(value: any, name: any) => { if (name === 'heartRate') return [`${value} bpm`, '心率']; if (name === 'stressLevel') return [`${(value * 100).toFixed(0)}%`, '唤起水平']; return [value, name]; }} />
              <Line type="monotone" dataKey="heartRate" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 3 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="p-2 bg-red-50 rounded-lg text-center"><div className="font-bold text-red-700">95 bpm</div><div className="text-xs text-gray-600">最高</div></div>
          <div className="p-2 bg-green-50 rounded-lg text-center"><div className="font-bold text-green-700">58 bpm</div><div className="text-xs text-gray-600">最低</div></div>
          <div className="p-2 bg-blue-50 rounded-lg text-center"><div className="font-bold text-blue-700">76 bpm</div><div className="text-xs text-gray-600">平均</div></div>
        </div>
      </div>
      <div className="bg-white rounded-2xl p-4 shadow-md border border-indigo-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">血压记录</h2>
        <div className="space-y-3">
          {bloodPressureReadings.map((reading, index) => (
            <div key={index} className={`p-3 rounded-xl flex justify-between items-center ${reading.emotionalState === "焦虑" ? "bg-amber-50 border-l-4 border-amber-400" : "bg-green-50 border-l-4 border-green-400"}`}>
              <div><div className="font-medium">{reading.time}</div><div className="text-sm text-gray-600 mt-1">{reading.emotionalState === "焦虑" ? "辅导作业期间" : "休息状态"}</div></div>
              <div className="text-right"><div className="text-xl font-bold">{reading.systolic}/{reading.diastolic}</div><div className="text-xs text-gray-500">mmHg</div></div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
  
  const renderDataTab = () => {
    if (showLearningManual) return renderLearningManual();
    if (showVoiceRecords) return renderVoiceRecords();
    if (showPartnerComparison) return renderPartnerComparison();
    if (showFullReport) return renderFullReport();
    if (showUserGuide) return renderUserGuide();
    if (showFAQ) return renderFAQ();
    
    return (
      <div className="p-4 space-y-6">
        <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
          <div>9:41</div>
          <div className="flex space-x-1"><span>📶</span><span>🔋 87%</span></div>
        </div>
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">情绪数据</h1>
        <div className="bg-white rounded-2xl p-4 shadow-md border border-purple-100">
          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-3"><span className="text-2xl">👥</span></div>
              <div><h3 className="font-bold text-gray-900">家庭数据共享</h3><p className="text-sm text-gray-600 mt-1">数据共享，促进理解与分工</p></div>
            </div>
          </div>
          {partnerConnected && (<div className="mt-3 flex items-center text-xs text-green-600 bg-green-50 p-2 rounded-lg"><span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>已与伴侣设备同步 • 数据隐私保护</div>)}
          
          {/* 家庭情绪健康学习手册 */}
          <div className="mt-4 bg-white rounded-2xl p-4 shadow-md border border-amber-100">
            <div onClick={() => setShowLearningManual(true)} className="flex items-center justify-between p-3 bg-amber-50 rounded-xl hover:bg-amber-100 cursor-pointer">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mr-3"><span className="text-2xl">📖</span></div>
                <div><h3 className="font-bold text-gray-900">家庭情绪健康学习手册</h3><p className="text-sm text-gray-600 mt-1">心理学知识引导伴侣共同应对压力与焦虑</p></div>
              </div>
              <div className="text-amber-600 text-2xl">→</div>
            </div>
          </div>
          
          {/* 家庭数据共享内容 */}
          <div className="mt-4">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-5 text-white">
              <h2 className="text-lg font-bold mb-2 flex items-center"><span className="text-xl mr-2">🔒</span> 数据隐私说明</h2>
              <p className="opacity-95 text-sm">所有对比数据仅在家庭内部共享，不会上传到云端或分享给第三方。数据用于促进家庭内部理解与分工优化。</p>
            </div>
            
            <div className="mt-4 bg-white rounded-2xl p-2 shadow-md border border-gray-200">
              <div className="flex space-x-2">
                <button onClick={() => setComparisonView("overview")} className={`flex-1 py-3 rounded-xl font-medium ${comparisonView === "overview" ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'}`}>总览</button>
                <button onClick={() => setComparisonView("weekly")} className={`flex-1 py-3 rounded-xl font-medium ${comparisonView === "weekly" ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'}`}>周趋势</button>
                <button onClick={() => setComparisonView("insights")} className={`flex-1 py-3 rounded-xl font-medium ${comparisonView === "insights" ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'}`}>洞察建议</button>
                <button onClick={() => setComparisonView("profiles")} className={`flex-1 py-3 rounded-xl font-medium ${comparisonView === "profiles" ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'}`}>情绪画像</button>
              </div>
            </div>
            
            {comparisonView === "overview" && (
              <>
                <div className="mt-4 bg-white rounded-2xl p-4 shadow-md border border-purple-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">📊 辅导情绪数据对比</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={partnerComparisonData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis type="number" tick={{ fontSize: 10 }} />
                        <YAxis dataKey="category" type="category" width={80} tick={{ fontSize: 11 }} />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #e5e7eb', borderRadius: '8px' }} formatter={(value, name, props) => [`${value}${props.payload.unit}`, name === 'me' ? '我' : name === 'partner' ? '伴侣' : '孩子']} />
                        <Legend />
                        <Bar dataKey="me" name="我" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                        <Bar dataKey="partner" name="伴侣" fill="#ec4899" radius={[0, 4, 4, 0]} />
                        <Bar dataKey="child" name="孩子" fill="#10b981" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="mt-4 bg-white rounded-2xl p-4 shadow-md border border-green-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">💪 各自优势</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                      <div className="flex items-center mb-2"><div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3"><span className="text-xl">👤</span></div><h4 className="font-bold text-purple-900">您的优势</h4></div>
                      <ul className="space-y-2 text-sm text-purple-800">
                        <li className="flex items-start"><span className="text-green-500 mr-2 mt-0.5">✓</span><span>情绪恢复更快（平均 2.5 分钟 vs 3.2 分钟）</span></li>
                        <li className="flex items-start"><span className="text-green-500 mr-2 mt-0.5">✓</span><span>主动干预意识更强（18 次/周 vs 14 次/周）</span></li>
                        <li className="flex items-start"><span className="text-green-500 mr-2 mt-0.5">✓</span><span>平静状态占比更高（65% vs 58%）</span></li>
                      </ul>
                    </div>
                    <div className="p-4 bg-pink-50 rounded-xl border border-pink-200">
                      <div className="flex items-center mb-2"><div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center mr-3"><span className="text-xl">👤</span></div><h4 className="font-bold text-pink-900">伴侣的优势</h4></div>
                      <ul className="space-y-2 text-sm text-pink-800">
                        <li className="flex items-start"><span className="text-green-500 mr-2 mt-0.5">✓</span><span>周末情绪更稳定（周日 75% vs 78%）</span></li>
                        <li className="flex items-start"><span className="text-green-500 mr-2 mt-0.5">✓</span><span>语音触发次数较少（11 次/周 vs 8 次/周）</span></li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="mt-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-200">
                  <h3 className="text-lg font-bold text-amber-900 mb-3 flex items-center"><span className="text-xl mr-2">💡</span> 家庭分工建议</h3>
                  <ul className="space-y-3 text-sm text-amber-800">
                    <li className="flex items-start"><span className="bg-amber-200 text-amber-800 rounded-full w-6 h-6 flex items-center justify-center mr-2 mt-0.5 text-xs font-bold">1</span><span><strong>错峰辅导：</strong>您在工作日表现更好，伴侣在周末更稳定，可以考虑分工安排</span></li>
                    <li className="flex items-start"><span className="bg-amber-200 text-amber-800 rounded-full w-6 h-6 flex items-center justify-center mr-2 mt-0.5 text-xs font-bold">2</span><span><strong>互相补位：</strong>当您感到情绪上升时，可以请伴侣接手，反之亦然</span></li>
                    <li className="flex items-start"><span className="bg-amber-200 text-amber-800 rounded-full w-6 h-6 flex items-center justify-center mr-2 mt-0.5 text-xs font-bold">3</span><span><strong>经验交流：</strong>每周花 10 分钟分享各自的有效干预方法，共同提升</span></li>
                  </ul>
                </div>
              </>
            )}
            
            {comparisonView === "weekly" && (
              <>
                <div className="mt-4 bg-white rounded-2xl p-4 shadow-md border border-purple-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">📈 本周平静状态对比</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={weeklyComparisonData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                        <YAxis domain={[40, 100]} tick={{ fontSize: 10 }} />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #e5e7eb', borderRadius: '8px' }} formatter={(value, name) => [`${value}%`, name === 'me' ? '我' : name === 'partner' ? '伴侣' : '孩子']} />
                        <Legend />
                        <Line type="monotone" dataKey="me" name="我" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }} />
                        <Line type="monotone" dataKey="partner" name="伴侣" stroke="#ec4899" strokeWidth={3} dot={{ fill: '#ec4899', strokeWidth: 2, r: 4 }} />
                        <Line type="monotone" dataKey="child" name="孩子" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            )}
            
            {comparisonView === "insights" && (
              <>
                <div className="mt-4 bg-white rounded-2xl p-4 shadow-md border border-green-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">🏆 家庭整体优势</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 bg-green-50 rounded-xl border border-green-200 text-center"><div className="text-3xl mb-2">💪</div><div className="text-2xl font-bold text-green-700">72%</div><div className="text-sm text-green-600 mt-1">平均平静状态</div></div>
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 text-center"><div className="text-3xl mb-2">⚡</div><div className="text-2xl font-bold text-blue-700">2.8 分钟</div><div className="text-sm text-blue-600 mt-1">平均恢复时间</div></div>
                    <div className="p-4 bg-purple-50 rounded-xl border border-purple-200 text-center"><div className="text-3xl mb-2">🎯</div><div className="text-2xl font-bold text-purple-700">27 次</div><div className="text-sm text-purple-600 mt-1">周干预总数</div></div>
                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-center"><div className="text-3xl mb-2">📉</div><div className="text-2xl font-bold text-amber-700">-15%</div><div className="text-sm text-amber-600 mt-1">情绪升级下降</div></div>
                  </div>
                </div>
                <div className="mt-4 bg-white rounded-2xl p-4 shadow-md border border-amber-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">🎯 共同改善方向</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                      <h4 className="font-bold text-amber-900 mb-2">周三压力高峰</h4>
                      <p className="text-sm text-amber-800 mb-3">数据显示周三双方情绪状态都相对较低，建议：</p>
                      <ul className="space-y-2 text-sm text-amber-800">
                        <li className="flex items-start"><span className="text-amber-600 mr-2 mt-0.5">•</span><span>周三安排更轻松的学习内容</span></li>
                        <li className="flex items-start"><span className="text-amber-600 mr-2 mt-0.5">•</span><span>提前进行 5 分钟呼吸练习</span></li>
                        <li className="flex items-start"><span className="text-amber-600 mr-2 mt-0.5">•</span><span>考虑请外部帮助（如家教）</span></li>
                      </ul>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <h4 className="font-bold text-blue-900 mb-2">语音触发优化</h4>
                      <p className="text-sm text-blue-800 mb-3">双方语音触发次数都较高，建议：</p>
                      <ul className="space-y-2 text-sm text-blue-800">
                        <li className="flex items-start"><span className="text-blue-600 mr-2 mt-0.5">•</span><span>辅导前共同设定情绪规则</span></li>
                        <li className="flex items-start"><span className="text-blue-600 mr-2 mt-0.5">•</span><span>建立"暂停信号"机制</span></li>
                        <li className="flex items-start"><span className="text-blue-600 mr-2 mt-0.5">•</span><span>定期回顾触发话语并调整</span></li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="mt-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-5 text-white">
                  <h3 className="text-lg font-bold mb-3 flex items-center"><span className="text-xl mr-2">🎯</span> 本周家庭目标</h3>
                  <div className="space-y-3">
                    <div className="flex items-center"><div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3"><span className="text-sm">✓</span></div><span>将平均平静状态提升至 75%</span></div>
                    <div className="flex items-center"><div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3"><span className="text-sm">✓</span></div><span>将语音触发次数减少至 15 次/周以下</span></div>
                    <div className="flex items-center"><div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3"><span className="text-sm">✓</span></div><span>建立每周 10 分钟情绪交流时间</span></div>
                  </div>
                  <button onClick={() => { alert('提醒已设置！系统将在每周一早上 9 点提醒您查看本周家庭目标。'); }} className="mt-4 w-full bg-white text-indigo-700 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors">设置提醒</button>
                </div>
              </>
            )}
            
            {comparisonView === "profiles" && (
              <>
                <div className="mt-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-5 text-white">
                  <h2 className="text-lg font-bold mb-2 flex items-center"><span className="text-xl mr-2">🎨</span> 家庭情绪画像</h2>
                  <p className="opacity-95 text-sm">通过情绪数据，生成家庭成员的情绪画像，帮助理解彼此的情绪模式和应对方式。</p>
                </div>
                
                {/* 父母情绪画像 */}
                <div className="mt-4 bg-white rounded-2xl p-4 shadow-md border border-indigo-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">👨‍👩‍👧‍👦 家庭成员情绪画像</h3>
                  
                  {/* 父亲/母亲情绪画像 */}
                  <div className="space-y-6">
                    {/* 我的情绪画像 */}
                    <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-2xl">👤</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-purple-900">您的情绪画像</h4>
                            <p className="text-sm text-purple-700">主要照护者</p>
                          </div>
                        </div>
                        <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-medium">
                          稳定型
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">情绪稳定性</span>
                            <span className="font-medium">75%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-purple-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">恢复能力</span>
                            <span className="font-medium">82%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-purple-600 h-2 rounded-full" style={{ width: '82%' }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">干预意识</span>
                            <span className="font-medium">88%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-purple-600 h-2 rounded-full" style={{ width: '88%' }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">压力承受力</span>
                            <span className="font-medium">65%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-purple-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 p-3 bg-white rounded-lg border border-purple-200">
                        <h5 className="font-medium text-purple-900 mb-2">情绪模式</h5>
                        <p className="text-sm text-gray-700">您的情绪状态在工作日下午 4-6 点容易波动，建议在这个时间段提前做深呼吸练习，或者请伴侣暂时接管辅导。</p>
                      </div>
                    </div>
                    
                    {/* 伴侣情绪画像 */}
                    <div className="p-4 bg-pink-50 rounded-xl border border-pink-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-2xl">👤</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-pink-900">伴侣的情绪画像</h4>
                            <p className="text-sm text-pink-700">共同照护者</p>
                          </div>
                        </div>
                        <div className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-xs font-medium">
                          从容型
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">情绪稳定性</span>
                            <span className="font-medium">85%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-pink-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">恢复能力</span>
                            <span className="font-medium">75%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-pink-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">干预意识</span>
                            <span className="font-medium">70%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-pink-600 h-2 rounded-full" style={{ width: '70%' }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">压力承受力</span>
                            <span className="font-medium">80%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-pink-600 h-2 rounded-full" style={{ width: '80%' }}></div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 p-3 bg-white rounded-lg border border-pink-200">
                        <h5 className="font-medium text-pink-900 mb-2">情绪模式</h5>
                        <p className="text-sm text-gray-700">您的伴侣情绪状态在周末较为稳定，但在处理复杂问题时容易拖延，建议在遇到困难时提前规划，分解任务。</p>
                      </div>
                    </div>
                    
                    {/* 孩子情绪画像 */}
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-2xl">🧒</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-blue-900">孩子的情绪画像</h4>
                            <p className="text-sm text-blue-700">学习者</p>
                          </div>
                        </div>
                        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                          探索型
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">情绪稳定性</span>
                            <span className="font-medium">65%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">恢复能力</span>
                            <span className="font-medium">90%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '90%' }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">学习动力</span>
                            <span className="font-medium">75%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">挫折承受力</span>
                            <span className="font-medium">60%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200">
                        <h5 className="font-medium text-blue-900 mb-2">情绪模式</h5>
                        <p className="text-sm text-gray-700">孩子在上午 9-11 点学习状态最佳，建议在这个时间段安排较难的学习内容。遇到困难时容易产生挫败感，需要及时的鼓励和支持。</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* 情绪画像总结 */}
                <div className="mt-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-200">
                  <h3 className="text-lg font-bold text-amber-900 mb-3 flex items-center">
                    <span className="text-xl mr-2">📊</span> 情绪画像总结
                  </h3>
                  <ul className="space-y-3 text-sm text-amber-800">
                    <li className="flex items-start"><span className="bg-amber-200 text-amber-800 rounded-full w-6 h-6 flex items-center justify-center mr-2 mt-0.5 text-xs font-bold">1</span><span>根据情绪画像调整辅导时间和分工，优化家庭学习环境</span></li>
                    <li className="flex items-start"><span className="bg-amber-200 text-amber-800 rounded-full w-6 h-6 flex items-center justify-center mr-2 mt-0.5 text-xs font-bold">2</span><span>针对孩子的学习高峰期安排重要学习任务，提高学习效率</span></li>
                    <li className="flex items-start"><span className="bg-amber-200 text-amber-800 rounded-full w-6 h-6 flex items-center justify-center mr-2 mt-0.5 text-xs font-bold">3</span><span>建立家庭成员之间的情绪支持机制，相互理解和包容</span></li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-md border border-green-100">
          <div onClick={() => setShowVoiceRecords(true)} className="flex items-center justify-between p-3 bg-green-50 rounded-xl hover:bg-green-100 cursor-pointer">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-3"><span className="text-2xl">📝</span></div>
              <div><h3 className="font-bold text-gray-900">语音转文本记录</h3><p className="text-sm text-gray-600 mt-1">按日期查看辅导对话记录</p></div>
            </div>
            <div className="text-green-600 text-2xl">→</div>
          </div>
        </div>


      </div>
    );
  };
  
  const renderUserGuide = () => (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
        <div>9:41</div>
        <div className="flex space-x-1"><span>📶</span><span>🔋 87%</span></div>
      </div>
      <div className="flex items-center mb-6">
        <button onClick={() => setShowUserGuide(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">←</button>
        <div><h1 className="text-2xl font-bold text-gray-900">使用指南</h1><p className="text-gray-600 mt-1">快速上手应用功能</p></div>
      </div>
      
      {/* 指南内容 */}
      <div className="bg-white rounded-2xl p-5 shadow-md space-y-6">
        {/* 功能介绍 */}
        <div>
          <h2 className="text-lg font-bold mb-4 text-gray-900 flex items-center">
            <span className="text-2xl mr-2">🌟</span> 功能介绍
          </h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-0.5">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-800">情绪监测</h3>
                <p className="text-sm text-gray-600 mt-1">应用通过麦克风监测您的语音情绪，当检测到焦虑或愤怒时，会及时提醒您进行干预。</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3 mt-0.5">
                <span className="text-green-600 font-bold">2</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-800">情绪创可贴</h3>
                <p className="text-sm text-gray-600 mt-1">当您感到焦虑或愤怒时，点击情绪创可贴获取即时的情绪调节建议和心理支持。</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3 mt-0.5">
                <span className="text-purple-600 font-bold">3</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-800">AI情绪助手</h3>
                <p className="text-sm text-gray-600 mt-1">通过语音与AI情绪助手交流，获取专业的情绪支持和建议。</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center mr-3 mt-0.5">
                <span className="text-amber-600 font-bold">4</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-800">数据报告</h3>
                <p className="text-sm text-gray-600 mt-1">查看您的情绪和健康数据报告，了解自己的情绪变化趋势和干预效果。</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* 快速上手 */}
        <div>
          <h2 className="text-lg font-bold mb-4 text-gray-900 flex items-center">
            <span className="text-2xl mr-2">🚀</span> 快速上手
          </h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3 mt-0.5">
                <span className="text-indigo-600 font-bold">1</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-800">授予麦克风权限</h3>
                <p className="text-sm text-gray-600 mt-1">首次使用时，应用会请求麦克风权限，这是用于监测您的语音情绪的必要权限。</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3 mt-0.5">
                <span className="text-indigo-600 font-bold">2</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-800">设置语音关键词</h3>
                <p className="text-sm text-gray-600 mt-1">在干预设置中，您可以自定义触发干预的语音关键词，如"你好笨"、"气死我了"等。</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3 mt-0.5">
                <span className="text-indigo-600 font-bold">3</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-800">开始使用</h3>
                <p className="text-sm text-gray-600 mt-1">当您辅导孩子作业时，应用会自动监测您的情绪，当检测到负面情绪时，会及时提醒您进行干预。</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* 功能技巧 */}
        <div>
          <h2 className="text-lg font-bold mb-4 text-gray-900 flex items-center">
            <span className="text-2xl mr-2">💡</span> 功能技巧
          </h2>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h3 className="font-bold text-blue-800 text-sm">使用情绪创可贴</h3>
              <p className="text-xs text-blue-700 mt-1">当感到焦虑或愤怒时，点击情绪创可贴获取即时的情绪调节建议，帮助您快速恢复平静。</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h3 className="font-bold text-green-800 text-sm">调整干预灵敏度</h3>
              <p className="text-xs text-green-700 mt-1">在设置中，您可以调整情绪监测的灵敏度，以适应您的个人情况。</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <h3 className="font-bold text-purple-800 text-sm">使用AI情绪助手</h3>
              <p className="text-xs text-purple-700 mt-1">当您需要更多情感支持时，点击AI情绪助手，通过语音与助手交流，获取专业的情绪支持和建议。</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFAQ = () => (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
        <div>9:41</div>
        <div className="flex space-x-1"><span>📶</span><span>🔋 87%</span></div>
      </div>
      <div className="flex items-center mb-6">
        <button onClick={() => setShowFAQ(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">←</button>
        <div><h1 className="text-2xl font-bold text-gray-900">常见问题</h1><p className="text-gray-600 mt-1">解决使用疑问</p></div>
      </div>
      
      {/* 常见问题内容 */}
      <div className="bg-white rounded-2xl p-5 shadow-md space-y-4">
        <div className="border-b border-gray-200 pb-4">
          <h3 className="font-bold text-gray-800">Q: 应用如何监测我的情绪？</h3>
          <p className="text-sm text-gray-600 mt-2">A: 应用通过麦克风监测您的语音特征，如语调、音量和语速等，来判断您的情绪状态。当检测到焦虑或愤怒等负面情绪时，会及时提醒您进行干预。</p>
        </div>
        <div className="border-b border-gray-200 pb-4">
          <h3 className="font-bold text-gray-800">Q: 应用会保存我的语音数据吗？</h3>
          <p className="text-sm text-gray-600 mt-2">A: 应用不会保存您的完整语音数据。语音数据仅用于实时情绪监测，监测完成后会立即被处理和丢弃，不会存储在任何服务器或本地设备上。</p>
        </div>
        <div className="border-b border-gray-200 pb-4">
          <h3 className="font-bold text-gray-800">Q: 如何调整干预灵敏度？</h3>
          <p className="text-sm text-gray-600 mt-2">A: 在设置页面中，您可以找到情绪监测灵敏度的调整选项，根据您的个人情况调整灵敏度，以获得更准确的情绪监测结果。</p>
        </div>
        <div className="border-b border-gray-200 pb-4">
          <h3 className="font-bold text-gray-800">Q: AI情绪助手是如何工作的？</h3>
          <p className="text-sm text-gray-600 mt-2">A: AI情绪助手使用先进的语音识别和自然语言处理技术，能够理解您的情绪状态和需求，并提供相应的情感支持和建议。即使在离线状态下，也能提供基本的情绪支持。</p>
        </div>
        <div className="border-b border-gray-200 pb-4">
          <h3 className="font-bold text-gray-800">Q: 如何自定义语音关键词？</h3>
          <p className="text-sm text-gray-600 mt-2">A: 在干预设置页面中，您可以添加、删除或修改触发干预的语音关键词，以适应您的个人语言习惯和需求。</p>
        </div>
        <div className="border-b border-gray-200 pb-4">
          <h3 className="font-bold text-gray-800">Q: 应用需要网络连接吗？</h3>
          <p className="text-sm text-gray-600 mt-2">A: 应用的基本功能（如情绪监测和本地干预）不需要网络连接。但AI情绪助手和数据同步等功能需要网络连接才能正常工作。</p>
        </div>
        <div className="border-b border-gray-200 pb-4">
          <h3 className="font-bold text-gray-800">Q: 如何查看我的情绪数据报告？</h3>
          <p className="text-sm text-gray-600 mt-2">A: 在数据页面中，您可以查看您的情绪和健康数据报告，包括情绪趋势、干预效果和健康指标等。点击"查看完整报告"按钮，还可以查看更详细的分析和建议。</p>
        </div>
        <div>
          <h3 className="font-bold text-gray-800">Q: 应用支持哪些设备？</h3>
          <p className="text-sm text-gray-600 mt-2">A: 应用支持iOS和Android智能手机，以及平板电脑等移动设备。需要设备具有麦克风功能，以进行情绪监测。</p>
        </div>
      </div>
    </div>
  );

  const renderFullReport = () => (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
        <div>9:41</div>
        <div className="flex space-x-1"><span>📶</span><span>🔋 87%</span></div>
      </div>
      <div className="flex items-center mb-6">
        <button onClick={() => setShowFullReport(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">←</button>
        <div><h1 className="text-2xl font-bold text-gray-900">情绪 - 健康完整报告</h1><p className="text-gray-600 mt-1">详细分析与建议</p></div>
      </div>
      
      {/* 报告摘要 */}
      <div className="bg-gradient-to-r from-rose-500 to-pink-600 rounded-2xl p-5 text-white">
        <h2 className="text-lg font-bold mb-3">📊 报告摘要</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>情绪调节能力提升</span>
            <span className="font-bold">46%</span>
          </div>
          <div className="flex justify-between">
            <span>平均心率恢复时间</span>
            <span className="font-bold">1.5 分钟</span>
          </div>
          <div className="flex justify-between">
            <span>干预成功率</span>
            <span className="font-bold">82%</span>
          </div>
          <div className="flex justify-between">
            <span>情绪稳定天数</span>
            <span className="font-bold">5/7</span>
          </div>
        </div>
      </div>
      
      {/* 详细数据 */}
      <div className="bg-white rounded-2xl p-5 shadow-md">
        <h2 className="text-lg font-bold mb-4 text-gray-900">📈 详细数据</h2>
        
        {/* 情绪趋势图 */}
        <div className="mb-6">
          <h3 className="font-bold text-sm text-gray-700 mb-2">情绪趋势</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weeklyComparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="me" stroke="#8884d8" name="我的情绪分数" />
              <Line type="monotone" dataKey="partner" stroke="#82ca9d" name="伴侣情绪分数" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* 健康指标 */}
        <div className="mb-6">
          <h3 className="font-bold text-sm text-gray-700 mb-3">健康指标</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>心率稳定性</span>
                <span className="font-bold">78/100</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '78%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>血压稳定性</span>
                <span className="font-bold">82/100</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '82%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>压力水平</span>
                <span className="font-bold">35/100</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '35%' }}></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 干预效果 */}
        <div>
          <h3 className="font-bold text-sm text-gray-700 mb-3">干预效果</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-green-50 rounded-lg">
              <h4 className="font-bold text-green-800 text-xs">成功干预</h4>
              <p className="text-2xl font-bold text-green-900 mt-1">24</p>
              <p className="text-xs text-green-700 mt-1">次/周</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <h4 className="font-bold text-blue-800 text-xs">平均恢复时间</h4>
              <p className="text-2xl font-bold text-blue-900 mt-1">1.5</p>
              <p className="text-xs text-blue-700 mt-1">分钟</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <h4 className="font-bold text-purple-800 text-xs">情绪稳定率</h4>
              <p className="text-2xl font-bold text-purple-900 mt-1">71%</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <h4 className="font-bold text-amber-800 text-xs">干预成功率</h4>
              <p className="text-2xl font-bold text-amber-900 mt-1">82%</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* 个性化建议 */}
      <div className="bg-white rounded-2xl p-5 shadow-md">
        <h2 className="text-lg font-bold mb-3 text-gray-900">🎯 个性化建议</h2>
        <div className="space-y-3">
          <div className="flex items-start">
            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-3 mt-0.5">
              <span className="text-green-600 text-xs font-bold">1</span>
            </div>
            <div>
              <p className="text-sm font-medium">增加晨间正念练习</p>
              <p className="text-xs text-gray-600 mt-1">每天早晨 10 分钟的正念冥想，有助于降低一天的压力水平。</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-0.5">
              <span className="text-blue-600 text-xs font-bold">2</span>
            </div>
            <div>
              <p className="text-sm font-medium">优化辅导前准备</p>
              <p className="text-xs text-gray-600 mt-1">辅导作业前进行 5 分钟深呼吸练习，设定积极意图。</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center mr-3 mt-0.5">
              <span className="text-purple-600 text-xs font-bold">3</span>
            </div>
            <div>
              <p className="text-sm font-medium">建立规律的运动习惯</p>
              <p className="text-xs text-gray-600 mt-1">每周 3-4 次中等强度运动，每次 30 分钟，有助于调节情绪。</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center mr-3 mt-0.5">
              <span className="text-amber-600 text-xs font-bold">4</span>
            </div>
            <div>
              <p className="text-sm font-medium">改善睡眠质量</p>
              <p className="text-xs text-gray-600 mt-1">保持规律的睡眠时间，睡前 1 小时避免使用电子设备。</p>
            </div>
          </div>
        </div>
      </div>
      

    </div>
  );

  const renderPartnerComparison = () => (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
        <div>9:41</div>
        <div className="flex space-x-1"><span>📶</span><span>🔋 87%</span></div>
      </div>
      <div className="flex items-center mb-6">
        <button onClick={() => setShowPartnerComparison(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">←</button>
        <div><h1 className="text-2xl font-bold text-gray-900">家庭情绪对比</h1><p className="text-gray-600 mt-1">数据共享，促进理解与分工</p></div>
      </div>
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-5 text-white">
        <h2 className="text-lg font-bold mb-2 flex items-center"><span className="text-xl mr-2">🔒</span> 数据隐私说明</h2>
        <p className="opacity-95 text-sm">所有对比数据仅在家庭内部共享，不会上传到云端或分享给第三方。数据用于促进家庭内部理解与分工优化。</p>
      </div>
      <div className="bg-white rounded-2xl p-4 shadow-md border border-amber-100">
        <div onClick={() => setShowLearningManual(true)} className="flex items-center justify-between p-3 bg-amber-50 rounded-xl hover:bg-amber-100 cursor-pointer">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mr-3"><span className="text-2xl">📖</span></div>
            <div><h3 className="font-bold text-gray-900">家庭情绪健康学习手册</h3><p className="text-sm text-gray-600 mt-1">心理学知识引导伴侣共同应对压力与焦虑</p></div>
          </div>
          <div className="text-amber-600 text-2xl">→</div>
        </div>
      </div>
      <div className="bg-white rounded-2xl p-2 shadow-md border border-gray-200">
        <div className="flex space-x-2">
          <button onClick={() => setComparisonView("overview")} className={`flex-1 py-3 rounded-xl font-medium ${comparisonView === "overview" ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'}`}>总览</button>
          <button onClick={() => setComparisonView("weekly")} className={`flex-1 py-3 rounded-xl font-medium ${comparisonView === "weekly" ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'}`}>周趋势</button>
          <button onClick={() => setComparisonView("insights")} className={`flex-1 py-3 rounded-xl font-medium ${comparisonView === "insights" ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'}`}>洞察建议</button>
          <button onClick={() => setComparisonView("profiles")} className={`flex-1 py-3 rounded-xl font-medium ${comparisonView === "profiles" ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'}`}>情绪画像</button>
        </div>
      </div>
      {comparisonView === "overview" && (
        <>
          <div className="bg-white rounded-2xl p-4 shadow-md border border-purple-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">📊 辅导情绪数据对比</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={partnerComparisonData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis dataKey="category" type="category" width={80} tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #e5e7eb', borderRadius: '8px' }} formatter={(value, name, props) => [`${value}${props.payload.unit}`, name === 'me' ? '我' : name === 'partner' ? '伴侣' : '孩子']} />
                  <Legend />
                  <Bar dataKey="me" name="我" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="partner" name="伴侣" fill="#ec4899" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="child" name="孩子" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-md border border-green-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">💪 各自优势</h3>
            <div className="space-y-4">
              <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                <div className="flex items-center mb-2"><div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3"><span className="text-xl">👤</span></div><h4 className="font-bold text-purple-900">您的优势</h4></div>
                <ul className="space-y-2 text-sm text-purple-800">
                  <li className="flex items-start"><span className="text-green-500 mr-2 mt-0.5">✓</span><span>情绪恢复更快（平均 2.5 分钟 vs 3.2 分钟）</span></li>
                  <li className="flex items-start"><span className="text-green-500 mr-2 mt-0.5">✓</span><span>主动干预意识更强（18 次/周 vs 14 次/周）</span></li>
                  <li className="flex items-start"><span className="text-green-500 mr-2 mt-0.5">✓</span><span>平静状态占比更高（65% vs 58%）</span></li>
                </ul>
              </div>
              <div className="p-4 bg-pink-50 rounded-xl border border-pink-200">
                <div className="flex items-center mb-2"><div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center mr-3"><span className="text-xl">👤</span></div><h4 className="font-bold text-pink-900">伴侣的优势</h4></div>
                <ul className="space-y-2 text-sm text-pink-800">
                  <li className="flex items-start"><span className="text-green-500 mr-2 mt-0.5">✓</span><span>周末情绪更稳定（周日 75% vs 78%）</span></li>
                  <li className="flex items-start"><span className="text-green-500 mr-2 mt-0.5">✓</span><span>语音触发次数较少（11 次/周 vs 8 次/周）</span></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-200">
            <h3 className="text-lg font-bold text-amber-900 mb-3 flex items-center"><span className="text-xl mr-2">💡</span> 家庭分工建议</h3>
            <ul className="space-y-3 text-sm text-amber-800">
              <li className="flex items-start"><span className="bg-amber-200 text-amber-800 rounded-full w-6 h-6 flex items-center justify-center mr-2 mt-0.5 text-xs font-bold">1</span><span><strong>错峰辅导：</strong>您在工作日表现更好，伴侣在周末更稳定，可以考虑分工安排</span></li>
              <li className="flex items-start"><span className="bg-amber-200 text-amber-800 rounded-full w-6 h-6 flex items-center justify-center mr-2 mt-0.5 text-xs font-bold">2</span><span><strong>互相补位：</strong>当您感到情绪上升时，可以请伴侣接手，反之亦然</span></li>
              <li className="flex items-start"><span className="bg-amber-200 text-amber-800 rounded-full w-6 h-6 flex items-center justify-center mr-2 mt-0.5 text-xs font-bold">3</span><span><strong>经验交流：</strong>每周花 10 分钟分享各自的有效干预方法，共同提升</span></li>
            </ul>
          </div>
        </>
      )}
      {comparisonView === "weekly" && (
        <>
          <div className="bg-white rounded-2xl p-4 shadow-md border border-purple-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">📈 本周平静状态对比</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                  <YAxis domain={[40, 100]} tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #e5e7eb', borderRadius: '8px' }} formatter={(value, name) => [`${value}%`, name === 'me' ? '我' : name === 'partner' ? '伴侣' : '孩子']} />
                  <Legend />
                  <Line type="monotone" dataKey="me" name="我" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }} />
                  <Line type="monotone" dataKey="partner" name="伴侣" stroke="#ec4899" strokeWidth={3} dot={{ fill: '#ec4899', strokeWidth: 2, r: 4 }} />
                  <Line type="monotone" dataKey="child" name="孩子" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-md border border-indigo-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">📅 每日洞察</h3>
            <div className="space-y-3">
              {[
                { day: "周一", insight: "孩子状态不错，您可以主导辅导", me: 65, partner: 60, child: 70 },
                { day: "周二", insight: "孩子状态很好，您可以多承担", me: 70, partner: 55, child: 75 },
                { day: "周三", insight: "孩子状态一般，建议伴侣主导", me: 60, partner: 65, child: 68 },
                { day: "周四", insight: "孩子状态良好，您可以主导", me: 75, partner: 58, child: 72 },
                { day: "周五", insight: "孩子状态非常好，适合新内容学习", me: 80, partner: 62, child: 85 },
                { day: "周六", insight: "孩子状态极佳，适合挑战性任务", me: 85, partner: 70, child: 90 },
                { day: "周日", insight: "孩子状态很好，可以轻松复习", me: 78, partner: 75, child: 88 }
              ].map((item, index) => (
                <div key={index} className={`p-3 rounded-xl border-2 ${item.child > 80 ? 'border-green-200 bg-green-50' : item.child > 70 ? 'border-blue-200 bg-blue-50' : 'border-yellow-200 bg-yellow-50'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center"><div className={`w-3 h-3 rounded-full mr-3 ${item.child > 80 ? 'bg-green-500' : item.child > 70 ? 'bg-blue-500' : 'bg-yellow-500'}`}></div><span className="font-medium text-gray-900">{item.day}</span></div>
                    <span className="text-sm text-gray-600">{item.insight}</span>
                  </div>
                  <div className="mt-2 flex space-x-4 text-xs">
                    <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-purple-500 mr-1"></span> 您: {item.me}%</div>
                    <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-pink-500 mr-1"></span> 伴侣: {item.partner}%</div>
                    <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span> 孩子: {item.child}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      {comparisonView === "insights" && (
        <>
          <div className="bg-white rounded-2xl p-4 shadow-md border border-green-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">🏆 家庭整体优势</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-green-50 rounded-xl border border-green-200 text-center"><div className="text-3xl mb-2">💪</div><div className="text-2xl font-bold text-green-700">72%</div><div className="text-sm text-green-600 mt-1">平均平静状态</div></div>
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 text-center"><div className="text-3xl mb-2">⚡</div><div className="text-2xl font-bold text-blue-700">2.8 分钟</div><div className="text-sm text-blue-600 mt-1">平均恢复时间</div></div>
              <div className="p-4 bg-purple-50 rounded-xl border border-purple-200 text-center"><div className="text-3xl mb-2">🎯</div><div className="text-2xl font-bold text-purple-700">27 次</div><div className="text-sm text-purple-600 mt-1">周干预总数</div></div>
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-center"><div className="text-3xl mb-2">📉</div><div className="text-2xl font-bold text-amber-700">-15%</div><div className="text-sm text-amber-600 mt-1">情绪升级下降</div></div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-md border border-amber-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">🎯 共同改善方向</h3>
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                <h4 className="font-bold text-amber-900 mb-2">周三压力高峰</h4>
                <p className="text-sm text-amber-800 mb-3">数据显示周三双方情绪状态都相对较低，建议：</p>
                <ul className="space-y-2 text-sm text-amber-800">
                  <li className="flex items-start"><span className="text-amber-600 mr-2 mt-0.5">•</span><span>周三安排更轻松的学习内容</span></li>
                  <li className="flex items-start"><span className="text-amber-600 mr-2 mt-0.5">•</span><span>提前进行 5 分钟呼吸练习</span></li>
                  <li className="flex items-start"><span className="text-amber-600 mr-2 mt-0.5">•</span><span>考虑请外部帮助（如家教）</span></li>
                </ul>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <h4 className="font-bold text-blue-900 mb-2">语音触发优化</h4>
                <p className="text-sm text-blue-800 mb-3">双方语音触发次数都较高，建议：</p>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-start"><span className="text-blue-600 mr-2 mt-0.5">•</span><span>辅导前共同设定情绪规则</span></li>
                  <li className="flex items-start"><span className="text-blue-600 mr-2 mt-0.5">•</span><span>建立"暂停信号"机制</span></li>
                  <li className="flex items-start"><span className="text-blue-600 mr-2 mt-0.5">•</span><span>定期回顾触发话语并调整</span></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-5 text-white">
            <h3 className="text-lg font-bold mb-3 flex items-center"><span className="text-xl mr-2">🎯</span> 本周家庭目标</h3>
            <div className="space-y-3">
              <div className="flex items-center"><div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3"><span className="text-sm">✓</span></div><span>将平均平静状态提升至 75%</span></div>
              <div className="flex items-center"><div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3"><span className="text-sm">✓</span></div><span>将语音触发次数减少至 15 次/周以下</span></div>
              <div className="flex items-center"><div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3"><span className="text-sm">✓</span></div><span>建立每周 10 分钟情绪交流时间</span></div>
            </div>
            <button className="mt-4 w-full bg-white text-indigo-700 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors">设置提醒</button>
          </div>
        </>
      )}
      {comparisonView === "profiles" && (
        <>
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-5 text-white">
            <h2 className="text-lg font-bold mb-2 flex items-center"><span className="text-xl mr-2">🎨</span> 家庭情绪画像</h2>
            <p className="opacity-95 text-sm">通过情绪数据，生成家庭成员的情绪画像，帮助理解彼此的情绪模式和应对方式。</p>
          </div>
          
          {/* 父母情绪画像 */}
          <div className="bg-white rounded-2xl p-4 shadow-md border border-indigo-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">👨‍👩‍👧‍👦 家庭成员情绪画像</h3>
            
            {/* 父亲/母亲情绪画像 */}
            <div className="space-y-6">
              {/* 我的情绪画像 */}
              <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-2xl">👤</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-purple-900">您的情绪画像</h4>
                      <p className="text-sm text-purple-700">主要照护者</p>
                    </div>
                  </div>
                  <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-medium">
                    稳定型
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">情绪稳定性</span>
                      <span className="font-medium">75%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">恢复能力</span>
                      <span className="font-medium">82%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: '82%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">干预意识</span>
                      <span className="font-medium">88%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: '88%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">压力承受力</span>
                      <span className="font-medium">65%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-white rounded-lg border border-purple-200">
                  <h5 className="font-medium text-purple-900 mb-2">情绪模式</h5>
                  <p className="text-sm text-gray-700">您的情绪状态在工作日下午 4-6 点容易波动，建议在这个时间段提前做深呼吸练习，或者请伴侣暂时接管辅导。</p>
                </div>
              </div>
              
              {/* 伴侣情绪画像 */}
              <div className="p-4 bg-pink-50 rounded-xl border border-pink-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-2xl">👤</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-pink-900">伴侣的情绪画像</h4>
                      <p className="text-sm text-pink-700">共同照护者</p>
                    </div>
                  </div>
                  <div className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-xs font-medium">
                    从容型
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">情绪稳定性</span>
                      <span className="font-medium">85%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-pink-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">恢复能力</span>
                      <span className="font-medium">70%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-pink-600 h-2 rounded-full" style={{ width: '70%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">干预意识</span>
                      <span className="font-medium">65%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-pink-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">压力承受力</span>
                      <span className="font-medium">78%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-pink-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-white rounded-lg border border-pink-200">
                  <h5 className="font-medium text-pink-900 mb-2">情绪模式</h5>
                  <p className="text-sm text-gray-700">伴侣的情绪状态在周末表现更佳，建议在周六和周日由伴侣主导辅导，您可以在旁辅助。</p>
                </div>
              </div>
              
              {/* 孩子情绪画像 */}
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-2xl">👧</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-blue-900">孩子的情绪画像</h4>
                      <p className="text-sm text-blue-700">学习者</p>
                    </div>
                  </div>
                  <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                    敏感型
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">注意力持续</span>
                      <span className="font-medium">60%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">挫折容忍</span>
                      <span className="font-medium">55%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '55%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">学习热情</span>
                      <span className="font-medium">75%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">情绪表达</span>
                      <span className="font-medium">80%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '80%' }}></div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200">
                  <h5 className="font-medium text-blue-900 mb-2">情绪模式</h5>
                  <p className="text-sm text-gray-700">孩子在早晨和晚上情绪状态较好，建议将重要的学习内容安排在这些时间段，避免在下午 3-5 点安排复杂任务。</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* 家庭情绪互动模式 */}
          <div className="bg-white rounded-2xl p-4 shadow-md border border-green-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">🔄 家庭情绪互动模式</h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                <h4 className="font-bold text-green-900 mb-3">最佳互动组合</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white rounded-lg border border-green-200 text-center">
                    <div className="text-2xl mb-2">👤 + 👧</div>
                    <p className="text-sm text-gray-700">您与孩子：逻辑引导</p>
                    <p className="text-xs text-green-600 mt-1">配合度：85%</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-green-200 text-center">
                    <div className="text-2xl mb-2">👤 + 👧</div>
                    <p className="text-sm text-gray-700">伴侣与孩子：情感支持</p>
                    <p className="text-xs text-green-600 mt-1">配合度：90%</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                <h4 className="font-bold text-amber-900 mb-3">注意事项</h4>
                <ul className="space-y-2 text-sm text-amber-800">
                  <li className="flex items-start">
                    <span className="text-amber-600 mr-2 mt-0.5">•</span>
                    <span>当您感到情绪上升时，建议由伴侣接管辅导，避免情绪传递给孩子</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-amber-600 mr-2 mt-0.5">•</span>
                    <span>孩子在周一和周三情绪较敏感，需要更多耐心和鼓励</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-amber-600 mr-2 mt-0.5">•</span>
                    <span>家庭情绪高峰期在晚上 7-8 点，建议提前做好准备</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* 情绪画像总结 */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-5 border border-purple-200">
            <h3 className="text-lg font-bold text-purple-900 mb-3 flex items-center">
              <span className="text-xl mr-2">📊</span> 情绪画像总结
            </h3>
            <p className="text-sm text-gray-700 mb-3">
              基于家庭情绪数据，我们发现您的家庭整体情绪状态良好，父母之间形成了很好的互补关系。孩子的情绪表达能力较强，这有助于更好地理解其需求。
            </p>
            <div className="p-3 bg-white rounded-lg border border-purple-200">
              <h5 className="font-medium text-purple-900 mb-2">建议行动</h5>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2 mt-0.5">✓</span>
                  <span>建立家庭情绪日志，记录每天的情绪状态和触发因素</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2 mt-0.5">✓</span>
                  <span>每周安排 15 分钟家庭情绪分享时间，增进彼此理解</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2 mt-0.5">✓</span>
                  <span>根据情绪画像调整辅导时间和分工，优化家庭学习环境</span>
                </li>
              </ul>
            </div>
          </div>
        </>
      )}
      <button onClick={() => { alert("确定要断开与伴侣设备的连接吗？断开后将无法查看对比数据。"); }} className="w-full bg-gray-100 text-gray-700 py-4 rounded-2xl font-bold border border-gray-300 hover:bg-gray-200 transition-colors">🔗 断开设备连接</button>
    </div>
  );
  
  const renderLearningManual = () => {
    if (selectedChapter) {
      const chapter = LEARNING_MANUAL_CONTENT.chapters.find(c => c.id === selectedChapter);
      return (
        <div className="p-4 space-y-6">
          <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
            <div>9:41</div>
            <div className="flex space-x-1"><span>📶</span><span>🔋 87%</span></div>
          </div>
          <div className="flex items-center mb-6">
            <button onClick={() => { setSelectedChapter(null); handleChapterComplete(selectedChapter); toggleChapterAudio(); }} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">←</button>
            <div><h1 className="text-2xl font-bold text-gray-900">{chapter?.title}</h1><p className="text-gray-600 mt-1">家庭情绪健康学习手册 • {chapter?.readTime}</p></div>
          </div>
          
          {/* Audio Player with Doubao TTS and Canon in D Background Music - FIXED */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-5 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
                  <span className="text-2xl">🎧</span>
                </div>
                <div>
                  <h3 className="font-bold">章节音频</h3>
                  <p className="text-sm opacity-90">豆包 TTS + 卡农背景音乐</p>
                  <button 
                    onClick={() => setShowVoiceSelector(!showVoiceSelector)}
                    className="text-xs text-yellow-200 mt-1 flex items-center"
                  >
                    🎤 切换豆包音色
                  </button>
                </div>
              </div>
              <button
                onClick={toggleChapterAudio}
                className="w-14 h-14 bg-white text-indigo-600 rounded-full flex items-center justify-center hover:bg-indigo-50 transition-colors shadow-lg"
              >
                {isChapterAudioPlaying && chapter && currentPlayingChapter === chapter.id ? (
                  <span className="text-2xl">⏸️</span>
                ) : (
                  <span className="text-2xl">▶️</span>
                )}
              </button>
            </div>
            
            {/* Voice Selector - Doubao TTS Voices - FIXED */}
            <AnimatePresence>
              {showVoiceSelector && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 p-3 bg-white bg-opacity-20 rounded-xl overflow-hidden"
                >
                  <p className="text-xs mb-2">选择豆包 TTS 音色：</p>
                  <div className="space-y-2">
                    {AVAILABLE_VOICES.filter(v => v.provider === 'doubao').map((voice) => (
                      <button
                        key={voice.id}
                        onClick={() => handleVoiceChange(voice.id)}
                        className={`w-full text-left p-2 rounded-lg text-xs transition-all ${
                          currentVoiceId === voice.id 
                            ? 'bg-white text-indigo-600 shadow-md' 
                            : 'bg-white bg-opacity-20 text-white hover:bg-white hover:bg-opacity-30'
                        }`}
                      >
                        <div className="font-medium">{voice.name}</div>
                        <div className="opacity-80">{voice.emotion}</div>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs mt-2 opacity-70">💡 豆包 TTS：中文语音自然度高，情感表达丰富</p>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Progress Bar */}
            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1 opacity-90">
                {chapter && (
                  <>
                    <span>{Math.floor(chapterAudioProgress / 100 * parseFloat(chapter.audioDuration.split(':')[0]))}:{(Math.floor(chapterAudioProgress / 100 * parseFloat(chapter.audioDuration.split(':')[1]) * 60) % 60).toString().padStart(2, '0')}</span>
                    <span>{chapter.audioDuration}</span>
                  </>
                )}
              </div>
              <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
                <div
                  className="bg-white h-2 rounded-full transition-all duration-300"
                  style={{ width: `${chapterAudioProgress}%` }}
                ></div>
              </div>
            </div>
            
            {/* Volume Control */}
            <div className="flex items-center space-x-3">
              <span className="text-xs opacity-90">🎵 卡农背景音乐</span>
              <input
                type="range"
                min="0"
                max="100"
                value={chapterAudioVolume * 100}
                onChange={(e) => {
                  const newVolume = parseInt(e.target.value) / 100;
                  setChapterAudioVolume(newVolume);
                  if (bgMusicRef.current) {
                    bgMusicRef.current.volume = newVolume;
                  }
                }}
                className="flex-1 h-1 bg-white bg-opacity-20 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-xs opacity-90">{Math.round(chapterAudioVolume * 100)}%</span>
            </div>
            
            {/* Audio Info */}
            <div className="mt-3 flex items-center text-xs opacity-80">
              <span className="mr-2">🎼</span>
              <span>背景音乐：帕赫贝尔 - 卡农 in D 大调</span>
              {isTTSSpeaking && (
                <span className="ml-2 flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></span>
                  豆包 TTS 朗读中 - {selectedVoice.name}
                </span>
              )}
            </div>
          </div>
          
          <div className="space-y-4">
            {chapter?.sections?.map((section, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="bg-white rounded-2xl p-5 shadow-md border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-3">{section.title}</h3>
                <p className="text-gray-700 mb-4 leading-relaxed">{section.content}</p>
                {section.keyPoints && (
                  <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200">
                    <h4 className="font-bold text-indigo-900 mb-2 flex items-center"><span className="text-lg mr-2">💡</span> 核心要点</h4>
                    <ul className="space-y-2">
                      {section.keyPoints.map((point, idx) => (<li key={idx} className="flex items-start text-sm text-indigo-800"><span className="text-indigo-600 mr-2 mt-0.5">•</span><span>{point}</span></li>))}
                    </ul>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
          <div className="flex justify-between pt-4">
            <button onClick={() => { const currentIndex = LEARNING_MANUAL_CONTENT.chapters.findIndex(c => c.id === selectedChapter); if (currentIndex > 0) setSelectedChapter(LEARNING_MANUAL_CONTENT.chapters[currentIndex - 1].id); }} disabled={selectedChapter === 1} className={`px-6 py-3 rounded-xl font-medium ${selectedChapter === 1 ? 'bg-gray-100 text-gray-400' : 'bg-indigo-100 text-indigo-700'}`}>← 上一章</button>
            <button onClick={() => { const currentIndex = LEARNING_MANUAL_CONTENT.chapters.findIndex(c => c.id === selectedChapter); if (currentIndex < LEARNING_MANUAL_CONTENT.chapters.length - 1) setSelectedChapter(LEARNING_MANUAL_CONTENT.chapters[currentIndex + 1].id); }} disabled={selectedChapter === LEARNING_MANUAL_CONTENT.chapters.length} className={`px-6 py-3 rounded-xl font-medium ${selectedChapter === LEARNING_MANUAL_CONTENT.chapters.length ? 'bg-gray-100 text-gray-400' : 'bg-indigo-600 text-white'}`}>下一章 →</button>
          </div>
        </div>
      );
    }
    
    return (
      <div className="p-4 space-y-6">
        <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
          <div>9:41</div>
          <div className="flex space-x-1"><span>📶</span><span>🔋 87%</span></div>
        </div>
        <div className="flex items-center mb-6">
          <button onClick={() => { setShowLearningManual(false); setSelectedChapter(null); }} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">←</button>
          <div><h1 className="text-2xl font-bold text-gray-900">家庭情绪健康学习手册</h1><p className="text-gray-600 mt-1">心理学知识引导伴侣共同应对压力与焦虑</p></div>
        </div>
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-5 text-white">
          <h2 className="text-lg font-bold mb-2 flex items-center"><span className="text-xl mr-2">📚</span> 为什么需要学习？</h2>
          <p className="opacity-95 text-sm leading-relaxed">情绪管理不是天生的能力，而是可以学习的技能。通过了解情绪的科学原理、掌握有效的应对策略、建立家庭情绪规则，伴侣双方可以共同成长，为孩子创造更健康的情绪环境。</p>
        </div>
        
        {LEARNING_MANUAL_CONTENT.parts.map((part) => (
          <div key={part.id} className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3 px-1">{part.title}</h3>
            <div className="space-y-3">
              {LEARNING_MANUAL_CONTENT.chapters.filter(c => c.part === part.id).map((chapter, index) => (
                <motion.div
                  key={chapter.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedChapter(chapter.id)}
                  className={`bg-white rounded-2xl p-5 shadow-md border-2 cursor-pointer hover:shadow-lg transition-all ${selectedChapter === chapter.id ? 'border-indigo-500' : 'border-gray-200'}`}
                >
                  <div className="flex items-center">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${chapter.color} flex items-center justify-center mr-4 flex-shrink-0`}>
                      <span className="text-2xl">{chapter.icon}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-lg text-gray-900">{chapter.title}</h3>
                        {completedChapters.includes(chapter.id) && (<span className="text-green-600 text-sm font-medium mr-2">✓ 已完成</span>)}
                      </div>
                      <div className="flex items-center mt-1 space-x-3">
                        <p className="text-sm text-gray-600">{chapter.sections.length} 个小节</p>
                        <span className="text-gray-300">•</span>
                        <p className="text-sm text-gray-600">{chapter.readTime}</p>
                        <span className="text-gray-300">•</span>
                        <div className="flex items-center text-sm text-indigo-600">
                          <span className="mr-1">🎧</span>
                          <span>豆包 TTS + 卡农 BGM</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-gray-400 text-2xl">→</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
        
        <div className="bg-white rounded-2xl p-5 shadow-md border border-amber-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center"><span className="text-xl mr-2">⚡</span> 快速技巧</h3>
          <div className="space-y-3">
            {LEARNING_MANUAL_CONTENT.quickTips.map((tip, index) => (
              <div key={index} className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                <h4 className="font-bold text-amber-900 mb-1">{tip.title}</h4>
                <p className="text-sm text-amber-800">{tip.content}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-5 text-white">
          <h3 className="text-lg font-bold mb-3 flex items-center"><span className="text-xl mr-2">📊</span> 学习进度</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm"><span>已完成章节</span><span>{completedChapters.length}/{LEARNING_MANUAL_CONTENT.chapters.length}</span></div>
            <div className="w-full bg-white bg-opacity-20 rounded-full h-3">
              <div className="bg-white h-3 rounded-full transition-all duration-500" style={{ width: `${(completedChapters.length / LEARNING_MANUAL_CONTENT.chapters.length) * 100}%` }}></div>
            </div>
            <p className="text-sm opacity-90">完成所有章节后，您将获得"家庭情绪健康导师"证书</p>
          </div>
        </div>
      </div>
    );
  };
  
  const renderVoiceRecords = () => {
    const todayRecords = voiceTranscripts.find(d => d.date === selectedDate);
    return (
      <div className="p-4 space-y-6">
        <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
          <div>9:41</div>
          <div className="flex space-x-1"><span>📶</span><span>🔋 87%</span></div>
        </div>
        <div className="flex items-center mb-6">
          <button onClick={() => setShowVoiceRecords(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">←</button>
          <div><h1 className="text-2xl font-bold text-gray-900">语音记录</h1><p className="text-gray-600 mt-1">按日期查看语音转文本记录</p></div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-5 text-white">
          <h2 className="text-lg font-bold mb-2 flex items-center"><span className="text-xl mr-2">🔒</span> 隐私保护说明</h2>
          <p className="opacity-95 text-sm">所有语音转文本数据仅存储在您本地设备上，不会上传到云端。您可以随时查看、删除这些记录。系统仅检测预设的情绪升级关键词，不记录完整对话内容。</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-md border border-indigo-100">
          <h3 className="text-lg font-bold text-gray-900 mb-3">📅 选择日期</h3>
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {voiceTranscripts.map((day) => (
              <button key={day.date} onClick={() => setSelectedDate(day.date)} className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap ${selectedDate === day.date ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-indigo-50'}`}>
                {day.date === new Date().toISOString().split('T')[0] ? '今天' : day.date === new Date(Date.now() - 86400000).toISOString().split('T')[0] ? '昨天' : day.date}
              </button>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-md border border-indigo-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">📝 {selectedDate === new Date().toISOString().split('T')[0] ? '关键时刻回放' : selectedDate}</h3>
            <span className="text-sm text-gray-500">{todayRecords?.records.length || 0} 条</span>
          </div>
          {todayRecords && todayRecords.records.length > 0 ? (
            <div className="space-y-3">
              {todayRecords.records.slice(0, 6).map((record: any) => (
                <div key={record.id} className={`p-4 rounded-xl border-2 ${record.triggered ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className="text-xs font-medium text-gray-500 bg-gray-200 px-2 py-1 rounded">{record.time}</span>
                        {record.triggered && (<span className="ml-2 text-xs font-medium text-red-700 bg-red-100 px-2 py-1 rounded flex items-center"><span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span>触发干预</span>)}
                      </div>
                      <p className="text-gray-800 italic">"{record.text}"</p>
                      {record.keyword && (<p className="text-xs text-red-600 mt-2">匹配关键词：<span className="font-medium">"{record.keyword}"</span></p>)}
                    </div>
                    <div className="ml-4">
                      <button className="w-10 h-10 bg-indigo-100 hover:bg-indigo-200 rounded-full flex items-center justify-center transition-colors">
                        <span className="text-indigo-600">▶</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📭</div>
              <p>今天还没有语音记录</p>
              <p className="text-sm mt-1">开启语音记录后，辅导对话将自动转文本保存</p>
            </div>
          )}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800"><span className="font-medium">💡 提示：</span> 红色标记表示触发了情绪干预提醒，建议您回顾当时的情绪状态，思考是否有更好的应对方式。</p>
          </div>
        </div>

      </div>
    );
  };
  
  const renderPsychologyDetail = () => (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
        <div>9:41</div>
        <div className="flex space-x-1"><span>📶</span><span>🔋 87%</span></div>
      </div>
      <div className="flex items-center mb-6">
        <button onClick={() => setResourceDetail(null)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">←</button>
        <div><h1 className="text-2xl font-bold text-gray-900">心理学原理</h1><p className="text-gray-600 mt-1">科学依据与实践指导</p></div>
      </div>
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-5 text-white">
        <h2 className="text-xl font-bold mb-2">为什么理解心理学很重要？</h2>
        <p className="opacity-95">情绪管理不是压抑情绪，而是理解情绪背后的机制。掌握这些心理学原理，能帮助您在辅导作业时更科学地应对情绪挑战，建立健康的亲子关系。</p>
      </div>
      <div className="space-y-4">
        {PSYCHOLOGY_PRINCIPLES.map((principle) => (
          <motion.div key={principle.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: principle.id * 0.1 }} className={`bg-white rounded-2xl shadow-md overflow-hidden border ${expandedPrinciple === principle.id ? 'border-indigo-300' : 'border-gray-200'}`}>
            <button onClick={() => setExpandedPrinciple(expandedPrinciple === principle.id ? null : principle.id)} className="w-full p-4 flex items-start text-left">
              <div className="text-3xl mr-4 mt-1">{principle.icon}</div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-900">{principle.title}</h3>
                <p className="text-gray-600 mt-1">{principle.description}</p>
              </div>
              <div className="ml-2 mt-1 text-xl">{expandedPrinciple === principle.id ? '−' : '+'}</div>
            </button>
            {expandedPrinciple === principle.id && (
              <div className="px-4 pb-4 pt-0 text-gray-700 space-y-3 border-t border-gray-100">
                <p>{principle.content}</p>
                <div className="bg-indigo-50 p-3 rounded-lg">
                  <h4 className="font-bold text-indigo-800 flex items-center"><span className="text-xl mr-2">💡</span> 实践技巧</h4>
                  <p className="mt-1 text-indigo-900">{principle.practicalTip}</p>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
      <div className="bg-white rounded-2xl p-5 shadow-md border border-cyan-100">
        <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center"><span className="text-2xl mr-2">🔬</span> 科学研究支持</h2>
        <ul className="space-y-3 text-gray-700">
          <li className="flex"><span className="text-green-500 mr-2 mt-1">✓</span><span>哈佛大学研究：每天 10 分钟正念练习，8 周后大脑前额叶皮层增厚 15%，情绪调节能力显著提升</span></li>
          <li className="flex"><span className="text-green-500 mr-2 mt-1">✓</span><span>《儿童发展》期刊：父母情绪稳定性与孩子学业成就呈正相关 (r=0.67)，比辅导时长影响更大</span></li>
          <li className="flex"><span className="text-green-500 mr-2 mt-1">✓</span><span>神经科学研究：情绪爆发后，大脑需要 20-30 分钟才能完全恢复理性思考能力</span></li>
        </ul>
      </div>
      <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl p-5 text-white text-center">
        <h2 className="text-xl font-bold mb-2">将知识转化为行动</h2>
        <p className="opacity-95 mb-4">理解原理是第一步，持续实践才能带来改变。应用中的每个干预工具都基于这些心理学原理设计。</p>
        <button onClick={() => { setResourceDetail(null); setActiveTab("home"); }} className="bg-white text-amber-800 font-bold px-6 py-3 rounded-xl shadow-lg">立即实践这些原理</button>
      </div>
    </div>
  );
  
  const renderCommunicationDetail = () => (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
        <div>9:41</div>
        <div className="flex space-x-1"><span>📶</span><span>🔋 87%</span></div>
      </div>
      <div className="flex items-center mb-6">
        <button onClick={() => setResourceDetail(null)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">←</button>
        <div><h1 className="text-2xl font-bold text-gray-900">沟通技巧</h1><p className="text-gray-600 mt-1">分龄沟通策略与话术指南</p></div>
      </div>
      <div className="bg-gradient-to-r from-pink-500 to-rose-600 rounded-2xl p-5 text-white">
        <h2 className="text-xl font-bold mb-2">沟通需要随年龄调整</h2>
        <p className="opacity-95">孩子的认知能力、情感需求和社会性发展随年龄变化。有效的沟通需要根据孩子的发育阶段调整策略，避免"一刀切"的教育方式。</p>
      </div>
      <div className="space-y-4">
        {COMMUNICATION_AGES.map((ageGroup) => (
          <motion.div key={ageGroup.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ageGroup.id * 0.1 }} className={`bg-white rounded-2xl shadow-md overflow-hidden border ${expandedAgeGroup === ageGroup.id ? 'border-pink-300' : 'border-gray-200'}`}>
            <button onClick={() => setExpandedAgeGroup(expandedAgeGroup === ageGroup.id ? null : ageGroup.id)} className="w-full p-4 flex items-start text-left">
              <div className="text-3xl mr-4 mt-1">{ageGroup.icon}</div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-900">{ageGroup.grade}</h3>
                <p className="text-gray-600 mt-1">{ageGroup.ageRange}</p>
              </div>
              <div className="ml-2 mt-1 text-xl">{expandedAgeGroup === ageGroup.id ? '−' : '+'}</div>
            </button>
            {expandedAgeGroup === ageGroup.id && (
              <div className="px-4 pb-4 pt-0 text-gray-700 space-y-4 border-t border-gray-100">
                <div>
                  <h4 className="font-bold text-pink-800 mb-2 flex items-center"><span className="text-xl mr-2">🧠</span> 发展特点</h4>
                  <ul className="space-y-1 pl-4 list-disc">{ageGroup.characteristics.map((item, index) => (<li key={index} className="text-gray-700">{item}</li>))}</ul>
                </div>
                <div>
                  <h4 className="font-bold text-amber-800 mb-2 flex items-center"><span className="text-xl mr-2">⚠️</span> 常见挑战</h4>
                  <ul className="space-y-1 pl-4 list-disc">{ageGroup.challenges.map((item, index) => (<li key={index} className="text-gray-700">{item}</li>))}</ul>
                </div>
                <div>
                  <h4 className="font-bold text-green-800 mb-2 flex items-center"><span className="text-xl mr-2">💡</span> 有效技巧</h4>
                  <ul className="space-y-2">{ageGroup.techniques.map((item, index) => (<li key={index} className="flex"><span className="text-green-500 mr-2 mt-1">✓</span><span>{item}</span></li>))}</ul>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h4 className="font-bold text-blue-800 mb-2 flex items-center"><span className="text-xl mr-2">💬</span> 话术示例</h4>
                  <div className="space-y-2">{ageGroup.examplePhrases.map((phrase, index) => (<div key={index} className="bg-white p-2 rounded border border-blue-200 italic text-blue-900">"{phrase}"</div>))}</div>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
      <button onClick={() => setShowAllPhrases(!showAllPhrases)} className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-4 rounded-2xl font-bold shadow-lg flex items-center justify-center">
        <span className="text-2xl mr-2">✨</span>{showAllPhrases ? "收起更多话术" : "查看更多心理学话术"}<span className="ml-2 text-xl">{showAllPhrases ? "−" : "+"}</span>
      </button>
      {showAllPhrases && (
        <div className="space-y-4">
          {COMMUNICATION_PHRASES.map((category) => (
            <motion.div key={category.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`bg-white rounded-2xl shadow-md overflow-hidden border ${expandedPhraseCategory === category.id ? 'border-purple-300' : 'border-gray-200'}`}>
              <button onClick={() => setExpandedPhraseCategory(expandedPhraseCategory === category.id ? null : category.id)} className="w-full p-4 flex items-start text-left">
                <div className="text-3xl mr-4 mt-1">{category.icon}</div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900">{category.title}</h3>
                  <p className="text-gray-600 mt-1">{category.description}</p>
                </div>
                <div className="ml-2 mt-1 text-xl">{expandedPhraseCategory === category.id ? '−' : '+'}</div>
              </button>
              {expandedPhraseCategory === category.id && (
                <div className="px-4 pb-4 pt-0 text-gray-700 space-y-3 border-t border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {category.phrases.map((phrase, index) => (<div key={index} className="bg-purple-50 p-3 rounded-lg border border-purple-200 italic text-purple-900">"{phrase}"</div>))}
                  </div>
                  <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <h4 className="font-bold text-amber-800 flex items-center"><span className="text-xl mr-2">🧠</span> 心理学原理</h4>
                    <p className="mt-1 text-amber-900 text-sm">{category.id === "general" && "基于积极心理学，强调关注积极行为而非问题行为"}{category.id === "homework" && "运用成长型思维模式，关注过程而非结果"}{category.id === "frustration" && "基于韧性培养理论，将挫折视为学习机会"}{category.id === "anxiety" && "结合认知行为疗法，通过认知重构缓解焦虑"}{category.id === "encouragement" && "培养自我效能感，建立积极的自我对话模式"}{category.id === "connection" && "基于依附理论，强化安全型亲子关系"}</p>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
      <div className="bg-white rounded-2xl p-5 shadow-md border border-purple-100">
        <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center"><span className="text-2xl mr-2">🔑</span> 跨年龄段核心原则</h2>
        <ul className="space-y-3 text-gray-700">
          <li className="flex"><span className="bg-purple-100 text-purple-800 rounded-full w-6 h-6 flex items-center justify-center mr-2 text-sm font-bold">1</span><span><strong>先处理情绪，再处理事情：</strong>无论哪个年龄段，当孩子情绪激动时，先帮助平静下来再讨论问题</span></li>
          <li className="flex"><span className="bg-purple-100 text-purple-800 rounded-full w-6 h-6 flex items-center justify-center mr-2 text-sm font-bold">2</span><span><strong>描述行为而非评判人格：</strong>说"这道题的计算有错误"而非"你怎么这么粗心"</span></li>
          <li className="flex"><span className="bg-purple-100 text-purple-800 rounded-full w-6 h-6 flex items-center justify-center mr-2 text-sm font-bold">3</span><span><strong>关注进步而非完美：</strong>强调"比昨天进步了"而非"为什么不是 100 分"</span></li>
          <li className="flex"><span className="bg-purple-100 text-purple-800 rounded-full w-6 h-6 flex items-center justify-center mr-2 text-sm font-bold">4</span><span><strong>以身作则：</strong>展示如何管理自己的情绪，孩子会通过观察学习</span></li>
        </ul>
      </div>
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-5 text-white text-center">
        <h2 className="text-xl font-bold mb-2">实践建议</h2>
        <p className="opacity-95 mb-4">选择 1-2 个适合孩子当前年龄段的技巧开始实践，坚持 21 天形成习惯。记住：没有完美的父母，只有不断进步的父母。</p>
        <button onClick={() => { setResourceDetail(null); setActiveTab("home"); }} className="bg-white text-emerald-800 font-bold px-6 py-3 rounded-xl shadow-lg">应用到今天的辅导中</button>
      </div>
    </div>
  );
  
  const renderVoiceSettings = () => (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
        <div>9:41</div>
        <div className="flex space-x-1"><span>📶</span><span>🔋 87%</span></div>
      </div>
      <div className="flex items-center mb-6">
        <button onClick={() => setShowVoiceSettings(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">←</button>
        <div><h1 className="text-2xl font-bold text-gray-900">语音关键词设置</h1><p className="text-gray-600 mt-1">自定义情绪升级提醒</p></div>
      </div>
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-5 text-white">
        <h2 className="text-xl font-bold mb-2 flex items-center"><span className="text-2xl mr-2">🎯</span> 智能语音干预</h2>
        <p className="opacity-95">当您说到预设的威胁性或人身攻击话语时，系统会自动提醒您。提醒方式可自定义，帮助您及时觉察并调整情绪状态。</p>
      </div>
      <div className="bg-white rounded-2xl p-4 shadow-md border border-indigo-100">
        <h3 className="text-lg font-bold text-gray-900 mb-3">🔔 提醒方式</h3>
        <div className="space-y-3">
          <button onClick={() => setAlertType("voice")} className={`w-full p-4 rounded-xl border-2 flex items-center justify-between ${alertType === "voice" ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'}`}>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3"><span className="text-xl">🔊</span></div>
              <div className="text-left"><div className="font-medium text-gray-900">语音提醒</div><div className="text-xs text-gray-500">播放录制好的提醒语音</div></div>
            </div>
            {alertType === "voice" && (<div className="text-indigo-600 text-xl">✓</div>)}
          </button>
          <button onClick={() => setAlertType("vibration")} className={`w-full p-4 rounded-xl border-2 flex items-center justify-between ${alertType === "vibration" ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'}`}>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3"><span className="text-xl">📳</span></div>
              <div className="text-left"><div className="font-medium text-gray-900">震动提醒</div><div className="text-xs text-gray-500">手机震动提醒</div></div>
            </div>
            {alertType === "vibration" && (<div className="text-indigo-600 text-xl">✓</div>)}
          </button>
          <button onClick={() => setAlertType("aiCall")} className={`w-full p-4 rounded-xl border-2 flex items-center justify-between ${alertType === "aiCall" ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'}`}>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3"><span className="text-xl">📞</span></div>
              <div className="text-left"><div className="font-medium text-gray-900">AI 助手来电</div><div className="text-xs text-gray-500">模拟来电提醒</div></div>
            </div>
            {alertType === "aiCall" && (<div className="text-indigo-600 text-xl">✓</div>)}
          </button>
        </div>
      </div>
      {alertType === "voice" && (
        <>
          <div className="bg-white rounded-2xl p-4 shadow-md border border-indigo-100">
            <h3 className="text-lg font-bold text-gray-900 mb-3">🎤 录制提醒语音</h3>
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 mb-2 block">录制人</label>
              <div className="flex space-x-3">
                <button onClick={() => setRecordingSource("self")} className={`flex-1 py-3 rounded-xl border-2 font-medium ${recordingSource === "self" ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600'}`}>👤 我自己</button>
                <button onClick={() => setRecordingSource("partner")} className={`flex-1 py-3 rounded-xl border-2 font-medium ${recordingSource === "partner" ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600'}`}>👫 伴侣</button>
                <button onClick={() => setRecordingSource("child")} className={`flex-1 py-3 rounded-xl border-2 font-medium ${recordingSource === "child" ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600'}`}>🧒 孩子</button>
              </div>
            </div>
            <div className="bg-indigo-50 p-4 rounded-xl mb-4">
              <p className="text-sm text-indigo-900 mb-2">💡 建议录制内容：</p>
              <p className="text-xs text-indigo-700 italic">{recordingSource === "self" && "亲爱的，深呼吸，孩子需要的是你的耐心，不是你的脾气。"}{recordingSource === "partner" && "老公/老婆，先停一下，我们一起想办法，别着急。"}{recordingSource === "child" && "爸爸/妈妈，我知道你爱我，我们可以慢慢来吗？"}</p>
            </div>
            <button onClick={handleRecording} className={`w-full py-4 rounded-xl font-bold flex items-center justify-center ${isRecording ? 'bg-red-500 text-white animate-pulse' : hasCustomRecording ? 'bg-green-500 text-white' : 'bg-indigo-600 text-white'}`}>
              {isRecording ? (<><span className="text-2xl mr-2">🔴</span>录制中... (3 秒)</>) : hasCustomRecording ? (<><span className="text-2xl mr-2">✓</span>重新录制</>) : (<><span className="text-2xl mr-2">🎤</span>点击录制提醒语音</>)}
            </button>
            {hasCustomRecording && (<button className="w-full mt-3 py-3 rounded-xl font-medium border-2 border-indigo-300 text-indigo-700 hover:bg-indigo-50">▶️ 试听录音</button>)}
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-md border border-indigo-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">📝 监控关键词</h3>
              <button className="text-indigo-600 text-sm font-medium flex items-center"><span className="text-xl mr-1">+</span>添加新词</button>
            </div>
            <div className="space-y-3">
              {voiceKeywords.map((kw) => (
                <div key={kw.id} className={`p-3 rounded-xl border-2 flex items-center justify-between ${kw.enabled ? 'border-indigo-200 bg-indigo-50' : 'border-gray-200 bg-gray-50'}`}>
                  <div className="flex items-center flex-1">
                    <div className={`w-3 h-3 rounded-full mr-3 ${kw.enabled ? 'bg-indigo-500' : 'bg-gray-300'}`}></div>
                    <span className={`font-medium ${kw.enabled ? 'text-gray-900' : 'text-gray-400'}`}>"{kw.keyword}"</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button onClick={() => toggleKeyword(kw.id)} className={`px-3 py-1 rounded-lg text-xs font-medium ${kw.enabled ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}>{kw.enabled ? '已启用' : '已禁用'}</button>
                    <button onClick={() => deleteKeyword(kw.id)} className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200">✕</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-sm text-amber-800"><span className="font-medium">⚠️ 隐私说明：</span> 所有语音识别仅在本地设备处理，不会上传到云端。系统只检测预设关键词，不记录完整对话内容。</p>
            </div>
          </div>
        </>
      )}
      <button onClick={() => { setShowVoiceSettings(false); }} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-indigo-700 transition-colors">保存设置</button>
    </div>
  );
  
  const renderProfileTab = () => {
    if (resourceDetail === 'psychology') return renderPsychologyDetail();
    if (resourceDetail === 'communication') return renderCommunicationDetail();
    if (showVoiceSettings) return renderVoiceSettings();
    if (showUserGuide) return renderUserGuide();
    if (showFAQ) return renderFAQ();
    
    return (
      <div className="p-4 space-y-6">
        <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
          <div>9:41</div>
          <div className="flex space-x-1"><span>📶</span><span>🔋 87%</span></div>
        </div>
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white text-center">
          <div className="w-20 h-20 bg-white rounded-full mx-auto flex items-center justify-center text-4xl mb-3">👨</div>
          <h1 className="text-2xl font-bold">张爸爸</h1>
          <p className="opacity-90 mt-1">辅导小明作业 127 天</p>
          <div className="mt-3 flex justify-center space-x-4">
            <div className="text-center"><div className="font-bold text-xl">86%</div><div className="text-xs opacity-90">平静率</div></div>
            <div className="text-center"><div className="font-bold text-xl">24</div><div className="text-xs opacity-90">成功干预</div></div>
            <div className="text-center"><div className="font-bold text-xl">12</div><div className="text-xs opacity-90">进步天数</div></div>
          </div>
        </div>
        
        {/* Error and success messages */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3"><span className="text-xl">⚠️</span></div>
              <p className="font-medium">{errorMessage}</p>
            </div>
          </div>
        )}
        
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-green-700">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3"><span className="text-xl">✓</span></div>
              <p className="font-medium">{successMessage}</p>
            </div>
          </div>
        )}
        <div className="bg-white rounded-2xl p-4 shadow-md border border-purple-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center"><span className="text-2xl mr-2">👥</span> 家庭连接</h2>
          {partnerConnected ? (
            <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-3"><span className="text-2xl">👤</span></div>
                  <div><h3 className="font-medium text-purple-900">已连接伴侣设备</h3><p className="text-sm text-purple-700 mt-1">数据同步中 • 家庭对比已启用</p></div>
                </div>
                <div className="text-green-600 text-xl">✓</div>
              </div>
              <button onClick={() => setShowPartnerComparison(true)} className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition-colors">查看家庭情绪对比</button>
              <button onClick={() => setPartnerConnected(false)} className="w-full mt-2 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors">断开连接</button>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-gray-600 mb-3">连接伴侣设备，开启家庭情绪对比功能</p>
              <button 
                onClick={searchPartnerDevices} 
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors"
                disabled={isSearching}
              >
                {isSearching ? '搜索中...' : '搜索伴侣设备'}
              </button>
            </div>
          )}
        </div>
        
        {/* Device search results */}
        {showDeviceList && (
          <div className="bg-white rounded-2xl p-4 shadow-md border border-indigo-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">发现的设备</h3>
              <button onClick={() => setShowDeviceList(false)} className="text-gray-500">✕</button>
            </div>
            <div className="space-y-3">
              {foundDevices.map((device) => (
                <div key={device.id} className="p-3 bg-gray-50 rounded-xl flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-3"><span className="text-xl">📱</span></div>
                    <div>
                      <h4 className="font-medium">{device.name}</h4>
                      <p className="text-xs text-gray-500">信号强度: {device.signal}%</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => pairPartnerDevice(device)} 
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                    disabled={isPairing}
                  >
                    配对
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Pairing progress */}
        {isPairing && pairingDevice && (
          <div className="bg-white rounded-2xl p-4 shadow-md border border-indigo-100">
            <div className="text-center">
              <div className="text-4xl mb-3">🔗</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">正在配对 {pairingDevice.name}</h3>
              <p className="text-gray-600 mb-4">请稍候，正在建立连接...</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-indigo-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
            </div>
          </div>
        )}
        <div className="bg-white rounded-2xl p-4 shadow-md border border-cyan-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center"><span className="text-2xl mr-2">❤️</span> 健康设备连接</h2>
          <div className="space-y-4">
            {healthDevices.map((device) => (
              <div key={device.id} className={`flex items-center justify-between p-3 ${device.connected ? 'bg-cyan-50' : 'bg-gray-50'} rounded-xl`}>
                <div className="flex items-center">
                  <div className={`w-10 h-10 ${device.connected ? 'bg-cyan-100' : 'bg-gray-200'} rounded-full flex items-center justify-center mr-3`}>
                    {device.type === 'smartwatch' && <span className="text-xl">⌚</span>}
                    {device.type === 'fitness' && <span className="text-xl">🏃</span>}
                    {device.type === 'blood-pressure' && <span className="text-xl">🩺</span>}
                    {!['smartwatch', 'fitness', 'blood-pressure'].includes(device.type) && <span className="text-xl">📱</span>}
                  </div>
                  <div>
                    <h3 className="font-medium">{device.name}</h3>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <span>{device.connected ? '已连接' : '未连接'}</span>
                      {device.connected && <span className="mx-1">•</span>}
                      {device.connected && <span>电量: {device.battery}%</span>}
                      {device.connected && <span className="mx-1">•</span>}
                      {device.connected && <span>实时同步</span>}
                    </div>
                  </div>
                </div>
                {device.connected ? (
                  <button 
                    onClick={() => disconnectHealthDevice(device.id)} 
                    className="bg-red-100 text-red-700 text-xs font-medium px-3 py-1 rounded-full"
                  >
                    断开
                  </button>
                ) : (
                  <button 
                    onClick={() => connectHealthDevice(device.id)} 
                    className="bg-indigo-100 text-indigo-700 text-xs font-medium px-3 py-1 rounded-full"
                    disabled={isConnecting}
                  >
                    {isConnecting ? '连接中...' : '连接'}
                  </button>
                )}
              </div>
            ))}
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 mt-2">
              <div className="flex items-start">
                <div className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-1 text-xs">i</div>
                <p className="text-sm text-blue-800">连接健康设备后，应用将自动同步心率、血压和压力数据，提供更精准的情绪干预建议。</p>
              </div>
            </div>
            <button 
              onClick={() => setShowAddDevice(true)} 
              className="w-full mt-2 bg-cyan-50 text-cyan-800 py-3 rounded-xl font-bold border border-cyan-200 hover:bg-cyan-100 transition-colors"
            >
              + 添加其他健康设备
            </button>
          </div>
        </div>
        
        {/* Add health device modal */}
        {showAddDevice && (
          <div className="bg-white rounded-2xl p-4 shadow-md border border-indigo-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">添加健康设备</h3>
              <button onClick={() => setShowAddDevice(false)} className="text-gray-500">✕</button>
            </div>
            <div className="space-y-4">
              <p className="text-gray-600">选择设备类型：</p>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setSelectedDeviceType('smartwatch')} 
                  className={`p-4 rounded-xl border-2 ${selectedDeviceType === 'smartwatch' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'}`}
                >
                  <div className="text-3xl mb-2">⌚</div>
                  <div className="font-medium">智能手表</div>
                </button>
                <button 
                  onClick={() => setSelectedDeviceType('fitness')} 
                  className={`p-4 rounded-xl border-2 ${selectedDeviceType === 'fitness' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'}`}
                >
                  <div className="text-3xl mb-2">🏃</div>
                  <div className="font-medium">健身手环</div>
                </button>
                <button 
                  onClick={() => setSelectedDeviceType('blood-pressure')} 
                  className={`p-4 rounded-xl border-2 ${selectedDeviceType === 'blood-pressure' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'}`}
                >
                  <div className="text-3xl mb-2">🩺</div>
                  <div className="font-medium">血压计</div>
                </button>
                <button 
                  onClick={() => setSelectedDeviceType('other')} 
                  className={`p-4 rounded-xl border-2 ${selectedDeviceType === 'other' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'}`}
                >
                  <div className="text-3xl mb-2">📱</div>
                  <div className="font-medium">其他设备</div>
                </button>
              </div>
              <button 
                onClick={() => selectedDeviceType && addHealthDevice(selectedDeviceType)} 
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors"
                disabled={!selectedDeviceType || isConnecting}
              >
                {isConnecting ? '连接中...' : '添加设备'}
              </button>
            </div>
          </div>
        )}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">应用设置</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div><h3 className="font-medium">语音记录</h3><p className="text-sm text-gray-500 mt-1">自动检测情绪升级信号</p></div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={voiceDetection} onChange={handleParentVoiceToggle} className="sr-only peer" />
                  <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer ${voiceDetection ? 'bg-indigo-600' : ''} peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                </label>
              </div>
              <div onClick={() => setShowVoiceSettings(true)} className="flex items-center justify-between p-3 bg-indigo-50 rounded-xl hover:bg-indigo-100 cursor-pointer">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-3"><span className="text-xl">🎯</span></div>
                  <div><h3 className="font-medium text-indigo-900">干预设置</h3><p className="text-xs text-indigo-700 mt-1">自定义威胁性话语提醒</p></div>
                </div>
                <div className="text-indigo-600 text-xl">→</div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div><h3 className="font-medium">健康监测</h3><p className="text-sm text-gray-500 mt-1">连接设备后自动监测</p></div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={isMonitoring} onChange={toggleHealthMonitoring} className="sr-only peer" />
                  <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer ${isMonitoring ? 'bg-cyan-600' : ''} peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                </label>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div><h3 className="font-medium">健康数据提醒</h3><p className="text-sm text-gray-500 mt-1">心率异常时提醒</p></div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:bg-indigo-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </label>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div><h3 className="font-medium">隐私保护</h3><p className="text-sm text-gray-500 mt-1">所有数据仅存储在本设备</p></div>
                <span className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">本地存储</span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div><h3 className="font-medium">误报反馈</h3><p className="text-sm text-gray-500 mt-1">已标记 {falseAlarmCount} 次误报</p></div>
                <button onClick={() => setFalseAlarmCount(0)} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">重置计数</button>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">资源中心</h2>
            <div className="space-y-3">
              {[
                {
                icon: "📚", title: "使用指南", desc: "快速上手应用功能", action: () => setShowUserGuide(true)
              },
              {
                icon: "🧠", title: "心理学原理", desc: "了解背后科学依据", action: () => setResourceDetail('psychology')
              },
              {
                icon: "💬", title: "沟通技巧", desc: "分龄沟通策略与话术", action: () => setResourceDetail('communication')
              },
              {
                icon: "❓", title: "常见问题", desc: "解决使用疑问", action: () => setShowFAQ(true)
              }
              ].map((item, index) => (
                <div key={index} onClick={item.action || undefined} className={`flex items-center p-3 bg-gray-50 rounded-xl ${item.action ? 'hover:bg-indigo-50 cursor-pointer' : ''}`}>
                  <div className="text-2xl mr-3">{item.icon}</div>
                  <div><h3 className="font-medium">{item.title}</h3><p className="text-sm text-gray-500">{item.desc}</p></div>
                </div>
              ))}
            </div>
          </div>

        </div>
        <div className="text-center py-4 text-xs text-gray-500 border-t border-gray-100">
          <p>© 2026 情绪小助手 v1.8.0 (豆包 TTS)</p>
          <p className="mt-1">用心守护每一个家庭的温暖时光</p>
        </div>
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 font-sans max-w-md mx-auto">
      {/* Collaboration Panel */}

      
      {/* Privacy Popup */}
      <AnimatePresence>
        {showPrivacyPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🛡️</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">隐私协议</h2>
              </div>
              
              <div className="text-gray-700 space-y-4 mb-6">
                <p className="text-sm leading-relaxed">
                  欢迎使用产品前，请知悉：
                </p>
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <p className="text-sm leading-relaxed">
                    我们将通过手表传感器记录心率和血压数据，用于情绪波动提醒；
                  </p>
                  <p className="text-sm leading-relaxed">
                    语音记录功能默认开启，语音数据仅存储于本地设备，用于生成个性化提醒话术，不会上传至云端或共享给第三方；
                  </p>
                  <p className="text-sm leading-relaxed">
                    您可随时在"应用设置 - 语音记录"中关闭语音记录或调整相关权限。详细条款请查阅《用户协议》与《隐私政策》。
                  </p>
                </div>
              </div>
              
              <div className="flex items-center mb-6">
                <input
                  type="checkbox"
                  id="privacy-checkbox"
                  checked={privacyAccepted}
                  onChange={(e) => setPrivacyAccepted(e.target.checked)}
                  className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <label htmlFor="privacy-checkbox" className="ml-3 text-sm text-gray-700">
                  我已阅读并同意<span className="text-indigo-600 cursor-pointer hover:underline">《用户协议》</span>与<span className="text-indigo-600 cursor-pointer hover:underline">《隐私政策》</span>
                </label>
              </div>
              
              <button
                onClick={handlePrivacyAccept}
                disabled={!privacyAccepted}
                className={`w-full py-3 rounded-xl font-bold transition-all ${
                  privacyAccepted
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-lg'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                确认并继续
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="bg-white min-h-screen flex flex-col">
        <div className="flex-1 overflow-y-auto">
          {activeTab === "home" && renderHomeTab()}
          {activeTab === "health" && renderHealthTab()}
          {activeTab === "data" && renderDataTab()}
          {activeTab === "profile" && renderProfileTab()}
        </div>
        <div className="bg-white border-t border-gray-200">
          <div className="flex justify-around py-2">
            {[
              { id: "home", icon: "🏠", label: "首页" },
              { id: "health", icon: "❤️", label: "健康" },
              { id: "data", icon: "📊", label: "数据" },
              { id: "profile", icon: "👨", label: "我的" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id !== "profile") {
                    setResourceDetail(null);
                    setShowAllPhrases(false);
                    setExpandedPhraseCategory(null);
                  }
                  if (tab.id !== "data") {
                    setShowVoiceRecords(false);
                    setShowPartnerComparison(false);
                    setShowLearningManual(false);
                    setSelectedChapter(null);
                  }
                }}
                className={`flex flex-col items-center p-1.5 ${activeTab === tab.id ? "text-indigo-600" : "text-gray-500"}`}
              >
                <div className="text-xl mb-1">{tab.icon}</div>
                <span className="text-[10px] font-medium leading-tight">{tab.label}</span>
                {activeTab === tab.id && (<div className="w-6 h-0.5 bg-indigo-600 rounded-full mt-0.5"></div>)}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-black rounded-full opacity-20"></div>
    </div>
  );
}
