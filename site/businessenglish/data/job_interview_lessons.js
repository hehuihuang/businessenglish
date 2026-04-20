const JOB_INTERVIEW_LESSONS = [
  {
    id: 'job-01',
    track: 'job_interview',
    number: 1,
    title: 'Behavioral Interview Preparation Framework',
    chinese_title: '行为面试准备框架',
    category: 'job_interview',
    tags: ['行为面试', 'STAR', '故事库'],
    related: ['job-05', 'job-07', 'job-10'],
    summary: '建立行为面试回答框架，提前准备可复用案例，提升面试稳定性。',
    sections: [
      {
        heading: '核心方法',
        items: [
          {
            term: 'Behavioral Question',
            chinese: '行为面试问题',
            definition: 'A question about what you did in a real past situation.',
            note: '常见开头：Tell me about a time when...',
            examples: [
              { en: 'Tell me about a time you handled a conflict.', zh: '请说说你如何处理一次冲突。' }
            ]
          },
          {
            term: 'STAR Method',
            chinese: 'STAR 回答法',
            definition: 'Situation, Task, Action, Result.',
            note: '重点讲清 Action 与 Result。',
            examples: [
              { en: 'I used STAR to keep my answers structured.', zh: '我用 STAR 让回答更有结构。' }
            ]
          }
        ]
      },
      {
        heading: '准备策略',
        items: [
          {
            term: 'Story Bank',
            chinese: '案例故事库',
            definition: 'A set of reusable interview stories.',
            note: '建议准备 8-10 个案例。',
            examples: [
              { en: 'One story can answer teamwork and leadership questions.', zh: '一个案例可以同时回答协作和领导力问题。' }
            ]
          },
          {
            term: 'Pressure Practice',
            chinese: '高压模拟练习',
            definition: 'Practice with time limits and follow-up questions.',
            note: '录音复盘可明显提升表达质量。',
            examples: [
              { en: 'Mock interviews helped me stay calm under pressure.', zh: '模拟面试帮助我在压力下保持冷静。' }
            ]
          }
        ]
      }
    ],
    source: {
      title: '如何準備行為面試｜BQ Interview Prep',
      videoId: '0xKLVJuBRCU',
      url: 'https://www.youtube.com/watch?v=0xKLVJuBRCU'
    }
  },
  {
    id: 'job-02',
    track: 'job_interview',
    number: 2,
    title: 'One-Hour Interview Listening Drill',
    chinese_title: '一小时面试英语听力训练',
    category: 'job_interview',
    tags: ['听力训练', '高频问答'],
    related: ['job-04', 'job-09'],
    summary: '通过高频英语面试问答训练听辨与反应，提升真实面试交流效率。',
    sections: [
      {
        heading: '高频问题',
        items: [
          {
            term: 'Can you introduce yourself?',
            chinese: '请介绍一下你自己',
            definition: 'An opening question about your profile and fit.',
            note: '回答建议 60-90 秒。',
            examples: [
              { en: 'I have five years of experience in software development.', zh: '我有五年软件开发经验。' }
            ]
          },
          {
            term: 'What are your key strengths?',
            chinese: '你的核心优势是什么？',
            definition: 'A question about role-relevant strengths.',
            note: '优势要配案例，不要空谈。',
            examples: [
              { en: 'My strengths include problem-solving and communication.', zh: '我的优势是解决问题和沟通能力。' }
            ]
          }
        ]
      },
      {
        heading: '回答句型',
        items: [
          {
            term: 'I prioritize tasks based on urgency.',
            chinese: '我会按紧急程度安排优先级',
            definition: 'A useful sentence for deadline questions.',
            note: '可补充“工具 + 结果”。',
            examples: [
              { en: 'I prioritize tasks based on urgency and business impact.', zh: '我根据紧急程度和业务影响排优先级。' }
            ]
          },
          {
            term: 'I am working on improving...',
            chinese: '我正在提升...',
            definition: 'A balanced answer pattern for weakness questions.',
            note: '务必补充改进动作。',
            examples: [
              { en: 'I am improving my public speaking through weekly practice.', zh: '我通过每周练习提升公开表达能力。' }
            ]
          }
        ]
      }
    ],
    source: {
      title: '保母級聽力訓練｜一次聽懂求職面試的所有英語對話',
      videoId: '1SiBJjYK_FU',
      url: 'https://www.youtube.com/watch?v=1SiBJjYK_FU'
    }
  },
  {
    id: 'job-03',
    track: 'job_interview',
    number: 3,
    title: 'Top WFH Interview Questions',
    chinese_title: '远程岗位面试高频题',
    category: 'job_interview',
    tags: ['WFH', '远程办公', '自我介绍'],
    related: ['job-04', 'job-08'],
    summary: '聚焦远程岗位常见面试题，建立“背景-价值-动机”回答结构。',
    sections: [
      {
        heading: '关键问题',
        items: [
          {
            term: 'Tell me about yourself',
            chinese: '请介绍你自己',
            definition: 'An open question about your profile and personality.',
            note: '不要变成人生流水账。',
            examples: [
              { en: 'I have worked in tech operations and customer support.', zh: '我在技术运营和客户支持领域有相关经验。' }
            ]
          },
          {
            term: 'Why should we hire you?',
            chinese: '为什么录用你？',
            definition: 'A direct question about your unique value.',
            note: '建议 2-3 条能力 + 证据。',
            examples: [
              { en: 'I combine strong execution with proactive communication.', zh: '我兼具执行力和主动沟通能力。' }
            ]
          }
        ]
      },
      {
        heading: '回答结构',
        items: [
          {
            term: 'Background - Value - Motivation',
            chinese: '背景-价值-动机',
            definition: 'A concise structure for interview answers.',
            note: '适合 60 秒以内回答。',
            examples: [
              { en: 'My background is operations, and I bring process ownership.', zh: '我的背景是运营管理，能带来流程主人翁意识。' }
            ]
          },
          {
            term: 'Role-Relevant Storytelling',
            chinese: '岗位相关叙事',
            definition: 'Only share stories relevant to the target role.',
            note: '每句话都要回答“和岗位有什么关系”。',
            examples: [
              { en: 'I focused on examples related to remote collaboration.', zh: '我重点讲了远程协作相关经历。' }
            ]
          }
        ]
      }
    ],
    source: {
      title: 'TOP INTERVIEW QUESTIONS FOR WFH | Tell Me About Yourself',
      videoId: '8-qBR8PQzI4',
      url: 'https://www.youtube.com/watch?v=8-qBR8PQzI4'
    }
  },
  {
    id: 'job-04',
    track: 'job_interview',
    number: 4,
    title: 'Common English Interview Questions',
    chinese_title: '英语面试常见问题',
    category: 'job_interview',
    tags: ['英语面试', '高频问题'],
    related: ['job-02', 'job-03', 'job-06'],
    summary: '系统梳理英语面试开场题与动机题，给出可复用表达模板。',
    sections: [
      {
        heading: '开场与动机题',
        items: [
          {
            term: 'How would you describe yourself?',
            chinese: '你会如何描述自己？',
            definition: 'A question testing self-awareness and communication.',
            note: '可从性格、能力、方向回答。',
            examples: [
              { en: 'I am an outgoing person who enjoys teamwork.', zh: '我是一个外向且乐于协作的人。' }
            ]
          },
          {
            term: 'Why do you want to work for us?',
            chinese: '你为什么想来我们公司？',
            definition: 'A fit question about company research and alignment.',
            note: '回答中加入对公司具体理解。',
            examples: [
              { en: 'I admire your customer-focused product strategy.', zh: '我认可贵公司以客户为中心的产品策略。' }
            ]
          }
        ]
      },
      {
        heading: '高分原则',
        items: [
          {
            term: 'Use Evidence',
            chinese: '用证据说话',
            definition: 'Support every claim with a specific example.',
            note: '不要只说“我很擅长”。',
            examples: [
              { en: 'I improved handoff quality by introducing weekly demos.', zh: '我通过每周演示机制提升了交接质量。' }
            ]
          },
          {
            term: 'Keep Answers Concise',
            chinese: '保持简洁回答',
            definition: 'Short and focused answers are more persuasive.',
            note: '建议单题 60-120 秒。',
            examples: [
              { en: 'I gave one clear story with measurable impact.', zh: '我给出一个清晰且可量化的案例。' }
            ]
          }
        ]
      }
    ],
    source: {
      title: "Common Questions You'll Be Asked During An English Job Interview",
      videoId: '-AOQl94ZYn8',
      url: 'https://www.youtube.com/watch?v=-AOQl94ZYn8'
    }
  },
  {
    id: 'job-05',
    track: 'job_interview',
    number: 5,
    title: 'Five Core Questions in International Company Interviews',
    chinese_title: '外商面试五大核心问题',
    category: 'job_interview',
    tags: ['外商面试', '优缺点'],
    related: ['job-01', 'job-04', 'job-10'],
    summary: '从面试官角度理解优缺点、录用理由等问题，强调岗位定制化回答。',
    sections: [
      {
        heading: '面试官视角',
        items: [
          {
            term: 'Think from Company Perspective',
            chinese: '从公司视角作答',
            definition: 'Show how you solve business problems for the company.',
            note: '从“我想要什么”转为“我能带来什么”。',
            examples: [
              { en: 'I explained how I can solve your current team bottlenecks.', zh: '我说明了如何解决团队当前瓶颈。' }
            ]
          },
          {
            term: 'No Universal Perfect Answer',
            chinese: '没有通用标准答案',
            definition: 'Good answers are personalized and role-specific.',
            note: '避免照搬模板。',
            examples: [
              { en: 'I tailored my strengths to match this specific role.', zh: '我根据岗位需求定制了优势表达。' }
            ]
          }
        ]
      },
      {
        heading: '优缺点回答',
        items: [
          {
            term: 'Strengths from Job Description',
            chinese: '优势对齐岗位 JD',
            definition: 'Select strengths according to role requirements.',
            note: '优先展示岗位最关注能力。',
            examples: [
              { en: 'My strongest fit for this role is stakeholder communication.', zh: '对该岗位最匹配的是我的跨方沟通能力。' }
            ]
          },
          {
            term: 'Weakness + Improvement',
            chinese: '缺点 + 改进动作',
            definition: 'Show self-awareness and active improvement.',
            note: '回答结构：问题-动作-进展。',
            examples: [
              { en: 'I used to overcommit, so now I prioritize weekly.', zh: '我过去会过度承诺，现在会每周优先级规划。' }
            ]
          }
        ]
      }
    ],
    source: {
      title: '外商公司最常見的 5 個面試問題！前麥肯錫面試官分享',
      videoId: 'BAA9uOi0LsI',
      url: 'https://www.youtube.com/watch?v=BAA9uOi0LsI'
    }
  },
  {
    id: 'job-06',
    track: 'job_interview',
    number: 6,
    title: "English Job Interview Dos and Don'ts",
    chinese_title: '英语面试该做与不该做',
    category: 'job_interview',
    tags: ['面试礼仪', '流程'],
    related: ['job-04', 'job-08'],
    summary: '从寒暄开场到正式答题，梳理英语面试中的高频加分与减分动作。',
    sections: [
      {
        heading: 'Dos',
        items: [
          {
            term: 'Polite Small Talk',
            chinese: '礼貌寒暄',
            definition: 'Use short and friendly opening conversation.',
            note: '寒暄简短，不偏离主题。',
            examples: [
              { en: "It's my pleasure. Thank you for meeting with me today.", zh: '很高兴见到您，感谢今天安排面试。' }
            ]
          },
          {
            term: 'Structured Answers',
            chinese: '结构化回答',
            definition: 'Organize answers with clear logic.',
            note: '先结论，再过程，再结果。',
            examples: [
              { en: 'First I analyzed the issue, then aligned the team, then delivered.', zh: '我先分析问题，再对齐团队，最后完成交付。' }
            ]
          }
        ]
      },
      {
        heading: "Don'ts",
        items: [
          {
            term: 'Avoid Long Unfocused Stories',
            chinese: '避免冗长且无重点',
            definition: 'Long unfocused answers hurt clarity.',
            note: '每题围绕一个核心案例。',
            examples: [
              { en: 'I now answer with one scenario and one clear impact.', zh: '我现在每题只讲一个场景和一个清晰结果。' }
            ]
          },
          {
            term: 'Avoid Scripted Tone',
            chinese: '避免机械背稿',
            definition: 'Over-memorized answers sound inauthentic.',
            note: '记框架，不逐字背诵。',
            examples: [
              { en: 'I practiced key points but kept my wording natural.', zh: '我练的是要点，表达保持自然。' }
            ]
          }
        ]
      }
    ],
    source: {
      title: "English Job Interview Dos & Don'ts! | English Conversation Practice",
      videoId: '-JNjsOX0N0c',
      url: 'https://www.youtube.com/watch?v=-JNjsOX0N0c'
    }
  },
  {
    id: 'job-07',
    track: 'job_interview',
    number: 7,
    title: 'Behavioral Interview for Software Developers',
    chinese_title: '软件工程师行为面试',
    category: 'job_interview',
    tags: ['软件工程师', '行为面试'],
    related: ['job-01', 'job-09', 'job-10'],
    summary: '针对工程师行为面试，强化冲突处理、项目复盘与技术沟通表达。',
    sections: [
      {
        heading: '工程师高频题',
        items: [
          {
            term: 'Conflict with Teammates',
            chinese: '团队冲突处理',
            definition: 'Questions evaluating collaboration under disagreement.',
            note: '重点讲如何达成共识。',
            examples: [
              { en: 'I aligned on goals first and then proposed a compromise plan.', zh: '我先对齐目标，再提出折中方案。' }
            ]
          },
          {
            term: 'Technical Suggestion and Impact',
            chinese: '技术建议与影响',
            definition: 'Show initiative and measurable outcomes.',
            note: '讲“建议前后”的变化。',
            examples: [
              { en: 'I suggested caching optimization and reduced response time by 25%.', zh: '我建议缓存优化，将响应时间降低了25%。' }
            ]
          }
        ]
      },
      {
        heading: '准备技巧',
        items: [
          {
            term: 'Prepare Reusable Stories',
            chinese: '准备可复用案例',
            definition: 'Prepare examples covering teamwork, ownership, and failure.',
            note: '可复用比临场硬想更稳定。',
            examples: [
              { en: 'I prepared stories for leadership, conflict, and execution.', zh: '我准备了领导力、冲突和执行类案例。' }
            ]
          },
          {
            term: 'Paint a Clear Picture',
            chinese: '讲清情境与动作',
            definition: 'Use concrete context and decisions.',
            note: '具体但不啰嗦。',
            examples: [
              { en: 'I explained the constraints, options, and final decision.', zh: '我清晰说明了约束、选项和最终决策。' }
            ]
          }
        ]
      }
    ],
    source: {
      title: 'Cracking the Behavioral Interview for Software Developers',
      videoId: 'ld0cvWnrVsU',
      url: 'https://www.youtube.com/watch?v=ld0cvWnrVsU'
    }
  },
  {
    id: 'job-08',
    track: 'job_interview',
    number: 8,
    title: 'Virtual Interview Success Checklist',
    chinese_title: '线上面试通关清单',
    category: 'job_interview',
    tags: ['线上面试', 'Zoom', '准备清单'],
    related: ['job-03', 'job-06'],
    summary: '整理线上面试前中后关键动作：软件测试、网络检查、环境布置和沟通礼仪。',
    sections: [
      {
        heading: '技术与环境准备',
        items: [
          {
            term: 'Test Software 24h Earlier',
            chinese: '至少提前24小时测试软件',
            definition: 'Install and test interview platform in advance.',
            note: '避免临开场技术故障。',
            examples: [
              { en: 'I tested Zoom settings one day before the interview.', zh: '我在面试前一天完成 Zoom 设置测试。' }
            ]
          },
          {
            term: 'Network and Device Check',
            chinese: '网络与设备检查',
            definition: 'Ensure stable internet and fully charged device.',
            note: '准备热点作为备用方案。',
            examples: [
              { en: 'I prepared a mobile hotspot as a backup.', zh: '我准备了手机热点作为备用。' }
            ]
          }
        ]
      },
      {
        heading: '线上沟通细节',
        items: [
          {
            term: 'Log in Early',
            chinese: '提前登录',
            definition: 'Join the meeting around 10 minutes early.',
            note: '预留缓冲时间应对突发问题。',
            examples: [
              { en: 'I logged in early and did a final audio check.', zh: '我提前登录并完成最后音频检查。' }
            ]
          },
          {
            term: 'Professional Camera Presence',
            chinese: '保持镜头中的职业状态',
            definition: 'Use eye-level camera and front lighting.',
            note: '避免背光与视线漂移。',
            examples: [
              { en: 'I kept eye contact with the camera while answering.', zh: '回答时我保持与摄像头的视线接触。' }
            ]
          }
        ]
      }
    ],
    source: {
      title: 'TOP 10 VIRTUAL JOB INTERVIEW TIPS!',
      videoId: 'PpbhaVjV2QI',
      url: 'https://www.youtube.com/watch?v=PpbhaVjV2QI'
    }
  },
  {
    id: 'job-09',
    track: 'job_interview',
    number: 9,
    title: 'Backend Developer Interview Dialogue Practice',
    chinese_title: '后端开发面试对话训练',
    category: 'job_interview',
    tags: ['程序员面试', '后端开发', '口语对话'],
    related: ['job-02', 'job-07', 'job-10'],
    summary: '通过后端开发场景对话训练英文面试表达，覆盖背景介绍、技术沟通与协作叙述。',
    sections: [
      {
        heading: '技术岗位介绍',
        items: [
          {
            term: "I'm a back-end developer...",
            chinese: '我是后端开发工程师...',
            definition: 'A direct and role-specific self-introduction.',
            note: '可接“经验年限 + 技术方向”。',
            examples: [
              { en: "I'm a back-end developer focused on reliable APIs.", zh: '我是专注可靠 API 的后端工程师。' }
            ]
          },
          {
            term: 'Educational and Project Context',
            chinese: '教育背景与项目语境',
            definition: 'Link your education and projects to role relevance.',
            note: '讲与岗位最相关的学习和实践。',
            examples: [
              { en: 'My major focused on web development and programming.', zh: '我的专业方向是 Web 开发与编程。' }
            ]
          }
        ]
      },
      {
        heading: '互动表达',
        items: [
          {
            term: 'Clarify Before Answering',
            chinese: '先澄清后回答',
            definition: 'Ask brief clarifying questions when prompts are broad.',
            note: '体现结构化思考能力。',
            examples: [
              { en: 'Do you want a high-level overview or implementation details?', zh: '您希望我高层概述还是讲实现细节？' }
            ]
          },
          {
            term: 'Explain Trade-offs Clearly',
            chinese: '清晰解释技术取舍',
            definition: 'Compare options and explain final decisions.',
            note: '强调约束条件和业务影响。',
            examples: [
              { en: 'Given latency constraints, we prioritized caching first.', zh: '考虑延迟约束，我们优先优化了缓存。' }
            ]
          }
        ]
      }
    ],
    source: {
      title: '程序员面试英语｜后端开发面试对话',
      videoId: 'QKJ6YLXpLJM',
      url: 'https://www.youtube.com/watch?v=QKJ6YLXpLJM'
    }
  },
  {
    id: 'job-10',
    track: 'job_interview',
    number: 10,
    title: 'Top 10 Behavioral Questions for Software Engineers',
    chinese_title: '软件工程师行为面试十大问题',
    category: 'job_interview',
    tags: ['行为面试', '软件工程师', '高频题'],
    related: ['job-01', 'job-07', 'job-09'],
    summary: '总结工程师行为面试十大问题，帮助你建立可迁移、可量化的回答模式。',
    sections: [
      {
        heading: '问题类型',
        items: [
          {
            term: 'Project and Impact Question',
            chinese: '项目与影响问题',
            definition: 'Questions about your role, challenge, and measurable outcome.',
            note: '必须讲清个人贡献。',
            examples: [
              { en: 'I led API redesign and reduced failures by 40%.', zh: '我主导 API 重构，将故障率降低了40%。' }
            ]
          },
          {
            term: 'Disagreement Question',
            chinese: '分歧处理问题',
            definition: 'Questions testing collaboration and conflict management.',
            note: '体现倾听、协商和共识能力。',
            examples: [
              { en: 'We aligned on goals and used data to resolve disagreement.', zh: '我们先对齐目标，再用数据解决分歧。' }
            ]
          }
        ]
      },
      {
        heading: '高分答题策略',
        items: [
          {
            term: 'Short, Simple, Clear',
            chinese: '短、准、清',
            definition: 'Keep answers concise and easy to follow.',
            note: '确保面试官能记住一个核心点。',
            examples: [
              { en: 'I used one story and one measurable result per answer.', zh: '我每题只用一个案例和一个量化结果。' }
            ]
          },
          {
            term: 'Growth Mindset',
            chinese: '成长型思维',
            definition: 'Show what you learned and how you improved.',
            note: '失败题中重点讲改进机制。',
            examples: [
              { en: 'After the incident, I introduced a stronger review checklist.', zh: '事故后我建立了更严格的评审清单。' }
            ]
          }
        ]
      }
    ],
    source: {
      title: 'Top 10 Behavioral Software Engineering Interview Questions',
      videoId: 'T25I2FQ9Mok',
      url: 'https://www.youtube.com/watch?v=T25I2FQ9Mok'
    }
  }
];
