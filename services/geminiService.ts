

import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { Lesson } from "../types";

const BASE_SYSTEM_INSTRUCTION = `
你是一位风趣、幽默、极具耐心的日语老师 "Sensei" 🎓。
你的任务是像**微信/Line聊天**一样，通过碎片化的对话教用户日语。

### 核心人设 & 规则
1.  **极致简短**：每次回复通常只发 1-2 个气泡。每个气泡**不超过 30 个字**。
2.  **像朋友一样**：禁止使用教科书式的长篇大论。用口语、用 Emoji ✨。
3.  **循循善诱**：
    *   **课程介绍 (重要！)**: 收到用户的初始问题后，你的**第一次回复必须**先用一两句话，热情地介绍一下这节课的目标和内容大纲，然后再开始教学。
    *   **分步教学**: 不要一次性把知识点讲完！讲一个点，然后**提问**，确认用户懂了，或者引导用户猜下一个点。等待用户回复后，再讲下一步。
4.  **强制中文**：除非举例日语单词，否则全用中文交流。
5.  **分隔符**：使用 "===" 分隔气泡。

### 建议回复 (Suggested Replies)
在对话结束时，提供 3 个简短回复选项。
**格式严格要求**：
* 必须使用 \`<<<\` 和 \`>>>\` 包裹选项内容。
* **绝对不要**嵌套标签。
* 每个选项之间用空格或换行分开。
* 错误示范：\`<<<[冷静] 选项1 <<<[搞笑] 选项2>>>\` (这是错的！)
* 正确示范：
\`<<<[冷静] 明白了，请继续>>>\`
\`<<<[搞笑] 哈哈，这也太简单了>>>\`
\`<<<[疑问] 这里不太懂>>>\`
`;

let chatSession: Chat | null = null;

export const startChat = (lesson: Lesson, apiKey: string) => {
  if (!apiKey) throw new Error("API Key is missing");

  const client = new GoogleGenAI({ apiKey });
  
  const systemInstruction = `${BASE_SYSTEM_INSTRUCTION}

### 当前课程主题：
${lesson.title} - ${lesson.subtitle}
初始问题：${lesson.initialPrompt}
`;

  chatSession = client.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: systemInstruction,
      temperature: 1.3,
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
    // FIX: The chunk itself needs to be cast to GenerateContentResponse, not a property of it.
    yield chunk as GenerateContentResponse;
  }
};

export const parseContentWithOptions = (text: string) => {
  // Regex for content between <<< and >>> (options)
  const optionRegex = /<<<((?:(?!>>>).)+)>>>/g;

  const options: string[] = [];
  
  // 1. Extract Options from the text
  let match;
  while ((match = optionRegex.exec(text)) !== null) {
    // match[1] is the content inside <<<...>>>
    let rawContent = match[1].trim();
    // Remove the emotion tag like [冷静] or [搞笑] at the beginning if present
    rawContent = rawContent.replace(/^\[[^\]]+\]\s*/, '');
    options.push(rawContent);
  }

  // 2. Final Clean Text: Remove options from the text
  const cleanText = text.replace(optionRegex, '').trim();

  return { cleanText, options };
};