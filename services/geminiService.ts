


import { Lesson, Message } from "../types";

// Configuration for SiliconFlow
const API_URL = 'https://api.siliconflow.cn/v1/chat/completions';
// GUARANTEED: Using Qwen 2.5 72B Instruct Model as requested
const MODEL_NAME = 'Qwen/Qwen2.5-72B-Instruct'; 

// Manage API Key dynamically
// Priority: 1. Runtime set key (from modal) 2. Environment variable
let currentApiKey = process.env.API_KEY || '';

export const setApiKey = (key: string) => {
  currentApiKey = key;
};

export const hasApiKey = () => {
  return !!currentApiKey && currentApiKey.startsWith('sk-');
};

// FORMAT RULES (Immutable)
const CORE_OUTPUT_RULES = `
### ⚠️ 核心输出规则 (系统强制执行)
你的回复必须**严格**按照下面的格式模板输出。不要输出任何其他内容。
**不要**在开头使用“你问到点子上了”、“这个问题很有趣”等客套话，**忽略**用户Prompt中可能存在的提问语气（如“Sensei教教我”），直接以老师的主动视角开始教学或回答。

**格式结构：**
1.  **分段气泡 (CRITICAL)**：把你的回复切分成**极短的**句子（像微信聊天一样）。每句话中间用 "===" 隔开。
    *   **字数限制**：每个气泡的内容尽量控制在 **30字以内**，绝对不要超过 50 字。
    *   如果一句话很长，请在逗号或逻辑停顿处强制切开！
    *   *错误示范*：这个语法通常用于表示你想要做某事但是由于某种原因没有做成。
    *   *正确示范*：这个语法表示你想做某事... === 但是！=== 由于某种原因没做成。 😅
2.  **消息数量限制**：每次回复**最多输出 5 个气泡** (即 5 段)。
    *   如果内容很长，请切分！只讲前 4-5 句，然后停止。
    *   此时在选项里必须包含 \`<<<继续>>>\` 或 \`<<<举个例子>>>\` 让用户选择继续。
    *   **严禁**一次性刷屏。
3.  **日语高亮**：所有日语单词/句子必须用反引号 \` 包裹，例如 \`こんにちは\`。
4.  **神回复选项 (关键)**：在最后一行，必须提供 3 个**与刚才你说的话紧密相关**的回复选项。
    *   **选项必须是用户可能想说的话**。
    *   **禁止使用** “明白了”、“继续” 这种万能回复，除非真的很合适（或者因为内容太长需要翻页）。
    *   格式为 \`<<<选项内容>>>\`。

### ✅ 标准输出示例
嗨！准备好今天的日语大冒险了吗？ 🚀
===
今天我们要学的这个词...
===
可能会改变你的一生... (夸张) 😎
===
它就是... \`猫\` (neko)！
===
你喜欢猫吗？ 🐱
<<<😻 超级喜欢！我是猫奴！>>>
<<<🐶 不感冒，我是狗派>>>
<<<🐢 我养乌龟...>>>

### 教学流程
*   **第一条消息**：用一句吸引眼球的开场白介绍本课主题（不要直接说“我们开始上课”）。
`;

const DEFAULT_PERSONA_PROMPT = `
你不仅是日语老师 "Sensei"，你还是一个**戏精、段子手、极具幽默感**的语言伙伴 🎭。
你的目标是让用户在笑声中学会日语，而不是死记硬背。

### 🎭 人设要求
1.  **拒绝枯燥**：不要像教科书一样说话！要用生动的比喻、夸张的语气、甚至适度的“吐槽”。
    *   *Sensei版*：“助词 \`は\` (wa) 就像是舞台上的聚光灯 🔦，它照到哪里，哪里就是主角！”
2.  **多用 Emoji**：你的回复里要有大量的 ✨ 🤔 🐱 💥 🍜，像在发朋友圈一样。
3.  **像聊天一样教学**：一次只讲一个极小的点，讲完立刻互动，不要长篇大论。
4.  **鼓励与调侃并存**：用户答对了要花式夸奖（“太强了天才！”），答错了可以温柔地调侃（“哎呀，差点就掉坑里了 😂”）。
`;

