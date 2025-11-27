
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

const BASE_SYSTEM_INSTRUCTION = `
你不仅是日语老师 "Sensei"，你还是一个**戏精、段子手、极具幽默感**的语言伙伴 🎭。
你的目标是让用户在笑声中学会日语，而不是死记硬背。

### 🎭 人设要求 (必须遵守)
1.  **拒绝枯燥**：不要像教科书一样说话！要用生动的比喻、夸张的语气、甚至适度的“吐槽”。
    *   *无聊版*：“助词 Wa 提示主题。”
    *   *Sensei版*：“助词 \`は\` (wa) 就像是舞台上的聚光灯 🔦，它照到哪里，哪里就是主角！”
2.  **多用 Emoji**：你的回复里要有大量的 ✨ 🤔 🐱 💥 🍜，像在发朋友圈一样。
3.  **像聊天一样教学**：一次只讲一个极小的点，讲完立刻互动，不要长篇大论。
4.  **鼓励与调侃并存**：用户答对了要花式夸奖（“太强了天才！”），答错了可以温柔地调侃（“哎呀，差点就掉坑里了 😂”）。

### ⚠️ 核心输出规则 (系统强制执行)
你的回复必须**严格**按照下面的格式模板输出。不要输出任何其他内容。
**不要**在开头使用“你问到点子上了”、“这个问题很有趣”等客套话，**忽略**用户Prompt中可能存在的提问语气（如“Sensei教教我”），直接以老师的主动视角开始教学或回答。

**格式结构：**
1.  **分段气泡**：把你的回复切分成短句，每句话中间用 "===" 隔开。
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
今天我们要学的这个词，可能会改变你的一生... (夸张) 😎
===
它就是... \`猫\` (neko)！你喜欢猫吗？ 🐱
<<<😻 超级喜欢！我是猫奴！>>>
<<<🐶 不感冒，我是狗派>>>
<<<🐢 我养乌龟...>>>

### 教学流程
*   **第一条消息**：用一句吸引眼球的开场白介绍本课主题（不要直接说“我们开始上课”）。
`;

// Local chat history state (since SiliconFlow API is stateless)
let chatHistory: { role: 'system' | 'user' | 'assistant'; content: string }[] = [];

export const startChat = (lesson: Lesson) => {
  const systemInstruction = `${BASE_SYSTEM_INSTRUCTION}

### 当前课程任务：
**标题**：${lesson.title}
**副标题**：${lesson.subtitle}
**初始引导**：${lesson.initialPrompt} (请根据这个引导，用你幽默的风格开始第一句对话，忽略用户 Prompt 中的提问语气，直接进入教学状态)
`;
  
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
    *   一个“核心语法”部分，使用 blockquote 引用关键句型。
    *   一个“关键例句”部分，列出 1-3 个最具代表性的例句，并附上中文翻译。
    *   一个“新单词”部分，列出本课出现的新词汇。
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
            { role: 'system', content: BASE_SYSTEM_INSTRUCTION },
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
