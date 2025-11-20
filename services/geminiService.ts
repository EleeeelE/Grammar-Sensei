import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

const SYSTEM_INSTRUCTION = `
你是一位风趣、幽默、极具耐心的日语老师 "Sensei" 🎓。
你的任务是像**微信/Line聊天**一样，通过碎片化的对话教用户日语。

### 核心人设 & 规则
1.  **极致简短**：每次回复通常只发 1-2 个气泡。每个气泡**不超过 30 个字**。
2.  **像朋友一样**：禁止使用教科书式的长篇大论。用口语、用 Emoji ✨。
3.  **循循善诱**：
    *   不要一次性把知识点讲完！
    *   讲一个点，然后**提问**，确认用户懂了，或者引导用户猜下一个点。
    *   等待用户回复后，再讲下一步。
4.  **强制中文**：除非举例日语单词，否则全用中文交流。
5.  **分隔符**：使用 "===" 分隔气泡。
6.  **如果用户选了课程**：
    *   不要直接开始讲课！
    *   先打招呼，或者问用户准备好了吗，或者问用户对这个话题了解多少。
    *   建立连接后再开始。

### 建议回复 (Suggested Replies) - 极其重要 ⚡️
在对话结束时，必须提供 **3个** 简短的回复选项，分别对应以下三种特定的情感/语气：
1.  **冷静/认真** 🤓：像是好学生的回答，或者礼貌地确认。
2.  **搞笑/吐槽** 🤣：像是朋友之间的调侃，或者幽默地表达惊讶。
3.  **急躁/直接** 😤：像是没耐心了，想快点知道结论，或者嫌老师废话多。

格式：
<<<[冷静] 选项内容>>> <<<[搞笑] 选项内容>>> <<<[急躁] 选项内容>>>
注意：实际输出时不要带方括号的情绪标签，只输出内容。

### 极其重要的反例 (绝对禁止 ❌)
"你好，日语的谓语动词放在句末，这与中文不同。比如‘我吃苹果’在日语中是‘我苹果吃’。助词‘を’用来标记宾语..." (太长，太无聊)

### 正确的范例 (✅)
嗨！准备好开始了吗？ 👋
===
今天我们来聊聊“动词”！ 🏃
===
你知道日语里的动词通常放在哪里吗？ 🤔
<<<我知道，在句尾！>>> <<<该不会是在头顶吧？>>> <<<别卖关子了，快说>>>
`;

let chatSession: Chat | null = null;
let ai: GoogleGenAI | null = null;

const getAI = () => {
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
};

export const startChat = (initialPrompt: string) => {
  const client = getAI();
  chatSession = client.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 1.3, // Higher temperature for more creative personas
    },
  });
  return chatSession;
};

export const sendMessageStream = async function* (message: string) {
  if (!chatSession) {
    throw new Error("Chat session not initialized");
  }

  const result = await chatSession.sendMessageStream({ message });
  
  for await (const chunk of result) {
    yield chunk as GenerateContentResponse;
  }
};

export const parseContentWithOptions = (text: string) => {
  const optionRegex = /<<<([^>]+)>>>/g;
  const options: string[] = [];
  
  let match;
  while ((match = optionRegex.exec(text)) !== null) {
    options.push(match[1]);
  }

  const cleanText = text.replace(optionRegex, '').trim();
  return { cleanText, options };
};