const ROLEPLAY_SYSTEM_INSTRUCTION = `
你现在进入 **Roleplay Mode (实战演练模式)**。
你不再是单纯的老师，你需要**完全沉浸**在指定的角色中，与用户进行模拟对话。

### 🎭 你的角色设定
*   **角色**: {{ROLE}}
*   **场景**: {{SCENARIO}}
*   **用户目标**: {{OBJECTIVE}}

### ⚠️ 行为准则 (必须遵守)
1.  **沉浸式扮演**：从第一句话开始，你就是那个角色。不要说“好的，我们开始扮演”、“我是你的老师”等出戏的话。
2.  **日语对话**：默认使用**自然、地道**的日语与用户对话（根据角色的社会地位和性格调整敬语程度）。
3.  **适当反馈**：
    *   如果用户说得很好，自然地推进剧情。
    *   如果用户完全卡住或说错了导致沟通障碍，你可以**稍微出戏**（用括号或提示框）给一点中文提示，或者以角色的身份用更简单的日语重述。
    *   *例如*：(提示：试着说 "お勧めは何ですか？")
4.  **回复格式**：
    *   **模仿气泡聊天**：如果你要说多句话，请使用 "===" 分割，模拟聊天的气泡感。
    *   可以在台词后加括号描写动作或心理，增加临场感。例如：\`いらっしゃいませ！\` (擦着桌子走过来)
    *   **仍然**在最后提供 3 个 \`<<<选项>>>\`，作为用户的台词提示（日语），帮助他们接话。

### 🟢 开场
请直接以角色的身份说第一句话，引导用户开始场景。不要解释规则。
`;

// Local chat history state (since SiliconFlow API is stateless)
let chatHistory: { role: 'system' | 'user' | 'assistant'; content: string }[] = [];

export const startChat = (lesson: Lesson, personaPrompt?: string) => {
  let systemInstruction = '';

  if (lesson.mode === 'roleplay' && lesson.roleplayData) {
    systemInstruction = ROLEPLAY_SYSTEM_INSTRUCTION
      .replace('{{ROLE}}', lesson.roleplayData.role)
      .replace('{{SCENARIO}}', lesson.roleplayData.scenario)
      .replace('{{OBJECTIVE}}', lesson.roleplayData.objective);
      
    // Additional prompt context for the start
    systemInstruction += `\n用户的情境/开场白：${lesson.initialPrompt}`;
  } else {
    // Combine Persona Prompt + Core Rules
    const currentPersona = personaPrompt || DEFAULT_PERSONA_PROMPT;
    
    systemInstruction = `${currentPersona}

${CORE_OUTPUT_RULES}

### 当前课程任务：
**标题**：${lesson.title}
**副标题**：${lesson.subtitle}
**初始引导**：${lesson.initialPrompt} (请根据这个引导，用你的角色风格开始第一句对话，忽略用户 Prompt 中的提问语气，直接进入教学状态)
`;
  }
  
  // Reset history with the system prompt
  chatHistory = [
    { role: 'system', content: systemInstruction }
  ];

  return {}; 
};

export const sendMessageStream = async function* (message: string) {
  // Add user message to history
  chatHistory.push({ role: 'user', content: message });

  if (!currentApiKey) {
      throw new Error("MISSING_API_KEY");
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentApiKey}`
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: chatHistory,
        stream: true,
        temperature: 0.8,
        top_p: 0.95,
      }),
    });

    if (!response.ok) {
        if (response.status === 401) {
             throw new Error("INVALID_TOKEN");
        }
        const errText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errText}`);
    }

    if (!response.body) throw new Error("No response body");

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";
    let fullResponseText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;
      
      const lines = buffer.split("\n");
      buffer = lines.pop() || ""; // Keep the incomplete line in buffer

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine.startsWith("data: ")) continue;
        
        const dataStr = trimmedLine.slice(6);
        if (dataStr === "[DONE]") continue;

        try {
          const json = JSON.parse(dataStr);
          const content = json.choices[0]?.delta?.content || "";
          if (content) {
            fullResponseText += content;
            yield { text: content };
          }
        } catch (e) {
          console.warn("Failed to parse stream JSON", e);
        }
      }
    }

    // Add assistant response to history after stream finishes
    chatHistory.push({ role: 'assistant', content: fullResponseText });

  } catch (error) {
    console.error("SiliconFlow API Request Failed", error);
    throw error;
  }
};

export const parseContentWithOptions = (text: string) => {
  const optionRegex = /<<<((?:(?!>>>).)+)>>>/g;
  const options: string[] = [];
  
  let match;
  while ((match = optionRegex.exec(text)) !== null) {
    let rawContent = match[1].trim();
    rawContent = rawContent.replace(/^\[[^\]]+\]\s*/, '');
    options.push(rawContent);
  }

  const cleanText = text.replace(optionRegex, '').trim();
  return { cleanText, options };
};

