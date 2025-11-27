
import { Lesson, Message } from "../types";

// SiliconFlow Configuration
const API_KEY = "sk-xigfaeowojgqogfwgpysjkxnnxsxjkktnzpkctwqsubenpfo"; // Hardcoded as requested
const API_URL = "https://api.siliconflow.cn/v1/chat/completions";
const MODEL_ID = "Qwen/Qwen2.5-72B-Instruct"; // Upgraded from 7B to 72B for better performance

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

**格式结构：**
1.  **分段气泡**：把你的回复切分成短句，每句话中间用 "===" 隔开。让用户读起来像在收微信消息。
2.  **日语高亮**：所有日语单词/句子必须用反引号 \` 包裹，例如 \`こんにちは\`。
3.  **神回复选项 (关键)**：在最后一行，必须提供 3 个**与刚才你说的话紧密相关**的回复选项。
    *   **选项必须是用户可能想说的话**。
    *   **禁止使用** “明白了”、“继续” 这种万能回复，除非真的很合适。
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

### ❌ 错误示范
(错误：选项无关)
今天天气不错。
<<<好的>>>
<<<明白了>>>
<<<继续>>>

### 教学流程
*   **第一条消息**：用一句吸引眼球的开场白介绍本课主题（不要直接说“我们开始上课”）。
`;

// Simple history management
let chatHistory: { role: string; content: string }[] = [];
let currentSystemInstruction = "";

export const startChat = (lesson: Lesson) => {
  currentSystemInstruction = `${BASE_SYSTEM_INSTRUCTION}

### 当前课程任务：
**标题**：${lesson.title}
**副标题**：${lesson.subtitle}
**初始引导**：${lesson.initialPrompt} (请根据这个引导，用你幽默的风格开始第一句对话)
`;
  
  // Reset history
  chatHistory = [
    { role: "system", content: currentSystemInstruction }
  ];

  return {}; 
};

export const sendMessageStream = async function* (message: string) {
  // Add user message to history
  chatHistory.push({ role: "user", content: message });

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL_ID,
        messages: chatHistory,
        stream: true,
        max_tokens: 512,
        temperature: 0.8, // Increased slightly for more creativity/humor
        top_p: 0.8,
        top_k: 60,
        frequency_penalty: 0.6, // Higher penalty to avoid repetitive phrases
        n: 1,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`SiliconFlow API Error: ${response.status} - ${err}`);
    }

    if (!response.body) throw new Error("No response body");

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";
    let fullAssistantMessage = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("data: ")) {
          const dataStr = trimmed.slice(6);
          if (dataStr === "[DONE]") continue;
          
          try {
            const json = JSON.parse(dataStr);
            const content = json.choices[0]?.delta?.content || "";
            if (content) {
              fullAssistantMessage += content;
              yield { text: content } as any;
            }
          } catch (e) {
            console.warn("Error parsing stream chunk", e);
          }
        }
      }
    }

    // Add model response to history
    chatHistory.push({ role: "assistant", content: fullAssistantMessage });

  } catch (error) {
    console.error("API Request Failed", error);
    throw error;
  }
};

export const parseContentWithOptions = (text: string) => {
  const optionRegex = /<<<((?:(?!>>>).)+)>>>/g;
  const options: string[] = [];
  
  let match;
  while ((match = optionRegex.exec(text)) !== null) {
    let rawContent = match[1].trim();
    rawContent = rawContent.replace(/^\[[^\]]+\]\s*/, ''); // Remove any potential brackets like [Option]
    options.push(rawContent);
  }

  const cleanText = text.replace(optionRegex, '').trim();
  return { cleanText, options };
};

// Browser Native TTS (No Key Required)
export const generateSpeech = async (text: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        if (!('speechSynthesis' in window)) {
            reject(new Error("Browser does not support TTS"));
            return;
        }

        // Cancel any current speaking
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ja-JP'; // Set to Japanese
        utterance.rate = 0.9; // Slightly slower for learners
        
        // Try to find a Japanese voice
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

export const generateSummary = async (messages: Message[]): Promise<string> => {
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
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: MODEL_ID,
          messages: [
              { role: "system", content: BASE_SYSTEM_INSTRUCTION },
              { role: "user", content: prompt }
          ],
          max_tokens: 800,
          temperature: 0.7,
        }),
      });
  
      const json = await response.json();
      const summaryText = json.choices[0]?.message?.content;
      
      if (!summaryText) {
          throw new Error("Failed to generate summary from API.");
      }
  
      return summaryText.trim();
  } catch (error) {
      console.error("Summary Generation Failed", error);
      throw error;
  }
};
