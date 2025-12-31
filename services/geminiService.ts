
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getTradingAdvice = async (leaderPnl: number, followerPnl: number, marketPrice: number) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `当前 BTC 市场背景:
      - 当前 BTC 价格: $${marketPrice.toLocaleString()}
      - 带单端 (Leader) 累计盈亏: $${leaderPnl.toFixed(2)}
      - 跟单端 (5倍反向跟单) 累计盈亏: $${followerPnl.toFixed(2)}
      
      请分析这种“反向跟单”策略在当前行情下的表现。解释为什么跟单端相对于带单端在盈利或亏损。请以专业、简洁且通俗易懂的方式为新手交易者提供中文投资洞察，长度在 150 字以内。`,
      config: {
        temperature: 0.7,
        maxOutputTokens: 350,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return "市场分析暂时不可用。请继续关注行情波动。";
  }
};