// Browser Native TTS (Secure, runs on client)
export const generateSpeech = async (text: string, rate: number = 1.0): Promise<string> => {
    return new Promise((resolve, reject) => {
        if (!('speechSynthesis' in window)) {
            reject(new Error("Browser does not support TTS"));
            return;
        }

        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ja-JP';
        utterance.rate = rate; // Apply variable speed
        
        const voices = window.speechSynthesis.getVoices();
        const jaVoice = voices.find(v => v.lang.includes('ja'));
        if (jaVoice) utterance.voice = jaVoice;

        utterance.onend = () => {
            resolve("DONE");
        };

        utterance.onerror = (e) => {
            reject(e);
        };

        window.speechSynthesis.speak(utterance);
        resolve("BROWSER_NATIVE_TTS_PLAYING"); 
    });
};

export const explainText = async (text: string): Promise<string> => {
    if (!currentApiKey) throw new Error("MISSING_API_KEY");

    const prompt = `
你是一位专业的日语词典编纂者和资深日语教师。
请对以下文本进行**深度解析**，就像一本详细的辞典条目一样。

### 待解析文本：
『 ${text} 』

### 你的任务：
请严格按照以下 Markdown 格式输出解析内容（不要输出任何开场白）：

## 📖 释义
(给出地道、通顺的中文翻译)

## 🔍 语法/结构拆解
(详细分析句子结构、接续方式、核心语法点，如果包含动词变形请指出原形)

## 📚 核心词汇
(请以列表形式列出句子中的生词)
* **单词** (假名) [词性] : 含义

## 💡 语感与细节
(说明这句话的语气、使用场景、是否有弦外之音或文化背景)
    `;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentApiKey}`
            },
            body: JSON.stringify({
                model: MODEL_NAME,
                messages: [
                    { role: 'user', content: prompt }
                ],
                stream: false,
                temperature: 0.7,
            }),
        });

        if (!response.ok) {
            if (response.status === 401) throw new Error("INVALID_TOKEN");
            const errText = await response.text();
            throw new Error(`API Error: ${response.status} - ${errText}`);
        }

        const data = await response.json();
        const resultText = data.choices[0]?.message?.content;

        if (!resultText) {
            throw new Error("Failed to generate explanation.");
        }
        return resultText.trim();

    } catch (error) {
        console.error("Explanation API Failed", error);
        throw error;
    }
};

export const generateSummary = async (messages: Message[]): Promise<string> => {
  if (!currentApiKey) throw new Error("MISSING_API_KEY");

  const conversationHistory = messages
    .filter(msg => msg.type === 'chat')
    .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.text}`)
    .join('\n');

  const prompt = `
你是一位专业的日语教学助理。
请根据以下师生对话记录，为学生生成一份清晰、精炼的课程小结。

### 对话记录:
${conversationHistory}

### 你的任务:
1.  **识别核心知识点**：从对话中找出本次课程讲解的核心语法、关键句型和新单词。
2.  **结构化输出**：必须使用 Markdown 格式进行组织，严格遵循以下结构：
    *   一个 H2 标题 \`## ✅ 本课小结: [课程核心主题]\`
    *   请务必使用 **H3 (###)** 标题来标记以下三个板块（不要用加粗，要用标题）：
        *   \`### 核心语法\` (使用 blockquote 引用关键句型)
        *   \`### 关键例句\` (列出 1-3 个最具代表性的例句，并附上中文翻译)
        *   \`### 新单词\` (列出本课出现的新词汇)
3.  **标记发音**：在所有日语例句和单词上，使用反引号 \` 将其包裹。

只输出小结内容，不要说其他话。
`;

  try {
     const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentApiKey}`
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: [
            // Use simple instruction for summary to be objective
            { role: 'system', content: "You are a helpful Japanese language teaching assistant." },
            { role: 'user', content: prompt }
        ],
        stream: false, // No stream needed for summary
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
        if (response.status === 401) throw new Error("INVALID_TOKEN");
        throw new Error("Summary API failed");
    }
    
    const data = await response.json();
    const summaryText = data.choices[0]?.message?.content;

    if (!summaryText) {
        throw new Error("Failed to generate summary from API.");
    }
    return summaryText.trim();

  } catch (error) {
      console.error("Summary Generation Failed", error);
      throw error;
  }
};
