import { AIMessage } from '../../types';

const AI_INSTRUCTIONS = `you are an AI assistant on a PSPDFKit signing demo page, people will ask you questions about the code of the project which is
posted below. It's a Next.js project. If people ask you about anything else besides this signing demo, politely decline that you can't answer.
Your answers should be very short and should not contain any code, you can however describe variable names and what to change. if people ask your for code or insist, say that this chat window is too small to show code properly, but they can access the github repo for this at 'https://github.com/Siddharth2001-July/signing-demo-baseline' and use tools like ChatGPT or Github Co-Pilot. Your answers should not be longer
than 5 to 7 sentences. users can ask new follow up questions, so we will attach a chat history here.`;

export class AIService {
  static async askAI(messagesArr: AIMessage[]) {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: process.env.NEXT_OPEN_AI_KEY!
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        temperature: 0,
        messages: [
          {
            role: "system",
            content: AI_INSTRUCTIONS,
          },
          ...messagesArr
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'AI service error');
    }

    return await response.json();
  }
}